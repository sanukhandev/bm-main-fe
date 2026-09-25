import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { Customer } from '../../shared/models/customer.models';
import { Property } from '../../shared/models/property.models';
import { InstallmentItem, PaymentMode } from '../../shared/models/agreement.models';
import { uaeDateInput } from '../../shared/utils/uae-formatters';

import {
  BmComboboxComponent,
  ComboboxOption,
} from '../../shared/components/bm-combobox/bm-combobox.component';

@Component({
  selector: 'bm-owner-agreement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    BmPageHeaderComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmComboboxComponent,
  ],
  template: `
    <div class="max-w-[1240px] w-full mx-auto pb-12">
      <bm-page-header
        [title]="isEditMode() ? 'Edit Owner Agreement' : 'Draft Owner Agreement'"
        [subtitle]="
          isEditMode()
            ? 'Update agreement contract details and covered assets'
            : 'Create new property owner management contract in draft state'
        "
      >
        <a
          routerLink="/app/owner-agreements"
          class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-100 transition"
        >
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
            <div
              class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-3 shadow-xs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-rose-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div class="font-semibold text-rose-900 mb-0.5">Submission Error</div>
                <div>{{ serverError() }}</div>
              </div>
            </div>
          }

          <!-- SECTION 1: Agreement Identity & Owner Selection -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Agreement Identity & Owner
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Contract reference code and master property owner assignment
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label
                  class="block text-[13px] font-semibold text-[#26312C] mb-2 flex items-center justify-between"
                >
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
                  Property Owner <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <bm-combobox
                  formControlName="owner_customer_id"
                  [options]="ownerOptions()"
                  [locked]="ownerPrefilled()"
                  placeholder="Search or select property owner..."
                  searchPlaceholder="Search owner by name, code, phone..."
                  (change)="onOwnerChange()"
                  [invalid]="isFieldInvalid('owner_customer_id')"
                ></bm-combobox>
                @if (isFieldInvalid('owner_customer_id')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Property owner selection is required.
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- SECTION 2: Property Selection -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Covered Property Assets
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Select property assets managed under this owner contract
                </p>
              </div>
            </div>

            @if (!agreementForm.value.owner_customer_id) {
              <div class="py-6 text-center text-xs text-slate-500 italic border-t border-slate-100">
                Please select a property owner above to view available assets.
              </div>
            } @else if (availableProperties().length === 0) {
              <div
                class="py-6 text-center text-xs text-amber-700 font-medium border-t border-slate-100"
              >
                No active property assets registered under this owner in current branch.
              </div>
            } @else {
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-3">
                  Select Properties Managed <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1"
                >
                  @for (prop of availableProperties(); track prop.id) {
                    <label
                      class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 hover:shadow-2xs cursor-pointer transition-all duration-150"
                      [class.border-emerald-600]="isPropertySelected(prop.id)"
                      [class.bg-emerald-50/20]="isPropertySelected(prop.id)"
                    >
                      <input
                        type="checkbox"
                        [checked]="isPropertySelected(prop.id)"
                        (change)="toggleProperty(prop.id, $event)"
                        class="rounded-md text-emerald-700 focus:ring-emerald-600 h-4.5 w-4.5 border-slate-300"
                      />
                      <div class="text-xs overflow-hidden">
                        <div class="font-semibold text-slate-900 truncate">
                          [{{ prop.property_code }}] {{ prop.name }}
                        </div>
                        <div class="text-slate-500 text-[11px] truncate">
                          Property / Unit No.: {{ prop.unit_number }} | {{ prop.property_type }}
                        </div>
                      </div>
                    </label>
                  }
                </div>
                @if (selectedPropertyIds().length === 0 && agreementForm.touched) {
                  <span class="text-xs font-medium text-rose-600 mt-2 block">
                    Please select at least one property asset.
                  </span>
                }
              </div>
            }
          </div>

          <!-- SECTION 3: Agreement Period -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Contract Term & Validity
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Agreement commencement and expiration dates
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Start Date <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  formControlName="start_date"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('start_date')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Commencement start date is required.
                  </span>
                }
              </div>

              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  End Date <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  formControlName="end_date"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('end_date')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Expiration end date is required.
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- SECTION 4: Commercial Terms -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Commercial & Financial Terms
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Contract value, installment frequency, and payment mode
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Total Amount (AED) <span class="text-rose-600 font-bold ml-0.5">*</span>
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
                    Valid contract amount is required.
                  </span>
                }
              </div>

              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Number of Installments <span class="text-rose-600 font-bold ml-0.5">*</span>
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
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Notes & Special Conditions
                </label>
                <input
                  type="text"
                  formControlName="notes"
                  placeholder="Special clauses or agreement terms..."
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 5: Client Installment Schedule Preview -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Installment Schedule Preview
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Informative schedule breakdown generated based on commercial terms
                </p>
              </div>
            </div>

            @if (installmentPreview().length > 0) {
              <div class="border border-slate-200/80 rounded-xl overflow-hidden">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
                    >
                      <th class="py-3 px-4">Installment</th>
                      <th class="py-3 px-4">Estimated Due Date</th>
                      <th class="py-3 px-4 text-right">Amount (AED)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of installmentPreview(); track item.installment_number) {
                      <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="py-3 px-4 font-semibold text-slate-800">
                          Installment {{ item.installment_number }}
                        </td>
                        <td class="py-3 px-4 text-slate-600 tabular-nums font-medium">
                          {{ item.due_date }}
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">
                          AED {{ item.amount | number: '1.2-2' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="py-6 text-center text-xs text-slate-400 italic">
                Enter total contract amount, dates, and installment count above to calculate
                schedule preview.
              </div>
            }
          </div>

          <!-- STICKY ACTION BAR -->
          <div
            class="sticky bottom-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-lg flex items-center justify-between mt-8"
          >
            <div class="text-xs text-slate-500 font-medium hidden sm:block">
              <span class="text-slate-400">Status:</span>
              {{
                isEditMode()
                  ? 'Editing draft owner agreement'
                  : 'Creating new owner agreement in draft state'
              }}
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <a
                routerLink="/app/owner-agreements"
                class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border border-slate-200/80 transition"
              >
                Cancel
              </a>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#132a13] to-[#31572c] hover:brightness-110 text-white text-sm font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                @if (isSubmitting()) {
                  <svg
                    class="animate-spin -ml-1 h-4 w-4 text-white"
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
                  <span>Saving Agreement...</span>
                } @else {
                  <span>{{
                    isEditMode() ? 'Update Draft Agreement' : 'Save Draft Agreement'
                  }}</span>
                }
              </button>
            </div>
          </div>
        </form>
      }
    </div>
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
  ownerPrefilled = signal(false);

  owners = signal<Customer[]>([]);
  allOwnerProperties = signal<Property[]>([]);
  selectedPropertyIds = signal<number[]>([]);

  ownerOptions = computed<ComboboxOption[]>(() => {
    return this.owners().map((owner) => ({
      id: owner.id,
      label: owner.display_name,
      code: owner.customer_code,
      subtitle: owner.phone || owner.email || '',
    }));
  });

  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  serverError = signal<string | null>(null);

  agreementForm = this.fb.group({
    agreement_no: [''],
    owner_customer_id: ['', Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    total_amount: [0, [Validators.required, Validators.min(0.01)]],
    payment_count: [1, [Validators.required, Validators.min(1), Validators.max(36)]],
    payment_frequency: ['monthly'],
    payment_mode: ['bank_transfer' as PaymentMode, Validators.required],
    notes: [''],
  });

  availableProperties = computed(() => {
    const ownerId = Number(this.agreementForm.value.owner_customer_id);
    if (!ownerId) return [];
    return this.allOwnerProperties().filter((p) => Number(p.owner_customer_id) === ownerId);
  });

  installmentPreview = computed<InstallmentItem[]>(() => {
    const total = Number(this.agreementForm.value.total_amount) || 0;
    const count = Number(this.agreementForm.value.payment_count) || 1;
    const startDateStr = this.agreementForm.value.start_date;
    const frequency = this.agreementForm.value.payment_frequency || 'monthly';

    if (total <= 0 || count <= 0) return [];

    const perInstallment = total / count;
    const items: InstallmentItem[] = [];
    let baseDate = new Date(`${startDateStr || uaeDateInput()}T12:00:00Z`);
    if (isNaN(baseDate.getTime())) baseDate = new Date(`${uaeDateInput()}T12:00:00Z`);

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
    this.loadOwners();
    this.loadProperties();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.agreementId.set(Number(id));
      this.loadAgreement();
    } else {
      const ownerId = this.route.snapshot.queryParamMap.get('owner_customer_id');
      if (ownerId && /^\d+$/.test(ownerId)) {
        this.ownerPrefilled.set(true);
        this.agreementForm.patchValue({ owner_customer_id: ownerId });
      }
    }
  }

  loadOwners(): void {
    const prefilledOwnerId = Number(this.route.snapshot.queryParamMap.get('owner_customer_id'));
    if (prefilledOwnerId > 0) {
      this.customersApi.getCustomer(prefilledOwnerId).subscribe({
        next: (res) => {
          this.owners.set([res.data]);
          this.applyPrefilledOwner([res.data]);
        },
      });
      return;
    }

    this.customersApi.getCustomers({ per_page: 100, role: 'owner' }).subscribe({
      next: (res) => {
        this.owners.set(res.data);
        this.applyPrefilledOwner(res.data);
      },
      error: () => {
        this.customersApi.getCustomers({ per_page: 100 }).subscribe({
          next: (res) => {
            this.owners.set(res.data);
            this.applyPrefilledOwner(res.data);
          },
        });
      },
    });
  }

  private applyPrefilledOwner(owners: Customer[]): void {
    const ownerId = this.route.snapshot.queryParamMap.get('owner_customer_id');
    if (!this.isEditMode() && ownerId && owners.some((owner) => String(owner.id) === ownerId)) {
      this.ownerPrefilled.set(true);
      this.agreementForm.patchValue({ owner_customer_id: ownerId }, { emitEvent: false });
    }
  }

  loadProperties(): void {
    this.propertiesApi.getProperties({ per_page: 100, status: 'active' }).subscribe({
      next: (res) => {
        this.allOwnerProperties.set(res.data);
        const propertyId = this.route.snapshot.queryParamMap.get('property_id');
        if (!this.isEditMode() && propertyId && /^\d+$/.test(propertyId)) {
          const id = Number(propertyId);
          if (res.data.some((property) => property.id === id)) this.selectedPropertyIds.set([id]);
        }
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
        const propIds: number[] = [];
        if (agr.properties) {
          if (Array.isArray(agr.properties)) {
            propIds.push(...agr.properties.map((p) => p.id));
          } else if ('data' in agr.properties && Array.isArray(agr.properties.data)) {
            propIds.push(...agr.properties.data.map((p) => p.id));
          }
        }
        this.selectedPropertyIds.set(propIds);

        this.agreementForm.patchValue({
          agreement_no: agr.agreement_no,
          owner_customer_id: String(agr.owner_customer_id),
          start_date: agr.start_date,
          end_date: agr.end_date,
          total_amount: Number(agr.total_amount),
          payment_count: agr.payment_count || 1,
          payment_frequency: agr.payment_frequency || 'monthly',
          payment_mode: agr.payment_mode || 'bank_transfer',
          notes: agr.notes || '',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load owner agreement details.');
        this.isLoading.set(false);
      },
    });
  }

  onOwnerChange(): void {
    this.selectedPropertyIds.set([]);
  }

  isPropertySelected(id: number): boolean {
    return this.selectedPropertyIds().includes(id);
  }

  toggleProperty(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedPropertyIds().includes(id)) {
        this.selectedPropertyIds.update((ids) => [...ids, id]);
      }
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
      this.serverError.set('Please select at least one property asset.');
      return;
    }

    this.isSubmitting.set(true);
    this.serverError.set(null);

    const val = this.agreementForm.value;
    const dto = {
      owner_customer_id: Number(val.owner_customer_id),
      property_ids: this.selectedPropertyIds(),
      start_date: val.start_date!,
      end_date: val.end_date!,
      total_amount: Number(val.total_amount),
      payment_count: Number(val.payment_count),
      payment_frequency: val.payment_frequency || 'monthly',
      payment_mode: val.payment_mode as PaymentMode,
      notes: val.notes || null,
    };

    if (this.isEditMode()) {
      this.api.updateAgreement(this.agreementId()!, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/owner-agreements']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.error?.errors) {
            const messages = Object.values(err.error.errors).flat().join(' ');
            this.serverError.set(messages || err.message || 'Validation failed.');
          } else {
            this.serverError.set(err.message || 'Failed to update owner agreement.');
          }
        },
      });
    } else {
      this.api.createAgreement(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/owner-agreements']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.error?.errors) {
            const messages = Object.values(err.error.errors).flat().join(' ');
            this.serverError.set(messages || err.message || 'Validation failed.');
          } else {
            this.serverError.set(err.message || 'Failed to create owner agreement.');
          }
        },
      });
    }
  }
}
