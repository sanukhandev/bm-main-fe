import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmSearchInputComponent } from '../../shared/components/bm-search-input/bm-search-input.component';
import { BmPaginationComponent } from '../../shared/components/bm-pagination/bm-pagination.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmEmptyStateComponent } from '../../shared/components/bm-empty-state/bm-empty-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmConfirmDialogComponent } from '../../shared/components/bm-confirm-dialog/bm-confirm-dialog.component';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { Customer } from '../../shared/models/customer.models';
import { PaginationMeta } from '../../core/api/api.models';

@Component({
  selector: 'bm-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BmPageHeaderComponent,
    BmSearchInputComponent,
    BmPaginationComponent,
    BmStatusBadgeComponent,
    BmEmptyStateComponent,
    BmErrorStateComponent,
    BmLoadingStateComponent,
    BmConfirmDialogComponent,
  ],
  template: `
    <bm-page-header
      [title]="role() ? roleLabel() : 'Customers'"
      subtitle="Branch-scoped customer directory"
    >
      <a
        [routerLink]="
          role()
            ? [
                '/app/customers',
                role() === 'owner' ? 'owners' : role() === 'tenant' ? 'tenants' : 'vendors',
                'new',
              ]
            : ['/app/customers/new']
        "
        class="bm-btn bm-btn-primary text-xs"
      >
        + Create {{ roleLabel() || 'Customer' }}
      </a>
    </bm-page-header>

    <!-- Top Bento KPI Summary Strip -->
    <div class="rounded-2xl border border-slate-200/90 bg-white p-5 mb-6 shadow-xs">
      <div
        class="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100"
      >
        <div class="space-y-1">
          <div
            class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Total Records</span>
          </div>
          <div class="text-2xl font-extrabold text-slate-900 tabular-nums">
            {{ paginationMeta()?.total || customers().length }}
          </div>
        </div>

        <div class="space-y-1 pt-4 md:pt-0 md:pl-6">
          <div
            class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Active Accounts</span>
          </div>
          <div class="text-2xl font-extrabold text-emerald-700 tabular-nums">
            {{ activeCount() }}
          </div>
        </div>

        <div class="space-y-1 pt-4 md:pt-0 md:pl-6">
          <div
            class="flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wider"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-blue-600"
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
            <span>Corporate</span>
          </div>
          <div class="text-2xl font-extrabold text-blue-700 tabular-nums">
            {{ corporateCount() }}
          </div>
        </div>

        <div class="space-y-1 pt-4 md:pt-0 md:pl-6">
          <div
            class="flex items-center gap-1.5 text-xs font-semibold text-purple-700 uppercase tracking-wider"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-purple-600"
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
            <span>Individual</span>
          </div>
          <div class="text-2xl font-extrabold text-purple-700 tabular-nums">
            {{ individualCount() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bento Toolbar Filters -->
    <div
      class="rounded-2xl border border-slate-200/90 bg-white p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs"
    >
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <bm-search-input
          [value]="searchQuery()"
          placeholder="Search code, name, phone..."
          (searchChange)="onSearchChange($event)"
        ></bm-search-input>

        <select
          [value]="selectedType()"
          (change)="onTypeChange($event)"
          class="bm-input !w-auto text-xs font-medium"
        >
          <option value="">All Types</option>
          <option value="individual">Individual</option>
          <option value="organization">Organization</option>
        </select>

        <select
          [value]="selectedStatus()"
          (change)="onStatusChange($event)"
          class="bm-input !w-auto text-xs font-medium"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      @if (hasActiveFilters()) {
        <button
          type="button"
          (click)="clearFilters()"
          class="text-xs text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
        >
          Clear Filters
        </button>
      }
    </div>

    <!-- Data Table Container -->
    @if (isLoading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadCustomers()"></bm-error-state>
    } @else if (customers().length === 0) {
      <bm-empty-state
        title="No customers found"
        description="No customer records match your filter criteria."
        [actionLabel]="'+ Create ' + (roleLabel() || 'Customer')"
        (action)="navigateToCreate()"
      ></bm-empty-state>
    } @else {
      <div class="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
              >
                <th class="py-3.5 px-4">Customer Code</th>
                <th class="py-3.5 px-4">Display Name</th>
                <th class="py-3.5 px-4">Type</th>
                <th class="py-3.5 px-4">Roles</th>
                <th class="py-3.5 px-4">Phone / Email</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (cust of customers(); track cust.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-semibold text-slate-800 tabular-nums">
                    {{ cust.customer_code }}
                  </td>
                  <td class="py-3.5 px-4 font-medium text-slate-900">
                    <a
                      [routerLink]="['/app/customers', cust.id]"
                      class="hover:text-emerald-600 transition-colors"
                    >
                      {{ cust.display_name }}
                    </a>
                    @if (cust.legal_name && cust.legal_name !== cust.display_name) {
                      <div class="text-[11px] text-slate-400 font-normal">{{ cust.legal_name }}</div>
                    }
                  </td>
                  <td class="py-3.5 px-4">
                    <bm-status-badge [status]="cust.customer_type"></bm-status-badge>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-1 flex-wrap">
                      @for (r of cust.roles || []; track r) {
                        <bm-status-badge [status]="r"></bm-status-badge>
                      }
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-600">
                    @if (phoneNumbers(cust).length > 0) {
                      @for (phone of phoneNumbers(cust).slice(0, 3); track phone.type + phone.number) {
                        <div class="whitespace-nowrap">
                          <span class="text-[10px] uppercase tracking-wide text-slate-400 mr-1.5">
                            {{ phoneTypeLabel(phone.type) }}
                          </span>
                          {{ phone.number }}
                        </div>
                      }
                      @if (phoneNumbers(cust).length > 3) {
                        <div class="text-[11px] text-slate-400">
                          +{{ phoneNumbers(cust).length - 3 }} more
                        </div>
                      }
                    } @else {
                      <div>—</div>
                    }
                    <div class="text-[11px] text-slate-400">{{ cust.email || '' }}</div>
                  </td>
                  <td class="py-3.5 px-4">
                    <bm-status-badge [status]="cust.status"></bm-status-badge>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <a
                        [routerLink]="['/app/customers', cust.id]"
                        title="View Details"
                        aria-label="View Details"
                        class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 inline-flex items-center justify-center transition shadow-2xs"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </a>
                      <a
                        [routerLink]="
                          role()
                            ? [
                                '/app/customers',
                                role() === 'owner'
                                  ? 'owners'
                                  : role() === 'tenant'
                                    ? 'tenants'
                                    : 'vendors',
                                cust.id,
                                'edit',
                              ]
                            : ['/app/customers', cust.id, 'edit']
                        "
                        title="Edit Customer"
                        aria-label="Edit Customer"
                        class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 inline-flex items-center justify-center transition shadow-2xs"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </a>
                      <button
                        type="button"
                        (click)="confirmArchive(cust)"
                        title="Archive Customer"
                        aria-label="Archive Customer"
                        class="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200/60 inline-flex items-center justify-center transition shadow-2xs"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <bm-pagination
          [meta]="paginationMeta()"
          (pageChange)="onPageChange($event)"
        ></bm-pagination>
      </div>
    }

    <!-- Confirm Archive Dialog -->
    <bm-confirm-dialog
      [isOpen]="archiveDialogOpen()"
      title="Archive Customer"
      [message]="
        'Are you sure you want to archive customer ' + selectedCustomer()?.display_name + '?'
      "
      confirmLabel="Archive Customer"
      [isDanger]="true"
      [isSubmitting]="isArchiving()"
      (confirm)="executeArchive()"
      (cancel)="archiveDialogOpen.set(false)"
    ></bm-confirm-dialog>
  `,
})
export class CustomersListComponent implements OnInit, OnDestroy {
  private api = inject(CustomersApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private branchContext = inject(BranchContextService);

  customers = signal<Customer[]>([]);
  paginationMeta = signal<PaginationMeta | undefined>(undefined);
  isLoading = signal(true);
  error = signal<string | null>(null);

  searchQuery = signal('');
  selectedType = signal('');
  selectedStatus = signal('');
  role = signal<'owner' | 'tenant' | 'vendor' | null>(null);
  currentPage = signal(1);

  archiveDialogOpen = signal(false);
  selectedCustomer = signal<Customer | null>(null);
  isArchiving = signal(false);

  readonly activeCount = computed(
    () => this.customers().filter((c) => (c.status || 'active').toLowerCase() === 'active').length,
  );
  readonly corporateCount = computed(
    () =>
      this.customers().filter((c) => (c.customer_type || '').toLowerCase() === 'organization')
        .length,
  );
  readonly individualCount = computed(
    () =>
      this.customers().filter((c) => (c.customer_type || '').toLowerCase() === 'individual').length,
  );

  private branchSub?: Subscription;

  ngOnInit(): void {
    const routePath = this.router.url.split('?')[0];
    this.role.set(
      routePath.includes('/customers/owners')
        ? 'owner'
        : routePath.includes('/customers/tenants')
          ? 'tenant'
          : routePath.includes('/customers/vendors')
            ? 'vendor'
            : null,
    );
    this.route.queryParams.subscribe((queryParams) => {
      this.searchQuery.set(queryParams['search'] || '');
      this.selectedType.set(queryParams['customer_type'] || '');
      this.selectedStatus.set(queryParams['status'] || '');
      this.currentPage.set(Number(queryParams['page']) || 1);
      this.loadCustomers();
    });

    this.branchSub = this.branchContext.branchChanged$.subscribe(() => {
      this.loadCustomers();
    });
  }

  loadCustomers(silent = false): void {
    if (!silent && this.customers().length === 0) {
      this.isLoading.set(true);
    }
    this.error.set(null);

    this.api
      .getCustomers({
        page: this.currentPage(),
        per_page: 25,
        search: this.searchQuery(),
        customer_type: this.selectedType(),
        status: this.selectedStatus(),
        role: this.role() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.customers.set(res.data);
          this.paginationMeta.set(res.meta);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load customers.');
          this.isLoading.set(false);
        },
      });
  }

  roleLabel(): string {
    return this.role() === 'owner'
      ? 'Owners'
      : this.role() === 'tenant'
        ? 'Tenants'
        : this.role() === 'vendor'
          ? 'Vendors'
          : '';
  }

  updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery() || null,
        customer_type: this.selectedType() || null,
        status: this.selectedStatus() || null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
    this.currentPage.set(1);
    this.updateQueryParams();
  }

  onTypeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedType.set(val);
    this.currentPage.set(1);
    this.updateQueryParams();
  }

  onStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(val);
    this.currentPage.set(1);
    this.updateQueryParams();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updateQueryParams();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedType.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.updateQueryParams();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery() || this.selectedType() || this.selectedStatus());
  }

  phoneNumbers(customer: Customer) {
    const numbers = (customer.phone_numbers || [])
      .filter((phone) => !!phone?.number?.trim())
      .map((phone) => ({ type: phone.type || 'contact', number: phone.number.trim() }));

    if (numbers.length > 0) return numbers;
    return customer.phone?.trim() ? [{ type: 'contact' as const, number: customer.phone.trim() }] : [];
  }

  phoneTypeLabel(type: string): string {
    return type === 'whatsapp'
      ? 'WhatsApp'
      : type === 'landline'
        ? 'Landline'
        : type === 'other'
          ? 'Other'
          : 'Contact';
  }

  navigateToCreate(): void {
    this.router.navigate(
      this.role() ? ['/app/customers', `${this.role()}s`, 'new'] : ['/app/customers/new'],
    );
  }

  confirmArchive(cust: Customer): void {
    this.selectedCustomer.set(cust);
    this.archiveDialogOpen.set(true);
  }

  executeArchive(): void {
    const cust = this.selectedCustomer();
    if (!cust) return;

    this.isArchiving.set(true);
    this.api.archiveCustomer(cust.id).subscribe({
      next: () => {
        this.isArchiving.set(false);
        this.archiveDialogOpen.set(false);
        this.loadCustomers();
      },
      error: (err) => {
        this.isArchiving.set(false);
        alert(err.message || 'Failed to archive customer.');
      },
    });
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }
}
