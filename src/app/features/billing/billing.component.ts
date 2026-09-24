import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BillingApiService } from '../../core/api/billing-api.service';
import { Invoice, Quotation } from '../../shared/models/billing.models';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmSearchInputComponent } from '../../shared/components/bm-search-input/bm-search-input.component';
import { BmPaginationComponent } from '../../shared/components/bm-pagination/bm-pagination.component';
import { PaginationMeta } from '../../core/api/api.models';

@Component({
  selector: 'bm-billing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BmLoadingStateComponent,
    BmStatusBadgeComponent,
    BmSearchInputComponent,
    BmPaginationComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider text-emerald-700">Billing</div>
          <h1 class="text-3xl font-bold text-slate-900 mt-1">
            {{ type() === 'quotations' ? 'Quotations' : 'Invoices' }}
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            Branch-scoped billing records and financial activity
          </p>
        </div>
        <a class="bm-btn bm-btn-primary" [routerLink]="['/app/billing', type(), 'new']">
          + Create {{ type() === 'quotations' ? 'Quotation' : 'Invoice' }}
        </a>
      </div>

      <!-- Toolbar Filters -->
      <div class="bm-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <bm-search-input
            [value]="searchQuery()"
            placeholder="Search document no, title, work order, total..."
            (searchChange)="onSearchChange($event)"
          ></bm-search-input>

          <select
            [value]="selectedStatus()"
            (change)="onStatusChange($event)"
            class="bm-input !w-auto text-xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued / Sent</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
            <option value="converted">Converted</option>
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

      @if (error()) {
        <div class="bm-card p-4 text-sm text-rose-700 font-medium">{{ error() }}</div>
      }

      @if (loading()) {
        <bm-loading-state type="table"></bm-loading-state>
      } @else {
        <div class="bm-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
                >
                  <th class="py-3.5 px-4">Number</th>
                  <th class="py-3.5 px-4">Title</th>
                  <th class="py-3.5 px-4">Work Order</th>
                  <th class="py-3.5 px-4">Date</th>
                  <th class="py-3.5 px-4">Total</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (row of paginatedRows(); track row.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="py-3.5 px-4 font-semibold text-emerald-700 tabular-nums">
                      {{ number(row) }}
                    </td>
                    <td class="py-3.5 px-4 font-medium text-slate-900">{{ row.title }}</td>
                    <td class="py-3.5 px-4 text-slate-600">
                      {{ row.work_order?.work_order_no || '—' }}
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 tabular-nums">{{ date(row) }}</td>
                    <td class="py-3.5 px-4 font-semibold text-slate-900 tabular-nums">
                      AED {{ money(row.total_amount) }}
                    </td>
                    <td class="py-3.5 px-4">
                      <bm-status-badge [status]="row.status"></bm-status-badge>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <a
                          class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 inline-flex items-center justify-center transition shadow-2xs"
                          [routerLink]="['/app/billing', type(), row.id]"
                          title="View Document"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
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
                        </a>
                        @if (row.status === 'draft') {
                          <a
                            class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 inline-flex items-center justify-center transition shadow-2xs"
                            [routerLink]="['/app/billing', type(), row.id, 'edit']"
                            title="Edit Draft"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </a>
                        }
                        @if (type() === 'quotations' && row.status !== 'converted') {
                          <button
                            class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 inline-flex items-center justify-center transition shadow-2xs cursor-pointer"
                            (click)="convert(row.id)"
                            title="Convert to Invoice"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                          </button>
                        }
                        <button
                          class="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 inline-flex items-center justify-center transition shadow-2xs cursor-pointer"
                          (click)="remove(row.id)"
                          title="Void Record"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="p-12 text-center text-slate-500 font-medium">
                      No {{ type() }} records found matching your filters.
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
    </div>
  `,
})
export class BillingComponent {
  private api = inject(BillingApiService);
  private route = inject(ActivatedRoute);

  type = signal<'quotations' | 'invoices'>('quotations');
  rows = signal<(Quotation | Invoice)[]>([]);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');
  currentPage = signal(1);
  pageSize = signal(10);
  loading = signal(true);
  error = signal<string | null>(null);

  filteredRows = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.rows().filter((row) => {
      if (st !== 'all' && (row.status || '').toLowerCase() !== st) return false;
      if (!q) return true;
      const num = this.number(row).toLowerCase();
      const title = (row.title || '').toLowerCase();
      const workOrder = (row.work_order?.work_order_no || '').toLowerCase();
      const dt = this.date(row).toLowerCase();
      const total = String(row.total_amount || '');
      const status = (row.status || '').toLowerCase();
      return (
        num.includes(q) ||
        title.includes(q) ||
        workOrder.includes(q) ||
        dt.includes(q) ||
        total.includes(q) ||
        status.includes(q)
      );
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

  hasActiveFilters = computed(() => !!this.searchQuery() || this.selectedStatus() !== 'all');

  constructor() {
    this.route.data.subscribe((data) => {
      this.type.set(data['type'] || 'quotations');
      this.currentPage.set(1);
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    const failure = (err: { message?: string }) => {
      this.error.set(err.message || 'Unable to load billing records.');
      this.loading.set(false);
    };

    if (this.type() === 'quotations') {
      this.api.quotations().subscribe({
        next: (res) => {
          this.rows.set(res.data);
          this.loading.set(false);
        },
        error: failure,
      });
    } else {
      this.api.invoices().subscribe({
        next: (res) => {
          this.rows.set(res.data);
          this.loading.set(false);
        },
        error: failure,
      });
    }
  }

  onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(val);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('all');
    this.currentPage.set(1);
  }

  convert(id: number): void {
    this.api.convertQuotation(id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.message || 'Unable to convert quotation.'),
    });
  }

  remove(id: number): void {
    const request =
      this.type() === 'quotations' ? this.api.deleteQuotation(id) : this.api.deleteInvoice(id);
    request.subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.message || 'Unable to void document.'),
    });
  }

  number(row: Quotation | Invoice): string {
    return 'quotation_no' in row ? row.quotation_no : row.invoice_no;
  }

  date(row: Quotation | Invoice): string {
    return 'quotation_no' in row ? row.quotation_date : row.invoice_date;
  }

  money(value: number | string | undefined): string {
    return Number(value || 0).toLocaleString('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
