import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  ReportsApiService,
  ReportFilters,
  ReportResponse,
  ReportRow,
  ReportType,
} from '../../core/api/reports-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';

@Component({
  selector: 'bm-reports',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BmPageHeaderComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmStatusBadgeComponent,
  ],
  template: `
    <div class="max-w-[1740px] mx-auto space-y-6 font-sans text-[#0F172A]">
      <bm-page-header
        [title]="title()"
        subtitle="Branch-scoped, backend-calculated financial & operational report"
      >
        <a routerLink="/app/dashboard" class="bm-btn bm-btn-secondary text-xs"> Dashboard </a>
      </bm-page-header>

      <!-- Bento Report Navigation Pill Bar -->
      <nav
        class="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs flex flex-wrap gap-2 items-center"
        aria-label="Reports Directory"
      >
        <a
          routerLink="/app/reports/intelligent"
          class="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs hover:opacity-90 transition flex items-center gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-emerald-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Intelligent Report</span>
        </a>

        @for (report of visibleReportLinks(); track report.type) {
          <a
            [routerLink]="['/app/reports', report.type]"
            [class.bg-slate-900]="type() === report.type"
            [class.text-white]="type() === report.type"
            [class.shadow-2xs]="type() === report.type"
            [class.bg-slate-100/80]="type() !== report.type"
            [class.text-slate-700]="type() !== report.type"
            [class.hover:bg-slate-200]="type() !== report.type"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            {{ report.label }}
          </a>
        }
      </nav>

      <!-- Bento Filter Card Container -->
      <div
        class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
      >
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >From Date</label
          >
          <input
            class="bm-input"
            type="date"
            [ngModel]="filterValue('date_from')"
            (ngModelChange)="setFilter('date_from', $event)"
            aria-label="Date from"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >To Date</label
          >
          <input
            class="bm-input"
            type="date"
            [ngModel]="filterValue('date_to')"
            (ngModelChange)="setFilter('date_to', $event)"
            aria-label="Date to"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >Keyword Search</label
          >
          <input
            class="bm-input"
            [ngModel]="filterValue('search')"
            (ngModelChange)="setFilter('search', $event)"
            placeholder="Search records..."
            aria-label="Search"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >Record Status</label
          >
          <select
            class="bm-input"
            [ngModel]="filterValue('status')"
            (ngModelChange)="setFilter('status', $event)"
            aria-label="Status"
          >
            <option value="">All Statuses</option>
            <option *ngFor="let status of statuses" [value]="status">
              {{ statusLabel(status) }}
            </option>
          </select>
        </div>
        <div class="flex gap-2">
          <button
            class="bm-btn bm-btn-primary text-xs flex-1 cursor-pointer"
            type="button"
            (click)="load()"
          >
            Apply
          </button>
          <button
            class="bm-btn bm-btn-secondary text-xs cursor-pointer"
            type="button"
            (click)="reset()"
          >
            Reset
          </button>
        </div>
      </div>

      @if (loading()) {
        <bm-loading-state type="table"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
      } @else {
        <!-- Bento Summary Metric Cards -->
        @if (summaryEntries().length) {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            @for (entry of summaryEntries(); track entry[0]) {
              <div
                class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition"
              >
                <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {{ summaryLabel(entry[0]) }}
                </div>
                <div
                  class="text-2xl font-extrabold text-slate-900 tabular-nums mt-1.5 flex items-center"
                >
                  @if (isMoney(entry[0])) {
                    <dirham-symbol
                      size="0.85em"
                      weight="bold"
                      class="mr-1 text-slate-500 select-none"
                    ></dirham-symbol>
                    <span>{{ money(entry[1]) }}</span>
                  } @else {
                    <span>{{ entry[1] }}</span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Bento Table Container -->
        <div class="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
                >
                  @for (column of columns(); track column.key) {
                    <th class="p-4 whitespace-nowrap">{{ column.label }}</th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (
                  row of response()?.data || [];
                  track row['id'] ||
                    row['agreement_id'] ||
                    row['installment_id'] ||
                    row['document_no']
                ) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    @for (column of columns(); track column.key) {
                      <td class="p-4 whitespace-nowrap">
                        @if (column.key === 'status') {
                          <bm-status-badge [status]="value(row, column.key)"></bm-status-badge>
                        } @else if (column.key === 'agreement_no' && rowLink(row)) {
                          <a
                            class="text-emerald-700 font-semibold hover:underline"
                            [routerLink]="rowLink(row)"
                          >
                            {{ value(row, column.key) }}
                          </a>
                        } @else {
                          {{ display(row, column.key) }}
                        }
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td
                      class="p-8 text-center text-slate-500 font-medium"
                      [attr.colspan]="columns().length"
                    >
                      No report records match the selected filter criteria.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (lastPage() > 1) {
            <div
              class="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 text-xs"
            >
              <button
                class="bm-btn bm-btn-secondary text-xs"
                [disabled]="page() <= 1"
                (click)="load(page() - 1)"
              >
                Previous
              </button>
              <span class="font-semibold text-slate-700"
                >Page {{ page() }} of {{ lastPage() }}</span
              >
              <button
                class="bm-btn bm-btn-secondary text-xs"
                [disabled]="page() >= lastPage()"
                (click)="load(page() + 1)"
              >
                Next
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ReportsComponent implements OnInit, OnDestroy {
  private api = inject(ReportsApiService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private sub?: Subscription;
  type = signal<ReportType>('owner-agreements');
  response = signal<ReportResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  page = signal(1);
  lastPage = signal(1);
  filters: ReportFilters = { date_from: '', date_to: '', search: '', status: '' };
  statuses = [
    'draft',
    'pending_approval',
    'approved',
    'commenced',
    'on_hold',
    'expired',
    'terminated',
    'cancelled',
    'posted',
    'void',
  ];
  reportLinks = [
    { type: 'owner-agreements' as ReportType, label: 'Owner Agreements' },
    { type: 'tenant-agreements' as ReportType, label: 'Tenant Agreements' },
    { type: 'agreement-expiry' as ReportType, label: 'Expiry' },
    { type: 'tenant-outstanding' as ReportType, label: 'Tenant Outstanding' },
    { type: 'owner-payables' as ReportType, label: 'Owner Payables' },
    { type: 'inward-receipts' as ReportType, label: 'Inward Receipts' },
    { type: 'outward-vouchers' as ReportType, label: 'Outward Vouchers' },
    { type: 'daily-cash-movement' as ReportType, label: 'Daily Cash' },
    { type: 'petty-cash' as ReportType, label: 'Petty Cash' },
  ];
  visibleReportLinks(): { type: ReportType; label: string }[] {
    return this.auth.hasPermission('accounts.view')
      ? this.reportLinks
      : this.reportLinks.slice(0, 3);
  }

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params) => {
      const type = params.get('type') as ReportType;
      this.type.set(type || 'owner-agreements');
      this.page.set(1);
      this.load();
    });
  }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  title(): string {
    return (
      {
        'owner-agreements': 'Owner Agreement Report',
        'tenant-agreements': 'Tenant Agreement Report',
        'agreement-expiry': 'Agreement Expiry Report',
        'tenant-outstanding': 'Tenant Outstanding Report',
        'owner-payables': 'Owner Payable Report',
        'inward-receipts': 'Inward Receipt Report',
        'outward-vouchers': 'Outward Voucher Report',
        'daily-cash-movement': 'Daily Cash Movement Report',
        'petty-cash': 'Petty Cash Report',
      } as Record<ReportType, string>
    )[this.type()];
  }
  load(page = this.page()): void {
    this.loading.set(true);
    this.error.set(null);
    this.page.set(page);
    this.api.get(this.type(), { ...this.filters, page, per_page: 25 }).subscribe({
      next: (result) => {
        this.response.set(result);
        this.lastPage.set(result.meta?.last_page || 1);
        this.loading.set(false);
      },
      error: (err) => {
        this.response.set(null);
        this.error.set(err?.error?.message || err?.message || 'Unable to load report.');
        this.loading.set(false);
      },
    });
  }
  reset(): void {
    this.filters = { date_from: '', date_to: '', search: '', status: '' };
    this.load(1);
  }
  columns(): { key: string; label: string }[] {
    const type = this.type();
    if (type === 'agreement-expiry')
      return [
        { key: 'agreement_type', label: 'Type' },
        { key: 'agreement_no', label: 'Agreement' },
        { key: 'customer', label: 'Customer' },
        { key: 'end_date', label: 'End Date' },
        { key: 'days_remaining', label: 'Days Remaining' },
        { key: 'status', label: 'Status' },
      ];
    if (type === 'tenant-outstanding' || type === 'owner-payables')
      return [
        { key: 'party_name', label: type === 'tenant-outstanding' ? 'Tenant' : 'Owner' },
        { key: 'agreement_no', label: 'Agreement' },
        { key: 'installment_no', label: 'Installment' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'amount', label: 'Amount' },
        { key: 'paid_amount', label: 'Paid' },
        { key: 'outstanding_amount', label: 'Outstanding' },
        { key: 'days_overdue', label: 'Days Overdue' },
      ];
    if (type === 'inward-receipts' || type === 'outward-vouchers')
      return [
        { key: 'document_no', label: type === 'inward-receipts' ? 'Receipt No' : 'Voucher No' },
        { key: 'transaction_date', label: 'Date' },
        { key: 'party', label: 'Party' },
        { key: 'payment_mode', label: 'Mode' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
        { key: 'remarks', label: 'Remarks' },
      ];
    if (type === 'daily-cash-movement')
      return [
        { key: 'date', label: 'Date' },
        { key: 'cash_in', label: 'Cash In' },
        { key: 'cash_out', label: 'Cash Out' },
        { key: 'net', label: 'Net' },
        { key: 'transaction_count', label: 'Transactions' },
      ];
    if (type === 'petty-cash')
      return [
        { key: 'date', label: 'Date' },
        { key: 'document_no', label: 'Document' },
        { key: 'particulars', label: 'Particulars' },
        { key: 'cash_in', label: 'Cash In' },
        { key: 'cash_out', label: 'Cash Out' },
        { key: 'running_balance', label: 'Balance' },
      ];
    return [
      { key: 'agreement_no', label: 'Agreement No' },
      { key: 'owner_name', label: type === 'owner-agreements' ? 'Owner' : 'Tenant' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'end_date', label: 'End Date' },
      { key: 'status', label: 'Status' },
      { key: 'agreement_amount', label: 'Value' },
      { key: 'outstanding_amount', label: 'Outstanding' },
    ];
  }
  summaryEntries(): [string, string | number | null][] {
    const summary = this.response()?.meta?.summary || this.response()?.summary || {};
    return Object.entries(summary).filter(([, value]) => value !== null) as [
      string,
      string | number | null,
    ][];
  }
  summaryLabel(key: string): string {
    return key.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }
  statusLabel(status: string): string {
    return this.summaryLabel(status);
  }
  value(row: ReportRow, key: string): string {
    return String(row[key] ?? '—');
  }
  display(row: ReportRow, key: string): string {
    const value = row[key];
    return key.includes('amount') || key.includes('cash_') || key === 'net' || key.includes('total')
      ? `AED ${this.money(this.scalar(value))}`
      : this.value(row, key);
  }
  money(value: string | number | null | undefined): string {
    return Number(value || 0).toFixed(2);
  }
  isMoney(key: string): boolean {
    return (
      key.includes('amount') ||
      key.includes('cash') ||
      key.includes('total') ||
      key.includes('outstanding') ||
      key.includes('payable') ||
      key.includes('receivable')
    );
  }
  rowLink(row: ReportRow): string[] | null {
    if (row['agreement_type'] === 'owner')
      return ['/app/owner-agreements', String(row['agreement_id'])];
    if (row['agreement_type'] === 'tenant' || row['agreement_id'])
      return ['/app/tenant-agreements', String(row['agreement_id'])];
    return null;
  }
  filterValue(key: string): string | number | boolean | undefined {
    return this.filters[key];
  }
  setFilter(key: string, value: string): void {
    this.filters[key] = value;
  }
  scalar(value: string | number | null | ReportRow[]): string | number | null {
    return Array.isArray(value) ? null : value;
  }
}
