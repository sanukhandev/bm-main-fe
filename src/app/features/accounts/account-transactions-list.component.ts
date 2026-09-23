import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountsApiService, AccountDirection, AccountTransaction } from '../../core/api/accounts-api.service';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmEmptyStateComponent } from '../../shared/components/bm-empty-state/bm-empty-state.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';

@Component({
  selector: 'bm-account-transactions-list', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BmPageHeaderComponent, BmLoadingStateComponent, BmErrorStateComponent, BmEmptyStateComponent, BmStatusBadgeComponent],
  template: `
    <bm-page-header [title]="direction() === 'inward' ? 'Inward Receipts' : 'Outward Payments'" subtitle="Branch-scoped financial documents"><a routerLink="/app/accounts/dashboard" class="bm-btn bm-btn-secondary text-xs">Accounts Dashboard</a></bm-page-header>
    @if (loading()) { <bm-loading-state type="table"></bm-loading-state> } @else if (error()) { <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state> } @else if (!rows().length) { <bm-empty-state title="No transactions found" description="No financial documents match this branch."></bm-empty-state> } @else {
      <div class="bm-card overflow-hidden overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase"><th class="p-4">Document</th><th class="p-4">Date</th><th class="p-4">Party</th><th class="p-4">Particulars</th><th class="p-4">Mode</th><th class="p-4">Amount</th><th class="p-4">Status</th><th class="p-4">Actions</th></tr></thead><tbody class="divide-y divide-slate-100">@for (row of rows(); track row.id) { <tr><td class="p-4 font-semibold">{{ row.document_no }}</td><td class="p-4">{{ row.transaction_date }}</td><td class="p-4">{{ row.party?.display_name || 'Miscellaneous' }}</td><td class="p-4">{{ row.remarks || '—' }}</td><td class="p-4"><bm-status-badge [status]="row.payment_mode"></bm-status-badge></td><td class="p-4 font-semibold tabular-nums">AED {{ row.amount }}</td><td class="p-4"><bm-status-badge [status]="row.status"></bm-status-badge></td><td class="p-4">@if (row.status === 'posted') { <button type="button" class="text-rose-700 font-semibold" (click)="openVoid(row.id)">Void</button> }</td></tr> }</tbody></table></div>
    }
    @if (voidId()) { <div class="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"><form class="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" (ngSubmit)="submitVoid()"><h2 class="text-lg font-semibold">Void financial document</h2><p class="text-sm text-slate-600">The original number and history will be preserved.</p><textarea [(ngModel)]="voidReason" name="voidReason" required rows="3" class="bm-input" placeholder="Reason"></textarea><div class="flex justify-end gap-2"><button type="button" class="bm-btn bm-btn-secondary" (click)="voidId.set(null)">Cancel</button><button type="submit" class="bm-btn bm-btn-danger" [disabled]="!voidReason.trim() || voiding">Void</button></div></form></div> }
  `,
})
export class AccountTransactionsListComponent implements OnInit {
  private api = inject(AccountsApiService);
  private route = inject(ActivatedRoute);
  direction = signal<AccountDirection>('inward');
  rows = signal<AccountTransaction[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  voidId = signal<number | null>(null);
  voidReason = '';
  voiding = false;

  ngOnInit(): void { this.direction.set(this.route.snapshot.data['direction']); this.load(); }
  load(): void { this.loading.set(true); this.api.getTransactions(this.direction()).subscribe({ next: (res) => { this.rows.set(res.data); this.loading.set(false); }, error: (err) => { this.error.set(err.message || 'Unable to load transactions.'); this.loading.set(false); } }); }
  openVoid(id: number): void { this.voidReason = ''; this.voidId.set(id); }
  submitVoid(): void { const id = this.voidId(); if (!id || !this.voidReason.trim() || this.voiding) return; this.voiding = true; this.api.voidTransaction(id, this.voidReason.trim()).subscribe({ next: () => { this.voiding = false; this.voidId.set(null); this.load(); }, error: (err) => { this.voiding = false; this.error.set(err.message || 'Unable to void document.'); } }); }
}
