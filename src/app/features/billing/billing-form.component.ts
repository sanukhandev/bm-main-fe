import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingApiService } from '../../core/api/billing-api.service';
import { MaintenanceApiService } from '../../core/api/maintenance-api.service';
import { Invoice, Quotation } from '../../shared/models/billing.models';

@Component({
  selector: 'bm-billing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: ` <div class="max-w-4xl mx-auto space-y-6">
    <a
      [routerLink]="['/app/billing', type() === 'quotations' ? 'quotations' : 'invoices']"
      class="text-sm text-emerald-700"
      >← Back</a
    >
    <div>
      <div class="text-xs font-semibold uppercase tracking-wider text-emerald-700">Billing</div>
      <h1 class="text-3xl font-bold text-slate-900">
        {{ editingId() ? 'Edit' : 'Create' }}
        {{ type() === 'quotations' ? 'Quotation' : 'Invoice' }}
      </h1>
    </div>
    @if (error()) {
      <div class="bm-card p-4 text-sm text-rose-700">{{ error() }}</div>
    }
    <form [formGroup]="form" (ngSubmit)="save()" class="bm-card p-6 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="text-sm font-medium"
          >Title<input class="bm-input mt-1" formControlName="title" /></label
        ><label class="text-sm font-medium"
          >Work Order<select class="bm-input mt-1" formControlName="work_order_id">
            <option value="">Optional</option>
            @for (order of workOrders(); track order.id) {
              <option [value]="order.id">{{ order.work_order_no }} — {{ order.title }}</option>
            }
          </select></label
        ><label class="text-sm font-medium"
          >Vendor<select class="bm-input mt-1" formControlName="vendor_id">
            <option value="">Optional</option>
            @for (vendor of vendors(); track vendor.id) {
              <option [value]="vendor.id">{{ vendor.name }}</option>
            }
          </select></label
        ><label class="text-sm font-medium"
          >{{ type() === 'quotations' ? 'Quotation Date' : 'Invoice Date'
          }}<input
            class="bm-input mt-1"
            type="date"
            [formControlName]="
              type() === 'quotations' ? 'quotation_date' : 'invoice_date'
            " /></label
        ><label class="text-sm font-medium"
          >{{ type() === 'quotations' ? 'Valid Until' : 'Due Date'
          }}<input
            class="bm-input mt-1"
            type="date"
            [formControlName]="type() === 'quotations' ? 'valid_until' : 'due_date'" /></label
        ><label class="text-sm font-medium"
          >Tax Amount<input
            class="bm-input mt-1"
            type="number"
            min="0"
            step="0.01"
            formControlName="tax_amount"
        /></label>
      </div>
      <label class="text-sm font-medium block"
        >Description<textarea
          class="bm-input mt-1 !h-auto p-3"
          rows="3"
          formControlName="description"
        ></textarea>
      </label>
      <div formArrayName="lines" class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Line Items</h2>
          <button type="button" class="text-emerald-700 text-sm font-semibold" (click)="addLine()">
            + Add line
          </button>
        </div>
        @for (line of lines.controls; track $index) {
          <div
            [formGroupName]="$index"
            class="grid grid-cols-1 md:grid-cols-[1fr_130px_130px_auto] gap-2"
          >
            <input class="bm-input" placeholder="Particulars" formControlName="particulars" /><input
              class="bm-input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Quantity"
              formControlName="quantity"
            /><input
              class="bm-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="Unit price"
              formControlName="unit_price"
            /><button type="button" class="text-rose-600 text-xs" (click)="removeLine($index)">
              Remove
            </button>
          </div>
        }
      </div>
      <div class="flex justify-end gap-3">
        <button type="button" class="bm-btn bm-btn-secondary" (click)="back()">Cancel</button
        ><button class="bm-btn bm-btn-primary" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </form>
  </div>`,
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
