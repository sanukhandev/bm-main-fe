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
    <div
      class="max-w-[1400px] w-full mx-auto space-y-4 font-sans text-slate-900 pb-12 px-4 sm:px-6"
    >
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
          class="bm-btn bm-btn-secondary text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
        >
          Cancel
        </a>
      </bm-page-header>

      @if (isLoading()) {
        <bm-loading-state type="form"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="loadAgreement()"></bm-error-state>
      } @else {
        <form [formGroup]="agreementForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Server Error Alert -->
          @if (serverError()) {
            <div
              class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2.5 shadow-2xs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-rose-600 shrink-0 mt-0.5"
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
                <div class="font-bold text-rose-900">Submission Error</div>
                <div>{{ serverError() }}</div>
              </div>
            </div>
          }

          <!-- GRID ROW 1: IDENTITY & VALIDITY PERIOD (2 COLUMNS) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            <!-- CARD 1: IDENTITY & OWNER (6 COLS) -->
            <div
              class="lg:col-span-6 rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div
                  class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
                >
                  01
                </div>
                <h3 class="text-sm font-extrabold text-slate-900">Contract Identity & Owner</h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label
                    class="block text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center justify-between"
                  >
                    <span>Agreement #</span>
                    <span class="text-[10px] text-slate-400 font-normal">Auto</span>
                  </label>
                  <input
                    type="text"
                    formControlName="agreement_no"
                    placeholder="Auto-generated on save"
                    readonly
                    class="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold tabular-nums cursor-not-allowed select-none"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    File No.
                  </label>
                  <input
                    type="text"
                    formControlName="file_no"
                    maxlength="100"
                    placeholder="Optional manual file #"
                    class="w-full h-9 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Property Owner <span class="text-rose-600 ml-0.5">*</span>
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
                    <span class="text-[11px] font-semibold text-rose-600 mt-1 block">
                      Property owner selection is required.
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- CARD 2: CONTRACT VALIDITY & TERM (6 COLS) -->
            <div
              class="lg:col-span-6 rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div
                  class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
                >
                  02
                </div>
                <h3 class="text-sm font-extrabold text-slate-900">Contract Term & Validity</h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Commencement Date <span class="text-rose-600 ml-0.5">*</span>
                  </label>
                  <input
                    type="date"
                    formControlName="start_date"
                    class="w-full h-9 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                  @if (isFieldInvalid('start_date')) {
                    <span class="text-[11px] font-semibold text-rose-600 mt-1 block">
                      Start date is required.
                    </span>
                  }
                </div>

                <div>
                  <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Expiration Date <span class="text-rose-600 ml-0.5">*</span>
                  </label>
                  <input
                    type="date"
                    formControlName="end_date"
                    class="w-full h-9 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                  @if (isFieldInvalid('end_date')) {
                    <span class="text-[11px] font-semibold text-rose-600 mt-1 block">
                      End date is required.
                    </span>
                  }
                </div>

                <div class="sm:col-span-2 pt-1">
                  <div
                    class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <span class="text-slate-500 font-medium">Contract Scope Status:</span>
                    <span
                      class="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]"
                    >
                      {{
                        isEditMode()
                          ? 'Editing Existing Agreement'
                          : 'New Management Agreement Draft'
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- GRID ROW 2: COVERED PROPERTIES & COMMERCIAL TERMS -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
            <!-- CARD 3: MANAGED PROPERTY ASSETS (5 COLS) -->
            <div
              class="lg:col-span-5 rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
                  >
                    03
                  </div>
                  <h3 class="text-sm font-extrabold text-slate-900">Covered Assets</h3>
                </div>
                <span
                  class="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {{ selectedPropertyIds().length }} Selected
                </span>
              </div>

              @if (!agreementForm.value.owner_customer_id) {
                <div
                  class="py-5 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-slate-100"
                >
                  Select a property owner above to view available assets.
                </div>
              } @else if (availableProperties().length === 0) {
                <div
                  class="py-5 text-center text-xs text-amber-700 font-medium bg-amber-50/50 rounded-xl border border-amber-200/60"
                >
                  No property assets registered under this owner in current branch.
                </div>
              } @else {
                <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  @for (prop of availableProperties(); track prop.id) {
                    <label
                      class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 cursor-pointer transition text-xs"
                      [class.border-emerald-600]="isPropertySelected(prop.id)"
                      [class.bg-emerald-50/30]="isPropertySelected(prop.id)"
                    >
                      <input
                        type="checkbox"
                        [checked]="isPropertySelected(prop.id)"
                        (change)="toggleProperty(prop.id, $event)"
                        class="rounded text-emerald-700 focus:ring-emerald-600 h-4 w-4 border-slate-300"
                      />
                      <div class="overflow-hidden">
                        <div class="font-bold text-slate-900 truncate">
                          [{{ prop.property_code }}] {{ prop.name }}
                        </div>
                        <div class="text-slate-500 text-[10px] truncate">
                          Unit {{ prop.unit_number }} · {{ prop.property_type }}
                        </div>
                      </div>
                    </label>
                  }
                </div>
                @if (selectedPropertyIds().length === 0 && agreementForm.touched) {
                  <span class="text-[11px] font-semibold text-rose-600 block">
                    Please select at least one property asset.
                  </span>
                }
              }
            </div>

            <!-- CARD 4: COMMERCIAL & FINANCIAL TERMS (7 COLS) -->
            <div
              class="lg:col-span-7 rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div
                  class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
                >
                  04
                </div>
                <h3 class="text-sm font-extrabold text-slate-900">Commercial & Financial Terms</h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Total Amount (AED) <span class="text-rose-600 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    formControlName="total_amount"
                    placeholder="0.00"
                    class="w-full h-9 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-bold tabular-nums focus:outline-none focus:border-emerald-600"
                  />
                  @if (isFieldInvalid('total_amount')) {
                    <span class="text-[11px] font-semibold text-rose-600 mt-1 block">
                      Valid amount required.
                    </span>
                  }
                </div>

                <div>
                  <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Installment Count <span class="text-rose-600 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    formControlName="payment_count"
                    class="w-full h-9 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-medium tabular-nums focus:outline-none focus:border-emerald-600"
                  />
                  @if (isFieldInvalid('payment_count')) {
                    <span class="text-[11px] font-semibold text-rose-600 mt-1 block">
                      Count required.
                    </span>
                  }
                </div>

                <div>
                  <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Payment Frequency
                  </label>
                  <select
                    formControlName="payment_frequency"
                    class="w-full h-9 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Payment Mode <span class="text-rose-600 ml-0.5">*</span>
                  </label>
                  <select
                    formControlName="payment_mode"
                    class="w-full h-9 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Notes & Special Conditions
                  </label>
                  <input
                    type="text"
                    formControlName="notes"
                    placeholder="Special clauses or agreement terms..."
                    class="w-full h-9 px-3 rounded-lg border border-slate-300/90 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- CARD 5: INSTALLMENT SCHEDULE PREVIEW (FULL WIDTH) -->
          <div class="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <div
                  class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
                >
                  05
                </div>
                <div>
                  <h3 class="text-sm font-extrabold text-slate-900">
                    Installment Schedule Breakdown
                  </h3>
                </div>
              </div>

              @if (installmentPreview().length > 0) {
                <div class="text-xs flex items-center gap-2">
                  <span class="text-slate-500">Schedule Total:</span>
                  <span
                    class="font-extrabold tabular-nums px-2.5 py-0.5 rounded text-[11px] border"
                    [class.bg-emerald-50]="scheduleMatchesTotal()"
                    [class.text-emerald-800]="scheduleMatchesTotal()"
                    [class.border-emerald-200]="scheduleMatchesTotal()"
                    [class.bg-rose-50]="!scheduleMatchesTotal()"
                    [class.text-rose-800]="!scheduleMatchesTotal()"
                    [class.border-rose-200]="!scheduleMatchesTotal()"
                  >
                    AED {{ scheduleTotal() | number: '1.2-2' }} /
                    {{ agreementForm.value.total_amount || 0 | number: '1.2-2' }}
                  </span>
                </div>
              }
            </div>

            @if (installmentPreview().length > 0) {
              <div class="border border-slate-200/80 rounded-xl overflow-x-auto bg-white">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      class="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px]"
                    >
                      <th class="py-2 px-3">#</th>
                      <th class="py-2 px-3">Due Date</th>
                      <th class="py-2 px-3">Particulars & Category</th>
                      <th class="py-2 px-3 text-right">Amount (AED)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    @for (item of installmentPreview(); track item.installment_number) {
                      <tr class="hover:bg-slate-50/60 transition">
                        <td class="py-2 px-3 font-bold text-slate-800">
                          Inst. {{ item.installment_number }}
                        </td>
                        <td class="py-2 px-3">
                          <input
                            [value]="item.due_date"
                            (input)="updateScheduleDate(item.installment_number, $event)"
                            type="date"
                            [min]="agreementForm.value.start_date || null"
                            [max]="agreementForm.value.end_date || null"
                            class="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs tabular-nums"
                            required
                          />
                        </td>
                        <td class="py-2 px-3 min-w-[320px]">
                          <div class="text-[10px] text-slate-400 font-mono truncate mb-0.5">
                            {{ scheduleReference(item) }}
                          </div>
                          <div class="flex gap-1.5">
                            <select
                              [value]="item.category"
                              (change)="updateScheduleCategory(item.installment_number, $event)"
                              class="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                            >
                              <option value="rent">Rent</option>
                              <option value="security">Security</option>
                              <option value="commission">Commission</option>
                            </select>
                            <input
                              [value]="item.particulars"
                              (input)="updateScheduleParticulars(item.installment_number, $event)"
                              placeholder="Enter particulars..."
                              required
                              class="h-8 min-w-0 flex-1 rounded-md border border-slate-200 px-2 text-xs"
                            />
                          </div>
                        </td>
                        <td class="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                          <div class="flex items-center justify-end gap-1">
                            <span class="text-slate-400 text-[10px]">AED</span>
                            <input
                              [value]="item.amount"
                              (input)="updateScheduleAmount(item.installment_number, $event)"
                              type="number"
                              min="0.01"
                              step="0.01"
                              class="h-8 w-28 rounded-md border border-slate-200 bg-white px-2 text-right text-xs tabular-nums font-bold"
                              required
                            />
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div
                class="py-6 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-slate-100"
              >
                Enter total contract amount, validity dates, and installment count to generate
                schedule breakdown.
              </div>
            }
          </div>

          <!-- STICKY ACTION BAR -->
          <div
            class="sticky bottom-3 z-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-md flex items-center justify-between mt-6"
          >
            <div class="text-xs text-slate-500 font-medium hidden sm:block">
              <span class="text-slate-400">Status:</span>
              {{
                isEditMode()
                  ? 'Editing draft owner agreement'
                  : 'Creating new owner agreement in draft state'
              }}
            </div>
            <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <a
                routerLink="/app/owner-agreements"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition"
              >
                Cancel
              </a>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                @if (isSubmitting()) {
                  <svg
                    class="animate-spin -ml-1 h-3.5 w-3.5 text-white"
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
                  <span>Saving...</span>
                } @else {
                  <span>{{ isEditMode() ? 'Update Agreement' : 'Save Agreement' }}</span>
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
  scheduleDetails = signal<
    Record<
      number,
      {
        category: InstallmentItem['category'];
        particulars: string;
        due_date?: string;
        amount?: number;
      }
    >
  >({});
  private formVersion = signal(0);
  private scheduleInputSignature = '';

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
    file_no: [''],
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
    this.formVersion();
    const total = Number(this.agreementForm.value.total_amount) || 0;
    const count = Number(this.agreementForm.value.payment_count) || 1;
    const startDateStr = this.agreementForm.value.start_date;
    const frequency = this.agreementForm.value.payment_frequency || 'monthly';

    if (total <= 0 || count <= 0) return [];

    const totalCents = Math.round(total * 100);
    const baseCents = Math.floor(totalCents / count);
    const remainderCents = totalCents - baseCents * count;
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
        due_date: this.scheduleDetails()[i]?.due_date || dueDate.toISOString().split('T')[0],
        amount:
          this.scheduleDetails()[i]?.amount ?? (baseCents + (i === 1 ? remainderCents : 0)) / 100,
        category: this.scheduleDetails()[i]?.category || 'rent',
        particulars: this.scheduleDetails()[i]?.particulars || '',
        status: 'pending',
      });
    }

    return items;
  });

  scheduleTotal = computed(() =>
    this.installmentPreview().reduce((total, item) => total + Number(item.amount || 0), 0),
  );

  scheduleMatchesTotal = computed(
    () =>
      Math.round(this.scheduleTotal() * 100) ===
      Math.round(Number(this.agreementForm.value.total_amount || 0) * 100),
  );

  scheduleReference(item: InstallmentItem): string {
    const customerCode =
      this.owners().find(
        (owner) => String(owner.id) === String(this.agreementForm.value.owner_customer_id),
      )?.customer_code || 'CUSTOMER';
    return `${customerCode}/${this.agreementForm.value.agreement_no || 'AGREEMENT_PENDING'}/OUTWARD/${item.category.toUpperCase()}/${item.particulars || '[particulars required]'}`;
  }

  updateScheduleCategory(number: number, event: Event): void {
    const category = (event.target as HTMLSelectElement).value as InstallmentItem['category'];
    this.scheduleDetails.update((details) => ({
      ...details,
      [number]: { ...details[number], category, particulars: details[number]?.particulars || '' },
    }));
  }

  updateScheduleParticulars(number: number, event: Event): void {
    const particulars = (event.target as HTMLInputElement).value;
    this.scheduleDetails.update((details) => ({
      ...details,
      [number]: { ...details[number], category: details[number]?.category || 'rent', particulars },
    }));
  }

  updateScheduleDate(number: number, event: Event): void {
    const dueDate = (event.target as HTMLInputElement).value;
    this.scheduleDetails.update((details) => ({
      ...details,
      [number]: {
        ...details[number],
        due_date: dueDate,
        category: details[number]?.category || 'rent',
        particulars: details[number]?.particulars || '',
      },
    }));
  }

  updateScheduleAmount(number: number, event: Event): void {
    const amount = Number((event.target as HTMLInputElement).value);
    this.scheduleDetails.update((details) => ({
      ...details,
      [number]: {
        ...details[number],
        amount: Number.isFinite(amount) ? amount : 0,
        category: details[number]?.category || 'rent',
        particulars: details[number]?.particulars || '',
      },
    }));
  }

  private resetScheduleOverrides(): void {
    this.scheduleDetails.update((details) =>
      Object.fromEntries(
        Object.entries(details).map(([number, value]) => [
          number,
          { category: value.category, particulars: value.particulars },
        ]),
      ),
    );
  }

  private scheduleSignature(): string {
    const value = this.agreementForm.getRawValue();
    return [
      value.total_amount,
      value.payment_count,
      value.start_date,
      value.payment_frequency,
    ].join('|');
  }

  ngOnInit(): void {
    this.scheduleInputSignature = this.scheduleSignature();
    this.agreementForm.valueChanges.subscribe(() => {
      const signature = this.scheduleSignature();
      if (signature !== this.scheduleInputSignature) this.resetScheduleOverrides();
      this.scheduleInputSignature = signature;
      this.formVersion.update((version) => version + 1);
    });
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
          file_no: agr.file_no || '',
          owner_customer_id: String(agr.owner_customer_id),
          start_date: agr.start_date,
          end_date: agr.end_date,
          total_amount: Number(agr.total_amount),
          payment_count: agr.payment_count || 1,
          payment_frequency: agr.payment_frequency || 'monthly',
          payment_mode: agr.payment_mode || 'bank_transfer',
          notes: agr.notes || '',
        });
        this.scheduleDetails.set(
          Object.fromEntries(
            (agr.installments || [])
              .filter((line) => !line.is_extra)
              .map((line) => [
                Number(line.installment_no),
                {
                  category: line.category,
                  particulars: line.particulars,
                  due_date: line.due_date,
                  amount: Number(line.amount),
                },
              ]),
          ),
        );
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
    if (this.installmentPreview().some((item) => !item.particulars.trim())) {
      this.serverError.set(
        'Particulars are required for every installment in the schedule preview.',
      );
      return;
    }
    if (!this.scheduleMatchesTotal()) {
      this.serverError.set('Installment amounts must add up exactly to the total contract amount.');
      return;
    }

    this.isSubmitting.set(true);
    this.serverError.set(null);

    const val = this.agreementForm.value;
    const dto = {
      owner_customer_id: Number(val.owner_customer_id),
      file_no: val.file_no?.trim() || null,
      property_ids: this.selectedPropertyIds(),
      start_date: val.start_date!,
      end_date: val.end_date!,
      total_amount: Number(val.total_amount),
      payment_count: Number(val.payment_count),
      payment_frequency: val.payment_frequency || 'monthly',
      payment_mode: val.payment_mode as PaymentMode,
      installments: this.installmentPreview().map((item) => ({
        installment_no: item.installment_number,
        due_date: item.due_date,
        amount: Number(item.amount.toFixed(2)),
        category: item.category,
        particulars: item.particulars.trim(),
      })),
      notes: val.notes || null,
    };

    if (this.isEditMode()) {
      this.api.updateAgreement(this.agreementId()!, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/owner-agreements', this.agreementId()!]);
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
