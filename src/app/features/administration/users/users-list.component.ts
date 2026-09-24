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
      <bm-page-header
        title="Users Administration"
        subtitle="System user access and branch role assignments"
      >
        <button type="button" (click)="openCreate()" class="bm-btn bm-btn-primary">Create User</button>
      </bm-page-header>

    <!-- Toolbar Filters -->
    <div class="bm-card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
      <div class="bm-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
              >
                <th class="py-3.5 px-4">User Name</th>
                <th class="py-3.5 px-4">Email</th>
                <th class="py-3.5 px-4">Roles</th>
                <th class="py-3.5 px-4">Permitted Branches</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (u of paginatedUsers(); track u.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-semibold text-slate-900">
                    {{ u.name }}
                  </td>
                  <td class="py-3.5 px-4 text-slate-600">
                    {{ u.email }}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-1 flex-wrap">
                      @for (r of u.roles; track r) {
                        <bm-status-badge [status]="r"></bm-status-badge>
                      }
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-600">
                    {{ getBranchesSummary(u) }}
                  </td>
                  <td class="py-3.5 px-4">
                    <bm-status-badge [status]="u.status"></bm-status-badge>
                  </td>
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <button type="button" class="text-emerald-700 hover:text-emerald-900 font-semibold mr-3" (click)="openEdit(u)">Edit</button>
                    @if (u.status === 'active') {
                      <button type="button" class="text-rose-700 hover:text-rose-900 font-semibold" (click)="changeStatus(u, 'suspended')">Suspend</button>
                    } @else {
                      <button type="button" class="text-emerald-700 hover:text-emerald-900 font-semibold" (click)="changeStatus(u, 'active')">Activate</button>
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

    @if (formOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" (click)="closeForm()">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">{{ editingUser() ? 'Edit User' : 'Create User' }}</h2>
              <p class="text-xs text-slate-500 mt-1">Assign access only to active branches.</p>
            </div>
            <button type="button" class="text-slate-400 hover:text-slate-700 text-xl" (click)="closeForm()">×</button>
          </div>
          <form class="p-6 space-y-4" (ngSubmit)="saveUser()">
            @if (formError()) { <p class="text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2">{{ formError() }}</p> }
            <label class="block text-sm font-medium text-slate-700">Name<input class="bm-input mt-1" name="name" [(ngModel)]="form.name" required /></label>
            <label class="block text-sm font-medium text-slate-700">Email<input class="bm-input mt-1" type="email" name="email" [(ngModel)]="form.email" required /></label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="block text-sm font-medium text-slate-700">{{ editingUser() ? 'New password (optional)' : 'Password' }}<input class="bm-input mt-1" type="password" name="password" [(ngModel)]="form.password" [required]="!editingUser()" minlength="8" /></label>
              <label class="block text-sm font-medium text-slate-700">Confirm password<input class="bm-input mt-1" type="password" name="password_confirmation" [(ngModel)]="form.password_confirmation" [required]="!!form.password" /></label>
            </div>
            <fieldset>
              <legend class="text-sm font-medium text-slate-700 mb-2">Branches</legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                @for (branch of branchOptions(); track branch.id) {
                  <label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" [checked]="form.branch_ids.includes(branch.id)" (change)="toggleBranch(branch.id)" />{{ branch.code }} — {{ branch.name }}</label>
                }
              </div>
            </fieldset>
            <fieldset>
              <legend class="text-sm font-medium text-slate-700 mb-2">Roles</legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                @for (role of roleOptions(); track role.name) {
                  <label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" [checked]="form.roles.includes(role.name)" (change)="toggleRole(role.name)" />{{ role.label }}</label>
                }
              </div>
            </fieldset>
            <div class="flex justify-end gap-3 pt-3 border-t border-slate-100"><button type="button" class="bm-btn bm-btn-secondary" (click)="closeForm()">Cancel</button><button type="submit" class="bm-btn bm-btn-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save User' }}</button></div>
          </form>
        </div>
      </div>
    }
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
  form: UserAdminPayload = { name: '', email: '', password: '', password_confirmation: '', branch_ids: [], roles: [] };

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
    this.form = { name: '', email: '', password: '', password_confirmation: '', branch_ids: [], roles: [] };
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(user: UserAdmin): void {
    this.editingUser.set(user);
    this.form = { name: user.name, email: user.email, password: '', password_confirmation: '', branch_ids: user.branches.map((b) => b.id), roles: [...user.roles] };
    this.formError.set(null);
    this.formOpen.set(true);
  }

  closeForm(): void { if (!this.saving()) this.formOpen.set(false); }

  toggleBranch(id: number): void {
    this.form.branch_ids = this.form.branch_ids.includes(id) ? this.form.branch_ids.filter((value) => value !== id) : [...this.form.branch_ids, id];
  }

  toggleRole(role: string): void {
    this.form.roles = this.form.roles.includes(role) ? this.form.roles.filter((value) => value !== role) : [...this.form.roles, role];
  }

  saveUser(): void {
    this.formError.set(null);
    if (!this.form.branch_ids.length || !this.form.roles.length) { this.formError.set('Select at least one branch and one role.'); return; }
    if (this.form.password !== this.form.password_confirmation) { this.formError.set('Passwords do not match.'); return; }
    this.saving.set(true);
    const request = this.editingUser() ? this.api.updateUser(this.editingUser()!.id, this.form) : this.api.createUser(this.form);
    request.subscribe({ next: () => { this.formOpen.set(false); this.saving.set(false); this.loadUsers(true); }, error: (err) => { this.formError.set(err.error?.message || err.message || 'Unable to save user.'); this.saving.set(false); } });
  }

  changeStatus(user: UserAdmin, status: 'active' | 'suspended'): void {
    const action = status === 'active' ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;
    this.api.updateUserStatus(user.id, status).subscribe({ next: () => this.loadUsers(true), error: (err) => this.error.set(err.error?.message || err.message || 'Unable to update user status.') });
  }
}
