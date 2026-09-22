import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmCardComponent } from '../../shared/components/bm-card/bm-card.component';
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
    BmCardComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <bm-page-header
      [title]="isEditMode() ? 'Edit Customer' : 'Create Customer'"
      [subtitle]="isEditMode() ? 'Update master customer record' : 'Register a new property owner or tenant'"
    >
      <a routerLink="/app/customers" class="bm-btn bm-btn-secondary text-xs">
        Cancel
      </a>
    </bm-page-header>

    @if (isLoading()) {
      <bm-loading-state></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadCustomer()"></bm-error-state>
    } @else {
      <form [formGroup]="customerForm" (ngSubmit)="onSubmit()" class="space-y-6 max-w-4xl">
        <bm-card title="General Information">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Customer Type *</label>
              <select formControlName="customer_type" class="bm-input">
                <option value="individual">Individual</option>
                <option value="organization">Organization</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Display Name *</label>
              <input
                type="text"
                formControlName="display_name"
                placeholder="e.g. Ahmed Al Mansoori or Gulf Trading LLC"
                class="bm-input"
              />
              @if (isFieldInvalid('display_name')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Display name is required</span>
              }
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Legal Name</label>
              <input
                type="text"
                formControlName="legal_name"
                placeholder="Official registered name"
                class="bm-input"
              />
            </div>

            @if (!workflowRole()) {
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Business Roles *</label>
              <div class="flex items-center gap-6 pt-2.5">
                <label class="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="hasRole('owner')"
                    (change)="toggleRole('owner', $event)"
                    class="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Property Owner</span>
                </label>

                <label class="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="hasRole('tenant')"
                    (change)="toggleRole('tenant', $event)"
                    class="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Leasing Tenant</span>
                </label>
              </div>
            </div>
            }
          </div>
        </bm-card>

        <bm-card title="Contact & Identification">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                formControlName="phone"
                placeholder="+971 50 000 0000"
                class="bm-input"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                formControlName="email"
                placeholder="customer@example.com"
                class="bm-input"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Tax Registration No (TRN)</label>
              <input
                type="text"
                formControlName="tax_registration_no"
                placeholder="100xxxxxxxxxxxx"
                class="bm-input"
              />
            </div>

            @if (customerForm.value.customer_type === 'individual') {
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Emirates ID / National ID</label>
                <input
                  type="text"
                  formControlName="identity_no"
                  placeholder="784-1990-1234567-1"
                  class="bm-input"
                />
              </div>
            } @else {
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Trade License / Company Reg No</label>
                <input
                  type="text"
                  formControlName="company_registration_no"
                  placeholder="CN-1234567"
                  class="bm-input"
                />
              </div>
            }
          </div>
        </bm-card>

        <bm-card title="Address & Location">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Address Line 1</label>
              <input
                type="text"
                formControlName="address_line_1"
                placeholder="Building, Street Name"
                class="bm-input"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
              <input
                type="text"
                formControlName="city"
                placeholder="Dubai"
                class="bm-input"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Emirate / State</label>
              <input
                type="text"
                formControlName="state_or_emirate"
                placeholder="Dubai"
                class="bm-input"
              />
            </div>
          </div>
        </bm-card>

        <bm-card title="Notes & Metadata">
          <div>
            <textarea
              formControlName="notes"
              rows="3"
              placeholder="Additional remarks or notes..."
              class="bm-input !h-auto p-3"
            ></textarea>
          </div>
        </bm-card>

        @if (serverError()) {
          <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {{ serverError() }}
          </div>
        }

        <div class="flex items-center justify-end gap-3 pt-4">
          <a routerLink="/app/customers" class="bm-btn bm-btn-secondary">
            Cancel
          </a>
          <button type="submit" [disabled]="isSubmitting()" class="bm-btn bm-btn-primary">
            @if (isSubmitting()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            }
            {{ isEditMode() ? 'Update Customer' : 'Create Customer' }}
          </button>
        </div>
      </form>
    }
  `,
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(CustomersApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  customerId = signal<number | null>(null);

  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  serverError = signal<string | null>(null);

  selectedRoles = signal<CustomerRole[]>(['tenant']);
  workflowRole = signal<CustomerRole | null>(null);

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
    const path = this.route.snapshot.routeConfig?.path || '';
    const workflowRole = path.includes('owners') ? 'owner' : path.includes('tenants') ? 'tenant' : null;
    this.workflowRole.set(workflowRole);
    if (workflowRole) this.selectedRoles.set([workflowRole]);
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
        this.selectedRoles.set((cust.roles as CustomerRole[]) || ['tenant']);
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

    if (this.workflowRole()) this.selectedRoles.set([this.workflowRole()!]);
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

    if (this.isEditMode()) {
      this.api.updateCustomer(this.customerId()!, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/customers']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.serverError.set(err.message || 'Failed to update customer.');
        },
      });
    } else {
      this.api.createCustomer(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/app/customers']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.serverError.set(err.message || 'Failed to create customer.');
        },
      });
    }
  }
}
