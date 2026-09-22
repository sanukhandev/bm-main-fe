import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { CustomerRole, CustomerType } from '../../shared/models/customer.models';

@Component({
  selector: 'bm-customer-form',
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
      <!-- Page Header -->
      <bm-page-header
        [title]="pageTitle()"
        [subtitle]="pageSubtitle()"
      >
        <a [routerLink]="cancelRoute()" class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-100 transition">
          Cancel
        </a>
      </bm-page-header>

      @if (isLoading()) {
        <bm-loading-state type="form"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="loadCustomer()"></bm-error-state>
      } @else {
        <form [formGroup]="customerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
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

          <!-- SECTION 1: General Information -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">General Information</h3>
                <p class="text-xs text-slate-500 font-normal">Basic identity and customer classification</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <!-- Customer Type -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Customer Type <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <select
                  formControlName="customer_type"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                >
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                </select>
              </div>

              <!-- Display Name -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Display Name <span class="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  formControlName="display_name"
                  [placeholder]="customerType() === 'organization' ? 'e.g. Gulf Trading LLC' : 'e.g. Ahmed Al Mansoori'"
                  [attr.aria-invalid]="isFieldInvalid('display_name')"
                  aria-describedby="display_name-error"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('display_name')) {
                  <span id="display_name-error" class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Display name is required.
                  </span>
                }
              </div>

              <!-- Legal Name -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Legal Name
                </label>
                <input
                  type="text"
                  formControlName="legal_name"
                  placeholder="Official registered legal name"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>

              <!-- Customer Code (Read-Only) -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2 flex items-center justify-between">
                  <span>Customer Code</span>
                  <span class="text-[11px] text-slate-400 font-normal">System generated</span>
                </label>
                <input
                  type="text"
                  [value]="isEditMode() ? (customerCode() || 'N/A') : ''"
                  [placeholder]="isEditMode() ? '' : 'Generated automatically after saving'"
                  disabled
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-semibold tabular-nums cursor-not-allowed select-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              <!-- Business Roles (Only shown if workflowRole is null) -->
              @if (!workflowRole()) {
                <div class="md:col-span-2 pt-1">
                  <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                    Business Roles <span class="text-rose-600 font-bold ml-0.5">*</span>
                  </label>
                  <div class="flex items-center gap-6 pt-1">
                    <label class="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        [checked]="hasRole('owner')"
                        (change)="toggleRole('owner', $event)"
                        class="rounded-md text-emerald-700 focus:ring-emerald-600 h-4.5 w-4.5 border-slate-300"
                      />
                      <span>Property Owner</span>
                    </label>

                    <label class="inline-flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        [checked]="hasRole('tenant')"
                        (change)="toggleRole('tenant', $event)"
                        class="rounded-md text-emerald-700 focus:ring-emerald-600 h-4.5 w-4.5 border-slate-300"
                      />
                      <span>Leasing Tenant</span>
                    </label>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- SECTION 2: Contact & Identification -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">Contact & Identification</h3>
                <p class="text-xs text-slate-500 font-normal">Contact channels and legal identification documents</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <!-- Phone -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  formControlName="phone"
                  placeholder="+971 50 000 0000"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium tabular-nums shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="customer@example.com"
                  [attr.aria-invalid]="isFieldInvalid('email')"
                  aria-describedby="email-error"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
                @if (isFieldInvalid('email')) {
                  <span id="email-error" class="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
                    Please enter a valid email address.
                  </span>
                }
              </div>

              <!-- Dynamic ID Field -->
              @if (customerType() === 'individual') {
                <div>
                  <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                    Emirates ID / National ID
                  </label>
                  <input
                    type="text"
                    formControlName="identity_no"
                    placeholder="784-1990-1234567-1"
                    class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium tabular-nums shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                  />
                </div>
              } @else {
                <div>
                  <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                    Company Registration No.
                  </label>
                  <input
                    type="text"
                    formControlName="company_registration_no"
                    placeholder="CN-1234567"
                    class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                  />
                </div>
              }

              <!-- Tax Registration No (TRN) -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2 flex items-center justify-between">
                  <span>Tax Registration No (TRN)</span>
                  <span class="text-[11px] text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  formControlName="tax_registration_no"
                  placeholder="100xxxxxxxxxxxx"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium tabular-nums shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 3: Address & Location -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">Address & Location</h3>
                <p class="text-xs text-slate-500 font-normal">Official correspondence and location details</p>
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
                  placeholder="Building name, street, office or flat number"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>

              <!-- City -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  City
                </label>
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

              <!-- Country Code -->
              <div>
                <label class="block text-[13px] font-semibold text-[#26312C] mb-2">
                  Country
                </label>
                <input
                  type="text"
                  formControlName="country_code"
                  placeholder="AE"
                  class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 4: Notes & Metadata -->
          <div class="bg-white rounded-[20px] p-6 lg:p-7 border border-slate-200/90 shadow-xs">
            <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 tracking-tight">Notes & Administrative Remarks</h3>
                <p class="text-xs text-slate-500 font-normal">Internal comments and reference details</p>
              </div>
            </div>

            <div>
              <textarea
                formControlName="notes"
                rows="3"
                placeholder="Add any internal operational notes, reference numbers, or background context..."
                class="w-full p-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-sm font-medium shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150 leading-relaxed"
              ></textarea>
            </div>
          </div>

          <!-- STICKY ACTION BAR -->
          <div class="sticky bottom-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-lg flex items-center justify-between mt-8">
            <div class="text-xs text-slate-500 font-medium hidden sm:block">
              <span class="text-slate-400">Status:</span> {{ isEditMode() ? 'Editing existing master record' : 'Drafting new master record' }}
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <a [routerLink]="cancelRoute()" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border border-slate-200/80 transition">
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
                  <span>{{ submitButtonProgressLabel() }}</span>
                } @else {
                  <span>{{ submitButtonLabel() }}</span>
                }
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(CustomersApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  customerId = signal<number | null>(null);
  customerCode = signal<string | null>(null);
  customerType = signal<CustomerType>('individual');

  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  serverError = signal<string | null>(null);

  selectedRoles = signal<CustomerRole[]>(['tenant']);
  workflowRole = signal<CustomerRole | null>(null);
  customerRole = signal<CustomerRole | null>(null);

  cancelRoute = computed(() => {
    const wf = this.workflowRole();
    if (wf === 'owner') return '/app/customers/owners';
    if (wf === 'tenant') return '/app/customers/tenants';
    return '/app/customers';
  });

  pageTitle = computed(() => {
    const edit = this.isEditMode();
    const wf = this.workflowRole() || this.customerRole();
    if (edit) {
      if (wf === 'owner') return 'Edit Owner';
      if (wf === 'tenant') return 'Edit Tenant';
      return 'Edit Customer';
    }
    if (wf === 'owner') return 'Create Owner';
    if (wf === 'tenant') return 'Create Tenant';
    return 'Create Customer';
  });

  pageSubtitle = computed(() => {
    const edit = this.isEditMode();
    const wf = this.workflowRole() || this.customerRole();
    if (edit) {
      if (wf === 'owner') return 'Update property owner master details.';
      if (wf === 'tenant') return 'Update tenant master details.';
      return 'Update master customer record.';
    }
    if (wf === 'owner') return 'Register a new property owner.';
    if (wf === 'tenant') return 'Register a new tenant.';
    return 'Register a new property owner or tenant.';
  });

  submitButtonLabel = computed(() => {
    if (this.isEditMode()) return 'Save Changes';
    const wf = this.workflowRole();
    if (wf === 'owner') return 'Create Owner';
    if (wf === 'tenant') return 'Create Tenant';
    return 'Create Customer';
  });

  submitButtonProgressLabel = computed(() => {
    if (this.isEditMode()) return 'Saving Changes...';
    const wf = this.workflowRole();
    if (wf === 'owner') return 'Creating Owner...';
    if (wf === 'tenant') return 'Creating Tenant...';
    return 'Creating Customer...';
  });

  customerForm = this.fb.group({
    customer_type: ['individual' as CustomerType, Validators.required],
    display_name: ['', Validators.required],
    legal_name: [''],
    phone: [''],
    email: ['', [Validators.email]],
    tax_registration_no: [''],
    identity_no: [''],
    company_registration_no: [''],
    address_line_1: [''],
    city: ['Dubai'],
    state_or_emirate: ['Dubai'],
    country_code: ['AE'],
    notes: [''],
  });

  ngOnInit(): void {
    const url = this.router.url;
    let workflowRole: CustomerRole | null = null;
    if (url.includes('/owners')) {
      workflowRole = 'owner';
    } else if (url.includes('/tenants')) {
      workflowRole = 'tenant';
    }

    this.workflowRole.set(workflowRole);
    if (workflowRole) {
      this.selectedRoles.set([workflowRole]);
    }

    this.customerForm.get('customer_type')?.valueChanges.subscribe((val) => {
      if (val) {
        this.customerType.set(val as CustomerType);
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.customerId.set(Number(id));
      this.loadCustomer();
    }
  }

  loadCustomer(): void {
    const id = this.customerId();
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.api.getCustomer(id).subscribe({
      next: (res) => {
        const cust = res.data;
        const roles = (cust.roles as CustomerRole[]) || ['tenant'];
        this.selectedRoles.set(roles);
        this.customerCode.set(cust.customer_code || null);
        this.customerType.set(cust.customer_type || 'individual');

        if (roles.includes('owner') && !roles.includes('tenant')) {
          this.customerRole.set('owner');
        } else if (roles.includes('tenant') && !roles.includes('owner')) {
          this.customerRole.set('tenant');
        }

        this.customerForm.patchValue({
          customer_type: cust.customer_type,
          display_name: cust.display_name,
          legal_name: cust.legal_name || '',
          phone: cust.phone || '',
          email: cust.email || '',
          tax_registration_no: cust.tax_registration_no || '',
          identity_no: cust.identity_no || '',
          company_registration_no: cust.company_registration_no || '',
          address_line_1: cust.address_line_1 || '',
          city: cust.city || 'Dubai',
          state_or_emirate: cust.state_or_emirate || 'Dubai',
          country_code: cust.country_code || 'AE',
          notes: cust.notes || '',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load customer details.');
        this.isLoading.set(false);
      },
    });
  }

  hasRole(role: CustomerRole): boolean {
    return this.selectedRoles().includes(role);
  }

  toggleRole(role: CustomerRole, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedRoles().includes(role)) {
        this.selectedRoles.update((roles) => [...roles, role]);
      }
    } else {
      this.selectedRoles.update((roles) => roles.filter((r) => r !== role));
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.customerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    if (this.workflowRole()) {
      this.selectedRoles.set([this.workflowRole()!]);
    }

    if (this.selectedRoles().length === 0) {
      this.serverError.set('Please select at least one business role (Owner or Tenant).');
      return;
    }

    this.isSubmitting.set(true);
    this.serverError.set(null);

    const val = this.customerForm.value;
    const dto = {
      customer_type: val.customer_type as CustomerType,
      display_name: val.display_name!,
      legal_name: val.legal_name || null,
      phone: val.phone || null,
      email: val.email || null,
      tax_registration_no: val.tax_registration_no || null,
      identity_no: val.identity_no || null,
      company_registration_no: val.company_registration_no || null,
      address_line_1: val.address_line_1 || null,
      city: val.city || null,
      state_or_emirate: val.state_or_emirate || null,
      country_code: val.country_code || 'AE',
      notes: val.notes || null,
      roles: this.selectedRoles(),
    };

    const redirectPath = this.cancelRoute();

    if (this.isEditMode()) {
      this.api.updateCustomer(this.customerId()!, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate([redirectPath]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.error?.errors) {
            const messages = Object.values(err.error.errors).flat().join(' ');
            this.serverError.set(messages || err.message || 'Validation failed.');
          } else {
            this.serverError.set(err.message || 'Failed to update customer record.');
          }
        },
      });
    } else {
      this.api.createCustomer(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate([redirectPath]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.error?.errors) {
            const messages = Object.values(err.error.errors).flat().join(' ');
            this.serverError.set(messages || err.message || 'Validation failed.');
          } else {
            this.serverError.set(err.message || 'Failed to create customer record.');
          }
        },
      });
    }
  }
}
