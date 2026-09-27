import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    BmPageHeaderComponent,
    BmStatusBadgeComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmEmptyStateComponent,
    BmSearchInputComponent,
    BmPaginationComponent,
  ],
  template: `
    <div class="max-w-[1740px] mx-auto space-y-6 font-sans text-[#0F172A]">
      <bm-page-header
        title="Branches Administration"
        subtitle="Super Admin multi-branch organization control & regional site management"
      >
        <button
          type="button"
          (click)="openCreate()"
          class="bm-btn bm-btn-primary text-xs font-semibold"
        >
          + Create Branch
        </button>
      </bm-page-header>

      <!-- TOP BENTO SUMMARY STRIP -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Total Branches</span>
            </div>
            <div class="text-2xl font-extrabold text-slate-900 tabular-nums">
              {{ branches().length }} Regional Sites
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
              <span>Active Operations</span>
            </div>
            <div class="text-2xl font-extrabold text-emerald-700 tabular-nums">
              {{ activeBranchesCount() }} Active
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <span>UAE Emirates</span>
            </div>
            <div class="text-2xl font-extrabold text-blue-700 tabular-nums">
              {{ uniqueEmiratesCount() }} Emirates
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Currency / Timezone</span>
            </div>
            <div class="text-2xl font-extrabold text-purple-700 tabular-nums">AED · Asia/Dubai</div>
          </div>
        </div>
      </div>

      <!-- BENTO TOOLBAR FILTERS -->
      <div
        class="rounded-2xl border border-slate-200/90 bg-white p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs"
      >
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
        <!-- BENTO TABLE CONTAINER -->
        <div class="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
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
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (b of paginatedBranches(); track b.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="py-3.5 px-4 font-bold text-emerald-900 tabular-nums">
                      <span
                        class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono"
                      >
                        {{ b.code }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-slate-900">
                      {{ b.name }}
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {{ b.timezone }}
                    </td>
                    <td class="py-3.5 px-4 font-bold text-slate-800 uppercase font-mono">
                      {{ b.currency_code }}
                    </td>
                    <td class="py-3.5 px-4">
                      <bm-status-badge [status]="b.status"></bm-status-badge>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        class="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-2xs cursor-pointer"
                        (click)="openEdit(b)"
                      >
                        Edit
                      </button>
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

      <!-- BENTO FORM MODAL DIALOG -->
      @if (formOpen()) {
        <div
          class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          (click)="closeForm()"
        >
          <div
            class="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            (click)="$event.stopPropagation()"
          >
            <div class="pb-5 mb-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  {{ editingBranch() ? 'Edit Branch Profile' : 'Create New Branch' }}
                </h2>
                <p class="text-xs text-slate-500 mt-1">
                  Branch code is automatically generated based on the selected UAE emirate.
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-lg font-bold transition cursor-pointer"
                (click)="closeForm()"
              >
                ×
              </button>
            </div>

            <form class="space-y-4" (ngSubmit)="saveBranch()">
              @if (formError()) {
                <div
                  class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800"
                >
                  {{ formError() }}
                </div>
              }

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Branch Name <span class="text-rose-600">*</span>
                  </label>
                  <input
                    class="bm-input"
                    name="name"
                    [(ngModel)]="form.name"
                    placeholder="e.g. Fujairah Head Office"
                    required
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Emirate <span class="text-rose-600">*</span>
                  </label>
                  <select
                    class="bm-input"
                    name="state_or_emirate"
                    [(ngModel)]="form.state_or_emirate"
                    required
                  >
                    <option value="">Select emirate</option>
                    @for (emirate of emirates; track emirate) {
                      <option [value]="emirate">{{ emirate }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >Phone Number</label
                  >
                  <input
                    class="bm-input"
                    name="phone"
                    [(ngModel)]="form.phone"
                    placeholder="+971 9 123 4567"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >Email Address</label
                  >
                  <input
                    class="bm-input"
                    type="email"
                    name="email"
                    [(ngModel)]="form.email"
                    placeholder="branch@baithulmadeena.ae"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >Timezone</label
                  >
                  <input class="bm-input" name="timezone" [(ngModel)]="form.timezone" required />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >Currency Code</label
                  >
                  <input
                    class="bm-input"
                    name="currency_code"
                    maxlength="3"
                    [(ngModel)]="form.currency_code"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >Street Address</label
                >
                <input
                  class="bm-input"
                  name="address_line_1"
                  [(ngModel)]="form.address_line_1"
                  placeholder="Official physical address"
                />
              </div>

              @if (editingBranch()) {
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >Branch Status</label
                  >
                  <select class="bm-input" name="status" [(ngModel)]="form.status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              }

              <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button type="button" class="bm-btn bm-btn-secondary text-xs" (click)="closeForm()">
                  Cancel
                </button>
                <button type="submit" class="bm-btn bm-btn-primary text-xs" [disabled]="saving()">
                  {{ saving() ? 'Saving…' : 'Save Branch' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class BranchesListComponent implements OnInit {
  private api = inject(AdministrationApiService);
  emirates = [
    'Abu Dhabi',
    'Ajman',
    'Dubai',
    'Fujairah',
    'Ras Al Khaimah',
    'Sharjah',
    'Umm Al Quwain',
  ];

  branches = signal<Branch[]>([]);
  searchQuery = signal('');
  selectedStatus = signal<string>('all');
  currentPage = signal(1);
  pageSize = signal(10);
  isLoading = signal(true);
  error = signal<string | null>(null);
  formOpen = signal(false);
  editingBranch = signal<Branch | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  form: Partial<Branch> = this.emptyForm();

  readonly activeBranchesCount = computed(
    () => this.branches().filter((b) => (b.status || 'active').toLowerCase() === 'active').length,
  );

  readonly uniqueEmiratesCount = computed(() => {
    const states = new Set<string>();
    for (const b of this.branches()) {
      if (b.state_or_emirate) states.add(b.state_or_emirate);
    }
    return states.size;
  });

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

  openCreate(): void {
    this.editingBranch.set(null);
    this.form = this.emptyForm();
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(branch: Branch): void {
    this.editingBranch.set(branch);
    this.form = { ...branch };
    this.formError.set(null);
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (!this.saving()) this.formOpen.set(false);
  }

  saveBranch(): void {
    this.saving.set(true);
    this.formError.set(null);
    const request = this.editingBranch()
      ? this.api.updateBranch(this.editingBranch()!.id, this.form)
      : this.api.createBranch(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.loadBranches(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err.error?.message || err.message || 'Unable to save branch.');
      },
    });
  }

  private emptyForm(): Partial<Branch> {
    return {
      name: '',
      state_or_emirate: '',
      timezone: 'Asia/Dubai',
      currency_code: 'AED',
      status: 'active',
      phone: '',
      email: '',
      address_line_1: '',
    };
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
