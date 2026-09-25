import { Component, inject, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingApiService } from '../../core/api/billing-api.service';
import { MaintenanceApiService } from '../../core/api/maintenance-api.service';
import { Invoice, Quotation } from '../../shared/models/billing.models';

@Component({
  selector: 'bm-billing-form',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 font-sans text-slate-900">
      <!-- NAVIGATION & HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <a
            [routerLink]="['/app/billing', type() === 'quotations' ? 'quotations' : 'invoices']"
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
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ editingId() ? 'Edit' : 'Create' }}
            {{ type() === 'quotations' ? 'Quotation' : 'Invoice' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fill in header details, work order reference, and line items with tax adjustments
          </p>
        </div>
      </div>

      @if (error()) {
        <div
          class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium"
        >
          {{ error() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">
        <!-- 1. HEADER & BASIC DETAILS BENTO CARD -->
        <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div
              class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs"
            >
              01
            </div>
            <h2 class="text-base font-extrabold text-slate-900">Document Information</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Title / Subject <span class="text-rose-500">*</span>
              </label>
              <input
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition"
                placeholder="e.g. Annual HVAC Maintenance Service"
                formControlName="title"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Order Reference
              </label>
              <select
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition"
                formControlName="work_order_id"
              >
                <option value="">Optional (None selected)</option>
                @for (order of workOrders(); track order.id) {
                  <option [value]="order.id">{{ order.work_order_no }} — {{ order.title }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Associated Vendor
              </label>
              <select
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition"
                formControlName="vendor_id"
              >
                <option value="">Optional (None selected)</option>
                @for (vendor of vendors(); track vendor.id) {
                  <option [value]="vendor.id">{{ vendor.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {{ type() === 'quotations' ? 'Quotation Date' : 'Invoice Date' }}
                <span class="text-rose-500">*</span>
              </label>
              <input
                type="date"
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition"
                [formControlName]="type() === 'quotations' ? 'quotation_date' : 'invoice_date'"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {{ type() === 'quotations' ? 'Valid Until' : 'Due Date' }}
              </label>
              <input
                type="date"
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition"
                [formControlName]="type() === 'quotations' ? 'valid_until' : 'due_date'"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              rows="3"
              class="w-full p-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition"
              placeholder="Additional scope details, payment terms, or remarks..."
              formControlName="description"
            ></textarea>
          </div>
        </div>

        <!-- 2. LINE ITEMS BENTO CARD -->
        <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs"
              >
                02
              </div>
              <div>
                <h2 class="text-base font-extrabold text-slate-900">Line Items & Particulars</h2>
                <p class="text-xs text-slate-500">Specify items, quantity, and unit prices</p>
              </div>
            </div>
            <button
              type="button"
              class="bm-btn bm-btn-secondary text-xs flex items-center gap-1.5 px-3.5 py-2"
              (click)="addLine()"
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
              <span>Add Particular Line</span>
            </button>
          </div>

          <div formArrayName="lines" class="space-y-3">
            <!-- Table Header for Line Items -->
            <div
              class="hidden md:grid grid-cols-[1fr_120px_140px_140px_40px] gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider px-2"
            >
              <div>Particulars / Service</div>
              <div class="text-right">Qty</div>
              <div class="text-right">Unit Price</div>
              <div class="text-right">Line Total</div>
              <div></div>
            </div>

            @for (lineControl of lines.controls; track $index) {
              <div
                [formGroupName]="$index"
                class="grid grid-cols-1 md:grid-cols-[1fr_120px_140px_140px_40px] gap-3 items-center p-3 rounded-xl bg-slate-50/80 border border-slate-200/70"
              >
                <div>
                  <label class="block md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1"
                    >Particulars</label
                  >
                  <input
                    class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
                    placeholder="Item description or service scope..."
                    formControlName="particulars"
                  />
                </div>

                <div>
                  <label class="block md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1"
                    >Quantity</label
                  >
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs text-right tabular-nums focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
                    placeholder="1"
                    formControlName="quantity"
                  />
                </div>

                <div>
                  <label class="block md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1"
                    >Unit Price</label
                  >
                  <div class="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full h-10 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs text-right tabular-nums focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
                      placeholder="0.00"
                      formControlName="unit_price"
                    />
                  </div>
                </div>

                <div
                  class="text-right font-extrabold text-slate-900 text-xs tabular-nums py-2 md:py-0"
                >
                  <span class="md:hidden text-slate-500 font-normal mr-2">Line Total:</span>
                  <div class="inline-flex items-center justify-end">
                    <dirham-symbol
                      size="0.85em"
                      weight="bold"
                      class="mr-1 text-slate-400 select-none"
                    ></dirham-symbol>
                    <span>{{ calculateLineTotal($index) }}</span>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button
                    type="button"
                    class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 inline-flex items-center justify-center transition cursor-pointer"
                    (click)="removeLine($index)"
                    title="Remove line"
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
              </div>
            }
          </div>
        </div>

        <!-- 3. FINANCIAL SUMMARY & GRAND TOTAL BENTO CARD -->
        <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div
              class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs"
            >
              03
            </div>
            <h2 class="text-base font-extrabold text-slate-900">Financial Calculation Summary</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <!-- Left Side: Tax Amount Input -->
            <div class="md:col-span-6 space-y-2">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tax Amount (VAT / Fees)
              </label>
              <div class="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition"
                  placeholder="0.00"
                  formControlName="tax_amount"
                />
              </div>
              <p class="text-[11px] text-slate-500">
                Enter total tax amount applicable to this
                {{ type() === 'quotations' ? 'quotation' : 'invoice' }}
              </p>
            </div>

            <!-- Right Side: Subtotal, Tax, Grand Total Box -->
            <div
              class="md:col-span-6 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3"
            >
              <div class="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Items Subtotal</span>
                <div class="flex items-center text-slate-900 font-bold tabular-nums">
                  <dirham-symbol
                    size="0.85em"
                    weight="bold"
                    class="mr-1 text-slate-400 select-none"
                  ></dirham-symbol>
                  <span>{{ formatMoney(calculatedSubtotal()) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Tax / VAT</span>
                <div class="flex items-center text-slate-900 font-bold tabular-nums">
                  <dirham-symbol
                    size="0.85em"
                    weight="bold"
                    class="mr-1 text-slate-400 select-none"
                  ></dirham-symbol>
                  <span>{{ formatMoney(form.value.tax_amount || 0) }}</span>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-200/80 flex justify-between items-center">
                <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-800"
                  >Grand Total</span
                >
                <div
                  class="text-2xl font-extrabold text-emerald-700 tabular-nums flex items-center"
                >
                  <dirham-symbol
                    size="0.85em"
                    weight="bold"
                    class="mr-1.5 text-emerald-600 select-none"
                  ></dirham-symbol>
                  <span>{{ formatMoney(calculatedGrandTotal()) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FORM ACTION BAR -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            class="bm-btn bm-btn-secondary px-5 py-2.5 text-xs font-bold"
            (click)="back()"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="bm-btn bm-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition"
            [disabled]="form.invalid || saving()"
          >
            @if (saving()) {
              <svg
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Saving Document...</span>
            } @else {
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Save {{ type() === 'quotations' ? 'Quotation' : 'Invoice' }}</span>
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class BillingFormComponent {
  private api = inject(BillingApiService);
  private maintenance = inject(MaintenanceApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  type = signal<'quotations' | 'invoices'>('quotations');
  editingId = signal<number | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);
  workOrders = signal<Array<{ id: number; work_order_no: string; title: string }>>([]);
  vendors = signal<Array<{ id: number; name: string }>>([]);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    work_order_id: [''],
    vendor_id: [''],
    quotation_date: [new Date().toLocaleDateString('en-CA'), Validators.required],
    valid_until: [''],
    invoice_date: [new Date().toLocaleDateString('en-CA'), Validators.required],
    due_date: [''],
    tax_amount: [0, [Validators.required, Validators.min(0)]],
    lines: this.fb.array([this.line()]),
  });

  constructor() {
    this.route.data.subscribe((data) => {
      this.type.set(data['type'] || 'quotations');
      this.load();
    });
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.editingId.set(id);
        this.loadRecord(id);
      }
    });
  }

  get lines(): FormArray {
    return this.form.controls.lines;
  }

  line(value?: { particulars: string; quantity: number | string; unit_price: number | string }) {
    return this.fb.nonNullable.group({
      particulars: [value?.particulars || '', Validators.required],
      quantity: [Number(value?.quantity || 1), [Validators.required, Validators.min(0.01)]],
      unit_price: [Number(value?.unit_price || 0), [Validators.required, Validators.min(0)]],
    });
  }

  calculateLineTotal(index: number): string {
    const group = this.lines.at(index);
    if (!group) return '0.00';
    const qty = Number(group.get('quantity')?.value || 0);
    const price = Number(group.get('unit_price')?.value || 0);
    return this.formatMoney(qty * price);
  }

  calculatedSubtotal(): number {
    let sum = 0;
    for (let i = 0; i < this.lines.length; i++) {
      const g = this.lines.at(i);
      const qty = Number(g.get('quantity')?.value || 0);
      const price = Number(g.get('unit_price')?.value || 0);
      sum += qty * price;
    }
    return sum;
  }

  calculatedGrandTotal(): number {
    const tax = Number(this.form.value.tax_amount || 0);
    return this.calculatedSubtotal() + tax;
  }

  formatMoney(value: number | string | undefined): string {
    return Number(value || 0).toLocaleString('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  load(): void {
    this.maintenance.workOrders().subscribe({
      next: (res) =>
        this.workOrders.set(
          res.data.map((order) => ({
            id: order.id,
            work_order_no: order.work_order_no,
            title: order.title,
          })),
        ),
    });
    this.maintenance.vendors().subscribe({
      next: (res) =>
        this.vendors.set(res.data.map((vendor) => ({ id: vendor.id, name: vendor.name }))),
    });
  }

  loadRecord(id: number): void {
    const success = (record: Quotation | Invoice) => {
      this.form.patchValue({
        title: record.title,
        description: record.description || '',
        work_order_id: record.work_order_id ? String(record.work_order_id) : '',
        vendor_id: record.vendor?.id ? String(record.vendor.id) : '',
        quotation_date:
          'quotation_date' in record
            ? record.quotation_date
            : new Date().toLocaleDateString('en-CA'),
        valid_until: 'quotation_date' in record ? record.valid_until || '' : '',
        invoice_date:
          'invoice_date' in record ? record.invoice_date : new Date().toLocaleDateString('en-CA'),
        due_date: 'invoice_date' in record ? record.due_date || '' : '',
        tax_amount: Number(record.tax_amount),
      });
      while (this.lines.length) this.lines.removeAt(0);
      for (const line of record.lines || []) this.lines.push(this.line(line));
    };
    const failure = (err: { message?: string }) =>
      this.error.set(err.message || 'Unable to load document.');
    if (this.type() === 'quotations')
      this.api.quotation(id).subscribe({ next: (res) => success(res.data), error: failure });
    else this.api.invoice(id).subscribe({ next: (res) => success(res.data), error: failure });
  }

  addLine(): void {
    this.lines.push(this.line());
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) this.lines.removeAt(index);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    const common = {
      title: value.title,
      description: value.description,
      work_order_id: value.work_order_id ? Number(value.work_order_id) : null,
      vendor_id: value.vendor_id ? Number(value.vendor_id) : null,
      tax_amount: Number(value.tax_amount),
      lines: value.lines.map((line) => ({
        particulars: line.particulars,
        quantity: Number(line.quantity),
        unit_price: Number(line.unit_price),
      })),
    };
    const success = () => this.back();
    const failure = (err: { message?: string }) => {
      this.error.set(err.message || 'Unable to save document.');
      this.saving.set(false);
    };
    if (this.type() === 'quotations') {
      const payload = {
        ...common,
        quotation_date: value.quotation_date,
        valid_until: value.valid_until || null,
      };
      (this.editingId()
        ? this.api.updateQuotation(this.editingId()!, payload)
        : this.api.createQuotation(payload)
      ).subscribe({ next: success, error: failure });
    } else {
      const payload = {
        ...common,
        invoice_date: value.invoice_date,
        due_date: value.due_date || null,
      };
      (this.editingId()
        ? this.api.updateInvoice(this.editingId()!, payload)
        : this.api.createInvoice(payload)
      ).subscribe({ next: success, error: failure });
    }
  }

  back(): void {
    this.router.navigate(['/app/billing', this.type()]);
  }
}
