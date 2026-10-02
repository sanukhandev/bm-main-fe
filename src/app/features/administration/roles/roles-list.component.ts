import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministrationApiService } from '../../../core/api/administration-api.service';
import { BmPageHeaderComponent } from '../../../shared/components/bm-page-header/bm-page-header.component';
import { PermissionAdmin, RoleAdmin } from '../../../shared/models/admin.models';

@Component({
  selector: 'bm-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BmPageHeaderComponent],
  template: `
    <div class="max-w-[1740px] mx-auto space-y-6 font-sans text-[#0F172A]">
      <bm-page-header title="Roles & Access Control" subtitle="Create roles and manage permissions"></bm-page-header>
      @if (error()) { <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">{{ error() }}</div> }
      <div class="flex justify-end gap-2">
        <button class="bm-btn bm-btn-secondary text-xs" type="button" (click)="openPermission()">New Permission</button>
        <button class="bm-btn bm-btn-primary text-xs" type="button" (click)="openRole()">New Role</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (role of roles(); track role.id) {
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div class="flex items-start justify-between gap-3"><div><h3 class="text-base font-bold text-slate-900">{{ role.label }}</h3><span class="font-mono text-[11px] text-slate-400">{{ role.name }}</span></div><button class="bm-btn bm-btn-secondary text-xs" type="button" (click)="openRole(role)">Edit</button></div>
            <p class="text-xs text-slate-600 leading-relaxed my-4">{{ role.description || 'No description' }}</p>
            <div class="flex flex-wrap gap-1.5">@for (permission of role.permissions; track permission) { <span class="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px]">{{ permission }}</span> } @empty { <span class="text-xs text-slate-400">No permissions assigned</span> }</div>
          </div>
        }
      </div>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"><h2 class="text-base font-bold text-slate-900 mb-4">Permission Catalog</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-3">@for (permission of permissions(); track permission.id) { <div class="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><div class="font-mono text-xs text-slate-700">{{ permission.key }}</div><div class="text-xs text-slate-500">{{ permission.name }}</div></div><button class="bm-btn bm-btn-secondary text-xs" type="button" (click)="openPermission(permission)">Edit</button></div> }</div></section>
      @if (roleFormOpen()) { <div class="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4" (click)="closeForms()"><form class="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4" (click)="$event.stopPropagation()" (ngSubmit)="saveRole()"><h2 class="text-xl font-bold">{{ editingRole() ? 'Edit Role' : 'Create Role' }}</h2><input class="bm-input" name="key" [(ngModel)]="roleForm.key" placeholder="role.key" [disabled]="!!editingRole()" required /><input class="bm-input" name="name" [(ngModel)]="roleForm.name" placeholder="Role name" required /><textarea class="bm-input" name="description" [(ngModel)]="roleForm.description" placeholder="Description"></textarea><div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">@for (permission of permissions(); track permission.id) { <label class="flex gap-2 items-center text-xs"><input type="checkbox" [checked]="roleForm.permission_keys.includes(permission.key)" (change)="togglePermission(permission.key)" />{{ permission.name }}</label> }</div><div class="flex justify-end gap-2"><button type="button" class="bm-btn bm-btn-secondary text-xs" (click)="closeForms()">Cancel</button><button type="submit" class="bm-btn bm-btn-primary text-xs" [disabled]="saving()">Save</button></div></form></div> }
      @if (permissionFormOpen()) { <div class="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4" (click)="closeForms()"><form class="bg-white rounded-3xl w-full max-w-md p-6 space-y-4" (click)="$event.stopPropagation()" (ngSubmit)="savePermission()"><h2 class="text-xl font-bold">{{ editingPermission() ? 'Edit Permission' : 'Create Permission' }}</h2><input class="bm-input" name="key" [(ngModel)]="permissionForm.key" placeholder="module.action" [disabled]="!!editingPermission()" required /><input class="bm-input" name="name" [(ngModel)]="permissionForm.name" placeholder="Display name" required /><div class="flex justify-end gap-2"><button type="button" class="bm-btn bm-btn-secondary text-xs" (click)="closeForms()">Cancel</button><button type="submit" class="bm-btn bm-btn-primary text-xs" [disabled]="saving()">Save</button></div></form></div> }
    </div>
  `,
})
export class RolesListComponent implements OnInit {
  private api = inject(AdministrationApiService);
  roles = signal<RoleAdmin[]>([]);
  permissions = signal<PermissionAdmin[]>([]);
  error = signal<string | null>(null);
  saving = signal(false);
  roleFormOpen = signal(false);
  permissionFormOpen = signal(false);
  editingRole = signal<RoleAdmin | null>(null);
  editingPermission = signal<PermissionAdmin | null>(null);
  roleForm = { key: '', name: '', description: '', permission_keys: [] as string[] };
  permissionForm = { key: '', name: '' };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.error.set(null);
    this.api.getRoles().subscribe({ next: (response) => this.roles.set(response.data), error: (error) => this.showError(error) });
    this.api.getPermissions().subscribe({ next: (response) => this.permissions.set(response.data), error: (error) => this.showError(error) });
  }

  openRole(role?: RoleAdmin): void { this.editingRole.set(role || null); this.roleForm = role ? { key: role.name, name: role.label, description: role.description || '', permission_keys: [...role.permissions] } : { key: '', name: '', description: '', permission_keys: [] }; this.roleFormOpen.set(true); }
  openPermission(permission?: PermissionAdmin): void { this.editingPermission.set(permission || null); this.permissionForm = permission ? { key: permission.key, name: permission.name } : { key: '', name: '' }; this.permissionFormOpen.set(true); }
  closeForms(): void { this.roleFormOpen.set(false); this.permissionFormOpen.set(false); }
  togglePermission(key: string): void { this.roleForm.permission_keys = this.roleForm.permission_keys.includes(key) ? this.roleForm.permission_keys.filter((value) => value !== key) : [...this.roleForm.permission_keys, key]; }

  saveRole(): void {
    this.saving.set(true);
    const request = this.editingRole() ? this.api.updateRole(this.editingRole()!.id, this.roleForm) : this.api.createRole(this.roleForm);
    request.subscribe({ next: () => { this.closeForms(); this.saving.set(false); this.load(); }, error: (error) => { this.saving.set(false); this.showError(error); } });
  }

  savePermission(): void {
    this.saving.set(true);
    const request = this.editingPermission() ? this.api.updatePermission(this.editingPermission()!.id, { name: this.permissionForm.name }) : this.api.createPermission(this.permissionForm);
    request.subscribe({ next: () => { this.closeForms(); this.saving.set(false); this.load(); }, error: (error) => { this.saving.set(false); this.showError(error); } });
  }

  private showError(error: any): void { this.error.set(error?.error?.message || 'Unable to save access-control changes.'); }
}
