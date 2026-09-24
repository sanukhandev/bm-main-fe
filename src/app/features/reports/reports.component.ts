import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
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
    <bm-page-header [title]="title()" subtitle="Branch-scoped, backend-calculated report"
      ><a routerLink="/app/dashboard" class="bm-btn bm-btn-secondary text-xs"
        >Dashboard</a
      ></bm-page-header
    >
    <nav class="flex flex-wrap gap-2 mb-5" aria-label="Reports">
      <a routerLink="/app/reports/intelligent" class="bm-btn bm-btn-primary text-xs"
        >Intelligent Report</a
      >
      <a
        *ngFor="let report of visibleReportLinks()"
        [routerLink]="['/app/reports', report.type]"
        class="bm-btn bm-btn-secondary text-xs"
        >{{ report.label }}</a
      >
    </nav>
    <div class="bm-card p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <input
        class="bm-input"
        type="date"
        [ngModel]="filterValue('date_from')"
        (ngModelChange)="setFilter('date_from', $event)"
        aria-label="Date from"
      />
      <input
        class="bm-input"
        type="date"
        [ngModel]="filterValue('date_to')"
        (ngModelChange)="setFilter('date_to', $event)"
        aria-label="Date to"
      />
      <input
        class="bm-input"
        [ngModel]="filterValue('search')"
        (ngModelChange)="setFilter('search', $event)"
        placeholder="Search"
        aria-label="Search"
      />
      <select
        class="bm-input"
        [ngModel]="filterValue('status')"
        (ngModelChange)="setFilter('status', $event)"
        aria-label="Status"
      >
        <option value="">All statuses</option>
        <option *ngFor="let status of statuses" [value]="status">{{ statusLabel(status) }}</option>
      </select>
      <div class="flex gap-2">
        <button class="bm-btn bm-btn-primary text-xs" type="button" (click)="load()">Apply</button
        ><button class="bm-btn bm-btn-secondary text-xs" type="button" (click)="reset()">
          Reset
        </button>
      </div>
    </div>
    @if (loading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
    } @else {
      @if (summaryEntries().length) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          @for (entry of summaryEntries(); track entry[0]) {
            <div class="bm-card p-4">
              <div class="text-xs text-slate-500">{{ summaryLabel(entry[0]) }}</div>
              <div class="text-xl font-bold text-slate-900">
                {{ isMoney(entry[0]) ? 'AED ' + money(entry[1]) : entry[1] }}
              </div>
            </div>
          }
        </div>
      }
      <div class="bm-card overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50">
            <tr>
              @for (column of columns(); track column.key) {
                <th class="p-4 whitespace-nowrap">{{ column.label }}</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (
              row of response()?.data || [];
              track row['id'] || row['agreement_id'] || row['installment_id'] || row['document_no']
            ) {
              <tr class="hover:bg-slate-50">
                @for (column of columns(); track column.key) {
                  <td class="p-4 whitespace-nowrap">
                    @if (column.key === 'status') {
                      <bm-status-badge [status]="value(row, column.key)"></bm-status-badge>
                    } @else if (column.key === 'agreement_no' && rowLink(row)) {
                      <a class="text-emerald-700 font-semibold" [routerLink]="rowLink(row)">{{
                        value(row, column.key)
                      }}</a>
                    } @else {
                      {{ display(row, column.key) }}
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td class="p-8 text-center text-slate-500" [attr.colspan]="columns().length">
                  No records found for the selected filters.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (lastPage() > 1) {
        <div class="flex items-center justify-between mt-4 text-sm">
          <button
            class="bm-btn bm-btn-secondary text-xs"
            [disabled]="page() <= 1"
            (click)="load(page() - 1)"
          >
            Previous</button
          ><span>Page {{ page() }} of {{ lastPage() }}</span
          ><button
            class="bm-btn bm-btn-secondary text-xs"
            [disabled]="page() >= lastPage()"
            (click)="load(page() + 1)"
          >
            Next
          </button>
        </div>
      }
    }
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
