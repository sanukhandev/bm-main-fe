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
    <bm-page-header title="Customers" subtitle="Unified master directory for owners and tenants">
      <a routerLink="/app/customers/new" class="bm-btn bm-btn-primary text-xs">
        + Create Customer
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
        actionLabel="+ Create Customer"
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
                  <td class="py-3.5 px-4 text-right space-x-2">
                    <a
                      [routerLink]="['/app/customers', cust.id]"
                      class="text-emerald-700 hover:text-emerald-900 font-medium text-xs"
                    >
                      View
                    </a>
                    <a
                      [routerLink]="['/app/customers', cust.id, 'edit']"
                      class="text-slate-600 hover:text-slate-900 font-medium text-xs"
                    >
                      Edit
                    </a>
                    <button
                      type="button"
                      (click)="confirmArchive(cust)"
                      class="text-rose-600 hover:text-rose-800 font-medium text-xs"
                    >
                      Archive
                    </button>
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
  currentPage = signal(1);

  archiveDialogOpen = signal(false);
  selectedCustomer = signal<Customer | null>(null);
  isArchiving = signal(false);

  private branchSub?: Subscription;

  ngOnInit(): void {
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
    this.router.navigate(['/app/customers/new']);
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
