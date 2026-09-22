import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BillingApiService } from '../../core/api/billing-api.service';
import { Invoice, Quotation } from '../../shared/models/billing.models';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';

@Component({
  selector: 'bm-billing',
  standalone: true,
  imports: [CommonModule, RouterLink, BmLoadingStateComponent, BmStatusBadgeComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider text-emerald-700">Billing</div>
          <h1 class="text-3xl font-bold text-slate-900 mt-1">{{ type() === 'quotations' ? 'Quotations' : 'Invoices' }}</h1>
          <p class="text-sm text-slate-500 mt-1">Branch-scoped billing records and financial activity</p>
        </div>
        <a class="bm-btn bm-btn-primary" [routerLink]="['/app/billing', type(), 'new']">
          + Create {{ type() === 'quotations' ? 'Quotation' : 'Invoice' }}
        </a>
      </div>

      @if (error()) {
        <div class="bm-card p-4 text-sm text-rose-700 font-medium">{{ error() }}</div>
      }

      @if (loading()) {
        <bm-loading-state type="table"></bm-loading-state>
      } @else {
        <div class="bm-card overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th class="p-4">Number</th>
                <th class="p-4">Title</th>
                <th class="p-4">Work Order</th>
                <th class="p-4">Date</th>
                <th class="p-4">Total</th>
                <th class="p-4">Status</th>
                <th class="p-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (row of rows(); track row.id) {
                <tr class="hover:bg-slate-50/50 transition">
                  <td class="p-4 font-semibold text-emerald-700">{{ number(row) }}</td>
                  <td class="p-4">{{ row.title }}</td>
                  <td class="p-4">{{ row.work_order?.work_order_no || '—' }}</td>
                  <td class="p-4">{{ date(row) }}</td>
                  <td class="p-4 font-semibold tabular-nums">AED {{ money(row.total_amount) }}</td>
                  <td class="p-4">
                    <bm-status-badge [status]="row.status"></bm-status-badge>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <a class="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition" [routerLink]="['/app/billing', type(), row.id]" title="View Document">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      @if (row.status === 'draft') {
                        <a class="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition" [routerLink]="['/app/billing', type(), row.id, 'edit']" title="Edit Draft">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                      }
                      @if (type() === 'quotations' && row.status !== 'converted') {
                        <button class="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition" (click)="convert(row.id)" title="Convert to Invoice">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                      }
                      <button class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition" (click)="remove(row.id)" title="Void Record">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="p-12 text-center text-slate-500 font-medium">No {{ type() }} records found.</td>
                </tr>
              }
            </tbody>
          </table>
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
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.route.data.subscribe((data) => {
      this.type.set(data['type'] || 'quotations');
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

  convert(id: number): void {
    this.api.convertQuotation(id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err.message || 'Unable to convert quotation.'),
    });
  }

  remove(id: number): void {
    const request = this.type() === 'quotations' ? this.api.deleteQuotation(id) : this.api.deleteInvoice(id);
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
    return Number(value || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
