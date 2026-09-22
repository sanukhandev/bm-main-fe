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
import { TenantAgreementsApiService } from '../../core/api/tenant-agreements-api.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { TenantAgreement } from '../../shared/models/agreement.models';
import { PaginationMeta } from '../../core/api/api.models';

@Component({
  selector: 'bm-tenant-agreements-list',
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
    <bm-page-header title="Tenant Agreements" subtitle="Leasing contracts with tenants">
      <a routerLink="/app/tenant-agreements/new" class="bm-btn bm-btn-primary text-xs">
        + New Tenant Agreement
      </a>
    </bm-page-header>

    <!-- Toolbar Filters -->
    <div class="bm-card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <bm-search-input
          [value]="searchQuery()"
          placeholder="Search agreement number..."
          (searchChange)="onSearchChange($event)"
        ></bm-search-input>

        <select
          [value]="selectedStatus()"
          (change)="onStatusChange($event)"
          class="bm-input !w-auto text-xs font-medium"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="commenced">Commenced</option>
          <option value="expired">Expired</option>
          <option value="terminated">Terminated</option>
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
      <bm-error-state [message]="error()!" (retry)="loadAgreements()"></bm-error-state>
    } @else if (agreements().length === 0) {
      <bm-empty-state
        title="No tenant agreements found"
        description="No tenant lease records match your filter criteria."
        actionLabel="+ New Tenant Agreement"
        (action)="navigateToCreate()"
      ></bm-empty-state>
    } @else {
      <div class="bm-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th class="py-3.5 px-4">Agreement No</th>
                <th class="py-3.5 px-4">Tenant</th>
                <th class="py-3.5 px-4">Leased Property</th>
                <th class="py-3.5 px-4">Lease Period</th>
                <th class="py-3.5 px-4">Total Amount</th>
                <th class="py-3.5 px-4">Mode</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (agr of agreements(); track agr.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-semibold text-slate-800 tabular-nums">
                    <a [routerLink]="['/app/tenant-agreements', agr.id]" class="hover:text-emerald-600 transition-colors">
                      {{ agr.agreement_no }}
                    </a>
                  </td>
                  <td class="py-3.5 px-4 font-medium text-slate-900">
                    {{ getTenantName(agr) }}
                  </td>
                  <td class="py-3.5 px-4 font-medium text-slate-800">
                    {{ getLeasedPropertySummary(agr) }}
                  </td>
                  <td class="py-3.5 px-4 text-slate-600 tabular-nums">
                    {{ agr.start_date }} &rarr; {{ agr.end_date }}
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-900 tabular-nums">
                    {{ agr.currency_code }} {{ agr.total_amount | number:'1.2-2' }}
                  </td>
                  <td class="py-3.5 px-4 uppercase text-[11px] font-medium text-slate-600">
                    {{ (agr.payment_mode || '').replace('_', ' ') }}
                  </td>
                  <td class="py-3.5 px-4">
                    <bm-status-badge [status]="agr.status"></bm-status-badge>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <a
                        [routerLink]="['/app/tenant-agreements', agr.id]"
                        title="View Agreement Details"
                        aria-label="View Agreement Details"
                        class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 inline-flex items-center justify-center transition shadow-2xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>

                      @if (agr.status === 'draft' || agr.status === 'pending_approval') {
                        <a
                          [routerLink]="['/app/tenant-agreements', agr.id, 'edit']"
                          title="Edit Draft Agreement"
                          aria-label="Edit Draft Agreement"
                          class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 inline-flex items-center justify-center transition shadow-2xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                      }

                      @if (agr.status !== 'terminated') {
                        <button
                          type="button"
                          (click)="confirmTerminate(agr)"
                          title="Terminate Agreement"
                          aria-label="Terminate Agreement"
                          class="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200/60 inline-flex items-center justify-center transition shadow-2xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      }
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

    <bm-confirm-dialog
      [isOpen]="terminateDialogOpen()"
      title="Terminate Tenant Agreement"
      [message]="'Are you sure you want to terminate tenant agreement ' + selectedAgreement()?.agreement_no + '?'"
      confirmLabel="Terminate Agreement"
      [isDanger]="true"
      [isSubmitting]="isTerminating()"
      (confirm)="executeTerminate()"
      (cancel)="terminateDialogOpen.set(false)"
    ></bm-confirm-dialog>
  `,
})
export class TenantAgreementsListComponent implements OnInit, OnDestroy {
  private api = inject(TenantAgreementsApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private branchContext = inject(BranchContextService);

  agreements = signal<TenantAgreement[]>([]);
  paginationMeta = signal<PaginationMeta | undefined>(undefined);
  isLoading = signal(true);
  error = signal<string | null>(null);

  searchQuery = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);

  terminateDialogOpen = signal(false);
  selectedAgreement = signal<TenantAgreement | null>(null);
  isTerminating = signal(false);

  private branchSub?: Subscription;

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.searchQuery.set(queryParams['search'] || '');
      this.selectedStatus.set(queryParams['status'] || '');
      this.currentPage.set(Number(queryParams['page']) || 1);
      this.loadAgreements();
    });

    this.branchSub = this.branchContext.branchChanged$.subscribe(() => {
      this.loadAgreements();
    });
  }

  loadAgreements(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api
      .getAgreements({
        page: this.currentPage(),
        per_page: 25,
        search: this.searchQuery(),
        status: this.selectedStatus(),
      })
      .subscribe({
        next: (res) => {
          this.agreements.set(res.data);
          this.paginationMeta.set(res.meta);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load tenant agreements.');
          this.isLoading.set(false);
        },
      });
  }

  updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery() || null,
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
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.updateQueryParams();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery() || this.selectedStatus());
  }

  getTenantName(agr: TenantAgreement): string {
    if (!agr.tenant) return '—';
    if ('data' in agr.tenant && agr.tenant.data) return agr.tenant.data.display_name;
    if ('display_name' in agr.tenant) return (agr.tenant as any).display_name;
    return '—';
  }

  getLeasedPropertySummary(agr: TenantAgreement): string {
    if (!agr.properties || agr.properties.length === 0) return '—';
    const first = agr.properties[0];
    if (first.property) return `${first.property.name} (${first.property.unit_number})`;
    return `Property ID: ${first.property_id}`;
  }

  navigateToCreate(): void {
    this.router.navigate(['/app/tenant-agreements/new']);
  }

  confirmTerminate(agr: TenantAgreement): void {
    this.selectedAgreement.set(agr);
    this.terminateDialogOpen.set(true);
  }

  executeTerminate(): void {
    const agr = this.selectedAgreement();
    if (!agr) return;

    this.isTerminating.set(true);
    this.api.terminateAgreement(agr.id).subscribe({
      next: () => {
        this.isTerminating.set(false);
        this.terminateDialogOpen.set(false);
        this.loadAgreements();
      },
      error: (err) => {
        this.isTerminating.set(false);
        alert(err.message || 'Failed to terminate tenant agreement.');
      },
    });
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }
}
