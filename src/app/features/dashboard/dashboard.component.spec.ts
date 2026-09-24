import { Injector, signal } from '@angular/core';
import { NEVER, Subject, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AccountsApiService } from '../../core/api/accounts-api.service';
import { DashboardApiService, DashboardMetrics } from '../../core/api/dashboard-api.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { DashboardComponent } from './dashboard.component';

const metrics: DashboardMetrics = {
  total_owners: 12,
  total_tenants: 34,
  total_properties: 56,
  total_owner_agreements: 7,
  total_tenant_agreements: 18,
  summary: {
    owners: 12,
    tenants: 34,
    properties: 56,
    owner_agreements_active: 7,
    tenant_agreements_active: 18,
  },
  occupancy: { available_properties: 20, occupied_properties: 36 },
  agreements: { owner_expiring_30_days: 2, tenant_expiring_30_days: 3 },
  financial_attention: {
    tenant_receivables: '12500.00',
    owner_payables: '8400.00',
    overdue_tenant_installments: { count: 4, amount: '2300.00' },
    pending_cheques: { count: 2, value: '5000.00' },
  },
  maintenance: {
    open_work_orders: 6,
    items: [
      {
        id: 9,
        work_order_no: 'WO-009',
        title: 'Repair',
        priority: 'high',
        status: 'open',
        property_name: 'Flat 101',
        vendor_name: null,
        created_at: '2026-09-23T00:00:00Z',
      },
    ],
  },
  expiring_agreements: [
    {
      id: 11,
      agreement_no: 'OA-011',
      agreement_type: 'owner',
      customer: 'Ahmed Owner',
      end_date: '2026-10-01',
      days_remaining: 8,
      status: 'commenced',
    },
    {
      id: 12,
      agreement_no: 'TA-012',
      agreement_type: 'tenant',
      customer: 'Sara Tenant',
      end_date: '2026-10-03',
      days_remaining: 10,
      status: 'approved',
    },
  ],
};

const accounts = {
  data: {
    today_inward: '1000.00',
    today_outward: '500.00',
    today_net_movement: '500.00',
    month_inward: '12000.00',
    month_outward: '4000.00',
    month_net_movement: '8000.00',
    petty_cash_balance: '2500.00',
    tenant_outstanding_receivable: '12500.00',
    owner_outstanding_payable: '8400.00',
    pending_cheque_inward: '5000.00',
    pending_cheque_outward: '2000.00',
    recent_transactions: [],
  },
};

describe('DashboardComponent', () => {
  function createComponent(
    options: {
      dashboardApi?: any;
      accountsApi?: any;
      activeBranch?: any;
    } = {},
  ) {
    const dashboardApi = options.dashboardApi || { getMetrics: vi.fn(() => of(metrics)) };
    const accountsApi = options.accountsApi || { getDashboard: vi.fn(() => of(accounts)) };
    const branchContext = {
      activeBranch: signal(options.activeBranch ?? { id: 1, name: 'Dubai' }),
      branchChanged$: new Subject<null>(),
    };

    const injector = Injector.create({
      providers: [
        { provide: DashboardComponent, useClass: DashboardComponent },
        { provide: DashboardApiService, useValue: dashboardApi },
        { provide: AccountsApiService, useValue: accountsApi },
        { provide: BranchContextService, useValue: branchContext },
      ],
    });

    return {
      component: injector.get(DashboardComponent),
      dashboardApi,
      accountsApi,
      branchContext,
    };
  }

  it('loads operational metrics and accounts snapshot on init', () => {
    const { component } = createComponent();
    component.ngOnInit();

    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.metrics()?.total_owners).toBe(12);
    expect(component.metrics()?.total_tenants).toBe(34);
    expect(component.accountsSnapshot()?.petty_cash_balance).toBe('2500.00');
  });

  it('handles net cash movement calculations', () => {
    const { component } = createComponent();
    component.ngOnInit();
    expect(component.isNetMovementNegative()).toBe(false);
    expect(component.formatMoney('12500')).toBe('12,500.00');
  });

  it('shows loading state when API request is pending', () => {
    const dashboardApi = { getMetrics: vi.fn(() => NEVER) };
    const { component } = createComponent({ dashboardApi });
    component.ngOnInit();

    expect(component.isLoading()).toBe(true);
    expect(component.metrics()).toBeNull();
  });

  it('captures API error message when metrics request fails', () => {
    const dashboardApi = {
      getMetrics: vi.fn(() => throwError(() => new Error('Dashboard unavailable'))),
    };
    const { component } = createComponent({ dashboardApi });
    component.ngOnInit();

    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBe('Dashboard unavailable');
    expect(component.metrics()).toBeNull();
  });

  it('handles empty branch data without throwing an error', () => {
    const emptyMetrics = {
      total_owners: 0,
      total_tenants: 0,
      total_properties: 0,
      total_owner_agreements: 0,
      total_tenant_agreements: 0,
    };
    const dashboardApi = { getMetrics: vi.fn(() => of(emptyMetrics)) };
    const { component } = createComponent({ dashboardApi, activeBranch: null });
    component.ngOnInit();

    expect(component.error()).toBeNull();
    expect(component.metrics()?.total_owners).toBe(0);
  });

  it('handles restricted financial values safely', () => {
    const dashboardApi = { getMetrics: vi.fn(() => of({ ...metrics, financial_attention: null })) };
    const { component } = createComponent({ dashboardApi });
    component.ngOnInit();

    expect(component.error()).toBeNull();
    expect(component.metrics()?.financial_attention).toBeNull();
  });
});
