import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from './api.models';

export interface DashboardMetrics {
  total_owners: number;
  total_tenants: number;
  total_properties: number;
  total_owner_agreements: number;
  total_tenant_agreements: number;
  commenced_owner_agreements?: number;
  commenced_tenant_agreements?: number;
  expiring_soon_agreements?: number;
  summary?: {
    owners: number;
    tenants: number;
    properties: number;
    owner_agreements_active: number;
    tenant_agreements_active: number;
  };
  occupancy?: { available_properties: number; occupied_properties: number };
  agreements?: { owner_expiring_30_days: number; tenant_expiring_30_days: number };
  financial_attention?: {
    tenant_receivables: string;
    owner_payables: string;
    overdue_tenant_installments: { count: number; amount: string };
    pending_cheques: { count: number; value: string };
  } | null;
  maintenance?: {
    open_work_orders: number;
    items: Array<{
      id: number;
      work_order_no: string;
      title: string;
      priority: string;
      status: string;
      property_name: string;
      vendor_name: string | null;
      created_at: string;
    }>;
  };
  expiring_agreements?: Array<{
    id: number;
    agreement_no: string;
    agreement_type: 'owner' | 'tenant';
    customer: string;
    end_date: string;
    days_remaining: number;
    status: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private http = inject(HttpClient);

  getMetrics(): Observable<DashboardMetrics> {
    return this.http
      .get<ApiResponse<DashboardMetrics>>('/api/v1/dashboard/operational')
      .pipe(map((res) => res.data));
  }
}
