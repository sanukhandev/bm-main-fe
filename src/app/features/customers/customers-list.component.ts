import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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
    <bm-page-header [title]="role() ? (role() === 'owner' ? 'Owners' : 'Tenants') : 'Customers'" subtitle="Branch-scoped customer directory">
      <a [routerLink]="role() ? ['/app/customers', role() === 'owner' ? 'owners' : 'tenants', 'new'] : ['/app/customers/new']" class="bm-btn bm-btn-primary text-xs">
        + Create {{ role() === 'owner' ? 'Owner' : role() === 'tenant' ? 'Tenant' : 'Customer' }}
      </a>
    </bm-page-header>

    <!-- Toolbar Filters -->
    <div class="bm-card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
        <button type="button" (click)="clearFilters()" class="text-xs text-emerald-700 hover:text-emerald-800 font-medium">
          Clear Filters
        </button>
      }
    </div>

    <!-- Data Table -->
    @if (isLoading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadCustomers()"></bm-error-state>
    } @else if (customers().length === 0) {
      <bm-empty-state
        title="No customers found"
        description="No customer records match your filter criteria."
        [actionLabel]="'+ Create ' + (role() === 'owner' ? 'Owner' : role() === 'tenant' ? 'Tenant' : 'Customer')"
        (action)="navigateToCreate()"
      ></bm-empty-state>
    } @else {
      <div class="bm-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
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
                    <a [routerLink]="['/app/customers', cust.id]" class="hover:text-emerald-600 transition-colors">
                      {{ cust.display_name }}
                    </a>
                  </td>
                  <td class="py-3.5 px-4 capitalize text-slate-600">
                    {{ cust.customer_type }}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-1 flex-wrap">
                      @for (r of cust.roles || []; track r) {
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
                          [class.bg-emerald-100]="r === 'owner'"
                          [class.text-emerald-800]="r === 'owner'"
                          [class.bg-blue-100]="r === 'tenant'"
                          [class.text-blue-800]="r === 'tenant'"
                        >
                          {{ r }}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-600">
                    <div>{{ cust.phone || '—' }}</div>
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
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      <a
                        [routerLink]="role() ? ['/app/customers', role() === 'owner' ? 'owners' : 'tenants', cust.id, 'edit'] : ['/app/customers', cust.id, 'edit']"
                        title="Edit Customer"
                        aria-label="Edit Customer"
                        class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 inline-flex items-center justify-center transition shadow-2xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        (click)="confirmArchive(cust)"
                        title="Archive Customer"
                        aria-label="Archive Customer"
                        class="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200/60 inline-flex items-center justify-center transition shadow-2xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <bm-pagination [meta]="paginationMeta()" (pageChange)="onPageChange($event)"></bm-pagination>
      </div>
    }

    <!-- Confirm Archive Dialog -->
    <bm-confirm-dialog
      [isOpen]="archiveDialogOpen()"
      title="Archive Customer"
      [message]="'Are you sure you want to archive customer ' + selectedCustomer()?.display_name + '?'"
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
  role = signal<'owner' | 'tenant' | null>(null);
  currentPage = signal(1);

  archiveDialogOpen = signal(false);
  selectedCustomer = signal<Customer | null>(null);
  isArchiving = signal(false);

  private branchSub?: Subscription;

  ngOnInit(): void {
    const routePath = this.router.url.split('?')[0];
    this.role.set(routePath.includes('/customers/owners') ? 'owner' : routePath.includes('/customers/tenants') ? 'tenant' : null);
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

  loadCustomers(): void {
    this.isLoading.set(true);
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

  navigateToCreate(): void {
    this.router.navigate(this.role() ? ['/app/customers', `${this.role()}s`, 'new'] : ['/app/customers/new']);
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
