import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmCardComponent } from '../../shared/components/bm-card/bm-card.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { PropertyType } from '../../shared/models/property.models';
import { Customer } from '../../shared/models/customer.models';

@Component({
  selector: 'bm-property-form',
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
      [title]="isEditMode() ? 'Edit Property' : 'Add Property Asset'"
      [subtitle]="isEditMode() ? 'Update property specifications and owner assignment' : 'Register a new rentable property asset in current branch'"
    >
      <a routerLink="/app/properties" class="bm-btn bm-btn-secondary text-xs">
        Cancel
      </a>
    </bm-page-header>

    @if (isLoading()) {
      <bm-loading-state></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadProperty()"></bm-error-state>
    } @else {
      <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()" class="space-y-6 max-w-4xl">
        <bm-card title="Property Owner Assignment">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">Property Owner *</label>
            <select formControlName="owner_customer_id" class="bm-input">
              <option value="">Select Property Owner...</option>
              @for (owner of owners(); track owner.id) {
                <option [value]="owner.id">
                  [{{ owner.customer_code }}] {{ owner.display_name }}
                </option>
              }
            </select>
            @if (isFieldInvalid('owner_customer_id')) {
              <span class="text-[11px] text-rose-600 mt-1 block">Property owner is required</span>
            }
          </div>
        </bm-card>

        <bm-card title="Asset Details & Classification">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Property Code *</label>
              <input
                type="text"
                formControlName="property_code"
                placeholder="e.g. FLAT-101 or VILLA-12"
                class="bm-input"
              />
              @if (isFieldInvalid('property_code')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Property code is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Unit / Asset Number *</label>
              <input
                type="text"
                formControlName="unit_number"
                placeholder="e.g. 101 or Villa 12"
                class="bm-input"
              />
              @if (isFieldInvalid('unit_number')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Unit number is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Property Name *</label>
              <input
                type="text"
                formControlName="name"
                placeholder="e.g. Flat 101 Al Marina"
                class="bm-input"
              />
              @if (isFieldInvalid('name')) {
                <span class="text-[11px] text-rose-600 mt-1 block">Property name is required</span>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Property Type *</label>
              <select formControlName="property_type" class="bm-input">
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

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Building / Complex Name</label>
              <input
                type="text"
                formControlName="building_name"
                placeholder="Building A"
                class="bm-input"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Area Size (sq ft / sq m)</label>
              <input
                type="text"
                formControlName="area"
                placeholder="85.50"
                class="bm-input"
              />
            </div>
          </div>
        </bm-card>

        <bm-card title="Location & Address">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Address Line 1</label>
              <input
                type="text"
                formControlName="address_line_1"
                placeholder="Street address or location"
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

        <bm-card title="Notes">
          <div>
            <textarea
              formControlName="notes"
              rows="3"
              placeholder="Additional property notes..."
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
          <a routerLink="/app/properties" class="bm-btn bm-btn-secondary">
            Cancel
          </a>
          <button type="submit" [disabled]="isSubmitting()" class="bm-btn bm-btn-primary">
            @if (isSubmitting()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            }
            {{ isEditMode() ? 'Update Property' : 'Create Property' }}
          </button>
        </div>
      </form>
    }
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
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  serverError = signal<string | null>(null);

  propertyForm = this.fb.group({
    owner_customer_id: ['', Validators.required],
    property_code: ['', Validators.required],
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
    this.customersApi.getCustomers({ per_page: 100 }).subscribe({
      next: (res) => {
        // Filter or list customers that act as owner
        this.owners.set(res.data);
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
      property_code: val.property_code!,
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
          this.serverError.set(err.message || 'Failed to update property.');
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
          this.serverError.set(err.message || 'Failed to create property.');
        },
      });
    }
  }
}
