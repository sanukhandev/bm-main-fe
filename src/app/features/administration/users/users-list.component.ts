import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmPageHeaderComponent } from '../../../shared/components/bm-page-header/bm-page-header.component';
import { BmStatusBadgeComponent } from '../../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../../shared/components/bm-error-state/bm-error-state.component';
import { BmEmptyStateComponent } from '../../../shared/components/bm-empty-state/bm-empty-state.component';
import { AdministrationApiService } from '../../../core/api/administration-api.service';
import { UserAdmin } from '../../../shared/models/admin.models';

@Component({
  selector: 'bm-users-list',
  standalone: true,
  imports: [
    CommonModule,
    BmPageHeaderComponent,
    BmStatusBadgeComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmEmptyStateComponent,
  ],
  template: `
    <bm-page-header title="Users Administration" subtitle="System user access and branch role assignments">
    </bm-page-header>

    @if (isLoading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadUsers()"></bm-error-state>
    } @else if (users().length === 0) {
      <bm-empty-state
        title="No user records found"
        description="User administrative management records."
      ></bm-empty-state>
    } @else {
      <div class="bm-card overflow-hidden max-w-5xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th class="py-3.5 px-4">User Name</th>
                <th class="py-3.5 px-4">Email</th>
                <th class="py-3.5 px-4">Roles</th>
                <th class="py-3.5 px-4">Permitted Branches</th>
                <th class="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (u of users(); track u.id) {
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
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class UsersListComponent implements OnInit {
  private api = inject(AdministrationApiService);

  users = signal<UserAdmin[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
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

  getBranchesSummary(u: UserAdmin): string {
    if (!u.branches || u.branches.length === 0) return 'All Branches';
    return u.branches.map((b) => b.code).join(', ');
  }
}
