import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmCardComponent } from '../../shared/components/bm-card/bm-card.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { TenantAgreementsApiService } from '../../core/api/tenant-agreements-api.service';
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { Customer } from '../../shared/models/customer.models';
import { Property } from '../../shared/models/property.models';
import { InstallmentItem, PaymentMode } from '../../shared/models/agreement.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'bm-tenant-agreement-form',
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
      [title]="isEditMode() ? 'Edit Tenant Agreement' : 'Create Tenant Agreement'"
      [subtitle]="isEditMode() ? 'Update agreement lease details' : 'Draft a new tenant lease agreement for a property asset'"
    >
      <a routerLink="/app/tenant-agreements" class="bm-btn bm-btn-secondary text-xs">
        Cancel
      </a>
    </bm-page-header>

    @if (isLoading()) {
      <bm-loading-state></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadAgreement()"></bm-error-state>
    } @else {
      <form [formGroup]="agreementForm" (ngSubmit)="onSubmit()" class="space-y-6 max-w-4xl">
        
        <!-- Step 1: Identity & Tenant Selection -->
        <bm-card title="Step 1 — Agreement Identity & Tenant Selection">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Agreement Number (generated)</label>
              <input
                type="text"
                formControlName="agreement_no"
                placeholder="Assigned by server on save"
                readonly
                class="bm-input"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Tenant Customer *</label>
              <select formControlName="tenant_customer_id" class="bm-input">
                <option value="">Select Tenant...</option>
                @for (tenant of tenants(); track tenant.id) {
                  <option [value]="tenant.id">
                    [{{ tenant.customer_code }}] {{ tenant.display_name }}
                  </option>
                }
              </select>
              @if (isFieldInvalid('tenant_customer_id')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Tenant customer selection is required</span>
              }
            </div>
          </div>
        </bm-card>

        <!-- Step 2: Agreement Period -->
        <bm-card title="Step 2 — Lease Period">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Lease Start Date *</label>
              <input
                type="date"
                formControlName="start_date"
                (change)="onDateChange()"
                class="bm-input"
              />
              @if (isFieldInvalid('start_date')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Start date is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Lease End Date *</label>
              <input
                type="date"
                formControlName="end_date"
                (change)="onDateChange()"
                class="bm-input"
              />
              @if (isFieldInvalid('end_date')) {
                <span class="text-[11px] text-rose-600 mt-1 block">End date is required</span>
              }
            </div>
          </div>
        </bm-card>

        <!-- Step 3: Property Asset Selection -->
        <bm-card title="Step 3 — Select Leased Property Asset">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Property Asset *</label>
            <select formControlName="selected_property_id" (change)="onPropertyChange()" class="bm-input">
              <option value="">Select Property Asset...</option>
              @for (prop of availableProperties(); track prop.id) {
                <option [value]="prop.id">
                  [{{ prop.property_code }}] {{ prop.name }} (Unit: {{ prop.unit_number }}) - Owner ID: {{ prop.owner_customer_id }}
                </option>
              }
            </select>
            @if (isFieldInvalid('selected_property_id')) {
              <span class="text-[11px] text-rose-600 mt-1 block">Property asset selection is required</span>
            }
          </div>
        </bm-card>

        <!-- Step 4: Commercial Terms -->
        <bm-card title="Step 4 — Commercial Terms">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Total Rent Amount (AED) *</label>
              <input
                type="number"
                step="0.01"
                formControlName="total_amount"
                placeholder="0.00"
                class="bm-input tabular-nums font-semibold"
              />
              @if (isFieldInvalid('total_amount')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Valid rent amount is required</span>
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
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Notes / Special Conditions</label>
              <input
                type="text"
                formControlName="notes"
                placeholder="Additional lease terms..."
                class="bm-input"
              />
            </div>
          </div>
        </bm-card>

        <!-- Step 5: Installment Preview -->
        <bm-card title="Step 5 — Rent Schedule Preview (Client Informative)">
          @if (installmentPreview().length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th class="py-2 px-3">#</th>
                    <th class="py-2 px-3">Estimated Due Date</th>
                    <th class="py-2 px-3 text-right">Rent Installment (AED)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (item of installmentPreview(); track item.installment_number) {
                    <tr>
                      <td class="py-2 px-3 font-semibold text-slate-700">Payment {{ item.installment_number }}</td>
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
            <p class="text-xs text-slate-400 italic">Enter total rent amount and payment count to preview schedule.</p>
          }
        </bm-card>

        @if (serverError()) {
          <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {{ serverError() }}
          </div>
        }

        <div class="flex items-center justify-end gap-3 pt-4">
          <a routerLink="/app/tenant-agreements" class="bm-btn bm-btn-secondary">
            Cancel
          </a>
          <button type="submit" [disabled]="isSubmitting()" class="bm-btn bm-btn-primary">
            @if (isSubmitting()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            }
            {{ isEditMode() ? 'Update Tenant Agreement' : 'Save Tenant Draft' }}
          </button>
        </div>
      </form>
    }
  `,
})
export class TenantAgreementFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(TenantAgreementsApiService);
  private ownerAgreementsApi = inject(OwnerAgreementsApiService);
  private customersApi = inject(CustomersApiService);
  private propertiesApi = inject(PropertiesApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  agreementId = signal<number | null>(null);

  tenants = signal<Customer[]>([]);
  availableProperties = signal<Property[]>([]);
  sourceOwnerAgreementId = signal<number | null>(null);

  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  serverError = signal<string | null>(null);

  agreementForm = this.fb.group({
    agreement_no: [''],
    tenant_customer_id: ['', Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    selected_property_id: ['', Validators.required],
    total_amount: ['', [Validators.required, Validators.min(0)]],
    payment_count: [12, [Validators.required, Validators.min(1)]],
    payment_frequency: ['monthly'],
    payment_mode: ['cash' as PaymentMode, Validators.required],
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
      currDate.setMonth(currDate.getMonth() + 1);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadTenants();
    this.loadAvailableProperties();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.agreementId.set(Number(id));
      this.loadAgreement();
    }
  }

  loadTenants(): void {
    this.customersApi.getCustomers({ per_page: 100 }).subscribe({
      next: (res) => {
        this.tenants.set(res.data);
      },
    });
  }

  loadAvailableProperties(): void {
    forkJoin({
      properties: this.propertiesApi.getProperties({ per_page: 100 }),
      agreements: this.ownerAgreementsApi.getAgreements({ per_page: 100 }),
    }).subscribe({
      next: ({ properties, agreements }) => {
        const sources: Record<number, number> = {};
        for (const agreement of agreements.data) {
          if (!['approved', 'commenced'].includes(agreement.status)) continue;
          const covered = Array.isArray(agreement.properties) ? agreement.properties : [];
          for (const property of covered) sources[property.id] = agreement.id;
        }
        this.availableProperties.set(properties.data.filter((property) => sources[property.id]));
        const selected = Number(this.agreementForm.value.selected_property_id);
        this.sourceOwnerAgreementId.set(sources[selected] ?? this.sourceOwnerAgreementId());
      },
    });
  }

  onPropertyChange(): void {
    const propertyId = Number(this.agreementForm.value.selected_property_id);
    this.sourceOwnerAgreementId.set(null);
    this.ownerAgreementsApi.getAgreements({ per_page: 100 }).subscribe({
      next: (res) => {
        for (const agreement of res.data) {
          const covered = Array.isArray(agreement.properties) ? agreement.properties : [];
          if (['approved', 'commenced'].includes(agreement.status) && covered.some((property) => property.id === propertyId)) {
            this.sourceOwnerAgreementId.set(agreement.id);
            break;
          }
        }
      },
    });
  }

  onDateChange(): void {
    // Re-check available properties when dates change (Rule 25)
    this.loadAvailableProperties();
  }

  loadAgreement(): void {
    const id = this.agreementId();
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.api.getAgreement(id).subscribe({
      next: (res) => {
        const agr = res.data;
        const propId = agr.properties && agr.properties[0] ? agr.properties[0].property_id : '';
        this.sourceOwnerAgreementId.set(agr.properties?.[0]?.source_owner_agreement_id ?? null);
        this.agreementForm.patchValue({
          agreement_no: agr.agreement_no,
          tenant_customer_id: String(agr.tenant_customer_id),
          start_date: agr.start_date,
          end_date: agr.end_date,
          selected_property_id: String(propId),
          total_amount: String(agr.total_amount),
          payment_count: agr.payment_count,
          payment_frequency: agr.payment_frequency,
          payment_mode: agr.payment_mode,
          notes: agr.notes || '',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load tenant agreement.');
        this.isLoading.set(false);
      },
    });
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

    this.isSubmitting.set(true);
    this.serverError.set(null);

    const val = this.agreementForm.value;
    const propId = Number(val.selected_property_id);
    const sourceOwnerAgreementId = this.sourceOwnerAgreementId();

    if (!sourceOwnerAgreementId) {
      this.isSubmitting.set(false);
      this.serverError.set('The selected property is not covered by an approved owner agreement.');
      return;
    }

    const payload = {
      ...(this.isEditMode() && val.agreement_no ? { agreement_no: val.agreement_no } : {}),
      tenant_customer_id: Number(val.tenant_customer_id),
      properties: [
        {
          property_id: propId,
          source_owner_agreement_id: sourceOwnerAgreementId,
        },
      ],
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
          this.router.navigate(['/app/tenant-agreements']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.serverError.set(err.message || 'Failed to update tenant agreement.');
        },
      });
    } else {
      this.api.createAgreement(payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/tenant-agreements']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.serverError.set(err.message || 'Failed to create tenant agreement.');
        },
      });
    }
  }
}
