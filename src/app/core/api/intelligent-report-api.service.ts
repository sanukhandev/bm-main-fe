import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type IntelligentReportPeriod = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_12_months' | 'this_year' | 'custom';
export type IntelligentReportScope = 'branch' | 'overall';

export interface IntelligentReportSummary {
  [key: string]: string | number | null | { count: number; amount: string } | { owner: number; tenant: number };
  operational_profit_loss: string;
  operating_margin_percent: number | null;
  operating_income: string;
  operating_cost: string;
  net_cash_movement: string;
  collection_efficiency_percent: number | null;
  total_inward: string;
  total_outward: string;
  tenant_receivables: string;
  owner_payables: string;
  pending_cheque_value: string;
  bounced_cheque_value: string;
  maintenance_expenditure: string;
  petty_cash_expenditure: string;
  occupied_properties: number;
  available_properties: number;
  occupancy_percent: number | null;
  overdue_installments: { count: number; amount: string };
  expiring_agreements: { owner: number; tenant: number };
}

export interface IntelligentFinding {
  type: string;
  severity: string;
  title: string;
  amount?: string;
  description: string;
  calculation_basis: string;
  navigation?: string;
}

export interface IntelligentReportData {
  scope: { type: IntelligentReportScope; branch_id: number | null; label: string };
  period: { key: IntelligentReportPeriod; from: string; to: string; granularity: string; comparison_from: string; comparison_to: string };
  summary: IntelligentReportSummary;
  trends: { income_vs_cost: Array<{ period: string; income: string; cost: string }>; operational_result: Array<{ period: string; result: string }> };
  findings: IntelligentFinding[];
  branch_comparison: Array<{ branch_id: number; branch: string; operating_income: string; operating_cost: string; operational_result: string; margin: number | null }>;
  accounting_note: string;
}

@Injectable({ providedIn: 'root' })
export class IntelligentReportApiService {
  private http = inject(HttpClient);

  get(filters: { period: IntelligentReportPeriod; date_from?: string; date_to?: string; scope?: IntelligentReportScope }): Observable<{ data: IntelligentReportData }> {
    let params = new HttpParams().set('period', filters.period).set('scope', filters.scope || 'branch');
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);
    return this.http.get<{ data: IntelligentReportData }>('/api/v1/reports/intelligent', { params });
  }

  pdf(filters: { period: IntelligentReportPeriod; date_from?: string; date_to?: string; scope?: IntelligentReportScope }): Observable<Blob> {
    let params = new HttpParams().set('period', filters.period).set('scope', filters.scope || 'branch');
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);
    return this.http.get('/api/v1/reports/intelligent/pdf', { params, responseType: 'blob' });
  }
}
