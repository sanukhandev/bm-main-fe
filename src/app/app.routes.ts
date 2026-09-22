import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      // Customers
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers-list.component').then(
            (m) => m.CustomersListComponent
          ),
      },
      {
        path: 'customers/owners',
        loadComponent: () => import('./features/customers/customers-list.component').then((m) => m.CustomersListComponent),
      },
      {
        path: 'customers/owners/new',
        loadComponent: () => import('./features/customers/customer-form.component').then((m) => m.CustomerFormComponent),
      },
      {
        path: 'customers/owners/:id/edit',
        loadComponent: () => import('./features/customers/customer-form.component').then((m) => m.CustomerFormComponent),
      },
      {
        path: 'customers/tenants',
        loadComponent: () => import('./features/customers/customers-list.component').then((m) => m.CustomersListComponent),
      },
      {
        path: 'customers/tenants/new',
        loadComponent: () => import('./features/customers/customer-form.component').then((m) => m.CustomerFormComponent),
      },
      {
        path: 'customers/tenants/:id/edit',
        loadComponent: () => import('./features/customers/customer-form.component').then((m) => m.CustomerFormComponent),
      },
      {
        path: 'customers/new',
        loadComponent: () =>
          import('./features/customers/customer-form.component').then(
            (m) => m.CustomerFormComponent
          ),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/customers/customer-detail.component').then(
            (m) => m.CustomerDetailComponent
          ),
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () =>
          import('./features/customers/customer-form.component').then(
            (m) => m.CustomerFormComponent
          ),
      },
      // Properties
      {
        path: 'properties',
        loadComponent: () =>
          import('./features/properties/properties-list.component').then(
            (m) => m.PropertiesListComponent
          ),
      },
      {
        path: 'properties/new',
        loadComponent: () =>
          import('./features/properties/property-form.component').then(
            (m) => m.PropertyFormComponent
          ),
      },
      {
        path: 'properties/:id',
        loadComponent: () =>
          import('./features/properties/property-detail.component').then(
            (m) => m.PropertyDetailComponent
          ),
      },
      {
        path: 'properties/:id/edit',
        loadComponent: () =>
          import('./features/properties/property-form.component').then(
            (m) => m.PropertyFormComponent
          ),
      },
      // Owner Agreements
      {
        path: 'owner-agreements',
        loadComponent: () =>
          import('./features/owner-agreements/owner-agreements-list.component').then(
            (m) => m.OwnerAgreementsListComponent
          ),
      },
      {
        path: 'owner-agreements/new',
        loadComponent: () =>
          import('./features/owner-agreements/owner-agreement-form.component').then(
            (m) => m.OwnerAgreementFormComponent
          ),
      },
      {
        path: 'owner-agreements/:id',
        loadComponent: () =>
          import('./features/owner-agreements/owner-agreement-detail.component').then(
            (m) => m.OwnerAgreementDetailComponent
          ),
      },
      {
        path: 'owner-agreements/:id/edit',
        loadComponent: () =>
          import('./features/owner-agreements/owner-agreement-form.component').then(
            (m) => m.OwnerAgreementFormComponent
          ),
      },
      // Tenant Agreements
      {
        path: 'tenant-agreements',
        loadComponent: () =>
          import('./features/tenant-agreements/tenant-agreements-list.component').then(
            (m) => m.TenantAgreementsListComponent
          ),
      },
      {
        path: 'tenant-agreements/new',
        loadComponent: () =>
          import('./features/tenant-agreements/tenant-agreement-form.component').then(
            (m) => m.TenantAgreementFormComponent
          ),
      },
      {
        path: 'tenant-agreements/:id',
        loadComponent: () =>
          import('./features/tenant-agreements/tenant-agreement-detail.component').then(
            (m) => m.TenantAgreementDetailComponent
          ),
      },
      {
        path: 'tenant-agreements/:id/edit',
        loadComponent: () =>
          import('./features/tenant-agreements/tenant-agreement-form.component').then(
            (m) => m.TenantAgreementFormComponent
          ),
      },
      // Accounts
      {
        path: 'accounts/dashboard',
        loadComponent: () => import('./features/accounts/accounts-dashboard.component').then((m) => m.AccountsDashboardComponent),
      },
      {
        path: 'accounts/inward', data: { direction: 'inward' },
        loadComponent: () => import('./features/accounts/account-transactions-list.component').then((m) => m.AccountTransactionsListComponent),
      },
      {
        path: 'accounts/outward', data: { direction: 'outward' },
        loadComponent: () => import('./features/accounts/account-transactions-list.component').then((m) => m.AccountTransactionsListComponent),
      },
      {
        path: 'accounts/petty-cash',
        loadComponent: () => import('./features/accounts/petty-cash.component').then((m) => m.PettyCashComponent),
      },
      {
        path: 'accounts/reports',
        loadComponent: () => import('./features/accounts/accounts-reports.component').then((m) => m.AccountsReportsComponent),
      },
      { path: 'maintenance/work-orders/new', loadComponent: () => import('./features/maintenance/work-order-form.component').then((m) => m.WorkOrderFormComponent) },
      { path: 'maintenance/work-orders/:id', loadComponent: () => import('./features/maintenance/work-order-detail.component').then((m) => m.WorkOrderDetailComponent) },
      { path: 'maintenance/work-orders', data: { section: 'work-orders', title: 'Work Orders' }, loadComponent: () => import('./features/maintenance/maintenance.component').then((m) => m.MaintenanceComponent) },
      { path: 'maintenance/vendors', data: { section: 'vendors', title: 'Vendors' }, loadComponent: () => import('./features/maintenance/maintenance.component').then((m) => m.MaintenanceComponent) },
      { path: 'maintenance/inventory', data: { section: 'inventory', title: 'Inventory' }, loadComponent: () => import('./features/maintenance/maintenance.component').then((m) => m.MaintenanceComponent) },
      { path: 'billing/quotations/new', data: { type: 'quotations' }, loadComponent: () => import('./features/billing/billing-form.component').then((m) => m.BillingFormComponent) },
      { path: 'billing/quotations/:id/edit', data: { type: 'quotations' }, loadComponent: () => import('./features/billing/billing-form.component').then((m) => m.BillingFormComponent) },
      { path: 'billing/quotations/:id', data: { type: 'quotations' }, loadComponent: () => import('./features/billing/billing-detail.component').then((m) => m.BillingDetailComponent) },
      { path: 'billing/quotations', data: { type: 'quotations' }, loadComponent: () => import('./features/billing/billing.component').then((m) => m.BillingComponent) },
      { path: 'billing/invoices/new', data: { type: 'invoices' }, loadComponent: () => import('./features/billing/billing-form.component').then((m) => m.BillingFormComponent) },
      { path: 'billing/invoices/:id/edit', data: { type: 'invoices' }, loadComponent: () => import('./features/billing/billing-form.component').then((m) => m.BillingFormComponent) },
      { path: 'billing/invoices/:id', data: { type: 'invoices' }, loadComponent: () => import('./features/billing/billing-detail.component').then((m) => m.BillingDetailComponent) },
      { path: 'billing/invoices', data: { type: 'invoices' }, loadComponent: () => import('./features/billing/billing.component').then((m) => m.BillingComponent) },
      // Administration (Super Admin Only)
      {
        path: 'administration/branches',
        canActivate: [superAdminGuard],
        loadComponent: () =>
          import('./features/administration/branches/branches-list.component').then(
            (m) => m.BranchesListComponent
          ),
      },
      {
        path: 'administration/users',
        canActivate: [superAdminGuard],
        loadComponent: () =>
          import('./features/administration/users/users-list.component').then(
            (m) => m.UsersListComponent
          ),
      },
      {
        path: 'administration/roles',
        canActivate: [superAdminGuard],
        loadComponent: () =>
          import('./features/administration/roles/roles-list.component').then(
            (m) => m.RolesListComponent
          ),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/app/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/app/dashboard',
  },
];
