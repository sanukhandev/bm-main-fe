import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { PropertyType } from '../../shared/models/property.models';
import { Customer } from '../../shared/models/customer.models';

import {
  BmComboboxComponent,
  ComboboxOption,
} from '../../shared/components/bm-combobox/bm-combobox.component';

@Component({
  selector: 'bm-property-form',
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
      <!-- Page Header -->
      <bm-page-header
        [title]="isEditMode() ? 'Edit Property' : 'Add Property Asset'"
        [subtitle]="
          isEditMode()
            ? 'Update property specifications and owner assignment'
            : 'Register a new property in the current branch'
        "
      >
        <a
          routerLink="/app/properties"
          class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-100 transition"
        >
          Cancel
        </a>
      </bm-page-header>

      @if (isLoading()) {
        <bm-loading-state type="form"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="loadProperty()"></bm-error-state>
      } @else {
        <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()" class="space-y-6">
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

          <!-- SECTION 1: Property Owner Assignment -->
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Property Owner Assignment
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Assign master property owner for asset isolation and contract routing
                </p>
              </div>
            </div>

            <div>
              <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                Property Owner <span class="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <bm-combobox
                formControlName="owner_customer_id"
                [options]="ownerOptions()"
                placeholder="Search or select property owner..."
                searchPlaceholder="Search owner by name, code, phone..."
                [invalid]="isFieldInvalid('owner_customer_id')"
              ></bm-combobox>
              @if (isFieldInvalid('owner_customer_id')) {
                <span
                  id="owner_customer_id-error"
                  class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1"
                >
                  Property owner selection is required.
                </span>
              }
            </div>
          </div>

          <!-- SECTION 2: Asset Details & Classification -->
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
                  Asset Details & Classification
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Property identification, classification, and area
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <!-- Property Code -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Generated Property Code
                </label>
                <input
                  type="text"
                  formControlName="property_code"
                  placeholder="Generated from branch, emirate, building, unit, and type"
                  readonly
                  [attr.aria-invalid]="isFieldInvalid('property_code')"
                  aria-describedby="property_code-error"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('property_code')) {
                  <span
                    id="property_code-error"
                    class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1"
                  >
                    Property code is required.
                  </span>
                }
              </div>

              <!-- Property / Unit Number -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Property / Unit No. <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  formControlName="unit_number"
                  placeholder="e.g. 101 or Villa 12"
                  [attr.aria-invalid]="isFieldInvalid('unit_number')"
                  aria-describedby="unit_number-error"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('unit_number')) {
                  <span
                    id="unit_number-error"
                    class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1"
                  >
                    Unit number is required.
                  </span>
                }
              </div>

              <!-- Property Name -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Property Name <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Flat 101 Al Marina"
                  [attr.aria-invalid]="isFieldInvalid('name')"
                  aria-describedby="name-error"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('name')) {
                  <span
                    id="name-error"
                    class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1"
                  >
                    Property name is required.
                  </span>
                }
              </div>

              <!-- Property Type -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Property Type <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <select
                  formControlName="property_type"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="shop">Shop</option>
                  <option value="office">Office</option>
                  <option value="space">Space</option>
                  <option value="labor_camp">Labor Camp</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="land">Land</option>
                </select>
              </div>

              <!-- Building / Complex Name -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Building / Complex Name
                </label>
                <input
                  type="text"
                  formControlName="building_name"
                  placeholder="Building A / Al Madeena Tower"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>

              <!-- Area Size -->
              <div>
                <label
                  class="block text-[13px] font-semibold text-[#26312C] mb-2 flex items-center justify-between"
                >
                  <span>Area Size</span>
                  <span class="text-[11px] text-slate-400 font-normal">sq ft / sq m</span>
                </label>
                <input
                  type="text"
                  formControlName="area"
                  placeholder="85.50"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium tabular-nums shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 3: Location & Address -->
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                  Location & Address
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Physical location, street address, and emirate
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <!-- Address Line 1 -->
              <div class="md:col-span-3">
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  formControlName="address_line_1"
                  placeholder="Street address or physical property location"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>

              <!-- City -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2"> City </label>
                <input
                  type="text"
                  formControlName="city"
                  placeholder="Dubai"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>

              <!-- Emirate / State -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Emirate / State
                </label>
                <input
                  type="text"
                  formControlName="state_or_emirate"
                  placeholder="Dubai"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>

              <!-- Country -->
              <div>
                <label
                  class="block text-[13px] font-semibold text-[#26312C] mb-2 flex items-center justify-between"
                >
                  <span>Country</span>
                  <span class="text-[11px] text-slate-400 font-normal">Fixed (UAE)</span>
                </label>
                <input
                  type="text"
                  formControlName="country_code"
                  placeholder="AE"
                  readonly
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold tabular-nums cursor-not-allowed select-none placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 4: Notes & Specifications -->
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
                  Notes & Specifications
                </h3>
                <p class="text-xs text-slate-500 font-normal">
                  Internal operational notes, specifications, or key details
                </p>
              </div>
            </div>

            <div>
              <textarea
                formControlName="notes"
                rows="3"
                placeholder="Add any internal property specifications, key handover instructions, or notes..."
                class="w-full p-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150 leading-relaxed"
              ></textarea>
            </div>
          </div>

          <!-- STICKY ACTION BAR -->
          <div
            class="sticky bottom-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-lg flex items-center justify-between mt-8"
          >
            <div class="text-xs text-slate-500 font-medium hidden sm:block">
              <span class="text-slate-400">Status:</span>
              {{ isEditMode() ? 'Editing existing property asset' : 'Drafting new property asset' }}
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <a
                routerLink="/app/properties"
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
                  <span>{{ isEditMode() ? 'Saving Changes...' : 'Creating Property...' }}</span>
                } @else {
                  <span>{{ isEditMode() ? 'Save Changes' : 'Create Property' }}</span>
                }
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class PropertyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(PropertiesApiService);
  private customersApi = inject(CustomersApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  propertyId = signal<number | null>(null);

  owners = signal<Customer[]>([]);

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

  propertyForm = this.fb.group({
    owner_customer_id: ['', Validators.required],
    property_code: [{ value: '', disabled: true }],
    unit_number: ['', Validators.required],
    name: ['', Validators.required],
    property_type: ['apartment' as PropertyType, Validators.required],
    building_name: [''],
    address_line_1: [''],
    city: ['Dubai'],
    state_or_emirate: ['Dubai'],
    country_code: ['AE'],
    area: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadOwners();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.propertyId.set(Number(id));
      this.loadProperty();
    }
  }

  loadOwners(): void {
    this.customersApi.getCustomers({ per_page: 100, role: 'owner' }).subscribe({
      next: (res) => {
        this.owners.set(res.data);
      },
      error: () => {
        // Fallback to fetch all if role filter is unsupported
        this.customersApi.getCustomers({ per_page: 100 }).subscribe({
          next: (res) => this.owners.set(res.data),
        });
      },
    });
  }

  loadProperty(): void {
    const id = this.propertyId();
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.api.getProperty(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.propertyForm.patchValue({
          owner_customer_id: String(p.owner_customer_id),
          property_code: p.property_code,
          unit_number: p.unit_number,
          name: p.name,
          property_type: p.property_type,
          building_name: p.building_name || '',
          address_line_1: p.address_line_1 || '',
          city: p.city || 'Dubai',
          state_or_emirate: p.state_or_emirate || 'Dubai',
          country_code: p.country_code || 'AE',
          area: p.area !== null && p.area !== undefined ? String(p.area) : '',
          notes: p.notes || '',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load property specifications.');
        this.isLoading.set(false);
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.propertyForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.serverError.set(null);

    const val = this.propertyForm.value;
    const dto = {
      owner_customer_id: Number(val.owner_customer_id),
      unit_number: val.unit_number!,
      name: val.name!,
      property_type: val.property_type as PropertyType,
      building_name: val.building_name || null,
      address_line_1: val.address_line_1 || null,
      city: val.city || null,
      state_or_emirate: val.state_or_emirate || null,
      country_code: val.country_code || 'AE',
      area: val.area || null,
      notes: val.notes || null,
    };

    if (this.isEditMode()) {
      this.api.updateProperty(this.propertyId()!, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/properties']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.error?.errors) {
            const messages = Object.values(err.error.errors).flat().join(' ');
            this.serverError.set(messages || err.message || 'Validation failed.');
          } else {
            this.serverError.set(err.message || 'Failed to update property asset.');
          }
        },
      });
    } else {
      this.api.createProperty(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/properties']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.error?.errors) {
            const messages = Object.values(err.error.errors).flat().join(' ');
            this.serverError.set(messages || err.message || 'Validation failed.');
          } else {
            this.serverError.set(err.message || 'Failed to create property asset.');
          }
        },
      });
    }
  }
}
