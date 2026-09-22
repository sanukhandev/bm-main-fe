import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountsApiService, AccountsDashboardSnapshot } from '../../core/api/accounts-api.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmKpiCardComponent } from '../../shared/components/bm-kpi-card/bm-kpi-card.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';

@Component({
  selector: 'bm-accounts-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BmPageHeaderComponent, BmKpiCardComponent, BmLoadingStateComponent, BmErrorStateComponent],
  template: `
    <bm-page-header title="Accounts" subtitle="Financial activity for the current branch">
      <a routerLink="/app/accounts/inward" class="bm-btn bm-btn-secondary text-xs">Inward Receipts</a>
      <a routerLink="/app/accounts/outward" class="bm-btn bm-btn-primary text-xs">Outward Payments</a>
    </bm-page-header>
    @if (loading()) { <bm-loading-state type="kpi"></bm-loading-state> }
    @else if (error()) { <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state> }
    @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <bm-kpi-card label="Today Inward" [value]="money(snapshot()?.today_inward)" subtext="Posted receipts"></bm-kpi-card>
        <bm-kpi-card label="Today Outward" [value]="money(snapshot()?.today_outward)" subtext="Posted payments"></bm-kpi-card>
        <bm-kpi-card label="Net Movement" [value]="money(snapshot()?.today_net_movement)" subtext="Inward less outward" variant="featured"></bm-kpi-card>
        <bm-kpi-card label="Petty Cash" [value]="money(snapshot()?.petty_cash_balance)" subtext="Current cash balance"></bm-kpi-card>
        <bm-kpi-card label="Month Inward" [value]="money(snapshot()?.month_inward)" subtext="Current month"></bm-kpi-card>
        <bm-kpi-card label="Month Outward" [value]="money(snapshot()?.month_outward)" subtext="Current month"></bm-kpi-card>
        <bm-kpi-card label="Tenant Receivable" [value]="money(snapshot()?.tenant_outstanding_receivable)" subtext="Outstanding schedules"></bm-kpi-card>
        <bm-kpi-card label="Owner Payable" [value]="money(snapshot()?.owner_outstanding_payable)" subtext="Outstanding schedules"></bm-kpi-card>
      </div>
      <div class="mt-6 bm-card p-5 flex flex-wrap gap-3">
        <a routerLink="/app/accounts/petty-cash" class="bm-btn bm-btn-secondary text-xs">Petty Cash Daybook</a>
        <span class="text-xs text-slate-500 self-center">Pending cheques: {{ money(snapshot()?.pending_cheque_inward) }} inward / {{ money(snapshot()?.pending_cheque_outward) }} outward</span>
      </div>
      <div class="mt-6 bm-card overflow-hidden"><div class="p-5 border-b border-slate-100 flex items-center justify-between"><h3 class="font-semibold text-slate-900">Last 5 Payments</h3><span class="text-xs text-slate-500">Posted receipts and vouchers</span></div><div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead class="bg-slate-50 text-slate-500 uppercase"><tr><th class="p-4">Document</th><th class="p-4">Date</th><th class="p-4">Party</th><th class="p-4">Particulars</th><th class="p-4">Direction</th><th class="p-4">Mode</th><th class="p-4 text-right">Amount</th></tr></thead><tbody class="divide-y divide-slate-100">@for (row of snapshot()?.recent_transactions || []; track row.id) { <tr><td class="p-4 font-semibold">{{ row.document_no }}</td><td class="p-4">{{ row.transaction_date }}</td><td class="p-4">{{ row.party || 'Miscellaneous' }}</td><td class="p-4">{{ row.particulars || '—' }}</td><td class="p-4 capitalize">{{ row.direction }}</td><td class="p-4 capitalize">{{ row.payment_mode.replace('_', ' ') }}</td><td class="p-4 text-right font-semibold">AED {{ row.amount }}</td></tr> } @empty { <tr><td colspan="7" class="p-6 text-center text-slate-500">No posted payments yet.</td></tr> }</tbody></table></div></div>
    }
  `,
})
export class AccountsDashboardComponent implements OnInit, OnDestroy {
  private api = inject(AccountsApiService);
  private branchContext = inject(BranchContextService);
  snapshot = signal<AccountsDashboardSnapshot | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  private branchSub?: Subscription;

  ngOnInit(): void { this.load(); this.branchSub = this.branchContext.branchChanged$.subscribe(() => this.load()); }
  ngOnDestroy(): void { this.branchSub?.unsubscribe(); }
  load(): void {
    this.loading.set(true); this.error.set(null);
    this.api.getDashboard().subscribe({ next: (res) => { this.snapshot.set(res.data); this.loading.set(false); }, error: (err) => { this.error.set(err.message || 'Unable to load accounts.'); this.loading.set(false); } });
  }
  money(value: string | undefined): string { return `AED ${Number(value || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
}
