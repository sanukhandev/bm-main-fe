import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaintenanceApiService } from '../../core/api/maintenance-api.service';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { InventoryItem, Vendor, WorkOrder } from '../../shared/models/maintenance.models';
import { Property } from '../../shared/models/property.models';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmSpinnerComponent } from '../../shared/components/bm-spinner/bm-spinner.component';
import { BmSearchInputComponent } from '../../shared/components/bm-search-input/bm-search-input.component';
import { formatUaePhone, uaePhoneValidator } from '../../shared/utils/uae-formatters';

@Component({
  selector: 'bm-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    BmStatusBadgeComponent,
    BmLoadingStateComponent,
    BmSpinnerComponent,
    BmSearchInputComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Maintenance
          </div>
          <h1 class="text-3xl font-bold text-slate-900 mt-1">{{ title() }}</h1>
          <p class="text-sm text-slate-500 mt-1">
            Branch-scoped maintenance operations and work order management
          </p>
        </div>
        @if (section() === 'work-orders') {
          <a class="bm-btn bm-btn-primary" routerLink="/app/maintenance/work-orders/new"
            >Create Work Order</a
          >
        } @else {
          <button class="bm-btn bm-btn-primary" (click)="showForm.set(true)">
            Create {{ section() === 'vendors' ? 'Vendor' : 'Inventory Item' }}
          </button>
        }
      </div>

      <div class="flex gap-2 border-b border-slate-200">
        <a
          routerLink="/app/maintenance/work-orders"
          class="px-4 py-3 text-sm font-medium transition"
          [class.text-emerald-700]="section() === 'work-orders'"
          [class.border-b-2]="section() === 'work-orders'"
          [class.border-emerald-600]="section() === 'work-orders'"
          >Work Orders</a
        >
        <a
          routerLink="/app/maintenance/vendors"
          class="px-4 py-3 text-sm font-medium transition"
          [class.text-emerald-700]="section() === 'vendors'"
          [class.border-b-2]="section() === 'vendors'"
          [class.border-emerald-600]="section() === 'vendors'"
          >Vendors</a
        >
        <a
          routerLink="/app/maintenance/inventory"
          class="px-4 py-3 text-sm font-medium transition"
          [class.text-emerald-700]="section() === 'inventory'"
          [class.border-b-2]="section() === 'inventory'"
          [class.border-emerald-600]="section() === 'inventory'"
          >Inventory</a
        >
      </div>

      <!-- Toolbar Search -->
      <div class="bm-card p-4 flex items-center justify-between gap-4">
        <bm-search-input
          [value]="searchQuery()"
          [placeholder]="
            section() === 'vendors'
              ? 'Search vendor name, phone, email...'
              : section() === 'inventory'
                ? 'Search SKU, item name...'
                : 'Search work order no, title, property, vendor...'
          "
          (searchChange)="searchQuery.set($event)"
        ></bm-search-input>
      </div>

      @if (error()) {
        <div class="bm-card p-4 text-sm text-rose-700 font-medium">{{ error() }}</div>
      }

      @if (loading()) {
        <bm-loading-state type="table"></bm-loading-state>
      } @else {
        @if (section() === 'vendors') {
          <div class="bm-card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
                  >
                    <th class="py-3.5 px-4">Vendor Name</th>
                    <th class="py-3.5 px-4">Phone</th>
                    <th class="py-3.5 px-4">Email</th>
                    <th class="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (row of filteredVendors(); track row.id) {
                    <tr class="hover:bg-slate-50/60 transition-colors">
                      <td class="py-3.5 px-4 font-semibold text-slate-900">{{ row.name }}</td>
                      <td class="py-3.5 px-4 text-slate-700 tabular-nums">
                        {{ row.phone || '—' }}
                      </td>
                      <td class="py-3.5 px-4 text-slate-600">{{ row.email || '—' }}</td>
                      <td class="py-3.5 px-4">
                        <bm-status-badge [status]="row.status"></bm-status-badge>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="p-10 text-center text-slate-500 font-medium">
                        No vendors found matching search.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (section() === 'inventory') {
          <div class="bm-card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
                  >
                    <th class="py-3.5 px-4">SKU</th>
                    <th class="py-3.5 px-4">Item Name</th>
                    <th class="py-3.5 px-4">Unit of Measure</th>
                    <th class="py-3.5 px-4">Stock on Hand</th>
                    <th class="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (row of filteredInventory(); track row.id) {
                    <tr class="hover:bg-slate-50/60 transition-colors">
                      <td class="py-3.5 px-4 font-semibold text-emerald-700 tabular-nums">
                        {{ row.sku }}
                      </td>
                      <td class="py-3.5 px-4 font-medium text-slate-900">{{ row.name }}</td>
                      <td class="py-3.5 px-4 text-slate-600">{{ row.unit_of_measure }}</td>
                      <td class="py-3.5 px-4 tabular-nums font-semibold text-slate-900">
                        {{ row.stock_on_hand }}
                      </td>
                      <td class="py-3.5 px-4">
                        <bm-status-badge [status]="row.status"></bm-status-badge>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="p-10 text-center text-slate-500 font-medium">
                        No inventory items found matching search.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (section() === 'work-orders') {
          <div class="bm-card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
                  >
                    <th class="py-3.5 px-4">Number</th>
                    <th class="py-3.5 px-4">Property</th>
                    <th class="py-3.5 px-4">Title</th>
                    <th class="py-3.5 px-4">Vendor</th>
                    <th class="py-3.5 px-4">Priority</th>
                    <th class="py-3.5 px-4">Status</th>
                    <th class="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (row of filteredWorkOrders(); track row.id) {
                    <tr class="hover:bg-slate-50/60 transition-colors">
                      <td class="py-3.5 px-4 font-semibold tabular-nums">
                        <a
                          [routerLink]="['/app/maintenance/work-orders', row.id]"
                          class="text-emerald-700 hover:underline"
                          >{{ row.work_order_no }}</a
                        >
                      </td>
                      <td class="py-3.5 px-4 font-medium text-slate-800">
                        {{ row.property?.name || row.property?.property_code || '—' }}
                      </td>
                      <td class="py-3.5 px-4 font-medium text-slate-900">{{ row.title }}</td>
                      <td class="py-3.5 px-4 text-slate-700">{{ row.vendor?.name || '—' }}</td>
                      <td class="py-3.5 px-4">
                        <bm-status-badge [status]="row.priority"></bm-status-badge>
                      </td>
                      <td class="py-3.5 px-4">
                        <bm-status-badge [status]="row.status"></bm-status-badge>
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <select
                          class="bm-input !h-8 text-xs font-medium"
                          [value]="row.status"
                          (change)="changeStatus(row.id, $any($event.target).value)"
                        >
                          <option value="open">open</option>
                          <option value="assigned">assigned</option>
                          <option value="in_progress">in_progress</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="p-10 text-center text-slate-500 font-medium">
                        No work orders found matching search.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      @if (showForm()) {
        <div
          class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
        >
          <div
            class="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-hidden bm-modal-content"
          >
            <div
              class="px-6 py-4.5 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10"
            >
              <h2 class="text-lg font-bold text-slate-900 tracking-tight">Create {{ title() }}</h2>
              <button
                type="button"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold inline-flex items-center justify-center transition cursor-pointer"
                (click)="showForm.set(false)"
              >
                ×
              </button>
            </div>
            <div class="p-6">
              @if (section() === 'vendors') {
                <form [formGroup]="vendorForm" (ngSubmit)="saveVendor()" class="space-y-4">
                  <input class="bm-input" placeholder="Vendor name *" formControlName="name" />
                  <input
                    class="bm-input"
                    placeholder="+971 50 000 0000"
                    formControlName="phone"
                    (input)="onPhoneInput($event)"
                  />
                  <input class="bm-input" placeholder="Email" formControlName="email" />
                  <div class="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      class="bm-btn bm-btn-secondary"
                      (click)="showForm.set(false)"
                    >
                      Cancel
                    </button>
                    <button
                      class="bm-btn bm-btn-primary"
                      [disabled]="vendorForm.invalid || saving()"
                    >
                      @if (saving()) {
                        <bm-spinner size="sm" color="white" label="Saving..."></bm-spinner>
                      } @else {
                        Save Vendor
                      }
                    </button>
                  </div>
                </form>
              }

              @if (section() === 'inventory') {
                <form [formGroup]="inventoryForm" (ngSubmit)="saveInventory()" class="space-y-4">
                  <input class="bm-input" placeholder="SKU *" formControlName="sku" />
                  <input class="bm-input" placeholder="Item name *" formControlName="name" />
                  <input
                    class="bm-input"
                    placeholder="Unit of measure"
                    formControlName="unit_of_measure"
                  />
                  <input
                    class="bm-input"
                    type="number"
                    placeholder="Opening quantity"
                    formControlName="opening_quantity"
                  />
                  <div class="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      class="bm-btn bm-btn-secondary"
                      (click)="showForm.set(false)"
                    >
                      Cancel
                    </button>
                    <button
                      class="bm-btn bm-btn-primary"
                      [disabled]="inventoryForm.invalid || saving()"
                    >
                      @if (saving()) {
                        <bm-spinner size="sm" color="white" label="Saving..."></bm-spinner>
                      } @else {
                        Save Item
                      }
                    </button>
                  </div>
                </form>
              }

              @if (section() === 'work-orders') {
                <form [formGroup]="workOrderForm" (ngSubmit)="saveWorkOrder()" class="space-y-4">
                  <select class="bm-input" formControlName="property_id">
                    <option value="">Select property *</option>
                    @for (p of properties(); track p.id) {
                      <option [value]="p.id">{{ p.property_code }} — {{ p.name }}</option>
                    }
                  </select>
                  <select class="bm-input" formControlName="vendor_id">
                    <option value="">Select vendor</option>
                    @for (v of vendors(); track v.id) {
                      <option [value]="v.id">{{ v.name }}</option>
                    }
                  </select>
                  <input class="bm-input" placeholder="Title *" formControlName="title" />
                  <textarea
                    class="bm-input"
                    rows="3"
                    placeholder="Issue / request details"
                    formControlName="description"
                  ></textarea>
                  <div class="grid grid-cols-2 gap-3">
                    <select class="bm-input" formControlName="priority">
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <input
                      class="bm-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Service charge"
                      formControlName="service_charge"
                    />
                  </div>
                  <div formArrayName="lines" class="space-y-3">
                    <div class="flex justify-between items-center pt-2">
                      <h3 class="font-semibold text-sm text-slate-800">Line items</h3>
                      <button
                        type="button"
                        class="text-emerald-700 text-xs font-semibold hover:underline"
                        (click)="addLine()"
                      >
                        + Add line
                      </button>
                    </div>
                    @for (line of lines.controls; track $index) {
                      <div
                        [formGroupName]="$index"
                        class="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <select class="bm-input" formControlName="line_type">
                          <option value="service">Service</option>
                          <option value="inventory">Inventory</option>
                        </select>
                        <input
                          class="bm-input md:col-span-2"
                          placeholder="Particulars"
                          formControlName="description"
                        />
                        <select class="bm-input" formControlName="inventory_item_id">
                          <option value="">Inventory item</option>
                          @for (i of inventory(); track i.id) {
                            <option [value]="i.id">{{ i.name }} ({{ i.stock_on_hand }})</option>
                          }
                        </select>
                        <input
                          class="bm-input"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Qty"
                          formControlName="quantity"
                        />
                        <input
                          class="bm-input"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Unit cost"
                          formControlName="unit_cost"
                        />
                        <button
                          type="button"
                          class="text-rose-600 text-xs font-semibold md:col-span-5 text-right"
                          (click)="removeLine($index)"
                        >
                          Remove Line
                        </button>
                      </div>
                    }
                  </div>
                  <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      class="bm-btn bm-btn-secondary"
                      (click)="showForm.set(false)"
                    >
                      Cancel
                    </button>
                    <button
                      class="bm-btn bm-btn-primary"
                      [disabled]="workOrderForm.invalid || saving()"
                    >
                      @if (saving()) {
                        <bm-spinner size="sm" color="white" label="Saving..."></bm-spinner>
                      } @else {
                        Create Work Order
                      }
                    </button>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class MaintenanceComponent {
  private api = inject(MaintenanceApiService);
  private propertiesApi = inject(PropertiesApiService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  section = signal('work-orders');
  title = signal('Work Orders');
  searchQuery = signal('');
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  vendors = signal<Vendor[]>([]);
  inventory = signal<InventoryItem[]>([]);
  workOrders = signal<WorkOrder[]>([]);
  properties = signal<Property[]>([]);

  filteredVendors = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.vendors();
    return this.vendors().filter(
      (v) =>
        (v.name || '').toLowerCase().includes(q) ||
        (v.phone || '').toLowerCase().includes(q) ||
        (v.email || '').toLowerCase().includes(q),
    );
  });

  filteredInventory = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.inventory();
    return this.inventory().filter(
      (i) => (i.sku || '').toLowerCase().includes(q) || (i.name || '').toLowerCase().includes(q),
    );
  });

  filteredWorkOrders = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.workOrders();
    return this.workOrders().filter(
      (w) =>
        (w.work_order_no || '').toLowerCase().includes(q) ||
        (w.title || '').toLowerCase().includes(q) ||
        (w.property?.name || '').toLowerCase().includes(q) ||
        (w.vendor?.name || '').toLowerCase().includes(q),
    );
  });

  vendorForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['+971 ', [uaePhoneValidator()]],
    email: [''],
  });

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatUaePhone(input.value);
    this.vendorForm.get('phone')?.setValue(formatted, { emitEvent: false });
  }

  inventoryForm = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    unit_of_measure: ['piece', Validators.required],
    opening_quantity: [0, [Validators.required, Validators.min(0)]],
  });

  workOrderForm = this.fb.nonNullable.group({
    property_id: ['', Validators.required],
    vendor_id: [''],
    title: ['', Validators.required],
    description: [''],
    priority: ['normal', Validators.required],
    service_charge: [0, [Validators.min(0)]],
    lines: this.fb.array([this.lineForm()]),
  });

  constructor() {
    this.route.data.subscribe((data) => {
      this.section.set(data['section'] || 'work-orders');
      this.title.set(data['title'] || 'Work Orders');
      this.load();
    });
  }

  get lines(): FormArray {
    return this.workOrderForm.controls.lines;
  }

  lineForm() {
    return this.fb.nonNullable.group({
      line_type: ['service', Validators.required],
      inventory_item_id: [''],
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unit_cost: [0, [Validators.required, Validators.min(0)]],
    });
  }

  addLine() {
    this.lines.push(this.lineForm());
  }

  removeLine(index: number) {
    if (this.lines.length > 1) this.lines.removeAt(index);
  }

  load(silent = false) {
    const hasData =
      (this.section() === 'vendors' && this.vendors().length > 0) ||
      (this.section() === 'inventory' && this.inventory().length > 0) ||
      (this.section() === 'work-orders' && this.workOrders().length > 0);

    if (!silent && !hasData) {
      this.loading.set(true);
    }
    this.error.set(null);

    const checkComplete = () => {
      this.loading.set(false);
    };

    if (this.section() === 'vendors') {
      this.api.vendors().subscribe({
        next: (r) => {
          this.vendors.set(r.data);
          checkComplete();
        },
        error: (e) => {
          this.error.set(e.message);
          checkComplete();
        },
      });
    } else if (this.section() === 'inventory') {
      this.api.inventory().subscribe({
        next: (r) => {
          this.inventory.set(r.data);
          checkComplete();
        },
        error: (e) => {
          this.error.set(e.message);
          checkComplete();
        },
      });
    } else if (this.section() === 'work-orders') {
      this.api.workOrders().subscribe({
        next: (r) => {
          this.workOrders.set(r.data);
          checkComplete();
        },
        error: (e) => {
          this.error.set(e.message);
          checkComplete();
        },
      });
      this.api.vendors().subscribe({ next: (r) => this.vendors.set(r.data) });
      this.api.inventory().subscribe({ next: (r) => this.inventory.set(r.data) });
      this.propertiesApi
        .getProperties({ per_page: 100, status: 'active' })
        .subscribe({ next: (r) => this.properties.set(r.data) });
    }
  }

  saveVendor() {
    if (this.vendorForm.invalid) return;
    this.saving.set(true);
    this.api.createVendor(this.vendorForm.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.vendorForm.reset();
        this.load(true);
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(e.message);
      },
    });
  }

  saveInventory() {
    if (this.inventoryForm.invalid) return;
    this.saving.set(true);
    this.api.createInventory(this.inventoryForm.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.inventoryForm.reset({
          sku: '',
          name: '',
          unit_of_measure: 'piece',
          opening_quantity: 0,
        });
        this.load(true);
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(e.message);
      },
    });
  }

  saveWorkOrder() {
    if (this.workOrderForm.invalid) return;
    this.saving.set(true);
    const value = this.workOrderForm.getRawValue();
    this.api
      .createWorkOrder({
        ...value,
        property_id: Number(value.property_id),
        vendor_id: value.vendor_id ? Number(value.vendor_id) : null,
        service_charge: Number(value.service_charge),
        lines: value.lines.map((line) => ({
          ...line,
          inventory_item_id: line.inventory_item_id ? Number(line.inventory_item_id) : null,
          quantity: Number(line.quantity),
          unit_cost: Number(line.unit_cost),
        })),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.load(true);
        },
        error: (e) => {
          this.saving.set(false);
          this.error.set(e.message);
        },
      });
  }

  changeStatus(id: number, status: string) {
    this.api.updateWorkOrderStatus(id, status).subscribe({
      next: () => this.load(),
      error: (e) => this.error.set(e.message),
    });
  }
}
