import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type IntelligentReportPeriod =
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'last_12_months'
  | 'this_year'
  | 'custom';
export type IntelligentReportScope = 'branch' | 'overall';

export interface IntelligentReportSummary {
  [key: string]:
    string | number | null | { count: number; amount: string } | { owner: number; tenant: number };
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

export interface ZaakiyAttentionItem {
  code: string;
  label: string;
  severity: 'critical' | 'attention' | 'info' | string;
  metric: string;
  observed_value: number | string;
  rule: string;
  branch?: string | null;
  references: Array<{ type: string; id: number; label: string }>;
}

export interface ZaakiyPeriodComparison {
  metric: string;
  label: string;
  current_value: number;
  comparison_value: number;
  absolute_delta: number;
  percentage_delta: number | null;
  direction: 'increase' | 'decrease' | 'unchanged';
  unit: 'AED' | 'percent' | 'count' | string;
}

export interface ZaakiyCollectionsSkill {
  title: string;
  status: 'available' | 'restricted';
  metrics: {
    collected_amount: string;
    payment_count: number;
    unique_tenant_count: number;
    outstanding_total: string;
    overdue_total: string;
    tenant_count_with_outstanding: number;
    tenant_count_with_overdue: number;
    pending_cheque_count: number;
    bounced_cheque_count: number;
  };
  aging: Array<{ bucket: string; amount: string }>;
  cheque_status: Array<{ status: string; count: number }>;
  top_overdue_tenants: Array<{
    id: number;
    customer_code: string;
    display_name: string;
    outstanding: string;
    overdue: string;
    agreement_count: number;
    branch?: string | null;
  }>;
  navigation: string;
  ask_zaakiy: string;
}

export interface ZaakiyVacancySkill {
  title: string;
  status: string;
  metrics: {
    eligible_property_count: number;
    occupied_property_count: number;
    vacant_property_count: number;
    future_occupied_property_count: number;
    occupancy_rate: number;
    vacancy_rate: number;
    vacant_properties_with_open_work_orders: number;
    open_work_orders_on_vacant_properties: number;
  };
  by_property_type: Array<{
    property_type: string;
    total: number;
    occupied: number;
    vacant: number;
  }>;
  vacancy_duration: Array<{ bucket: string; property_count: number }>;
  longest_vacant: Array<{
    id: number;
    property_code: string;
    name: string;
    property_type: string;
    vacancy_days: number | null;
    open_work_order_count: number;
    available_for_leasing: boolean;
    branch?: string | null;
  }>;
  navigation: string;
  ask_zaakiy: string;
}

export interface ZaakiyAgreementRiskSkill {
  title: string;
  status: string;
  metrics: {
    agreement_count_needing_attention: number;
    expiring_soon_count: number;
    overdue_balance_count: number;
    bounced_cheque_agreement_count: number;
    coverage_mismatch_count: number;
    total_outstanding_amount: string;
    total_overdue_amount: string;
  };
  signals: Array<{ code: string; agreement_count: number }>;
  flagged_agreements: Array<{
    id: number;
    type: string;
    agreement_no: string;
    party_name: string;
    properties: string | null;
    end_date: string;
    days_until_expiry: number;
    signals: string[];
    overdue: string;
    outstanding: string;
    route: string;
    branch?: string | null;
  }>;
  navigation: string;
  ask_zaakiy: string;
}

export interface ZaakiyRenewalsSkill {
  title: string;
  status: string;
  metrics: {
    renewal_candidate_count: number;
    tenant_renewal_count: number;
    owner_renewal_count: number;
    due_within_30_days_count: number;
    owner_renewals_affecting_occupied_properties: number;
    renewal_with_outstanding_count: number;
    renewal_with_overdue_count: number;
    renewal_outstanding_amount: string;
    renewal_overdue_amount: string;
  };
  signals: Array<{ code: string; agreement_count: number }>;
  candidates: Array<{
    id: number;
    type: string;
    agreement_no: string;
    party_name: string;
    properties: string | null;
    end_date: string;
    days_until_expiry: number;
    renewal_signals: string[];
    overdue: string;
    outstanding: string;
    occupied_impact: number;
    route: string;
    branch?: string | null;
  }>;
  navigation: string;
  ask_zaakiy: string;
}

export interface ZaakiyMaintenanceSkill {
  title: string;
  status: string;
  metrics: {
    open_work_order_count: number;
    properties_with_open_work_orders: number;
    high_priority_open_count: number;
    oldest_open_age_days: number | null;
    completed_work_order_count: number;
    maintenance_expenditure: string;
    petty_cash_expenditure: string;
  };
  aging: Array<{ bucket: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
  by_priority: Array<{ priority: string; count: number }>;
  oldest_open: Array<{
    id: number;
    work_order_no: string;
    title: string;
    priority: string;
    status: string;
    age_days: number;
    property_code: string;
    branch?: string | null;
  }>;
  navigation: string;
  ask_zaakiy: string;
}

export interface ZaakiyReportIntelligence {
  overview: {
    headline: string;
    highlights: string[];
    attention_items: ZaakiyAttentionItem[];
    period_comparisons: ZaakiyPeriodComparison[];
    suggested_prompts: string[];
  };
  skills: {
    collections: ZaakiyCollectionsSkill;
    vacancy: ZaakiyVacancySkill;
    agreement_risk: ZaakiyAgreementRiskSkill;
    renewals: ZaakiyRenewalsSkill;
    maintenance: ZaakiyMaintenanceSkill;
  };
}

export interface IntelligentReportData {
  scope: { type: IntelligentReportScope; branch_id: number | null; label: string };
  period: {
    key: IntelligentReportPeriod;
    from: string;
    to: string;
    granularity: string;
    comparison_from: string;
    comparison_to: string;
  };
  summary: IntelligentReportSummary;
  trends: {
    income_vs_cost: Array<{ period: string; income: string; cost: string }>;
    operational_result: Array<{ period: string; result: string }>;
  };
  findings: IntelligentFinding[];
  branch_comparison: Array<{
    branch_id: number;
    branch: string;
    operating_income: string;
    operating_cost: string;
    operational_result: string;
    margin: number | null;
  }>;
  zaakiy?: ZaakiyReportIntelligence;
  accounting_note: string;
}

@Injectable({ providedIn: 'root' })
export class IntelligentReportApiService {
  private http = inject(HttpClient);

  get(filters: {
    period: IntelligentReportPeriod;
    date_from?: string;
    date_to?: string;
    scope?: IntelligentReportScope;
  }): Observable<{ data: IntelligentReportData }> {
    let params = new HttpParams()
      .set('period', filters.period)
      .set('scope', filters.scope || 'branch');
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);
    return this.http.get<{ data: IntelligentReportData }>('/api/v1/reports/intelligent', {
      params,
    });
  }

  pdf(filters: {
    period: IntelligentReportPeriod;
    date_from?: string;
    date_to?: string;
    scope?: IntelligentReportScope;
  }): Observable<Blob> {
    let params = new HttpParams()
      .set('period', filters.period)
      .set('scope', filters.scope || 'branch');
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);
    return this.http.get('/api/v1/reports/intelligent/pdf', { params, responseType: 'blob' });
  }
}
