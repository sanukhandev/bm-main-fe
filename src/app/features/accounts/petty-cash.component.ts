import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AccountsApiService,
  AccountTransaction,
  PettyCashDaybookResponse,
  PettyCashRequest,
} from '../../core/api/accounts-api.service';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmReceiptChequeModalComponent } from '../../shared/components/bm-receipt-cheque-modal/bm-receipt-cheque-modal.component';

@Component({
  selector: 'bm-petty-cash',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    BmPageHeaderComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmReceiptChequeModalComponent,
  ],
  template: `
    <bm-page-header title="Petty Cash Daybook" subtitle="Daily cash income and expenses"
      ><button
        type="button"
        (click)="entryOpen.set(!entryOpen())"
        class="bm-btn bm-btn-primary text-xs"
      >
        {{ entryOpen() ? 'Close Entry' : 'Create Daybook Entry' }}</button
      ><a routerLink="/app/accounts/dashboard" class="bm-btn bm-btn-secondary text-xs"
        >Accounts Dashboard</a
      ></bm-page-header
    >
    @if (entryOpen()) {
      <form
        [formGroup]="entryForm"
        (ngSubmit)="save()"
        class="bm-card p-4 mb-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
      >
        <label class="text-xs text-slate-600"
          >Date<input type="date" formControlName="transaction_date" class="bm-input mt-1"
        /></label>
        <label class="text-xs text-slate-600"
          >Type<select formControlName="direction" class="bm-input mt-1">
            <option value="outward">Cash Out</option>
            <option value="inward">Cash In</option>
          </select></label
        >
        <label class="text-xs text-slate-600"
          >Amount<input
            type="number"
            min="0.01"
            step="0.01"
            formControlName="amount"
            class="bm-input mt-1"
        /></label>
        <label class="text-xs text-slate-600"
          >Particulars<input
            formControlName="particulars"
            class="bm-input mt-1"
            placeholder="Stationery, replenishment..."
        /></label>
        <button type="submit" class="bm-btn bm-btn-primary text-xs" [disabled]="saving()">
          {{ saving() ? 'Saving…' : 'Add Entry' }}
        </button>
      </form>
    }
    @if (loading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
    } @else {
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div class="bm-card p-4">
          <div class="text-xs text-slate-500">Opening</div>
          <div class="font-semibold">AED {{ book()?.meta?.opening_balance }}</div>
        </div>
        <div class="bm-card p-4">
          <div class="text-xs text-slate-500">Cash In</div>
          <div class="font-semibold text-emerald-700">AED {{ book()?.meta?.total_in }}</div>
        </div>
        <div class="bm-card p-4">
          <div class="text-xs text-slate-500">Cash Out</div>
          <div class="font-semibold text-rose-700">AED {{ book()?.meta?.total_out }}</div>
        </div>
        <div class="bm-card p-4">
          <div class="text-xs text-slate-500">Closing</div>
          <div class="font-semibold">AED {{ book()?.meta?.closing_balance }}</div>
        </div>
      </div>
      <div class="bm-card overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-50 text-slate-500 uppercase">
              <th class="p-4">Date</th>
              <th class="p-4">Voucher</th>
              <th class="p-4">Particulars</th>
              <th class="p-4">Cash In</th>
              <th class="p-4">Cash Out</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (row of rows(); track row.id) {
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="p-4 font-medium text-slate-600 tabular-nums">
                  {{ row.transaction_date }}
                </td>
                <td class="p-4 font-bold text-slate-900 tabular-nums">{{ row.document_no }}</td>
                <td class="p-4 text-slate-700">{{ row.remarks || '—' }}</td>
                <td class="p-4 font-semibold text-emerald-700 tabular-nums">
                  {{ row.direction === 'inward' ? 'AED ' + row.amount : '—' }}
                </td>
                <td class="p-4 font-semibold text-rose-700 tabular-nums">
                  {{ row.direction === 'outward' ? 'AED ' + row.amount : '—' }}
                </td>
                <td class="p-4 text-right">
                  <button
                    type="button"
                    (click)="selectedVoucherRow.set(row)"
                    class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition font-semibold text-xs inline-flex items-center gap-1 shadow-2xs"
                    aria-label="View Bank Cheque / Receipt Voucher"
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
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
    <bm-receipt-cheque-modal
      [isOpen]="selectedVoucherRow() !== null"
      [transaction]="selectedVoucherRow()"
      (close)="selectedVoucherRow.set(null)"
    ></bm-receipt-cheque-modal>
  `,
})
export class PettyCashComponent implements OnInit {
  private api = inject(AccountsApiService);
  private fb = inject(FormBuilder);
  book = signal<PettyCashDaybookResponse | null>(null);
  rows = signal<AccountTransaction[]>([]);
  selectedVoucherRow = signal<AccountTransaction | null>(null);
  loading = signal(true);
  saving = signal(false);
  entryOpen = signal(true);
  error = signal<string | null>(null);
  entryForm = this.fb.nonNullable.group({
    transaction_date: [new Date().toLocaleDateString('en-CA'), Validators.required],
    direction: ['outward' as 'inward' | 'outward', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    particulars: ['', Validators.required],
  });
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api.getPettyCash().subscribe({
      next: (res) => {
        this.book.set(res);
        this.rows.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load petty cash.');
        this.loading.set(false);
      },
    });
  }
  save(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.api.createPettyCash(this.entryForm.getRawValue() as PettyCashRequest).subscribe({
      next: () => {
        this.entryForm.patchValue({ amount: 0, particulars: '' });
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to save petty cash entry.');
        this.saving.set(false);
      },
    });
  }
}
