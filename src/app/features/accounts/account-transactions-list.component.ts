import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountsApiService, AccountDirection, AccountTransaction } from '../../core/api/accounts-api.service';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmEmptyStateComponent } from '../../shared/components/bm-empty-state/bm-empty-state.component';

@Component({
  selector: 'bm-account-transactions-list', standalone: true,
  imports: [CommonModule, RouterLink, BmPageHeaderComponent, BmLoadingStateComponent, BmErrorStateComponent, BmEmptyStateComponent],
  template: `
    <bm-page-header [title]="direction() === 'inward' ? 'Inward Receipts' : 'Outward Payments'" subtitle="Branch-scoped posted financial documents">
      <a routerLink="/app/accounts/dashboard" class="bm-btn bm-btn-secondary text-xs">Accounts Dashboard</a>
    </bm-page-header>
    @if (loading()) { <bm-loading-state type="table"></bm-loading-state> }
    @else if (error()) { <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state> }
    @else if (!rows().length) { <bm-empty-state title="No transactions found" description="No financial documents match this branch." ></bm-empty-state> }
    @else {
      <div class="bm-card overflow-hidden overflow-x-auto"><table class="w-full text-left text-xs">
        <thead><tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase"><th class="p-4">Document</th><th class="p-4">Date</th><th class="p-4">Party</th><th class="p-4">Mode</th><th class="p-4">Amount</th><th class="p-4">Status</th></tr></thead>
        <tbody class="divide-y divide-slate-100">@for (row of rows(); track row.id) { <tr><td class="p-4 font-semibold">{{ row.document_no }}</td><td class="p-4">{{ row.transaction_date }}</td><td class="p-4">{{ row.party?.display_name || 'Miscellaneous' }}</td><td class="p-4 capitalize">{{ row.payment_mode.replace('_', ' ') }}</td><td class="p-4 font-semibold tabular-nums">AED {{ row.amount }}</td><td class="p-4 capitalize">{{ row.status }}</td></tr> }</tbody>
      </table></div>
    }
  `,
})
export class AccountTransactionsListComponent implements OnInit {
  private api = inject(AccountsApiService);
  private route = inject(ActivatedRoute);
  direction = signal<AccountDirection>('inward');
  rows = signal<AccountTransaction[]>([]); loading = signal(true); error = signal<string | null>(null);
  ngOnInit(): void { this.direction.set(this.route.snapshot.data['direction']); this.load(); }
  load(): void { this.loading.set(true); this.api.getTransactions(this.direction()).subscribe({ next: (res) => { this.rows.set(res.data); this.loading.set(false); }, error: (err) => { this.error.set(err.message || 'Unable to load transactions.'); this.loading.set(false); } }); }
}
