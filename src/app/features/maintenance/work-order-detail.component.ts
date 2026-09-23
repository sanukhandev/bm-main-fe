import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaintenanceApiService } from '../../core/api/maintenance-api.service';
import {
  InventoryItem,
  Vendor,
  WorkOrder,
  WorkOrderPayment,
} from '../../shared/models/maintenance.models';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmSpinnerComponent } from '../../shared/components/bm-spinner/bm-spinner.component';

@Component({
  selector: 'bm-work-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    BmStatusBadgeComponent,
    BmLoadingStateComponent,
    BmSpinnerComponent,
  ],
  template: `
    <div class="max-w-5xl mx-auto space-y-6">
      @if (isLoading()) {
        <bm-loading-state type="detail"></bm-loading-state>
      } @else if (error()) {
        <div class="bm-card p-4 text-sm text-rose-700 font-medium">{{ error() }}</div>
      } @else if (order(); as item) {
        <div class="flex items-center justify-between gap-4">
          <div>
            <a
              routerLink="/app/maintenance/work-orders"
              class="text-xs text-emerald-700 font-semibold hover:underline"
              >← Back to Work Orders</a
            >
            <h1 class="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              {{ item.work_order_no }}
            </h1>
          </div>
          <div class="flex gap-2">
            <button type="button" class="bm-btn bm-btn-secondary" (click)="paymentOpen.set(true)">
              + Add Payment
            </button>
            <button type="button" class="bm-btn bm-btn-primary" (click)="editing.set(!editing())">
              {{ editing() ? 'Cancel Editing' : 'Edit Order' }}
            </button>
          </div>
        </div>

        @if (editing()) {
          <form [formGroup]="form" (ngSubmit)="save()" class="bm-card p-6 space-y-4">
            <input class="bm-input" formControlName="title" placeholder="Title" />
            <textarea
              class="bm-input"
              rows="4"
              formControlName="description"
              placeholder="Description"
            ></textarea>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select class="bm-input" formControlName="priority">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select class="bm-input" formControlName="vendor_id">
                <option value="">No vendor</option>
                @for (vendor of vendors(); track vendor.id) {
                  <option [value]="vendor.id">{{ vendor.name }}</option>
                }
              </select>
              <input
                class="bm-input"
                type="number"
                min="0"
                step="0.01"
                formControlName="service_charge"
                placeholder="Service charge"
              />
            </div>
            <select class="bm-input" formControlName="status">
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button class="bm-btn bm-btn-primary" [disabled]="form.invalid || saving()">
              @if (saving()) {
                <bm-spinner size="sm" color="white" label="Saving..."></bm-spinner>
              } @else {
                Save Changes
              }
            </button>
          </form>
        } @else {
          <div class="bm-card p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div>
              <div class="text-slate-500 font-medium">Property</div>
              <div class="font-semibold text-slate-900 mt-1">
                {{ item.property?.name || item.property?.property_code || '—' }}
              </div>
            </div>
            <div>
              <div class="text-slate-500 font-medium">Vendor</div>
              <div class="font-semibold text-slate-900 mt-1">{{ item.vendor?.name || '—' }}</div>
            </div>
            <div>
              <div class="text-slate-500 font-medium">Title</div>
              <div class="font-semibold text-slate-900 mt-1">{{ item.title }}</div>
            </div>
            <div>
              <div class="text-slate-500 font-medium">Status</div>
              <div class="mt-1"><bm-status-badge [status]="item.status"></bm-status-badge></div>
            </div>
            <div>
              <div class="text-slate-500 font-medium">Priority</div>
              <div class="mt-1"><bm-status-badge [status]="item.priority"></bm-status-badge></div>
            </div>
            <div>
              <div class="text-slate-500 font-medium">Service Charge</div>
              <div class="font-semibold text-slate-900 mt-1">AED {{ item.service_charge }}</div>
            </div>
            <div class="md:col-span-2">
              <div class="text-slate-500 font-medium">Description</div>
              <p class="mt-1 text-slate-700 whitespace-pre-wrap">{{ item.description || '—' }}</p>
            </div>
          </div>
        }

        <div class="bm-card overflow-x-auto">
          <div class="p-5 border-b border-slate-100 font-bold text-slate-900">Work Order Lines</div>
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th class="p-4">Type</th>
                <th class="p-4">Particulars</th>
                <th class="p-4">Inventory</th>
                <th class="p-4">Qty</th>
                <th class="p-4">Unit Cost</th>
                <th class="p-4">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (line of item.lines || []; track line.id) {
                <tr>
                  <td class="p-4"><bm-status-badge [status]="line.line_type"></bm-status-badge></td>
                  <td class="p-4">{{ line.description }}</td>
                  <td class="p-4">{{ line.inventory_item?.name || '—' }}</td>
                  <td class="p-4">{{ line.quantity }}</td>
                  <td class="p-4">AED {{ line.unit_cost }}</td>
                  <td class="p-4 font-semibold tabular-nums">
                    AED {{ (toNumber(line.quantity) * toNumber(line.unit_cost)).toFixed(2) }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-slate-500 font-medium">
                    No line items.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="bm-card overflow-x-auto">
          <div class="p-5 border-b border-slate-100 flex justify-between items-center">
            <span class="font-bold text-slate-900">Payments</span>
            <span class="text-xs text-slate-500 font-normal"
              >Receipts and vouchers are generated when posted</span
            >
          </div>
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th class="p-4">Direction</th>
                <th class="p-4">Particulars</th>
                <th class="p-4">Category</th>
                <th class="p-4">Mode</th>
                <th class="p-4">Amount</th>
                <th class="p-4">Status</th>
                <th class="p-4">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (payment of payments(); track payment.id) {
                <tr>
                  <td class="p-4">
                    <bm-status-badge [status]="payment.direction"></bm-status-badge>
                  </td>
                  <td class="p-4">{{ payment.particulars }}</td>
                  <td class="p-4">{{ payment.category }}</td>
                  <td class="p-4">
                    <bm-status-badge [status]="payment.payment_mode"></bm-status-badge>
                  </td>
                  <td class="p-4 font-semibold tabular-nums">AED {{ payment.amount }}</td>
                  <td class="p-4"><bm-status-badge [status]="payment.status"></bm-status-badge></td>
                  <td class="p-4">
                    @if (payment.receipt) {
                      <a
                        [routerLink]="receiptRoute(payment.receipt.direction)"
                        class="text-blue-700 text-xs font-semibold mr-3 hover:underline"
                        [attr.aria-label]="'Open receipt ' + payment.receipt.document_no"
                      >
                        Receipt {{ payment.receipt.document_no }}
                      </a>
                    }
                    <button
                      type="button"
                      class="text-emerald-700 text-xs font-semibold hover:underline"
                      [disabled]="payment.status === 'paid'"
                      (click)="setPaymentStatus(payment, 'paid')"
                    >
                      Mark Paid
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="p-8 text-center text-slate-500 font-medium">
                    No payments added.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (paymentOpen()) {
        <div
          class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
        >
          <form
            [formGroup]="paymentForm"
            (ngSubmit)="savePayment()"
            class="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden bm-modal-content"
          >
            <div class="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center">
              <h2 class="text-lg font-bold text-slate-900 tracking-tight">
                Add Work Order Payment
              </h2>
              <button
                type="button"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold inline-flex items-center justify-center transition cursor-pointer"
                (click)="paymentOpen.set(false)"
              >
                ×
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select class="bm-input" formControlName="direction">
                  <option value="outward">Outward</option>
                  <option value="inward">Inward</option>
                </select>
                <input class="bm-input" formControlName="category" placeholder="Category" />
                <input class="bm-input" formControlName="particulars" placeholder="Particulars" />
                <input
                  class="bm-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  formControlName="amount"
                  placeholder="Amount"
                />
                <input class="bm-input" type="date" formControlName="due_date" />
                <select
                  class="bm-input"
                  formControlName="payment_mode"
                  (change)="onPaymentModeChange()"
                >
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
                @if (paymentForm.controls.payment_mode.value === 'cheque') {
                  <input
                    class="bm-input"
                    formControlName="cheque_no"
                    placeholder="Cheque Number"
                  /><input class="bm-input" type="date" formControlName="cheque_date" /><input
                    class="bm-input"
                    formControlName="bank_name"
                    placeholder="Bank Name"
                  />
                }
                @if (paymentForm.controls.payment_mode.value === 'bank_transfer') {
                  <input
                    class="bm-input"
                    formControlName="bank_reference"
                    placeholder="Bank Reference"
                  /><input class="bm-input" type="date" formControlName="transfer_date" /><input
                    class="bm-input"
                    formControlName="bank_name"
                    placeholder="Bank Name"
                  />
                }
                <textarea
                  class="bm-input md:col-span-2"
                  formControlName="remarks"
                  rows="2"
                  placeholder="Remarks"
                ></textarea>
                <textarea
                  class="bm-input md:col-span-2"
                  formControlName="terms"
                  rows="3"
                  placeholder="Terms"
                ></textarea>
              </div>
            </div>
            <div
              class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3"
            >
              <button
                type="button"
                class="bm-btn bm-btn-secondary text-xs rounded-xl"
                (click)="paymentOpen.set(false)"
              >
                Cancel
              </button>
              <button
                class="bm-btn bm-btn-primary text-xs rounded-xl shadow-2xs"
                [disabled]="paymentForm.invalid || saving()"
              >
                @if (saving()) {
                  <bm-spinner size="sm" color="white" label="Saving..."></bm-spinner>
                } @else {
                  Save Payment
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class WorkOrderDetailComponent {
  private api = inject(MaintenanceApiService);
  private route = inject(ActivatedRoute);

  receiptRoute(direction: 'inward' | 'outward'): string {
    return direction === 'inward' ? '/app/accounts/inward' : '/app/accounts/outward';
  }
  private fb = inject(FormBuilder);

  isLoading = signal(true);
  order = signal<WorkOrder | null>(null);
  payments = signal<WorkOrderPayment[]>([]);
  vendors = signal<Vendor[]>([]);
  inventory = signal<InventoryItem[]>([]);
  editing = signal(false);
  paymentOpen = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['normal', Validators.required],
    vendor_id: [''],
    service_charge: [0, [Validators.required, Validators.min(0)]],
    status: ['open', Validators.required],
  });

  paymentForm = this.fb.nonNullable.group({
    direction: ['outward', Validators.required],
    category: ['', Validators.required],
    particulars: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    due_date: [new Date().toLocaleDateString('en-CA')],
    payment_mode: ['cash', Validators.required],
    terms: [''],
    remarks: [''],
    cheque_no: [''],
    cheque_date: [''],
    bank_name: [''],
    bank_reference: [''],
    transfer_date: [''],
  });

  constructor() {
    this.load();
    this.api.vendors().subscribe((response) => this.vendors.set(response.data));
  }

  load(silent = false): void {
    if (!silent && !this.order()) {
      this.isLoading.set(true);
    }
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.workOrder(id).subscribe({
      next: (response) => {
        this.order.set(response.data);
        this.payments.set((response.data.payments || []) as WorkOrderPayment[]);
        this.form.patchValue({
          title: response.data.title,
          description: response.data.description || '',
          priority: response.data.priority,
          vendor_id: response.data.vendor?.id ? String(response.data.vendor.id) : '',
          service_charge: Number(response.data.service_charge),
          status: response.data.status,
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Unable to load work order.');
        this.isLoading.set(false);
      },
    });
  }

  save(): void {
    const id = this.order()?.id;
    if (!id || this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.api
      .updateWorkOrder(id, {
        ...value,
        vendor_id: value.vendor_id ? Number(value.vendor_id) : null,
        service_charge: Number(value.service_charge),
      })
      .subscribe({
        next: (response) => {
          this.order.set(response.data);
          this.editing.set(false);
          this.saving.set(false);
        },
        error: (error) => {
          this.error.set(error.message || 'Unable to update work order.');
          this.saving.set(false);
        },
      });
  }

  toNumber(value: string | number): number {
    return Number(value) || 0;
  }

  savePayment(): void {
    const id = this.order()?.id;
    if (!id || this.paymentForm.invalid) return;
    this.saving.set(true);
    const payload = this.paymentForm.getRawValue();
    this.api
      .addWorkOrderPayment(id, {
        ...payload,
        particulars: payload.remarks.trim() || payload.particulars,
      })
      .subscribe({
        next: () => {
          this.paymentOpen.set(false);
          this.saving.set(false);
          this.load(true);
        },
        error: (error) => {
          this.error.set(error.message || 'Unable to add payment.');
          this.saving.set(false);
        },
      });
  }

  onPaymentModeChange(): void {
    const mode = this.paymentForm.controls.payment_mode.value;
    const required = mode === 'cheque' ? [Validators.required] : [];
    this.paymentForm.controls.cheque_no.setValidators(required);
    this.paymentForm.controls.cheque_date.setValidators(required);
    const bankRequired = mode === 'bank_transfer' ? [Validators.required] : [];
    this.paymentForm.controls.bank_reference.setValidators(bankRequired);
    this.paymentForm.controls.transfer_date.setValidators(bankRequired);
    [
      this.paymentForm.controls.cheque_no,
      this.paymentForm.controls.cheque_date,
      this.paymentForm.controls.bank_reference,
      this.paymentForm.controls.transfer_date,
    ].forEach((control) => control.updateValueAndValidity({ emitEvent: false }));
    if (mode !== 'cheque') this.paymentForm.patchValue({ cheque_no: '', cheque_date: '' });
    if (mode !== 'bank_transfer')
      this.paymentForm.patchValue({ bank_reference: '', transfer_date: '' });
    if (mode === 'cash') this.paymentForm.patchValue({ bank_name: '' });
  }

  setPaymentStatus(payment: WorkOrderPayment, status: 'paid' | 'defaulted'): void {
    const id = this.order()?.id;
    if (!id) return;
    if (this.saving()) return;
    this.saving.set(true);
    this.api
      .updateWorkOrderPaymentStatus(
        id,
        payment.id,
        status,
        `work-order-${id}-${payment.id}-${Date.now()}`,
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.load();
        },
        error: (error) => {
          this.saving.set(false);
          this.error.set(error.message || 'Unable to post payment.');
        },
      });
  }
}
