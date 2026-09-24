import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmPageHeaderComponent } from '../../../shared/components/bm-page-header/bm-page-header.component';
import { BmStatusBadgeComponent } from '../../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../../shared/components/bm-error-state/bm-error-state.component';
import { BmEmptyStateComponent } from '../../../shared/components/bm-empty-state/bm-empty-state.component';
import { BmSearchInputComponent } from '../../../shared/components/bm-search-input/bm-search-input.component';
import { BmPaginationComponent } from '../../../shared/components/bm-pagination/bm-pagination.component';
import { AdministrationApiService } from '../../../core/api/administration-api.service';
import { Branch } from '../../../core/branch-context/branch.models';
import { PaginationMeta } from '../../../core/api/api.models';

@Component({
  selector: 'bm-branches-list',
  standalone: true,
  imports: [
    CommonModule,
    BmPageHeaderComponent,
    BmStatusBadgeComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmEmptyStateComponent,
    BmSearchInputComponent,
    BmPaginationComponent,
  ],
  template: `
    <bm-page-header
      title="Branches Administration"
      subtitle="Super Admin multi-branch organization control"
    >
    </bm-page-header>

    <!-- Toolbar Filters -->
    <div class="bm-card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <bm-search-input
          [value]="searchQuery()"
          placeholder="Search branch code, name, timezone, currency..."
          (searchChange)="onSearchChange($event)"
        ></bm-search-input>

        <select
          [value]="selectedStatus()"
          (change)="onStatusChange($event)"
          class="bm-input !w-auto text-xs font-medium"
        >
          <option value="all">All Statuses</option>
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

    @if (isLoading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadBranches()"></bm-error-state>
    } @else if (filteredBranches().length === 0) {
      <bm-empty-state
        title="No branches found"
        description="No branch records match your search criteria."
      ></bm-empty-state>
    } @else {
      <div class="bm-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
              >
                <th class="py-3.5 px-4">Branch Code</th>
                <th class="py-3.5 px-4">Branch Name</th>
                <th class="py-3.5 px-4">Timezone</th>
                <th class="py-3.5 px-4">Currency</th>
                <th class="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (b of paginatedBranches(); track b.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-emerald-900 tabular-nums">
                    [{{ b.code }}]
                  </td>
                  <td class="py-3.5 px-4 font-medium text-slate-900">
                    {{ b.name }}
                  </td>
                  <td class="py-3.5 px-4 text-slate-600">
                    {{ b.timezone }}
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-800 uppercase">
                    {{ b.currency_code }}
                  </td>
                  <td class="py-3.5 px-4">
                    <bm-status-badge [status]="b.status"></bm-status-badge>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (filteredBranches().length > 0) {
          <bm-pagination
            [meta]="paginationMeta()"
            (pageChange)="currentPage.set($event)"
          ></bm-pagination>
        }
      </div>
    }
  `,
})
export class BranchesListComponent implements OnInit {
  private api = inject(AdministrationApiService);

  branches = signal<Branch[]>([]);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');
  currentPage = signal(1);
  pageSize = signal(10);
  isLoading = signal(true);
  error = signal<string | null>(null);

  filteredBranches = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.branches().filter((b) => {
      if (st !== 'all' && (b.status || '').toLowerCase() !== st) return false;
      if (!q) return true;
      const code = (b.code || '').toLowerCase();
      const name = (b.name || '').toLowerCase();
      const tz = (b.timezone || '').toLowerCase();
      const curr = (b.currency_code || '').toLowerCase();
      return code.includes(q) || name.includes(q) || tz.includes(q) || curr.includes(q);
    });
  });

  paginationMeta = computed<PaginationMeta>(() => {
    const total = this.filteredBranches().length;
    const page = this.currentPage();
    const size = this.pageSize();
    const lastPage = Math.max(1, Math.ceil(total / size));
    const from = total === 0 ? 0 : (page - 1) * size + 1;
    const to = Math.min(total, page * size);
    return { current_page: page, per_page: size, total, last_page: lastPage, from, to };
  });

  paginatedBranches = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredBranches().slice(start, start + size);
  });

  hasActiveFilters = computed(() => !!this.searchQuery() || this.selectedStatus() !== 'all');

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(silent = false): void {
    if (!silent && this.branches().length === 0) {
      this.isLoading.set(true);
    }
    this.error.set(null);

    this.api.getBranches().subscribe({
      next: (res) => {
        this.branches.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load branch registry.');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(val);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('all');
    this.currentPage.set(1);
  }
}
