import { Component, OnInit, inject, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

import {
  BmComboboxComponent,
  ComboboxOption,
} from '../../shared/components/bm-combobox/bm-combobox.component';

@Component({
  selector: 'bm-tenant-agreement-form',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    <div class="max-w-[1240px] w-full mx-auto pb-12 font-sans text-slate-900">
      <bm-page-header
        [title]="isEditMode() ? 'Edit Tenant Agreement' : 'Create Tenant Agreement'"
        [subtitle]="
          isEditMode()
            ? 'Update agreement lease details and commercial schedule'
            : 'Draft a new tenant lease contract for a property asset'
        "
      >
        <a
          routerLink="/app/tenant-agreements"
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

          <!-- SECTION 1: Agreement Identity & Tenant Selection -->
          <div
            class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-2xs space-y-5"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
              >
                01
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900 tracking-tight">
                  Agreement Identity & Tenant
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Contract reference code and leasing tenant customer assignment
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
                  Tenant Customer <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <bm-combobox
                  formControlName="tenant_customer_id"
                  [options]="tenantOptions()"
                  [locked]="tenantPrefilled()"
                  placeholder="Search or select tenant..."
                  searchPlaceholder="Search tenant by name, customer code, phone..."
                  [invalid]="isFieldInvalid('tenant_customer_id')"
                ></bm-combobox>
                @if (isFieldInvalid('tenant_customer_id')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Tenant customer selection is required.
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- SECTION 2: Lease Period -->
          <div
            class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-2xs space-y-5"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
              >
                02
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900 tracking-tight">
                  Lease Term & Period
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Tenant tenancy commencement and expiration dates
                </p>
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

          <!-- SECTION 3: Source Owner Agreement & Leased Assets -->
          <div
            class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-2xs space-y-5"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
              >
                03
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900 tracking-tight">
                  Source Owner Agreement & Leased Assets
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Select source owner contract and property assets for this tenant lease
                </p>
              </div>
            </div>

            <div>
              <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                Source Owner Agreement <span class="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <bm-combobox
                formControlName="source_owner_agreement_id"
                [options]="sourceOwnerAgreementOptions()"
                placeholder="Search or select source owner agreement..."
                searchPlaceholder="Search agreement by reference number, owner name or dates..."
                (change)="onAvailabilityInputsChange()"
                [invalid]="isFieldInvalid('source_owner_agreement_id')"
              ></bm-combobox>
              @if (isFieldInvalid('source_owner_agreement_id')) {
                <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                  Source owner agreement is required.
                </span>
              }
            </div>

            <!-- Selected Source Owner Agreement Summary Banner -->
            @if (selectedOwnerAgreement()) {
              <div
                class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
              >
                <div class="space-y-0.5">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Source Owner Contract
                  </div>
                  <div class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>{{ selectedOwnerAgreement()?.agreement_no }}</span>
                    <span
                      class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize"
                    >
                      {{ selectedOwnerAgreement()?.status }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-600">
                    Owner:
                    <strong class="text-slate-900">{{
                      ownerName(selectedOwnerAgreement())
                    }}</strong>
                    · Valid: {{ selectedOwnerAgreement()?.start_date }} to
                    {{ selectedOwnerAgreement()?.end_date }}
                  </div>
                </div>
              </div>
            }

            <!-- Property Asset Selection Cards Grid -->
            @if (!agreementForm.value.source_owner_agreement_id) {
              <div
                class="py-8 text-center text-xs text-slate-500 italic bg-slate-50/60 rounded-xl border border-slate-100"
              >
                Please select a source owner agreement above to view and select available
                properties.
              </div>
            } @else if (availableProperties().length === 0) {
              <div
                class="py-8 text-center text-xs text-amber-800 font-medium bg-amber-50/60 rounded-xl border border-amber-200/60"
              >
                No available property assets found for the selected source owner agreement and lease
                dates.
              </div>
            } @else {
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <label class="block text-[13px] font-semibold text-[#26312C]">
                    Select Covered Property Asset(s)
                    <span class="text-rose-600 font-bold ml-0.5">*</span>
                  </label>
                  <span class="text-xs font-semibold text-slate-500">
                    Selected:
                    <strong class="text-emerald-700 font-bold">{{
                      selectedPropertyIds().length
                    }}</strong>
                    property(ies)
                  </span>
                </div>

                <!-- Quick Filter Search Input -->
                <div class="relative">
                  <input
                    type="search"
                    [value]="propertySearch()"
                    (input)="onPropertySearch($event)"
                    placeholder="Filter properties by code, unit number or building..."
                    class="w-full h-10 px-3.5 pl-9 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                <!-- Tactile Bento Property Cards Grid -->
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1"
                >
                  @for (prop of filteredAvailableProperties(); track prop.id) {
                    <label
                      class="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 hover:shadow-2xs cursor-pointer transition-all duration-150 relative"
                      [class.border-emerald-600]="isPropertySelected(prop.id)"
                      [class.bg-emerald-50/20]="isPropertySelected(prop.id)"
                      [class.ring-2]="isPropertySelected(prop.id)"
                      [class.ring-emerald-500/10]="isPropertySelected(prop.id)"
                    >
                      <input
                        type="checkbox"
                        [checked]="isPropertySelected(prop.id)"
                        (change)="toggleProperty(prop.id, $event)"
                        class="rounded-md text-emerald-700 focus:ring-emerald-600 h-4.5 w-4.5 border-slate-300 mt-0.5 shrink-0 cursor-pointer"
                      />
                      <div class="text-xs overflow-hidden flex-1">
                        <div class="flex items-center justify-between gap-1 mb-0.5">
                          <span class="font-extrabold text-slate-900 truncate"
                            >Unit {{ prop.unit_number }}</span
                          >
                          <span
                            class="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0"
                          >
                            {{ prop.property_code }}
                          </span>
                        </div>
                        <div class="text-slate-700 font-semibold truncate">{{ prop.name }}</div>
                        <div class="text-slate-500 text-[11px] truncate mt-0.5">
                          {{ prop.building_name || 'Building Asset' }} ·
                          <span class="capitalize">{{ prop.property_type }}</span>
                        </div>
                      </div>
                    </label>
                  }
                </div>

                @if (isFieldInvalid('selected_property_ids')) {
                  <span class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Please select at least one property asset for this tenancy contract.
                  </span>
                }
              </div>
            }
          </div>

          <!-- SECTION 4: Commercial Terms -->
          <div
            class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-2xs space-y-5"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
              >
                04
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900 tracking-tight">
                  Commercial & Rent Terms
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Total contract rent, number of payments, and payment mode
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Total Rent Amount (AED) <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <div class="relative">
                  <input
                    type="number"
                    step="0.01"
                    formControlName="total_amount"
                    placeholder="0.00"
                    class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-semibold tabular-nums shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                  />
                </div>
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
          <div
            class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-2xs space-y-5"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
              >
                05
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900 tracking-tight">
                  Rent Installment Schedule Preview
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Informative schedule breakdown generated based on commercial terms
                </p>
              </div>
            </div>

            @if (installmentPreview().length > 0) {
              <div class="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]"
                    >
                      <th class="py-3 px-4">Payment No</th>
                      <th class="py-3 px-4">Estimated Due Date</th>
                      <th class="py-3 px-4 text-right">Rent Installment Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    @for (item of installmentPreview(); track item.installment_number) {
                      <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="py-3 px-4 font-bold text-slate-800">
                          Payment {{ item.installment_number }}
                        </td>
                        <td class="py-3 px-4 text-slate-600 tabular-nums font-mono">
                          {{ item.due_date }}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                          <div class="flex items-center justify-end">
                            <dirham-symbol
                              size="0.85em"
                              weight="bold"
                              class="mr-1 text-slate-400 select-none"
                            ></dirham-symbol>
                            <span>{{ item.amount | number: '1.2-2' }}</span>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="py-6 text-center text-xs text-slate-400 italic">
                Enter total rent amount, dates, and payment count above to preview schedule.
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
                  ? 'Editing tenant agreement lease'
                  : 'Creating new tenant agreement draft'
              }}
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <a
                routerLink="/app/tenant-agreements"
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
  tenantPrefilled = signal(false);

  tenants = signal<Customer[]>([]);
  ownerAgreements = signal<OwnerAgreement[]>([]);
  availableProperties = signal<Property[]>([]);
  propertySearch = signal('');

  filteredAvailableProperties = computed(() => {
    const query = this.propertySearch().trim().toLowerCase();
    if (!query) return this.availableProperties();
    return this.availableProperties().filter((property) =>
      [property.property_code, property.name, property.building_name, property.unit_number]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  });

  selectedPropertyIds = computed<number[]>(() => {
    const val = this.agreementForm.get('selected_property_ids')?.value || [];
    return (val as Array<number | string>).map(Number);
  });

  selectedOwnerAgreement = computed<OwnerAgreement | null>(() => {
    const id = Number(this.agreementForm.value.source_owner_agreement_id);
    if (!id) return null;
    return this.ownerAgreements().find((oa) => oa.id === id) || null;
  });

  tenantOptions = computed<ComboboxOption[]>(() => {
    return this.tenants().map((tenant) => ({
      id: tenant.id,
      label: tenant.display_name,
      code: tenant.customer_code,
      subtitle: tenant.phone || tenant.email || '',
    }));
  });

  ownerName(oa: OwnerAgreement | null | undefined): string {
    if (!oa || !oa.owner) return 'Owner';
    if ('data' in oa.owner && oa.owner.data) return oa.owner.data.display_name;
    if ('display_name' in oa.owner) return oa.owner.display_name;
    return 'Owner';
  }

  sourceOwnerAgreementOptions = computed<ComboboxOption[]>(() => {
    return this.ownerAgreements().map((oa) => ({
      id: oa.id,
      label: `${oa.agreement_no} (${this.ownerName(oa)} · ${oa.start_date} – ${oa.end_date})`,
      code: oa.agreement_no,
      subtitle: `Valid ${oa.start_date} to ${oa.end_date}`,
    }));
  });

  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  serverError = signal<string | null>(null);
  private availabilityRequest = 0;

  agreementForm = this.fb.group({
    agreement_no: [''],
    tenant_customer_id: ['', Validators.required],
    source_owner_agreement_id: ['', Validators.required],
    selected_property_ids: this.fb.nonNullable.control<number[]>([], Validators.required),
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
    } else {
      const tenantId = this.route.snapshot.queryParamMap.get('tenant_customer_id');
      const sourceOwnerAgreementId = this.route.snapshot.queryParamMap.get(
        'source_owner_agreement_id',
      );
      if (tenantId && /^\d+$/.test(tenantId)) {
        this.tenantPrefilled.set(true);
        this.agreementForm.patchValue({ tenant_customer_id: tenantId });
      }
      if (sourceOwnerAgreementId && /^\d+$/.test(sourceOwnerAgreementId)) {
        this.agreementForm.patchValue({ source_owner_agreement_id: sourceOwnerAgreementId });
      }
      this.loadPrefilledOwnerAgreementProperties();
    }
  }

  private loadPrefilledOwnerAgreementProperties(): void {
    const agreementId = Number(this.route.snapshot.queryParamMap.get('source_owner_agreement_id'));
    if (!agreementId || this.isEditMode()) return;

    this.ownerAgreementsApi.getAgreement(agreementId).subscribe({
      next: (res) => {
        const oa = res.data;
        const properties = this.normalizeOwnerAgreementProperties(oa.properties);
        this.availableProperties.set(properties);
        if (oa.start_date && !this.agreementForm.value.start_date) {
          this.agreementForm.patchValue({
            start_date: oa.start_date,
            end_date: oa.end_date,
          });
        }
        const prefilledPropId = Number(this.route.snapshot.queryParamMap.get('property_id'));
        if (prefilledPropId && properties.some((p) => p.id === prefilledPropId)) {
          this.agreementForm.get('selected_property_ids')?.setValue([prefilledPropId]);
        } else if (properties.length === 1) {
          this.agreementForm.get('selected_property_ids')?.setValue([properties[0].id]);
        }
      },
    });
  }

  private normalizeOwnerAgreementProperties(properties: OwnerAgreement['properties']): Property[] {
    if (Array.isArray(properties)) return properties;
    return properties?.data || [];
  }

  loadTenants(): void {
    const prefilledTenantId = Number(this.route.snapshot.queryParamMap.get('tenant_customer_id'));
    if (prefilledTenantId > 0) {
      this.customersApi.getCustomer(prefilledTenantId).subscribe({
        next: (res) => {
          this.tenants.set([res.data]);
          this.applyPrefilledTenant([res.data]);
        },
      });
      return;
    }

    this.customersApi.getCustomers({ per_page: 100, role: 'tenant' }).subscribe({
      next: (res) => {
        this.tenants.set(res.data);
        this.applyPrefilledTenant(res.data);
      },
      error: () => {
        this.customersApi.getCustomers({ per_page: 100 }).subscribe({
          next: (res) => {
            this.tenants.set(res.data);
            this.applyPrefilledTenant(res.data);
          },
        });
      },
    });
  }

  private applyPrefilledTenant(tenants: Customer[]): void {
    const tenantId = this.route.snapshot.queryParamMap.get('tenant_customer_id');
    if (
      !this.isEditMode() &&
      tenantId &&
      tenants.some((tenant) => String(tenant.id) === tenantId)
    ) {
      this.tenantPrefilled.set(true);
      this.agreementForm.patchValue({ tenant_customer_id: tenantId }, { emitEvent: false });
    }
  }

  loadOwnerAgreements(): void {
    this.ownerAgreementsApi.getAgreements({ per_page: 100 }).subscribe({
      next: (res) => this.ownerAgreements.set(res.data),
    });
  }

  loadAvailableProperties(): void {
    const request = ++this.availabilityRequest;
    const value = this.agreementForm.getRawValue();
    const oaId = Number(value.source_owner_agreement_id);

    // If source owner agreement is selected but dates are missing, fetch properties directly from owner agreement
    if (oaId && (!value.start_date || !value.end_date)) {
      this.ownerAgreementsApi.getAgreement(oaId).subscribe({
        next: (res) => {
          if (request !== this.availabilityRequest) return;
          const props = this.normalizeOwnerAgreementProperties(res.data.properties);
          this.availableProperties.set(props);
          if (res.data.start_date && !this.agreementForm.value.start_date) {
            this.agreementForm.patchValue({
              start_date: res.data.start_date,
              end_date: res.data.end_date,
            });
          }
        },
      });
      return;
    }

    if (!value.start_date || !value.end_date || value.start_date > value.end_date) {
      this.availableProperties.set([]);
      return;
    }

    this.propertiesApi
      .getAvailableProperties({
        per_page: 100,
        start_date: value.start_date,
        end_date: value.end_date,
        source_owner_agreement_id: value.source_owner_agreement_id || undefined,
        exclude_tenant_agreement_id: this.agreementId() || undefined,
      })
      .subscribe({
        next: (res) => {
          if (request !== this.availabilityRequest) return;
          this.availableProperties.set(res.data);
          const selected = (
            (this.agreementForm.get('selected_property_ids')?.value || []) as Array<number | string>
          )
            .map(Number)
            .filter((id) => res.data.some((property) => property.id === id));
          this.agreementForm.get('selected_property_ids')?.setValue(selected, { emitEvent: false });
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
        this.agreementForm.patchValue({
          agreement_no: agr.agreement_no,
          tenant_customer_id: String(agr.tenant_customer_id),
          source_owner_agreement_id: agr.properties?.[0]?.source_owner_agreement_id
            ? String(agr.properties[0].source_owner_agreement_id)
            : '',
          selected_property_ids: agr.properties?.map((property) => property.property_id) || [],
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

  onDateChange(): void {
    this.onAvailabilityInputsChange();
  }

  onAvailabilityInputsChange(): void {
    const oaId = Number(this.agreementForm.value.source_owner_agreement_id);
    if (oaId) {
      const oa = this.ownerAgreements().find((item) => item.id === oaId);
      if (oa && (!this.agreementForm.value.start_date || !this.agreementForm.value.end_date)) {
        this.agreementForm.patchValue({
          start_date: oa.start_date,
          end_date: oa.end_date,
        });
      }
    }
    this.agreementForm.get('selected_property_ids')?.setValue([]);
    this.loadAvailableProperties();
  }

  isPropertySelected(id: number): boolean {
    const selected = (this.agreementForm.get('selected_property_ids')?.value || []) as number[];
    return selected.map(Number).includes(Number(id));
  }

  toggleProperty(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = (
      (this.agreementForm.get('selected_property_ids')?.value || []) as Array<number | string>
    ).map(Number);
    let updated: number[];
    if (checked) {
      updated = current.includes(id) ? current : [...current, id];
    } else {
      updated = current.filter((pId) => pId !== id);
    }
    this.agreementForm.get('selected_property_ids')?.setValue(updated);
    this.agreementForm.get('selected_property_ids')?.markAsTouched();
    this.agreementForm.get('selected_property_ids')?.markAsDirty();
  }

  onPropertySearch(event: Event): void {
    this.propertySearch.set((event.target as HTMLInputElement).value);
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
    const selectedPropertyIds = (val.selected_property_ids as number[]).map(Number);

    const dto = {
      tenant_customer_id: Number(val.tenant_customer_id),
      start_date: val.start_date!,
      end_date: val.end_date!,
      total_amount: Number(val.total_amount),
      payment_count: Number(val.payment_count),
      payment_frequency: val.payment_frequency || 'monthly',
      payment_mode: val.payment_mode as PaymentMode,
      properties: selectedPropertyIds.map((propertyId) => ({
        property_id: propertyId,
        source_owner_agreement_id: Number(val.source_owner_agreement_id),
      })),
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

  private handleSubmitError(
    err: { error?: { code?: string; errors?: Record<string, unknown> }; message?: string },
    fallback: string,
  ): void {
    if (err.error?.code === 'PROPERTY_NOT_AVAILABLE') {
      this.serverError.set(
        'One or more selected properties are no longer available for this agreement period. Review the property selection and try again.',
      );
      this.loadAvailableProperties();
      return;
    }
    const messages = err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : '';
    this.serverError.set(messages || err.message || fallback);
  }
}
