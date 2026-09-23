import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountsApiService, AccountDirection, AccountTransaction } from '../../core/api/accounts-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmEmptyStateComponent } from '../../shared/components/bm-empty-state/bm-empty-state.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmConfirmDialogComponent } from '../../shared/components/bm-confirm-dialog/bm-confirm-dialog.component';
import { ChequeAction, chequeActions, InFlightGuard } from '../../shared/models/payment.models';

@Component({
  selector: 'bm-account-transactions-list', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BmPageHeaderComponent, BmLoadingStateComponent, BmErrorStateComponent, BmEmptyStateComponent, BmStatusBadgeComponent, BmConfirmDialogComponent],
  template: `
    <bm-page-header [title]="direction() === 'inward' ? 'Inward Receipts' : 'Outward Payments'" subtitle="Branch-scoped financial documents"><a routerLink="/app/accounts/dashboard" class="bm-btn bm-btn-secondary text-xs">Accounts Dashboard</a></bm-page-header>
    <div class="bm-card p-4 mb-4 flex flex-wrap gap-3"><select class="bm-input max-w-xs" [(ngModel)]="paymentMode" (ngModelChange)="load()" aria-label="Payment mode filter"><option value="">All payment modes</option><option value="cash">Cash</option><option value="cheque">Cheque</option><option value="bank_transfer">Bank Transfer</option></select><select class="bm-input max-w-xs" [(ngModel)]="chequeStatus" (ngModelChange)="load()" aria-label="Cheque status filter"><option value="">All cheque statuses</option><option value="received">Received</option><option value="deposited">Deposited</option><option value="cleared">Cleared</option><option value="bounced">Bounced</option><option value="cancelled">Cancelled</option></select></div>
    @if (loading()) { <bm-loading-state type="table"></bm-loading-state> } @else if (error()) { <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state> } @else if (!rows().length) { <bm-empty-state title="No transactions found" description="No financial documents match these filters."></bm-empty-state> } @else { <div class="bm-card overflow-hidden overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase"><th class="p-4">Document</th><th class="p-4">Date</th><th class="p-4">Party</th><th class="p-4">Particulars</th><th class="p-4">Mode / Reference</th><th class="p-4">Amount</th><th class="p-4">Status</th><th class="p-4">Actions</th></tr></thead><tbody class="divide-y divide-slate-100">@for (row of rows(); track row.id) { <tr><td class="p-4 font-semibold">{{ row.document_no }}</td><td class="p-4">{{ row.transaction_date }}</td><td class="p-4">{{ row.party?.display_name || 'Miscellaneous' }}</td><td class="p-4">{{ row.remarks || '—' }}</td><td class="p-4"><bm-status-badge [status]="row.payment_mode"></bm-status-badge>@if (row.payment_mode === 'cheque') { <div class="mt-1 text-[10px]">Cheque {{ row.cheque_no }} · {{ chequeLabel(row.cheque_status) }}</div><div class="text-[10px] text-slate-500">{{ row.cheque_date }} · {{ row.bank_name || '—' }}</div> }</td><td class="p-4 font-semibold tabular-nums">AED {{ row.amount }}</td><td class="p-4"><bm-status-badge [status]="row.status"></bm-status-badge></td><td class="p-4"><div class="flex flex-wrap gap-2">@if (canVoid() && row.status === 'posted') { <button type="button" class="text-rose-700 font-semibold" aria-label="Void financial document" (click)="openVoid(row.id)">Void</button> } @for (action of actionsFor(row); track action) { <button type="button" class="text-emerald-700 font-semibold" [disabled]="actionBusy()" [attr.aria-label]="actionLabel(action) + ' cheque ' + row.cheque_no" (click)="openChequeAction(row, action)">{{ actionLabel(action) }}</button> }</div></td></tr> }</tbody></table></div> }
    <bm-confirm-dialog [isOpen]="confirmAction() !== null" [title]="confirmTitle()" [message]="confirmMessage()" [confirmLabel]="confirmActionLabel()" [isDanger]="confirmAction() === 'bounce' || confirmAction() === 'cancel'" [isSubmitting]="actionBusy()" (confirm)="submitChequeAction()" (cancel)="closeConfirmation()"></bm-confirm-dialog>
    @if (voidId()) { <div class="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"><form class="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" (ngSubmit)="submitVoid()"><h2 class="text-lg font-semibold">Void financial document</h2><p class="text-sm text-slate-600">The original number and history will be preserved.</p><textarea [(ngModel)]="voidReason" name="voidReason" required rows="3" class="bm-input" aria-label="Void reason" placeholder="Reason"></textarea><div class="flex justify-end gap-2"><button type="button" class="bm-btn bm-btn-secondary" (click)="voidId.set(null)">Cancel</button><button type="submit" class="bm-btn bm-btn-danger" [disabled]="!voidReason.trim() || voiding">Void</button></div></form></div> }
  `,
})
export class AccountTransactionsListComponent implements OnInit {
  private api = inject(AccountsApiService); private auth = inject(AuthService); private route = inject(ActivatedRoute);
  direction = signal<AccountDirection>('inward'); rows = signal<AccountTransaction[]>([]); loading = signal(true); error = signal<string | null>(null);
  paymentMode = ''; chequeStatus = ''; voidId = signal<number | null>(null); voidReason = ''; voiding = false; actionBusy = signal(false);
  confirmAction = signal<ChequeAction | null>(null); confirmRow = signal<AccountTransaction | null>(null);
  private requestGuard = new InFlightGuard();
  canPost = () => this.auth.hasPermission('accounts.post'); canVoid = () => this.auth.hasPermission('accounts.void');
  ngOnInit(): void { this.direction.set(this.route.snapshot.data['direction']); this.load(); }
  load(): void { this.loading.set(true); this.api.getTransactions(this.direction(), { payment_mode: this.paymentMode, cheque_status: this.paymentMode === 'cheque' ? this.chequeStatus : '' }).subscribe({ next: (res) => { this.rows.set(res.data); this.loading.set(false); }, error: (err) => { this.error.set(err.message || 'Unable to load transactions.'); this.loading.set(false); } }); }
  actionsFor(row: AccountTransaction): ChequeAction[] { return row.payment_mode === 'cheque' ? chequeActions(row.cheque_status || 'received', this.canPost()) : []; }
  chequeLabel(status: AccountTransaction['cheque_status']): string { return (status || 'received').replace('_', ' ').replace(/^./, (letter) => letter.toUpperCase()); }
  actionLabel(action: ChequeAction): string { return action.charAt(0).toUpperCase() + action.slice(1); }
  confirmTitle(): string { return this.confirmAction() ? `${this.actionLabel(this.confirmAction()!)} cheque` : 'Confirm cheque action'; }
  confirmMessage(): string { const row = this.confirmRow(); return row && this.confirmAction() ? `Mark cheque ${row.cheque_no || row.document_no} as ${this.confirmAction()}?` : ''; }
  confirmActionLabel(): string { return this.confirmAction() ? this.actionLabel(this.confirmAction()!) : 'Confirm'; }
  openChequeAction(row: AccountTransaction, action: ChequeAction): void { if (!this.canPost() || this.actionBusy()) return; this.confirmRow.set(row); this.confirmAction.set(action); }
  closeConfirmation(): void { if (!this.actionBusy()) { this.confirmAction.set(null); this.confirmRow.set(null); } }
  submitChequeAction(): void { const row = this.confirmRow(); const action = this.confirmAction(); if (!row || !action || this.actionBusy() || !this.requestGuard.begin()) return; this.actionBusy.set(true); this.api.chequeAction(row.id, action).subscribe({ next: () => { this.requestGuard.end(); this.actionBusy.set(false); this.closeConfirmation(); this.load(); }, error: (err) => { this.requestGuard.end(); this.actionBusy.set(false); this.error.set(err.message || 'Unable to update cheque status.'); this.closeConfirmation(); } }); }
  openVoid(id: number): void { this.voidReason = ''; this.voidId.set(id); }
  submitVoid(): void { const id = this.voidId(); if (!id || !this.voidReason.trim() || this.voiding) return; this.voiding = true; this.api.voidTransaction(id, this.voidReason.trim()).subscribe({ next: () => { this.voiding = false; this.voidId.set(null); this.load(); }, error: (err) => { this.voiding = false; this.error.set(err.message || 'Unable to void document.'); } }); }
}
