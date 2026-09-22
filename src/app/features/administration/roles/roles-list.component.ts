import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmPageHeaderComponent } from '../../../shared/components/bm-page-header/bm-page-header.component';
import { BmCardComponent } from '../../../shared/components/bm-card/bm-card.component';
import { RoleAdmin } from '../../../shared/models/admin.models';

@Component({
  selector: 'bm-roles-list',
  standalone: true,
  imports: [CommonModule, BmPageHeaderComponent, BmCardComponent],
  template: `
    <bm-page-header title="Roles & Access Control" subtitle="System roles and security policy overview">
    </bm-page-header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
      @for (role of roles(); track role.id) {
        <bm-card [title]="role.label">
          <div class="text-xs space-y-3">
            <p class="text-slate-600 leading-relaxed">{{ role.description }}</p>

            <div class="border-t border-slate-100 pt-3">
              <div class="text-slate-400 font-semibold mb-2 uppercase text-[10px] tracking-wider">Granted Capabilities</div>
              <div class="flex flex-wrap gap-1.5">
                @for (p of role.permissions; track p) {
                  <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {{ p }}
                  </span>
                }
              </div>
            </div>
          </div>
        </bm-card>
      }
    </div>
  `,
})
export class RolesListComponent {
  roles = signal<RoleAdmin[]>([
    {
      id: 1,
      name: 'super_admin',
      label: 'Super Admin',
      description: 'Global administrator with complete access to all branch contexts, user management, and consolidated reporting.',
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
      description: 'Operational branch manager with isolated access restricted to assigned active branch context.',
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
}
