import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IntelligentReportApiService, IntelligentReportData, IntelligentReportPeriod, IntelligentReportScope } from '../../core/api/intelligent-report-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';

@Component({
  selector: 'bm-intelligent-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BmErrorStateComponent, BmLoadingStateComponent],
  template: `
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p class="text-xs uppercase tracking-[0.2em] text-emerald-700">Reports</p><h1 class="text-3xl font-semibold text-slate-900">Intelligent Report</h1><p class="mt-1 text-slate-500">Financial and operational intelligence for the selected period.</p></div>
      <div class="flex flex-wrap gap-2"><button class="bm-btn bm-btn-secondary" type="button" (click)="load()">Refresh</button><button class="bm-btn bm-btn-primary" type="button" (click)="download()" [disabled]="loading()">Export PDF</button></div>
    </div>
    <div class="bm-card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label class="text-sm text-slate-600">Period<select class="bm-input mt-1 w-full" [(ngModel)]="period" (ngModelChange)="periodChanged()"><option value="this_month">This month</option><option value="last_month">Last month</option><option value="last_3_months">Last 3 months</option><option value="last_6_months">Last 6 months</option><option value="last_12_months">Last 12 months</option><option value="this_year">This year</option><option value="custom">Custom</option></select></label>
      @if (period === 'custom') {<label class="text-sm text-slate-600">From<input class="bm-input mt-1 w-full" type="date" [(ngModel)]="dateFrom"></label><label class="text-sm text-slate-600">To<input class="bm-input mt-1 w-full" type="date" [(ngModel)]="dateTo"></label>}
      @if (isSuperAdmin()) {<label class="text-sm text-slate-600">Scope<select class="bm-input mt-1 w-full" [(ngModel)]="scope"><option value="branch">Selected Branch</option><option value="overall">Overall Business</option></select></label>}
      <div class="flex items-end"><button class="bm-btn bm-btn-primary w-full" type="button" (click)="load()">Generate Report</button></div>
    </div>
    @if (loading()) {<bm-loading-state type="card"></bm-loading-state>} @else if (error()) {<bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>} @else if (report()) {
      <p class="mb-4 text-sm text-slate-500">{{ report()!.scope.label }} · {{ report()!.period.from }} to {{ report()!.period.to }}</p>
      <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><ng-container *ngFor="let card of cards"><article class="bm-card p-5"><p class="text-sm text-slate-500">{{ card.label }}</p><p class="mt-2 text-2xl font-semibold" [class.text-rose-700]="card.key === 'operational_profit_loss' && number(report()!.summary[card.key]) < 0">{{ card.money ? 'AED ' : '' }}{{ value(card.key) }}{{ card.percent ? '%' : '' }}</p></article></ng-container></section>
      <section class="mt-6 grid gap-6 lg:grid-cols-2"><article class="bm-card p-5"><h2 class="mb-4 text-lg font-semibold">Income vs Operating Cost</h2><div class="space-y-3"><div *ngFor="let row of report()!.trends.income_vs_cost"><div class="mb-1 flex justify-between text-xs text-slate-500"><span>{{ row.period }}</span><span>AED {{ row.income }} / {{ row.cost }}</span></div><div class="h-2 overflow-hidden rounded bg-slate-100"><div class="h-full bg-emerald-700" [style.width.%]="bar(row.income)"></div></div></div></div></article><article class="bm-card p-5"><h2 class="mb-4 text-lg font-semibold">Property Operations</h2><div class="grid grid-cols-2 gap-3"><div><p class="text-sm text-slate-500">Occupied</p><strong class="text-2xl">{{ report()!.summary.occupied_properties }}</strong></div><div><p class="text-sm text-slate-500">Available</p><strong class="text-2xl">{{ report()!.summary.available_properties }}</strong></div><div><p class="text-sm text-slate-500">Occupancy</p><strong class="text-2xl">{{ report()!.summary.occupancy_percent ?? '—' }}%</strong></div><div><p class="text-sm text-slate-500">Expiring</p><strong class="text-2xl">{{ report()!.summary.expiring_agreements.tenant + report()!.summary.expiring_agreements.owner }}</strong></div></div></article></section>
      <section class="mt-6 bm-card overflow-x-auto p-5"><h2 class="mb-4 text-lg font-semibold">Leakage Detection</h2><p *ngIf="!report()!.findings.length" class="text-slate-500">No deterministic leakage findings for this period.</p><table *ngIf="report()!.findings.length" class="w-full text-left text-sm"><thead><tr><th class="p-3">Severity</th><th class="p-3">Finding</th><th class="p-3">Exposure</th><th class="p-3">Review</th></tr></thead><tbody><tr *ngFor="let finding of report()!.findings" class="border-t"><td class="p-3 font-semibold uppercase">{{ finding.severity }}</td><td class="p-3"><div class="font-medium">{{ finding.title }}</div><div class="text-xs text-slate-500">{{ finding.description }}</div></td><td class="p-3">{{ finding.amount ? 'AED ' + finding.amount : '—' }}</td><td class="p-3"><a *ngIf="finding.navigation" class="text-emerald-700" [routerLink]="finding.navigation">Review</a></td></tr></tbody></table></section>
      <p class="mt-6 rounded border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-slate-600">{{ report()!.accounting_note }}</p>
    }
  `,
})
export class IntelligentReportComponent implements OnInit {
  private api = inject(IntelligentReportApiService); private auth = inject(AuthService);
  report = signal<IntelligentReportData | null>(null); loading = signal(false); error = signal<string | null>(null);
  period: IntelligentReportPeriod = 'this_month'; scope: IntelligentReportScope = 'branch'; dateFrom = ''; dateTo = '';
  readonly isSuperAdmin = this.auth.isSuperAdmin;
  cards = [{ key: 'operational_profit_loss', label: 'Operational Profit / Loss', money: true }, { key: 'operating_margin_percent', label: 'Operating Margin', percent: true }, { key: 'operating_income', label: 'Operating Income', money: true }, { key: 'operating_cost', label: 'Operating Cost', money: true }, { key: 'net_cash_movement', label: 'Net Cash Movement', money: true }, { key: 'collection_efficiency_percent', label: 'Collection Efficiency', percent: true }];
  ngOnInit(): void { this.load(); }
  periodChanged(): void { if (this.period !== 'custom') { this.dateFrom = ''; this.dateTo = ''; } }
  load(): void { this.loading.set(true); this.error.set(null); this.api.get({ period: this.period, scope: this.scope, date_from: this.dateFrom || undefined, date_to: this.dateTo || undefined }).subscribe({ next: (response) => { this.report.set(response.data); this.loading.set(false); }, error: () => { this.error.set('Unable to load the Intelligent Report.'); this.report.set(null); this.loading.set(false); } }); }
  download(): void { this.api.pdf({ period: this.period, scope: this.scope, date_from: this.dateFrom || undefined, date_to: this.dateTo || undefined }).subscribe({ next: (blob) => { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'BM-Intelligent-Report.pdf'; anchor.click(); URL.revokeObjectURL(url); }, error: () => this.error.set('Unable to generate the PDF report.') }); }
  value(key: string): string { const value = this.report()?.summary[key]; return value === null || value === undefined ? '—' : String(value); }
  number(key: string): number { return Number(this.report()?.summary[key] ?? 0); }
  bar(value: string): number { const max = Math.max(...(this.report()?.trends.income_vs_cost.map((row) => Number(row.income)) || [1])); return Math.min(100, Number(value) / Math.max(1, max) * 100); }
}
