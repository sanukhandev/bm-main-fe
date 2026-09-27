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
import { UserAdmin, UserAdminPayload, RoleAdmin } from '../../../shared/models/admin.models';
import { PaginationMeta } from '../../../core/api/api.models';
import { Branch } from '../../../core/branch-context/branch.models';

@Component({
  selector: 'bm-users-list',
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
        title="Users Administration"
        subtitle="System user access, permission policy, and multi-branch role assignments"
      >
        <button
          type="button"
          (click)="openCreate()"
          class="bm-btn bm-btn-primary text-xs font-semibold"
        >
          + Create User
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Total System Users</span>
            </div>
            <div class="text-2xl font-extrabold text-slate-900 tabular-nums">
              {{ users().length }} Accounts
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
              {{ activeUsersCount() }} Active
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Super Admins</span>
            </div>
            <div class="text-2xl font-extrabold text-blue-700 tabular-nums">
              {{ superAdminsCount() }} Global
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Branch Managers</span>
            </div>
            <div class="text-2xl font-extrabold text-purple-700 tabular-nums">
              {{ branchManagersCount() }} Managers
            </div>
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
            placeholder="Search user name, email, role, branch..."
            (searchChange)="onSearchChange($event)"
          ></bm-search-input>

          <select
            [value]="selectedRole()"
            (change)="onRoleChange($event)"
            class="bm-input !w-auto text-xs font-medium"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="branch_manager">Branch Manager</option>
            <option value="accountant">Accountant</option>
            <option value="property_manager">Property Manager</option>
            <option value="receptionist">Receptionist</option>
          </select>

          <select
            [value]="selectedStatus()"
            (change)="onStatusChange($event)"
            class="bm-input !w-auto text-xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
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
        <bm-error-state [message]="error()!" (retry)="loadUsers()"></bm-error-state>
      } @else if (filteredUsers().length === 0) {
        <bm-empty-state
          title="No user records found"
          description="No user records match your search criteria."
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
                  <th class="py-3.5 px-4">User Name</th>
                  <th class="py-3.5 px-4">Email Address</th>
                  <th class="py-3.5 px-4">Assigned Roles</th>
                  <th class="py-3.5 px-4">Permitted Branches</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (u of paginatedUsers(); track u.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="py-3.5 px-4 font-bold text-slate-900">
                      {{ u.name }}
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {{ u.email }}
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-1 flex-wrap">
                        @for (r of u.roles; track r) {
                          <bm-status-badge [status]="r"></bm-status-badge>
                        }
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 font-medium">
                      {{ getBranchesSummary(u) }}
                    </td>
                    <td class="py-3.5 px-4">
                      <bm-status-badge [status]="u.status"></bm-status-badge>
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-2xs mr-2 cursor-pointer"
                        (click)="openEdit(u)"
                      >
                        Edit
                      </button>
                      @if (u.status === 'active') {
                        <button
                          type="button"
                          class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 transition cursor-pointer"
                          (click)="changeStatus(u, 'suspended')"
                        >
                          Suspend
                        </button>
                      } @else {
                        <button
                          type="button"
                          class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 transition cursor-pointer"
                          (click)="changeStatus(u, 'active')"
                        >
                          Activate
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (filteredUsers().length > 0) {
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
                  {{ editingUser() ? 'Edit User Credentials & Roles' : 'Create New User' }}
                </h2>
                <p class="text-xs text-slate-500 mt-1">
                  Assign access strictly to authorized active branches.
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

            <form class="space-y-4" (ngSubmit)="saveUser()">
              @if (formError()) {
                <div
                  class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800"
                >
                  {{ formError() }}
                </div>
              }

              <div class="space-y-3">
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Full Name <span class="text-rose-600">*</span>
                  </label>
                  <input
                    class="bm-input"
                    name="name"
                    [(ngModel)]="form.name"
                    placeholder="Full legal name"
                    required
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Email Address <span class="text-rose-600">*</span>
                  </label>
                  <input
                    class="bm-input"
                    type="email"
                    name="email"
                    [(ngModel)]="form.email"
                    placeholder="user@baithulmadeena.ae"
                    required
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    {{ editingUser() ? 'New Password (optional)' : 'Password' }}
                  </label>
                  <input
                    class="bm-input"
                    type="password"
                    name="password"
                    [(ngModel)]="form.password"
                    [required]="!editingUser()"
                    minlength="8"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    class="bm-input"
                    type="password"
                    name="password_confirmation"
                    [(ngModel)]="form.password_confirmation"
                    [required]="!!form.password"
                  />
                </div>
              </div>

              <fieldset class="pt-2 border-t border-slate-100">
                <legend class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Permitted Branch Contexts <span class="text-rose-600">*</span>
                </legend>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80"
                >
                  @for (branch of branchOptions(); track branch.id) {
                    <label
                      class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                        [checked]="form.branch_ids.includes(branch.id)"
                        (change)="toggleBranch(branch.id)"
                      />
                      <span>{{ branch.code }} — {{ branch.name }}</span>
                    </label>
                  }
                </div>
              </fieldset>

              <fieldset class="pt-2 border-t border-slate-100">
                <legend class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Assigned Security Roles <span class="text-rose-600">*</span>
                </legend>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80"
                >
                  @for (role of roleOptions(); track role.name) {
                    <label
                      class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                        [checked]="form.roles.includes(role.name)"
                        (change)="toggleRole(role.name)"
                      />
                      <span>{{ role.label }}</span>
                    </label>
                  }
                </div>
              </fieldset>

              <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button type="button" class="bm-btn bm-btn-secondary text-xs" (click)="closeForm()">
                  Cancel
                </button>
                <button type="submit" class="bm-btn bm-btn-primary text-xs" [disabled]="saving()">
                  {{ saving() ? 'Saving…' : 'Save User' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  private api = inject(AdministrationApiService);

  users = signal<UserAdmin[]>([]);
  searchQuery = signal('');
  selectedRole = signal<string>('all');
  selectedStatus = signal<string>('all');
  currentPage = signal(1);
  pageSize = signal(10);
  isLoading = signal(true);
  error = signal<string | null>(null);
  branchOptions = signal<Branch[]>([]);
  roleOptions = signal<RoleAdmin[]>([]);
  formOpen = signal(false);
  editingUser = signal<UserAdmin | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  form: UserAdminPayload = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    branch_ids: [],
    roles: [],
  };

  readonly activeUsersCount = computed(
    () => this.users().filter((u) => (u.status || 'active').toLowerCase() === 'active').length,
  );

  readonly superAdminsCount = computed(
    () => this.users().filter((u) => (u.roles || []).includes('super_admin')).length,
  );

  readonly branchManagersCount = computed(
    () => this.users().filter((u) => (u.roles || []).includes('branch_manager')).length,
  );

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const role = this.selectedRole();
    const st = this.selectedStatus();

    return this.users().filter((u) => {
      if (st !== 'all' && (u.status || '').toLowerCase() !== st) return false;
      if (role !== 'all' && !(u.roles || []).includes(role)) return false;

      if (!q) return true;
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const rolesStr = (u.roles || []).join(' ').toLowerCase();
      const branches = this.getBranchesSummary(u).toLowerCase();
      const status = (u.status || '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        rolesStr.includes(q) ||
        branches.includes(q) ||
        status.includes(q)
      );
    });
  });

  paginationMeta = computed<PaginationMeta>(() => {
    const total = this.filteredUsers().length;
    const page = this.currentPage();
    const size = this.pageSize();
    const lastPage = Math.max(1, Math.ceil(total / size));
    const from = total === 0 ? 0 : (page - 1) * size + 1;
    const to = Math.min(total, page * size);
    return { current_page: page, per_page: size, total, last_page: lastPage, from, to };
  });

  paginatedUsers = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredUsers().slice(start, start + size);
  });

  hasActiveFilters = computed(
    () => !!this.searchQuery() || this.selectedRole() !== 'all' || this.selectedStatus() !== 'all',
  );

  ngOnInit(): void {
    this.loadUsers();
    this.api.getBranches().subscribe({ next: (res) => this.branchOptions.set(res.data) });
    this.api.getRoles().subscribe({ next: (res) => this.roleOptions.set(res.data) });
  }

  loadUsers(silent = false): void {
    if (!silent && this.users().length === 0) {
      this.isLoading.set(true);
    }
    this.error.set(null);

    this.api.getUsers().subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to fetch user list.');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  onRoleChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedRole.set(val);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(val);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedRole.set('all');
    this.selectedStatus.set('all');
    this.currentPage.set(1);
  }

  getBranchesSummary(u: UserAdmin): string {
    if (!u.branches || u.branches.length === 0) return 'All Branches';
    return u.branches.map((b) => b.code).join(', ');
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.form = {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      branch_ids: [],
      roles: [],
    };
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(user: UserAdmin): void {
    this.editingUser.set(user);
    this.form = {
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      branch_ids: user.branches.map((b) => b.id),
      roles: [...user.roles],
    };
    this.formError.set(null);
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (!this.saving()) this.formOpen.set(false);
  }

  toggleBranch(id: number): void {
    this.form.branch_ids = this.form.branch_ids.includes(id)
      ? this.form.branch_ids.filter((value) => value !== id)
      : [...this.form.branch_ids, id];
  }

  toggleRole(role: string): void {
    this.form.roles = this.form.roles.includes(role)
      ? this.form.roles.filter((value) => value !== role)
      : [...this.form.roles, role];
  }

  saveUser(): void {
    this.formError.set(null);
    if (!this.form.branch_ids.length || !this.form.roles.length) {
      this.formError.set('Select at least one branch and one role.');
      return;
    }
    if (this.form.password !== this.form.password_confirmation) {
      this.formError.set('Passwords do not match.');
      return;
    }
    this.saving.set(true);
    const request = this.editingUser()
      ? this.api.updateUser(this.editingUser()!.id, this.form)
      : this.api.createUser(this.form);
    request.subscribe({
      next: () => {
        this.formOpen.set(false);
        this.saving.set(false);
        this.loadUsers(true);
      },
      error: (err) => {
        this.formError.set(err.error?.message || err.message || 'Unable to save user.');
        this.saving.set(false);
      },
    });
  }

  changeStatus(user: UserAdmin, status: 'active' | 'suspended'): void {
    const action = status === 'active' ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;
    this.api.updateUserStatus(user.id, status).subscribe({
      next: () => this.loadUsers(true),
      error: (err) =>
        this.error.set(err.error?.message || err.message || 'Unable to update user status.'),
    });
  }
}
