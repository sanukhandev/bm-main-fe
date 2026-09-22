import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmCardComponent } from '../../shared/components/bm-card/bm-card.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { Customer } from '../../shared/models/customer.models';
import { Property } from '../../shared/models/property.models';
import { InstallmentItem, PaymentMode } from '../../shared/models/agreement.models';

@Component({
  selector: 'bm-owner-agreement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    BmPageHeaderComponent,
    BmCardComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <bm-page-header
      [title]="isEditMode() ? 'Edit Owner Agreement' : 'Draft Owner Agreement'"
      [subtitle]="isEditMode() ? 'Update agreement contract details' : 'Create new owner management agreement in draft state'"
    >
      <a routerLink="/app/owner-agreements" class="bm-btn bm-btn-secondary text-xs">
        Cancel
      </a>
    </bm-page-header>

    @if (isLoading()) {
      <bm-loading-state></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadAgreement()"></bm-error-state>
    } @else {
      <form [formGroup]="agreementForm" (ngSubmit)="onSubmit()" class="space-y-6 max-w-4xl">
        
        <!-- Section 1: Agreement Identity & Owner Selection -->
        <bm-card title="Section 1 — Agreement Identity & Owner">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Agreement Number *</label>
              <input
                type="text"
                formControlName="agreement_no"
                placeholder="e.g. OA-2026-001"
                class="bm-input"
              />
              @if (isFieldInvalid('agreement_no')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Agreement number is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Property Owner *</label>
              <select
                formControlName="owner_customer_id"
                (change)="onOwnerChange()"
                class="bm-input"
              >
                <option value="">Select Owner...</option>
                @for (owner of owners(); track owner.id) {
                  <option [value]="owner.id">
                    [{{ owner.customer_code }}] {{ owner.display_name }}
                  </option>
                }
              </select>
              @if (isFieldInvalid('owner_customer_id')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Property owner selection is required</span>
              }
            </div>
          </div>
        </bm-card>

        <!-- Section 2: Property Selection -->
        <bm-card title="Section 2 — Covered Property Assets">
          @if (!agreementForm.value.owner_customer_id) {
            <p class="text-xs text-slate-400 italic">Please select an owner above to view available properties.</p>
          } @else if (availableProperties().length === 0) {
            <p class="text-xs text-amber-700">No properties registered under this owner in current branch.</p>
          } @else {
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-slate-700 mb-2">Select Properties Owned *</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                @for (prop of availableProperties(); track prop.id) {
                  <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      [checked]="isPropertySelected(prop.id)"
                      (change)="toggleProperty(prop.id, $event)"
                      class="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div class="text-xs">
                      <div class="font-semibold text-slate-800">[{{ prop.property_code }}] {{ prop.name }}</div>
                      <div class="text-slate-400">Unit: {{ prop.unit_number }} | {{ prop.property_type }}</div>
                    </div>
                  </label>
                }
              </div>
              @if (selectedPropertyIds().length === 0 && agreementForm.touched) {
                <span class="text-[11px] text-rose-600 mt-1 block">Select at least one property asset</span>
              }
            </div>
          }
        </bm-card>

        <!-- Section 3: Agreement Period -->
        <bm-card title="Section 3 — Agreement Period">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Start Date *</label>
              <input
                type="date"
                formControlName="start_date"
                class="bm-input"
              />
              @if (isFieldInvalid('start_date')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Start date is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">End Date *</label>
              <input
                type="date"
                formControlName="end_date"
                class="bm-input"
              />
              @if (isFieldInvalid('end_date')) {
                <span class="text-[11px] text-rose-600 mt-1 block">End date is required</span>
              }
            </div>
          </div>
        </bm-card>

        <!-- Section 4: Commercial Terms -->
        <bm-card title="Section 4 — Commercial Terms">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Total Amount (AED) *</label>
              <input
                type="number"
                step="0.01"
                formControlName="total_amount"
                placeholder="0.00"
                class="bm-input tabular-nums font-semibold"
              />
              @if (isFieldInvalid('total_amount')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Valid total amount is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Number of Payments *</label>
              <input
                type="number"
                min="1"
                max="36"
                formControlName="payment_count"
                class="bm-input tabular-nums"
              />
              @if (isFieldInvalid('payment_count')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Payment count is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Payment Frequency</label>
              <select formControlName="payment_frequency" class="bm-input">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annually">Semi-Annually</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Payment Mode *</label>
              <select formControlName="payment_mode" class="bm-input">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Notes / Special Conditions</label>
              <input
                type="text"
                formControlName="notes"
                placeholder="Additional notes..."
                class="bm-input"
              />
            </div>
          </div>
        </bm-card>

        <!-- Section 5: Client Schedule Preview -->
        <bm-card title="Section 5 — Installment Schedule Preview (Client Informative)">
          @if (installmentPreview().length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th class="py-2 px-3">#</th>
                    <th class="py-2 px-3">Estimated Due Date</th>
                    <th class="py-2 px-3 text-right">Amount (AED)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (item of installmentPreview(); track item.installment_number) {
                    <tr>
                      <td class="py-2 px-3 font-semibold text-slate-700">Installment {{ item.installment_number }}</td>
                      <td class="py-2 px-3 text-slate-600 tabular-nums">{{ item.due_date }}</td>
                      <td class="py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">
                        AED {{ item.amount | number:'1.2-2' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-xs text-slate-400 italic">Enter total amount and payment count to calculate estimated schedule.</p>
          }
        </bm-card>

        @if (serverError()) {
          <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {{ serverError() }}
          </div>
        }

        <div class="flex items-center justify-end gap-3 pt-4">
          <a routerLink="/app/owner-agreements" class="bm-btn bm-btn-secondary">
            Cancel
          </a>
          <button type="submit" [disabled]="isSubmitting()" class="bm-btn bm-btn-primary">
            @if (isSubmitting()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            }
            {{ isEditMode() ? 'Update Draft Agreement' : 'Save Draft Agreement' }}
          </button>
        </div>

      </form>
    }
  `,
})
export class OwnerAgreementFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(OwnerAgreementsApiService);
  private customersApi = inject(CustomersApiService);
  private propertiesApi = inject(PropertiesApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  agreementId = signal<number | null>(null);

  owners = signal<Customer[]>([]);
  availableProperties = signal<Property[]>([]);
  selectedPropertyIds = signal<number[]>([]);

  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  serverError = signal<string | null>(null);

  agreementForm = this.fb.group({
    agreement_no: ['', Validators.required],
    owner_customer_id: ['', Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    total_amount: ['', [Validators.required, Validators.min(0)]],
    payment_count: [12, [Validators.required, Validators.min(1)]],
    payment_frequency: ['monthly'],
    payment_mode: ['bank_transfer' as PaymentMode, Validators.required],
    notes: [''],
  });

  installmentPreview = computed<InstallmentItem[]>(() => {
    const total = Number(this.agreementForm.value.total_amount) || 0;
    const count = Number(this.agreementForm.value.payment_count) || 0;
    const startDate = this.agreementForm.value.start_date;

    if (total <= 0 || count <= 0 || !startDate) return [];

    const baseAmount = Math.floor((total / count) * 100) / 100;
    const remainder = Math.round((total - baseAmount * count) * 100) / 100;

    const list: InstallmentItem[] = [];
    let currDate = new Date(startDate);

    for (let i = 1; i <= count; i++) {
      const amt = i === 1 ? baseAmount + remainder : baseAmount;
      const dueStr = currDate.toISOString().split('T')[0];
      list.push({
        installment_number: i,
        due_date: dueStr,
        amount: amt,
        status: 'pending',
      });
      // Increment 1 month for preview
      currDate.setMonth(currDate.getMonth() + 1);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadOwners();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.agreementId.set(Number(id));
      this.loadAgreement();
    }
  }

  loadOwners(): void {
    this.customersApi.getCustomers({ per_page: 100 }).subscribe({
      next: (res) => {
        this.owners.set(res.data);
      },
    });
  }

  onOwnerChange(): void {
    const ownerId = Number(this.agreementForm.value.owner_customer_id);
    if (!ownerId) {
      this.availableProperties.set([]);
      this.selectedPropertyIds.set([]);
      return;
    }

    this.propertiesApi.getProperties({ owner_customer_id: ownerId, per_page: 100 }).subscribe({
      next: (res) => {
        this.availableProperties.set(res.data);
      },
    });
  }

  loadAgreement(): void {
    const id = this.agreementId();
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.api.getAgreement(id).subscribe({
      next: (res) => {
        const agr = res.data;
        this.agreementForm.patchValue({
          agreement_no: agr.agreement_no,
          owner_customer_id: String(agr.owner_customer_id),
          start_date: agr.start_date,
          end_date: agr.end_date,
          total_amount: String(agr.total_amount),
          payment_count: agr.payment_count,
          payment_frequency: agr.payment_frequency,
          payment_mode: agr.payment_mode,
          notes: agr.notes || '',
        });

        if (agr.properties && Array.isArray(agr.properties)) {
          this.selectedPropertyIds.set(agr.properties.map((p) => p.id));
        }

        this.onOwnerChange();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load owner agreement.');
        this.isLoading.set(false);
      },
    });
  }

  isPropertySelected(id: number): boolean {
    return this.selectedPropertyIds().includes(id);
  }

  toggleProperty(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedPropertyIds.update((ids) => [...ids, id]);
    } else {
      this.selectedPropertyIds.update((ids) => ids.filter((pId) => pId !== id));
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.agreementForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.agreementForm.invalid) {
      this.agreementForm.markAllAsTouched();
      return;
    }

    if (this.selectedPropertyIds().length === 0) {
      this.serverError.set('Please select at least one property covered by this agreement.');
      return;
    }

    this.isSubmitting.set(true);
    this.serverError.set(null);

    const val = this.agreementForm.value;
    const payload = {
      agreement_no: val.agreement_no!,
      owner_customer_id: Number(val.owner_customer_id),
      property_ids: this.selectedPropertyIds(),
      start_date: val.start_date!,
      end_date: val.end_date!,
      total_amount: Number(val.total_amount!),
      currency_code: 'AED',
      payment_count: Number(val.payment_count!),
      payment_frequency: val.payment_frequency || 'monthly',
      payment_mode: val.payment_mode as PaymentMode,
      notes: val.notes || null,
    };

    if (this.isEditMode()) {
      this.api.updateAgreement(this.agreementId()!, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/owner-agreements']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.serverError.set(err.message || 'Failed to update owner agreement.');
        },
      });
    } else {
      this.api.createAgreement(payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/owner-agreements']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.serverError.set(err.message || 'Failed to create owner agreement.');
        },
      });
    }
  }
}
