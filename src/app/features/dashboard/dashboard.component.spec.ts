import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NEVER, Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  summary: { owners: 12, tenants: 34, properties: 56, owner_agreements_active: 7, tenant_agreements_active: 18 },
  occupancy: { available_properties: 20, occupied_properties: 36 },
  agreements: { owner_expiring_30_days: 2, tenant_expiring_30_days: 3 },
  financial_attention: {
    tenant_receivables: '12500.00', owner_payables: '8400.00',
    overdue_tenant_installments: { count: 4, amount: '2300.00' }, pending_cheques: { count: 2, value: '5000.00' },
  },
  maintenance: { open_work_orders: 6, items: [{ id: 9, work_order_no: 'WO-009', title: 'Repair', priority: 'high', status: 'open', property_name: 'Flat 101', vendor_name: null, created_at: '2026-09-23T00:00:00Z' }] },
  expiring_agreements: [
    { id: 11, agreement_no: 'OA-011', agreement_type: 'owner', customer: 'Ahmed Owner', end_date: '2026-10-01', days_remaining: 8, status: 'commenced' },
    { id: 12, agreement_no: 'TA-012', agreement_type: 'tenant', customer: 'Sara Tenant', end_date: '2026-10-03', days_remaining: 10, status: 'approved' },
  ],
};

const accounts = { data: { today_inward: '0.00', today_outward: '0.00', today_net_movement: '0.00', month_inward: '0.00', month_outward: '0.00', month_net_movement: '0.00', petty_cash_balance: '0.00', tenant_outstanding_receivable: '0.00', owner_outstanding_payable: '0.00', pending_cheque_inward: '0.00', pending_cheque_outward: '0.00', recent_transactions: [] } };

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboard: { getMetrics: ReturnType<typeof vi.fn> };
  let branchChanged$: Subject<null>;

  beforeEach(async () => {
    dashboard = { getMetrics: vi.fn(() => of(metrics)) };
    branchChanged$ = new Subject<null>();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: DashboardApiService, useValue: dashboard },
        { provide: AccountsApiService, useValue: { getDashboard: vi.fn(() => of(accounts)) } },
        { provide: BranchContextService, useValue: { activeBranch: signal({ id: 1, name: 'Dubai' }), branchChanged$ } },
      ],
    }).compileComponents();
  });

  it('renders KPIs, occupancy, attention metrics, expiry items, and work orders', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Owners');
    expect(text).toContain('12');
    expect(text).toContain('34');
    expect(text).toContain('56');
    expect(text).toContain('7');
    expect(text).toContain('18');
    expect(text).toContain('Available today');
    expect(text).toContain('20');
    expect(text).toContain('Occupied today');
    expect(text).toContain('36');
    expect(text).toContain('Tenant Outstanding');
    expect(text).toContain('12,500.00');
    expect(text).toContain('Overdue Tenant Installments');
    expect(text).toContain('OA-011');
    expect(text).toContain('Ahmed Owner');
    expect(text).toContain('WO-009');
    expect(text).toContain('Flat 101');
  });

  it('provides owner, tenant, and work-order navigation links', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href="/app/owner-agreements/11"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/app/tenant-agreements/12"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/app/maintenance/work-orders/9"]')).toBeTruthy();
  });

  it('shows loading without rendering false zero KPIs', () => {
    dashboard.getMetrics.mockReturnValue(NEVER);
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('bm-loading-state')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Available today');
  });

  it('shows an error and retries without stale dashboard data', () => {
    dashboard.getMetrics.mockReturnValue(throwError(() => new Error('Dashboard unavailable')));
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBe('Dashboard unavailable');
    expect(fixture.nativeElement.textContent).toContain('Try again');
    fixture.componentInstance.loadData();
    expect(dashboard.getMetrics).toHaveBeenCalledTimes(2);
  });

  it('renders an empty branch as zero data, not an error', () => {
    dashboard.getMetrics.mockReturnValue(of({ total_owners: 0, total_tenants: 0, total_properties: 0, total_owner_agreements: 0, total_tenant_agreements: 0, summary: { owners: 0, tenants: 0, properties: 0, owner_agreements_active: 0, tenant_agreements_active: 0 }, occupancy: { available_properties: 0, occupied_properties: 0 }, agreements: { owner_expiring_30_days: 0, tenant_expiring_30_days: 0 }, financial_attention: null, maintenance: { open_work_orders: 0, items: [] }, expiring_agreements: [] }));
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('0');
    expect(fixture.nativeElement.textContent).not.toContain('Failed to load dashboard metrics');
  });

  it('does not render restricted financial values as zero', () => {
    dashboard.getMetrics.mockReturnValue(of({ ...metrics, financial_attention: null }));
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Financial details are restricted for this user.');
    expect(fixture.nativeElement.textContent).not.toContain('Tenant Outstanding');
  });
});
