import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { BmSearchInputComponent } from '../../shared/components/bm-search-input/bm-search-input.component';
import { BmPaginationComponent } from '../../shared/components/bm-pagination/bm-pagination.component';
import { PaginationMeta } from '../../core/api/api.models';

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
    BmSearchInputComponent,
    BmPaginationComponent,
  ],
  template: `
    <bm-page-header title="Petty Cash Daybook" subtitle="Daily cash income and expenses">
      <button
        type="button"
        (click)="entryOpen.set(!entryOpen())"
        class="bm-btn bm-btn-primary text-xs"
      >
        {{ entryOpen() ? 'Close Entry' : 'Create Daybook Entry' }}
      </button>
      <a routerLink="/app/accounts/dashboard" class="bm-btn bm-btn-secondary text-xs"
        >Accounts Dashboard</a
      >
    </bm-page-header>

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

      <!-- Toolbar Filters -->
      <div class="bm-card p-4 mb-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <bm-search-input
            [value]="searchQuery()"
            placeholder="Search date, voucher, particulars, amount..."
            (searchChange)="onSearchChange($event)"
          ></bm-search-input>

          <select
            [value]="selectedDirection()"
            (change)="onDirectionChange($event)"
            class="bm-input !w-auto text-xs font-medium"
          >
            <option value="all">All Directions</option>
            <option value="inward">Cash In</option>
            <option value="outward">Cash Out</option>
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

      <div class="bm-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
              >
                <th class="p-4">Date</th>
                <th class="p-4">Voucher</th>
                <th class="p-4">Particulars</th>
                <th class="p-4">Cash In</th>
                <th class="p-4">Cash Out</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (row of paginatedRows(); track row.id) {
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
                      class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition font-semibold text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
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
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-slate-500 font-medium">
                    No petty cash transactions found matching your filters.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (filteredRows().length > 0) {
          <bm-pagination
            [meta]="paginationMeta()"
            (pageChange)="currentPage.set($event)"
          ></bm-pagination>
        }
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

  searchQuery = signal('');
  selectedDirection = signal<'all' | 'inward' | 'outward'>('all');
  currentPage = signal(1);
  pageSize = signal(10);

  filteredRows = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const dir = this.selectedDirection();
    return this.rows().filter((r) => {
      const matchDir = dir === 'all' || r.direction === dir;
      if (!matchDir) return false;
      if (!q) return true;
      const date = (r.transaction_date || '').toLowerCase();
      const doc = (r.document_no || '').toLowerCase();
      const remarks = (r.remarks || '').toLowerCase();
      const amt = String(r.amount || '');
      return date.includes(q) || doc.includes(q) || remarks.includes(q) || amt.includes(q);
    });
  });

  paginationMeta = computed<PaginationMeta>(() => {
    const total = this.filteredRows().length;
    const page = this.currentPage();
    const size = this.pageSize();
    const lastPage = Math.max(1, Math.ceil(total / size));
    const from = total === 0 ? 0 : (page - 1) * size + 1;
    const to = Math.min(total, page * size);
    return { current_page: page, per_page: size, total, last_page: lastPage, from, to };
  });

  paginatedRows = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredRows().slice(start, start + size);
  });

  hasActiveFilters = computed(() => !!this.searchQuery() || this.selectedDirection() !== 'all');

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

  onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  onDirectionChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'all' | 'inward' | 'outward';
    this.selectedDirection.set(val);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedDirection.set('all');
    this.currentPage.set(1);
  }
}
