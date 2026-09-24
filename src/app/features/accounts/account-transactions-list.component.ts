import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AccountsApiService,
  AccountDirection,
  AccountTransaction,
} from '../../core/api/accounts-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { BmSearchInputComponent } from '../../shared/components/bm-search-input/bm-search-input.component';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmEmptyStateComponent } from '../../shared/components/bm-empty-state/bm-empty-state.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmPaginationComponent } from '../../shared/components/bm-pagination/bm-pagination.component';
import { BmConfirmDialogComponent } from '../../shared/components/bm-confirm-dialog/bm-confirm-dialog.component';
import { BmReceiptChequeModalComponent } from '../../shared/components/bm-receipt-cheque-modal/bm-receipt-cheque-modal.component';
import { ChequeAction, chequeActions, InFlightGuard } from '../../shared/models/payment.models';
import { PaginationMeta } from '../../core/api/api.models';

@Component({
  selector: 'bm-account-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BmPageHeaderComponent,
    BmSearchInputComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmEmptyStateComponent,
    BmStatusBadgeComponent,
    BmPaginationComponent,
    BmConfirmDialogComponent,
    BmReceiptChequeModalComponent,
  ],
  template: `
    <bm-page-header
      [title]="direction() === 'inward' ? 'Inward Receipts' : 'Outward Payments'"
      subtitle="Branch-scoped financial documents"
      ><a routerLink="/app/accounts/dashboard" class="bm-btn bm-btn-secondary text-xs"
        >Accounts Dashboard</a
      ></bm-page-header
    >
    <div class="bm-card p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <bm-search-input
          [value]="searchQuery()"
          placeholder="Search document no, party, remarks, cheque no..."
          (searchChange)="onSearchChange($event)"
        ></bm-search-input>
        <select
          class="bm-input max-w-xs text-xs font-medium"
          [(ngModel)]="paymentMode"
          (ngModelChange)="load(); currentPage.set(1)"
          aria-label="Payment mode filter"
        >
          <option value="">All payment modes</option>
          <option value="cash">Cash</option>
          <option value="cheque">Cheque</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
        <select
          class="bm-input max-w-xs text-xs font-medium"
          [(ngModel)]="chequeStatus"
          (ngModelChange)="load(); currentPage.set(1)"
          aria-label="Cheque status filter"
        >
          <option value="">All cheque statuses</option>
          <option value="received">Received</option>
          <option value="deposited">Deposited</option>
          <option value="cleared">Cleared</option>
          <option value="bounced">Bounced</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          class="bm-input max-w-xs text-xs font-medium"
          [value]="selectedDocStatus()"
          (change)="selectedDocStatus.set($any($event.target).value); currentPage.set(1)"
          aria-label="Document status filter"
        >
          <option value="">All Document Statuses</option>
          <option value="posted">Posted</option>
          <option value="draft">Draft</option>
          <option value="voided">Voided</option>
        </select>
      </div>

      @if (hasActiveFilters()) {
        <button
          type="button"
          (click)="clearFilters()"
          class="text-xs text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
        >
          Clear Filters
        </button>
      }
    </div>
    @if (loading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
    } @else if (!filteredRows().length) {
      <bm-empty-state
        title="No transactions found"
        description="No financial documents match these search filters."
      ></bm-empty-state>
    } @else {
      <div class="bm-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
              >
                <th class="p-4">Document</th>
                <th class="p-4">Date</th>
                <th class="p-4">Party</th>
                <th class="p-4">Particulars</th>
                <th class="p-4">Mode / Reference</th>
                <th class="p-4">Amount</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (row of paginatedRows(); track row.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-4 font-semibold text-slate-800 tabular-nums">
                    {{ row.document_no }}
                  </td>
                  <td class="p-4 text-slate-600 tabular-nums">{{ row.transaction_date }}</td>
                  <td class="p-4 font-medium text-slate-900">
                    {{ row.party?.display_name || 'Miscellaneous' }}
                  </td>
                  <td class="p-4 text-slate-600">{{ row.remarks || '—' }}</td>
                  <td class="p-4">
                    <bm-status-badge [status]="row.payment_mode"></bm-status-badge>
                    @if (row.payment_mode === 'cheque') {
                      <div class="mt-1 text-[10px] font-medium text-slate-700">
                        Cheque {{ row.cheque_no }} · {{ chequeLabel(row.cheque_status) }}
                      </div>
                      <div class="text-[10px] text-slate-500">
                        {{ row.cheque_date }} · {{ row.bank_name || '—' }}
                      </div>
                    }
                  </td>
                  <td class="p-4 font-semibold text-slate-900 tabular-nums">
                    AED {{ row.amount | number: '1.2-2' }}
                  </td>
                  <td class="p-4"><bm-status-badge [status]="row.status"></bm-status-badge></td>
                  <td class="p-4 text-right">
                    <div class="flex items-center justify-end flex-wrap gap-2">
                      <button
                        type="button"
                        class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1 shadow-2xs"
                        aria-label="View Receipt / Cheque Voucher"
                        (click)="selectedVoucherRow.set(row)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3.5 w-3.5 text-slate-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>Voucher</span>
                      </button>
                      @if (canVoid() && row.status === 'posted') {
                        <button
                          type="button"
                          class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 transition"
                          aria-label="Void financial document"
                          (click)="openVoid(row.id)"
                        >
                          Void
                        </button>
                      }
                      @for (action of actionsFor(row); track action) {
                        <button
                          type="button"
                          class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition"
                          [disabled]="actionBusy()"
                          [attr.aria-label]="actionLabel(action) + ' cheque ' + row.cheque_no"
                          (click)="openChequeAction(row, action)"
                        >
                          {{ actionLabel(action) }}
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <bm-pagination
          [meta]="paginationMeta()"
          (pageChange)="onPageChange($event)"
        ></bm-pagination>
      </div>
    }
    <bm-confirm-dialog
      [isOpen]="confirmAction() !== null"
      [title]="confirmTitle()"
      [message]="confirmMessage()"
      [confirmLabel]="confirmActionLabel()"
      [isDanger]="confirmAction() === 'bounce' || confirmAction() === 'cancel'"
      [isSubmitting]="actionBusy()"
      (confirm)="submitChequeAction()"
      (cancel)="closeConfirmation()"
    ></bm-confirm-dialog>
    <bm-receipt-cheque-modal
      [isOpen]="selectedVoucherRow() !== null"
      [transaction]="selectedVoucherRow()"
      (close)="selectedVoucherRow.set(null)"
    ></bm-receipt-cheque-modal>
    @if (voidId()) {
      <div
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
      >
        <form
          class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden bm-modal-content"
          (ngSubmit)="submitVoid()"
        >
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Void Financial Document</span>
            </h2>
            <button
              type="button"
              (click)="voidId.set(null)"
              class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold flex items-center justify-center transition cursor-pointer"
            >
              ×
            </button>
          </div>

          <div class="p-6 space-y-4 text-xs">
            <p class="text-slate-600 font-normal leading-relaxed">
              This action will mark the transaction as voided. The original document number and
              history audit trial will be permanently preserved.
            </p>

            <div>
              <label class="block font-semibold text-slate-700 mb-1.5"
                >Reason for Voiding <span class="text-rose-600">*</span></label
              >
              <textarea
                [(ngModel)]="voidReason"
                name="voidReason"
                required
                rows="3"
                class="bm-input !h-auto p-3"
                aria-label="Void reason"
                placeholder="Explain why this transaction document is being voided..."
              ></textarea>
            </div>
          </div>

          <div
            class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3"
          >
            <button
              type="button"
              class="bm-btn bm-btn-secondary text-xs rounded-xl"
              (click)="voidId.set(null)"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bm-btn bm-btn-danger text-xs rounded-xl shadow-2xs"
              [disabled]="!voidReason.trim() || voiding"
            >
              {{ voiding ? 'Voiding…' : 'Void Document' }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
})
export class AccountTransactionsListComponent implements OnInit {
  private api = inject(AccountsApiService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  direction = signal<AccountDirection>('inward');
  rows = signal<AccountTransaction[]>([]);
  selectedVoucherRow = signal<AccountTransaction | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  paymentMode = '';
  chequeStatus = '';
  voidId = signal<number | null>(null);
  voidReason = '';
  voiding = false;
  actionBusy = signal(false);
  confirmAction = signal<ChequeAction | null>(null);
  confirmRow = signal<AccountTransaction | null>(null);
  private requestGuard = new InFlightGuard();

  selectedDocStatus = signal('');
  currentPage = signal(1);
  pageSize = signal(25);

  filteredRows = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const docStatus = this.selectedDocStatus();

    return this.rows().filter((row) => {
      if (docStatus && row.status !== docStatus) return false;
      if (!q) return true;

      const partyName = row.party?.display_name?.toLowerCase() || '';
      const docNo = row.document_no?.toLowerCase() || '';
      const remarks = row.remarks?.toLowerCase() || '';
      const chequeNo = row.cheque_no?.toLowerCase() || '';
      const bankName = row.bank_name?.toLowerCase() || '';
      const amount = String(row.amount);
      const mode = row.payment_mode?.toLowerCase() || '';
      return (
        docNo.includes(q) ||
        partyName.includes(q) ||
        remarks.includes(q) ||
        chequeNo.includes(q) ||
        bankName.includes(q) ||
        amount.includes(q) ||
        mode.includes(q)
      );
    });
  });

  paginatedRows = computed(() => {
    const items = this.filteredRows();
    const page = this.currentPage();
    const perPage = this.pageSize();
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  });

  paginationMeta = computed<PaginationMeta>(() => {
    const total = this.filteredRows().length;
    const page = this.currentPage();
    const perPage = this.pageSize();
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    return {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total: total,
      from: total > 0 ? (page - 1) * perPage + 1 : 0,
      to: Math.min(total, page * perPage),
    };
  });

  canPost = () => this.auth.hasPermission('accounts.post');
  canVoid = () => this.auth.hasPermission('accounts.void');

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.paymentMode = '';
    this.chequeStatus = '';
    this.selectedDocStatus.set('');
    this.currentPage.set(1);
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQuery() ||
      this.paymentMode ||
      this.chequeStatus ||
      this.selectedDocStatus()
    );
  }
  ngOnInit(): void {
    this.direction.set(this.route.snapshot.data['direction']);
    this.searchQuery.set(this.route.snapshot.queryParamMap.get('search') || '');
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api
      .getTransactions(this.direction(), {
        search: this.searchQuery(),
        payment_mode: this.paymentMode,
        cheque_status: this.paymentMode === 'cheque' ? this.chequeStatus : '',
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Unable to load transactions.');
          this.loading.set(false);
        },
      });
  }
  actionsFor(row: AccountTransaction): ChequeAction[] {
    return row.payment_mode === 'cheque'
      ? chequeActions(row.cheque_status || 'received', this.canPost())
      : [];
  }
  chequeLabel(status: AccountTransaction['cheque_status']): string {
    return (status || 'received').replace('_', ' ').replace(/^./, (letter) => letter.toUpperCase());
  }
  actionLabel(action: ChequeAction): string {
    return action.charAt(0).toUpperCase() + action.slice(1);
  }
  confirmTitle(): string {
    return this.confirmAction()
      ? `${this.actionLabel(this.confirmAction()!)} cheque`
      : 'Confirm cheque action';
  }
  confirmMessage(): string {
    const row = this.confirmRow();
    return row && this.confirmAction()
      ? `Mark cheque ${row.cheque_no || row.document_no} as ${this.confirmAction()}?`
      : '';
  }
  confirmActionLabel(): string {
    return this.confirmAction() ? this.actionLabel(this.confirmAction()!) : 'Confirm';
  }
  openChequeAction(row: AccountTransaction, action: ChequeAction): void {
    if (!this.canPost() || this.actionBusy()) return;
    this.confirmRow.set(row);
    this.confirmAction.set(action);
  }
  closeConfirmation(): void {
    if (!this.actionBusy()) {
      this.confirmAction.set(null);
      this.confirmRow.set(null);
    }
  }
  submitChequeAction(): void {
    const row = this.confirmRow();
    const action = this.confirmAction();
    if (!row || !action || this.actionBusy() || !this.requestGuard.begin()) return;
    this.actionBusy.set(true);
    this.api.chequeAction(row.id, action).subscribe({
      next: () => {
        this.requestGuard.end();
        this.actionBusy.set(false);
        this.closeConfirmation();
        this.load();
      },
      error: (err) => {
        this.requestGuard.end();
        this.actionBusy.set(false);
        this.error.set(err.message || 'Unable to update cheque status.');
        this.closeConfirmation();
      },
    });
  }
  openVoid(id: number): void {
    this.voidReason = '';
    this.voidId.set(id);
  }
  submitVoid(): void {
    const id = this.voidId();
    if (!id || !this.voidReason.trim() || this.voiding) return;
    this.voiding = true;
    this.api.voidTransaction(id, this.voidReason.trim()).subscribe({
      next: () => {
        this.voiding = false;
        this.voidId.set(null);
        this.load();
      },
      error: (err) => {
        this.voiding = false;
        this.error.set(err.message || 'Unable to void document.');
      },
    });
  }
}
