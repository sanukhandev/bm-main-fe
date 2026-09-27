import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmPageHeaderComponent } from '../../../shared/components/bm-page-header/bm-page-header.component';
import { RoleAdmin } from '../../../shared/models/admin.models';

@Component({
  selector: 'bm-roles-list',
  standalone: true,
  imports: [CommonModule, BmPageHeaderComponent],
  template: `
    <div class="max-w-[1740px] mx-auto space-y-6 font-sans text-[#0F172A]">
      <bm-page-header
        title="Roles & Access Control"
        subtitle="System roles, Security Policy Architecture, and Permission Matrix"
      ></bm-page-header>

      <!-- TOP BENTO SUMMARY STRIP -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div
          class="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100"
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>System Roles</span>
            </div>
            <div class="text-2xl font-extrabold text-slate-900 tabular-nums">
              {{ roles().length }} Defined Roles
            </div>
          </div>

          <div class="space-y-1 pt-4 sm:pt-0 sm:pl-6">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Security Isolation</span>
            </div>
            <div class="text-2xl font-extrabold text-emerald-700 tabular-nums">
              Branch Isolation
            </div>
          </div>

          <div class="space-y-1 pt-4 sm:pt-0 sm:pl-6">
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <span>Total Capabilities</span>
            </div>
            <div class="text-2xl font-extrabold text-blue-700 tabular-nums">
              {{ totalPermissions() }} Permissions
            </div>
          </div>
        </div>
      </div>

      <!-- BENTO ROLES GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (role of roles(); track role.id) {
          <div
            class="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    [class.bg-emerald-50]="role.name === 'super_admin'"
                    [class.text-emerald-700]="role.name === 'super_admin'"
                    [class.bg-blue-50]="role.name !== 'super_admin'"
                    [class.text-blue-700]="role.name !== 'super_admin'"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
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
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-slate-900">{{ role.label }}</h3>
                    <span class="font-mono text-[11px] text-slate-400 font-semibold">{{
                      role.name
                    }}</span>
                  </div>
                </div>
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  [class.bg-emerald-50]="role.name === 'super_admin'"
                  [class.text-emerald-800]="role.name === 'super_admin'"
                  [class.border]="role.name === 'super_admin'"
                  [class.border-emerald-200/80]="role.name === 'super_admin'"
                  [class.bg-blue-50]="role.name !== 'super_admin'"
                  [class.text-blue-800]="role.name !== 'super_admin'"
                  [class.border-blue-200/80]="role.name !== 'super_admin'"
                >
                  {{ role.permissions.length }} Permissions
                </span>
              </div>

              <p class="text-xs text-slate-600 leading-relaxed mb-5 font-normal">
                {{ role.description }}
              </p>

              <div class="pt-4 border-t border-slate-100">
                <div class="text-slate-400 font-bold mb-2.5 uppercase text-[10px] tracking-widest">
                  Granted Security Capabilities
                </div>
                <div class="flex flex-wrap gap-1.5">
                  @for (p of role.permissions; track p) {
                    <span
                      class="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 font-mono text-[11px] font-semibold"
                    >
                      {{ p }}
                    </span>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class RolesListComponent {
  roles = signal<RoleAdmin[]>([
    {
      id: 1,
      name: 'super_admin',
      label: 'Super Admin',
      description:
        'Global administrator with complete access to all branch contexts, user management, system organization settings, and consolidated reporting.',
      permissions: [
        'all:branches',
        'switch:branch-context',
        'manage:users',
        'manage:customers',
        'manage:properties',
        'manage:owner-agreements',
        'manage:tenant-agreements',
        'approve:agreements',
      ],
    },
    {
      id: 2,
      name: 'branch_admin',
      label: 'Branch Admin',
      description:
        'Operational branch manager with isolated access strictly restricted to their assigned active branch context.',
      permissions: [
        'view:assigned-branch',
        'manage:customers',
        'manage:properties',
        'manage:owner-agreements',
        'manage:tenant-agreements',
        'approve:agreements',
      ],
    },
  ]);

  readonly totalPermissions = computed(() => {
    const all = new Set<string>();
    for (const r of this.roles()) {
      r.permissions.forEach((p) => all.add(p));
    }
    return all.size;
  });
}
