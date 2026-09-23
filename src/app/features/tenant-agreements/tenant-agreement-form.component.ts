import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { TenantAgreementsApiService } from '../../core/api/tenant-agreements-api.service';
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { Customer } from '../../shared/models/customer.models';
import { Property } from '../../shared/models/property.models';
import { InstallmentItem, OwnerAgreement, PaymentMode } from '../../shared/models/agreement.models';

@Component({
  selector: 'bm-tenant-agreement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    BmPageHeaderComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <div class="max-w-[1240px] w-full mx-auto pb-12">
      <bm-page-header
        [title]="isEditMode() ? 'Edit Tenant Agreement' : 'Create Tenant Agreement'"
        [subtitle]="isEditMode() ? 'Update agreement lease details and commercial schedule' : 'Draft a new tenant lease contract for a property asset'"
      >
        <a routerLink="/app/tenant-agreements" class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-100 transition">
          Cancel
        </a>
      </bm-page-header>

      @if (isLoading()) {
        <bm-loading-state type="form"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="loadAgreement()"></bm-error-state>
      } @else {
        <form [formGroup]="agreementForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <!-- Top Server Error Alert -->
          @if (serverError()) {
            <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-3 shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div class="font-semibold text-rose-900 mb-0.5">Submission Error</div>
                <div>{{ serverError() }}</div>
              </div>
            </div>
          }

          <!-- SECTION 1: Agreement Identity & Tenant Selection -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">Agreement Identity & Tenant</h3>
                <p class="text-xs text-slate-500 font-normal">Contract reference code and leasing tenant assignment</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2 flex items-center justify-between">
                  <span>Agreement Number</span>
                  <span class="text-[11px] text-slate-400 font-normal">System generated</span>
                </label>
                <input
                  type="text"
                  formControlName="agreement_no"
                  placeholder="Assigned automatically on save"
                  readonly
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-semibold tabular-nums cursor-not-allowed select-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Tenant Customer <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <select
                  formControlName="tenant_customer_id"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                >
                  <option value="">Select Tenant...</option>
                  @for (tenant of tenants(); track tenant.id) {
                    <option [value]="tenant.id">
                      [{{ tenant.customer_code }}] {{ tenant.display_name }}
                    </option>
                  }
                </select>
                @if (isFieldInvalid('tenant_customer_id')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Tenant customer selection is required.
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- SECTION 2: Lease Period -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">Lease Term & Period</h3>
                <p class="text-xs text-slate-500 font-normal">Tenant tenancy commencement and expiration dates</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Lease Start Date <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  formControlName="start_date"
                  (change)="onDateChange()"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('start_date')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Lease start date is required.
                  </span>
                }
              </div>

              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Lease End Date <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  formControlName="end_date"
                  (change)="onDateChange()"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('end_date')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Lease end date is required.
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- SECTION 3: Leased Property Asset Selection -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">Leased Property Asset</h3>
                <p class="text-xs text-slate-500 font-normal">Select an active property for this tenancy contract</p>
              </div>
            </div>

            <div>
              <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                Source Owner Agreement <span class="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <select
                formControlName="source_owner_agreement_id"
                (change)="onAvailabilityInputsChange()"
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
              >
                <option value="">Select source agreement...</option>
                @for (ownerAgreement of ownerAgreements(); track ownerAgreement.id) {
                  <option [value]="ownerAgreement.id">{{ ownerAgreement.agreement_no }} · {{ ownerAgreement.start_date }} – {{ ownerAgreement.end_date }}</option>
                }
              </select>
              @if (isFieldInvalid('source_owner_agreement_id')) {
                <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">Source owner agreement is required.</span>
              }
            </div>

            <div class="mt-5">
              <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                Property Asset <span class="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <select
                formControlName="selected_property_id"
                (change)="onPropertyChange()"
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
              >
                <option value="">Select Property Asset...</option>
                @for (prop of availableProperties(); track prop.id) {
                  <option [value]="prop.id">
                    [{{ prop.property_code }}] {{ prop.name }} (Property / Unit No.: {{ prop.unit_number }})
                  </option>
                }
              </select>
              @if (isFieldInvalid('selected_property_id')) {
                <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                  Property asset selection is required.
                </span>
              }
            </div>
          </div>

          <!-- SECTION 4: Commercial Terms -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">Commercial & Rent Terms</h3>
                <p class="text-xs text-slate-500 font-normal">Total contract rent, number of payments, and payment mode</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Total Rent Amount (AED) <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  formControlName="total_amount"
                  placeholder="0.00"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-semibold tabular-nums shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('total_amount')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Valid rent amount is required.
                  </span>
                }
              </div>

              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Number of Payments <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  formControlName="payment_count"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium tabular-nums shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('payment_count')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Number of payments is required.
                  </span>
                }
              </div>

              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Payment Frequency
                </label>
                <select
                  formControlName="payment_frequency"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annually">Semi-Annually</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Payment Mode <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <select
                  formControlName="payment_mode"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                >
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Notes & Special Conditions
                </label>
                <input
                  type="text"
                  formControlName="notes"
                  placeholder="Additional lease clauses or special conditions..."
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 5: Rent Schedule Preview -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">Rent Installment Schedule Preview</h3>
                <p class="text-xs text-slate-500 font-normal">Informative schedule breakdown generated based on commercial terms</p>
              </div>
            </div>

            @if (installmentPreview().length > 0) {
              <div class="border border-slate-200/80 rounded-xl overflow-hidden">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      <th class="py-3 px-4">Payment No</th>
                      <th class="py-3 px-4">Estimated Due Date</th>
                      <th class="py-3 px-4 text-right">Rent Installment (AED)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of installmentPreview(); track item.installment_number) {
                      <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="py-3 px-4 font-semibold text-slate-800">Payment {{ item.installment_number }}</td>
                        <td class="py-3 px-4 text-slate-600 tabular-nums font-medium">{{ item.due_date }}</td>
                        <td class="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">
                          AED {{ item.amount | number:'1.2-2' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 text-center text-xs text-slate-400 italic">
                Enter total rent amount, dates, and payment count above to preview schedule.
              </div>
            }
          </div>

          <!-- STICKY ACTION BAR -->
          <div class="sticky bottom-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-lg flex items-center justify-between mt-8">
            <div class="text-xs text-slate-500 font-medium hidden sm:block">
              <span class="text-slate-400">Status:</span> {{ isEditMode() ? 'Editing tenant agreement lease' : 'Creating new tenant agreement draft' }}
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <a routerLink="/app/tenant-agreements" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border border-slate-200/80 transition">
                Cancel
              </a>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#132a13] to-[#31572c] hover:brightness-110 text-white text-sm font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin -ml-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving Agreement...</span>
                } @else {
                  <span>{{ isEditMode() ? 'Update Tenant Agreement' : 'Save Tenant Draft' }}</span>
                }
              </button>
            </div>
          </div>
        </form>
      }
    </div>
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
  ownerAgreements = signal<OwnerAgreement[]>([]);
  availableProperties = signal<Property[]>([]);

  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  serverError = signal<string | null>(null);
  private availabilityRequest = 0;

  agreementForm = this.fb.group({
    agreement_no: [''],
    tenant_customer_id: ['', Validators.required],
    source_owner_agreement_id: ['', Validators.required],
    selected_property_id: ['', Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    total_amount: [0, [Validators.required, Validators.min(0.01)]],
    payment_count: [1, [Validators.required, Validators.min(1), Validators.max(36)]],
    payment_frequency: ['monthly'],
    payment_mode: ['cheque' as PaymentMode, Validators.required],
    notes: [''],
  });

  installmentPreview = computed<InstallmentItem[]>(() => {
    const total = Number(this.agreementForm.value.total_amount) || 0;
    const count = Number(this.agreementForm.value.payment_count) || 1;
    const startDateStr = this.agreementForm.value.start_date;
    const frequency = this.agreementForm.value.payment_frequency || 'monthly';

    if (total <= 0 || count <= 0) return [];

    const perInstallment = total / count;
    const items: InstallmentItem[] = [];
    let baseDate = startDateStr ? new Date(startDateStr) : new Date();
    if (isNaN(baseDate.getTime())) baseDate = new Date();

    for (let i = 1; i <= count; i++) {
      const dueDate = new Date(baseDate);
      if (i > 1) {
        if (frequency === 'monthly') dueDate.setMonth(dueDate.getMonth() + (i - 1));
        else if (frequency === 'quarterly') dueDate.setMonth(dueDate.getMonth() + (i - 1) * 3);
        else if (frequency === 'semi-annually') dueDate.setMonth(dueDate.getMonth() + (i - 1) * 6);
        else if (frequency === 'annually') dueDate.setFullYear(dueDate.getFullYear() + (i - 1));
      }

      items.push({
        installment_number: i,
        due_date: dueDate.toISOString().split('T')[0],
        amount: perInstallment,
        status: 'pending',
      });
    }

    return items;
  });

  ngOnInit(): void {
    this.loadTenants();
    this.loadOwnerAgreements();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.agreementId.set(Number(id));
      this.loadAgreement();
    }
  }

  loadTenants(): void {
    this.customersApi.getCustomers({ per_page: 100, role: 'tenant' }).subscribe({
      next: (res) => this.tenants.set(res.data),
      error: () => {
        this.customersApi.getCustomers({ per_page: 100 }).subscribe({
          next: (res) => this.tenants.set(res.data),
        });
      },
    });
  }

  loadOwnerAgreements(): void {
    this.ownerAgreementsApi.getAgreements({ per_page: 100 }).subscribe({
      next: (res) => this.ownerAgreements.set(res.data),
    });
  }

  loadAvailableProperties(): void {
    const request = ++this.availabilityRequest;
    const value = this.agreementForm.getRawValue();
    if (!value.start_date || !value.end_date || value.start_date > value.end_date) {
      this.availableProperties.set([]);
      return;
    }
    this.propertiesApi.getAvailableProperties({
      per_page: 100,
      start_date: value.start_date,
      end_date: value.end_date,
      source_owner_agreement_id: value.source_owner_agreement_id || undefined,
      exclude_tenant_agreement_id: this.agreementId() || undefined,
    }).subscribe({
      next: (res) => {
        if (request !== this.availabilityRequest) return;
        this.availableProperties.set(res.data);
        const selected = Number(this.agreementForm.get('selected_property_id')?.value);
        if (selected && !res.data.some((property) => property.id === selected)) this.agreementForm.get('selected_property_id')?.setValue('');
      },
      error: () => {
        if (request === this.availabilityRequest) this.availableProperties.set([]);
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
        let selectedPropId = '';
        if (agr.properties && agr.properties.length > 0) {
          selectedPropId = String(agr.properties[0].property_id);
        }

        this.agreementForm.patchValue({
          agreement_no: agr.agreement_no,
          tenant_customer_id: String(agr.tenant_customer_id),
          source_owner_agreement_id: agr.properties?.[0]?.source_owner_agreement_id ? String(agr.properties[0].source_owner_agreement_id) : '',
          selected_property_id: selectedPropId,
          start_date: agr.start_date,
          end_date: agr.end_date,
          total_amount: Number(agr.total_amount),
          payment_count: agr.payment_count || 1,
          payment_frequency: agr.payment_frequency || 'monthly',
          payment_mode: agr.payment_mode || 'cheque',
          notes: agr.notes || '',
        });
        this.loadAvailableProperties();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load tenant agreement details.');
        this.isLoading.set(false);
      },
    });
  }

  onDateChange(): void { this.onAvailabilityInputsChange(); }
  onAvailabilityInputsChange(): void {
    this.agreementForm.get('selected_property_id')?.setValue('');
    this.loadAvailableProperties();
  }
  onPropertyChange(): void {}

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
    const selectedPropId = Number(val.selected_property_id);

    // Find property owner from available properties
    const prop = this.availableProperties().find((p) => p.id === selectedPropId);
    const ownerCustomerId = prop ? Number(prop.owner_customer_id) : 0;

    const dto = {
      tenant_customer_id: Number(val.tenant_customer_id),
      owner_customer_id: ownerCustomerId,
      start_date: val.start_date!,
      end_date: val.end_date!,
      total_amount: Number(val.total_amount),
      payment_count: Number(val.payment_count),
      payment_frequency: val.payment_frequency || 'monthly',
      payment_mode: val.payment_mode as PaymentMode,
      properties: [{
        property_id: selectedPropId,
        source_owner_agreement_id: Number(val.source_owner_agreement_id),
      }],
      notes: val.notes || null,
    };

    if (this.isEditMode()) {
      this.api.updateAgreement(this.agreementId()!, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/tenant-agreements']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.handleSubmitError(err, 'Failed to update tenant agreement.');
        },
      });
    } else {
      this.api.createAgreement(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/tenant-agreements']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.handleSubmitError(err, 'Failed to create tenant agreement.');
        },
      });
    }
  }

  private handleSubmitError(err: { error?: { code?: string; errors?: Record<string, unknown> }; message?: string }, fallback: string): void {
    if (err.error?.code === 'PROPERTY_NOT_AVAILABLE') {
      this.serverError.set('One or more selected properties are no longer available for this agreement period. Review the property selection and try again.');
      this.loadAvailableProperties();
      return;
    }
    const messages = err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : '';
    this.serverError.set(messages || err.message || fallback);
  }
}
