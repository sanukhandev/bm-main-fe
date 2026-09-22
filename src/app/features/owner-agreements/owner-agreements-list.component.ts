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
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { OwnerAgreement } from '../../shared/models/agreement.models';
import { PaginationMeta } from '../../core/api/api.models';

@Component({
  selector: 'bm-owner-agreements-list',
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
    <bm-page-header title="Owner Agreements" subtitle="Property management agreements with property owners">
      <a routerLink="/app/owner-agreements/new" class="bm-btn bm-btn-primary text-xs">
        + Draft Owner Agreement
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
        title="No owner agreements found"
        description="No owner agreement records match your filter criteria."
        actionLabel="+ Draft Owner Agreement"
        (action)="navigateToCreate()"
      ></bm-empty-state>
    } @else {
      <div class="bm-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th class="py-3.5 px-4">Agreement No</th>
                <th class="py-3.5 px-4">Owner</th>
                <th class="py-3.5 px-4">Property Count</th>
                <th class="py-3.5 px-4">Period</th>
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
                    <a [routerLink]="['/app/owner-agreements', agr.id]" class="hover:text-emerald-600 transition-colors">
                      {{ agr.agreement_no }}
                    </a>
                  </td>
                  <td class="py-3.5 px-4 font-medium text-slate-900">
                    {{ getOwnerName(agr) }}
                  </td>
                  <td class="py-3.5 px-4 tabular-nums text-slate-700">
                    {{ getPropertyCount(agr) }} property asset(s)
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
                  <td class="py-3.5 px-4 text-right space-x-2">
                    <a [routerLink]="['/app/owner-agreements', agr.id]" class="text-emerald-700 hover:text-emerald-900 font-medium text-xs">
                      View
                    </a>

                    <!-- Rule 22: Ordinary edit allowed ONLY for draft & pending_approval -->
                    @if (agr.status === 'draft' || agr.status === 'pending_approval') {
                      <a [routerLink]="['/app/owner-agreements', agr.id, 'edit']" class="text-slate-600 hover:text-slate-900 font-medium text-xs">
                        Edit
                      </a>
                    }

                    @if (agr.status !== 'terminated') {
                      <button type="button" (click)="confirmTerminate(agr)" class="text-rose-600 hover:text-rose-800 font-medium text-xs">
                        Terminate
                      </button>
                    }
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
      title="Terminate Owner Agreement"
      [message]="'Are you sure you want to terminate owner agreement ' + selectedAgreement()?.agreement_no + '?'"
      confirmLabel="Terminate Agreement"
      [isDanger]="true"
      [isSubmitting]="isTerminating()"
      (confirm)="executeTerminate()"
      (cancel)="terminateDialogOpen.set(false)"
    ></bm-confirm-dialog>
  `,
})
export class OwnerAgreementsListComponent implements OnInit, OnDestroy {
  private api = inject(OwnerAgreementsApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private branchContext = inject(BranchContextService);

  agreements = signal<OwnerAgreement[]>([]);
  paginationMeta = signal<PaginationMeta | undefined>(undefined);
  isLoading = signal(true);
  error = signal<string | null>(null);

  searchQuery = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);

  terminateDialogOpen = signal(false);
  selectedAgreement = signal<OwnerAgreement | null>(null);
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
          this.error.set(err.message || 'Failed to load owner agreements.');
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

  getOwnerName(agr: OwnerAgreement): string {
    if (!agr.owner) return '—';
    if ('data' in agr.owner && agr.owner.data) return agr.owner.data.display_name;
    if ('display_name' in agr.owner) return (agr.owner as any).display_name;
    return '—';
  }

  getPropertyCount(agr: OwnerAgreement): number {
    if (!agr.properties) return 0;
    if (Array.isArray(agr.properties)) return agr.properties.length;
    if ('data' in agr.properties && Array.isArray(agr.properties.data)) return agr.properties.data.length;
    return 0;
  }

  navigateToCreate(): void {
    this.router.navigate(['/app/owner-agreements/new']);
  }

  confirmTerminate(agr: OwnerAgreement): void {
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
        alert(err.message || 'Failed to terminate agreement.');
      },
    });
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }
}
