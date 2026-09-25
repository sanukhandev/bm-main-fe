import { Component, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingApiService } from '../../core/api/billing-api.service';
import { BillingPayment, Invoice, Quotation } from '../../shared/models/billing.models';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';

@Component({
  selector: 'bm-billing-detail',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, RouterLink, FormsModule, BmStatusBadgeComponent],
  template: `
    <div class="max-w-6xl mx-auto space-y-6 font-sans text-slate-900">
      @if (error()) {
        <div
          class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium"
        >
          {{ error() }}
        </div>
      }

      @if (record()) {
        <!-- TOP NAVIGATION & ACTION BAR -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <a
              [routerLink]="['/app/billing', type()]"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to {{ type() === 'quotations' ? 'Quotations' : 'Invoices' }}</span>
            </a>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {{ number(record()!) }}
              </h1>
              <bm-status-badge [status]="record()!.status"></bm-status-badge>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              {{ record()!.title }}
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            @if (record()!.status === 'draft') {
              <a
                [routerLink]="['/app/billing', type(), record()!.id, 'edit']"
                class="bm-btn bm-btn-secondary text-xs flex items-center gap-1.5 px-4 py-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-slate-500"
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
                <span>Edit Draft</span>
              </a>
            }

            @if (type() === 'quotations' && record()!.status !== 'converted') {
              <button
                class="bm-btn bm-btn-primary text-xs flex items-center gap-1.5 px-4 py-2 shadow-md hover:shadow-lg transition"
                (click)="convert()"
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
                <span>Convert to Invoice</span>
              </button>
            }
          </div>
        </div>

        <!-- DOCUMENT METADATA BENTO CARD -->
        <div
          class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs relative overflow-hidden"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {{ type() === 'quotations' ? 'Quotation Date' : 'Invoice Date' }}
              </span>
              <span class="text-sm font-bold text-slate-900 mt-1 block tabular-nums">
                {{ date(record()!) }}
              </span>
            </div>

            <div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {{ type() === 'quotations' ? 'Valid Until' : 'Due Date' }}
              </span>
              <span class="text-sm font-bold text-slate-900 mt-1 block tabular-nums">
                {{ secondaryDate(record()!) || '—' }}
              </span>
            </div>

            <div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Work Order
              </span>
              <span class="text-sm font-bold text-slate-900 mt-1 block">
                @if (record()!.work_order?.work_order_no) {
                  <span
                    class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 font-mono text-xs text-slate-800"
                  >
                    {{ record()!.work_order?.work_order_no }}
                  </span>
                } @else {
                  <span class="text-slate-400 font-normal">None</span>
                }
              </span>
            </div>

            <div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Vendor
              </span>
              <span class="text-sm font-bold text-slate-900 mt-1 block">
                {{ record()!.vendor?.name || '—' }}
              </span>
            </div>
          </div>

          @if (record()!.description) {
            <div class="mt-5 pt-4 border-t border-slate-100">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Description / Scope Notes
              </span>
              <p class="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {{ record()!.description }}
              </p>
            </div>
          }
        </div>

        <!-- FINANCIAL METRICS BENTO CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Subtotal -->
          <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Subtotal
            </span>
            <div class="text-2xl font-extrabold text-slate-900 tabular-nums mt-1 flex items-center">
              <dirham-symbol
                size="0.85em"
                weight="bold"
                class="mr-1.5 text-slate-400 select-none"
              ></dirham-symbol>
              <span>{{ money(record()!.subtotal) }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Sum of line items before tax</p>
          </div>

          <!-- Tax -->
          <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Tax / VAT
            </span>
            <div class="text-2xl font-extrabold text-slate-900 tabular-nums mt-1 flex items-center">
              <dirham-symbol
                size="0.85em"
                weight="bold"
                class="mr-1.5 text-slate-400 select-none"
              ></dirham-symbol>
              <span>{{ money(record()!.tax_amount) }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Applicable tax adjustments</p>
          </div>

          <!-- Grand Total -->
          <div
            class="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white p-5 shadow-2xs"
          >
            <span class="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Grand Total
            </span>
            <div
              class="text-2xl font-extrabold text-emerald-800 tabular-nums mt-1 flex items-center"
            >
              <dirham-symbol
                size="0.85em"
                weight="bold"
                class="mr-1.5 text-emerald-600 select-none"
              ></dirham-symbol>
              <span>{{ money(record()!.total_amount) }}</span>
            </div>
            <p class="text-xs text-emerald-700 font-medium mt-1">Total document amount</p>
          </div>
        </div>

        <!-- LINE ITEMS BENTO TABLE -->
        <div class="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-base font-extrabold text-slate-900">Line Particulars</h2>
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700"
            >
              {{ record()!.lines?.length || 0 }} Items
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]"
                >
                  <th class="py-3 px-4">Particulars</th>
                  <th class="py-3 px-4 text-center">Quantity</th>
                  <th class="py-3 px-4 text-right">Unit Price</th>
                  <th class="py-3 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                @for (line of record()!.lines || []; track line.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-4 font-bold text-slate-900">{{ line.particulars }}</td>
                    <td class="py-3.5 px-4 text-center tabular-nums text-slate-700 font-semibold">
                      {{ line.quantity }}
                    </td>
                    <td class="py-3.5 px-4 text-right tabular-nums text-slate-700 font-semibold">
                      <div class="flex items-center justify-end">
                        <dirham-symbol
                          size="0.85em"
                          weight="bold"
                          class="mr-1 text-slate-400 select-none"
                        ></dirham-symbol>
                        <span>{{ money(line.unit_price) }}</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-right tabular-nums font-extrabold text-slate-900">
                      <div class="flex items-center justify-end">
                        <dirham-symbol
                          size="0.85em"
                          weight="bold"
                          class="mr-1 text-slate-400 select-none"
                        ></dirham-symbol>
                        <span>{{ money(line.line_total) }}</span>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="p-8 text-center text-slate-500 font-medium">
                      No line items attached to this document.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- PAYMENT LINES & SETTLEMENT BENTO SECTION -->
        <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div
            class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100"
          >
            <div>
              <h2 class="text-base font-extrabold text-slate-900">Payment & Settlement Lines</h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Posted payment lines generate Accounts inward/outward receipts or vouchers.
              </p>
            </div>
            <button
              class="bm-btn bm-btn-secondary text-xs font-bold flex items-center gap-1.5 px-3.5 py-2"
              (click)="showPaymentForm.set(!showPaymentForm())"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-emerald-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>{{ showPaymentForm() ? 'Close Form' : 'Add Payment Line' }}</span>
            </button>
          </div>

          <!-- ADD PAYMENT LINE INLINE FORM -->
          @if (showPaymentForm()) {
            <form
              (ngSubmit)="addPayment()"
              class="grid grid-cols-1 md:grid-cols-3 gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs"
            >
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >Direction</label
                >
                <select
                  class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                  [(ngModel)]="payment.direction"
                  name="direction"
                >
                  <option value="inward">Inward (Receipt from Customer/Tenant)</option>
                  <option value="outward">Outward (Payment to Vendor/Owner)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >Particulars <span class="text-rose-500">*</span></label
                >
                <input
                  class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                  [(ngModel)]="payment.particulars"
                  name="particulars"
                  placeholder="e.g. Initial Deposit Payment"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >Amount <span class="text-rose-500">*</span></label
                >
                <input
                  class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs text-right tabular-nums"
                  type="number"
                  min="0.01"
                  step="0.01"
                  [(ngModel)]="payment.amount"
                  name="amount"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >Due Date</label
                >
                <input
                  class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                  type="date"
                  [(ngModel)]="payment.due_date"
                  name="due_date"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >Payment Mode</label
                >
                <select
                  class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                  [(ngModel)]="payment.payment_mode"
                  name="payment_mode"
                  (ngModelChange)="onPaymentModeChange()"
                >
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              @if (payment.payment_mode === 'cheque') {
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >Cheque Number <span class="text-rose-500">*</span></label
                  >
                  <input
                    class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                    [(ngModel)]="payment.cheque_no"
                    name="cheque_no"
                    placeholder="Cheque No"
                    required
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >Cheque Date <span class="text-rose-500">*</span></label
                  >
                  <input
                    class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                    type="date"
                    [(ngModel)]="payment.cheque_date"
                    name="cheque_date"
                    required
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >Drawn Bank Name</label
                  >
                  <input
                    class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                    [(ngModel)]="payment.bank_name"
                    name="bank_name"
                    placeholder="Bank Name"
                  />
                </div>
              }

              @if (payment.payment_mode === 'bank_transfer') {
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >Bank Reference <span class="text-rose-500">*</span></label
                  >
                  <input
                    class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                    [(ngModel)]="payment.bank_reference"
                    name="bank_reference"
                    placeholder="Ref No"
                    required
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >Transfer Date <span class="text-rose-500">*</span></label
                  >
                  <input
                    class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                    type="date"
                    [(ngModel)]="payment.transfer_date"
                    name="transfer_date"
                    required
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >Bank Name</label
                  >
                  <input
                    class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                    [(ngModel)]="payment.bank_name"
                    name="bank_name"
                    placeholder="Bank Name"
                  />
                </div>
              }

              <div class="md:col-span-3">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >Remarks</label
                >
                <textarea
                  class="w-full p-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                  rows="2"
                  [(ngModel)]="payment.remarks"
                  name="remarks"
                  placeholder="Optional settlement remarks..."
                ></textarea>
              </div>

              <div class="md:col-span-3 flex justify-end">
                <button
                  class="bm-btn bm-btn-primary text-xs px-5 py-2.5 font-bold shadow-md hover:shadow-lg transition"
                >
                  Save Payment Line
                </button>
              </div>
            </form>
          }

          <!-- PAYMENT LINES DATA TABLE -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]"
                >
                  <th class="py-3 px-4">Direction</th>
                  <th class="py-3 px-4">Particulars</th>
                  <th class="py-3 px-4">Mode</th>
                  <th class="py-3 px-4">Amount</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                @for (line of record()!.payments || []; track line.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-4">
                      <span
                        class="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider border inline-flex items-center gap-1"
                        [class.bg-emerald-50]="line.direction === 'inward'"
                        [class.text-emerald-800]="line.direction === 'inward'"
                        [class.border-emerald-200]="line.direction === 'inward'"
                        [class.bg-amber-50]="line.direction === 'outward'"
                        [class.text-amber-800]="line.direction === 'outward'"
                        [class.border-amber-200]="line.direction === 'outward'"
                      >
                        {{ line.direction }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 font-bold text-slate-900">{{ line.particulars }}</td>
                    <td class="py-3.5 px-4 capitalize text-slate-700">
                      <span
                        class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 font-semibold text-[11px]"
                      >
                        {{ line.payment_mode.replace('_', ' ') }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 font-extrabold text-slate-900 tabular-nums">
                      <div class="flex items-center">
                        <dirham-symbol
                          size="0.85em"
                          weight="bold"
                          class="mr-1 text-slate-400 select-none"
                        ></dirham-symbol>
                        <span>{{ money(line.amount) }}</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <bm-status-badge [status]="line.status"></bm-status-badge>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        @if (line.receipt) {
                          <a
                            [routerLink]="receiptRoute(line.receipt.direction)"
                            class="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 transition"
                            [attr.aria-label]="'Open receipt ' + line.receipt.document_no"
                          >
                            <span>Receipt {{ line.receipt.document_no }}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        }
                        <button
                          class="px-3 py-1 rounded-md font-bold text-xs transition cursor-pointer"
                          [class.bg-emerald-700]="line.status !== 'paid'"
                          [class.text-white]="line.status !== 'paid'"
                          [class.hover:bg-emerald-800]="line.status !== 'paid'"
                          [class.bg-slate-100]="line.status === 'paid'"
                          [class.text-slate-400]="line.status === 'paid'"
                          [disabled]="line.status === 'paid' || posting()"
                          (click)="postPayment(line)"
                        >
                          {{ line.status === 'paid' ? 'Paid ✓' : 'Mark Paid' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="p-8 text-center text-slate-500 font-medium">
                      No payment settlement lines attached. Click "+ Add Payment Line" to record
                      payments.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else if (!error()) {
        <div
          class="rounded-2xl border border-slate-200/90 bg-white p-12 text-center text-slate-500 font-medium"
        >
          Loading document details...
        </div>
      }
    </div>
  `,
})
export class BillingDetailComponent {
  private api = inject(BillingApiService);
  private route = inject(ActivatedRoute);

  type = signal<'quotations' | 'invoices'>('quotations');
  record = signal<Quotation | Invoice | null>(null);
  error = signal<string | null>(null);
  showPaymentForm = signal(false);
  posting = signal(false);

  receiptRoute(direction: 'inward' | 'outward'): string {
    return direction === 'inward' ? '/app/accounts/inward' : '/app/accounts/outward';
  }

  payment: {
    direction: 'inward' | 'outward';
    particulars: string;
    amount: number;
    due_date: string;
    payment_mode: 'cash' | 'cheque' | 'bank_transfer';
    remarks: string;
    cheque_no: string;
    cheque_date: string;
    bank_name: string;
    bank_reference: string;
    transfer_date: string;
  } = {
    direction: 'inward',
    particulars: '',
    amount: 0,
    due_date: '',
    payment_mode: 'cash',
    remarks: '',
    cheque_no: '',
    cheque_date: '',
    bank_name: '',
    bank_reference: '',
    transfer_date: '',
  };

  constructor() {
    this.route.data.subscribe((data) => this.type.set(data['type'] || 'quotations'));
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) this.load(id);
    });
  }

  load(id: number): void {
    const failure = (err: { message?: string }) =>
      this.error.set(err.message || 'Unable to load document.');
    if (this.type() === 'quotations')
      this.api
        .quotation(id)
        .subscribe({ next: (res) => this.record.set(res.data), error: failure });
    else
      this.api.invoice(id).subscribe({ next: (res) => this.record.set(res.data), error: failure });
  }

  number(row: Quotation | Invoice): string {
    return 'quotation_no' in row ? row.quotation_no : row.invoice_no;
  }

  date(row: Quotation | Invoice): string {
    return 'quotation_date' in row ? row.quotation_date : row.invoice_date;
  }

  secondaryDate(row: Quotation | Invoice): string {
    if ('valid_until' in row) {
      return row.valid_until || '';
    }
    return (row as Invoice).due_date || '';
  }

  money(value: number | string | undefined): string {
    return Number(value || 0).toLocaleString('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  convert(): void {
    const row = this.record();
    if (!row || !('quotation_no' in row)) return;
    this.api.convertQuotation(row.id).subscribe({
      next: () => this.load(row.id),
      error: (err) => this.error.set(err.message || 'Unable to convert quotation.'),
    });
  }

  addPayment(): void {
    const row = this.record();
    if (!row || this.payment.amount <= 0 || !this.payment.particulars.trim()) return;
    const payload = {
      ...this.payment,
      particulars: this.payment.remarks.trim() || this.payment.particulars,
    };
    const success = () => {
      this.showPaymentForm.set(false);
      this.payment = {
        direction: 'inward',
        particulars: '',
        amount: 0,
        due_date: '',
        payment_mode: 'cash',
        remarks: '',
        cheque_no: '',
        cheque_date: '',
        bank_name: '',
        bank_reference: '',
        transfer_date: '',
      };
      this.load(row.id);
    };
    const failure = (err: { message?: string }) =>
      this.error.set(err.message || 'Unable to add payment line.');
    if ('quotation_no' in row)
      this.api.addQuotationPayment(row.id, payload).subscribe({ next: success, error: failure });
    else this.api.addInvoicePayment(row.id, payload).subscribe({ next: success, error: failure });
  }

  onPaymentModeChange(): void {
    if (this.payment.payment_mode !== 'cheque') {
      this.payment.cheque_no = '';
      this.payment.cheque_date = '';
    }
    if (this.payment.payment_mode !== 'bank_transfer') {
      this.payment.bank_reference = '';
      this.payment.transfer_date = '';
    }
    if (this.payment.payment_mode === 'cash') this.payment.bank_name = '';
  }

  postPayment(line: BillingPayment): void {
    const row = this.record();
    if (!row || line.status === 'paid' || this.posting()) return;
    this.posting.set(true);
    const key = `billing-${row.id}-${line.id}-${Date.now()}`;
    const success = () => {
      this.posting.set(false);
      this.load(row.id);
    };
    const failure = (err: { message?: string }) => {
      this.posting.set(false);
      this.error.set(err.message || 'Unable to post payment.');
    };
    if ('quotation_no' in row)
      this.api
        .updateQuotationPayment(row.id, line.id, 'paid', key)
        .subscribe({ next: success, error: failure });
    else
      this.api
        .updateInvoicePayment(row.id, line.id, 'paid', key)
        .subscribe({ next: success, error: failure });
  }
}
