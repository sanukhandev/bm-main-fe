import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountsApiService, DailyMovement, PaymentModeSummary } from '../../core/api/accounts-api.service';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';

@Component({ selector: 'bm-accounts-reports', standalone: true, imports: [CommonModule, RouterLink, BmPageHeaderComponent, BmLoadingStateComponent, BmErrorStateComponent], template: `
  <bm-page-header title="Accounts Reports" subtitle="Backend-calculated branch financial summaries"><a routerLink="/app/accounts/dashboard" class="bm-btn bm-btn-secondary text-xs">Accounts Dashboard</a></bm-page-header>
  @if (loading()) { <bm-loading-state type="table"></bm-loading-state> } @else if (error()) { <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state> } @else {
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><section class="bm-card overflow-hidden"><div class="p-4 border-b font-semibold">Daily Cash Movement</div><table class="w-full text-left text-xs"><thead class="bg-slate-50 text-slate-500"><tr><th class="p-4">Date</th><th class="p-4">Inward</th><th class="p-4">Outward</th><th class="p-4">Net</th></tr></thead><tbody class="divide-y">@for (row of movement(); track row.date) { <tr><td class="p-4">{{ row.date }}</td><td class="p-4 text-emerald-700">AED {{ row.inward }}</td><td class="p-4 text-rose-700">AED {{ row.outward }}</td><td class="p-4 font-semibold">AED {{ row.net }}</td></tr> }</tbody></table></section><section class="bm-card overflow-hidden"><div class="p-4 border-b font-semibold">Payment Mode Summary</div><table class="w-full text-left text-xs"><thead class="bg-slate-50 text-slate-500"><tr><th class="p-4">Mode</th><th class="p-4">Direction</th><th class="p-4">Count</th><th class="p-4">Amount</th></tr></thead><tbody class="divide-y">@for (row of modes(); track row.payment_mode + row.direction) { <tr><td class="p-4 capitalize">{{ row.payment_mode.replace('_', ' ') }}</td><td class="p-4 capitalize">{{ row.direction }}</td><td class="p-4">{{ row.count }}</td><td class="p-4 font-semibold">AED {{ row.amount }}</td></tr> }</tbody></table></section></div>
  }
` })
export class AccountsReportsComponent implements OnInit {
  private api = inject(AccountsApiService); movement = signal<DailyMovement[]>([]); modes = signal<PaymentModeSummary[]>([]); loading = signal(true); error = signal<string | null>(null);
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.error.set(null); this.api.getDailyMovement().subscribe({ next: (movement) => { this.movement.set(movement.data); this.api.getPaymentModeSummary().subscribe({ next: (modes) => { this.modes.set(modes.data); this.loading.set(false); }, error: (err) => this.fail(err) }); }, error: (err) => this.fail(err) }); }
  private fail(err: { message?: string }): void { this.error.set(err.message || 'Unable to load reports.'); this.loading.set(false); }
}
