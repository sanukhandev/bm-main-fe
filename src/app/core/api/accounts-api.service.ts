import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ListQueryParams, PaginatedResponse } from './api.models';

export type AccountDirection = 'inward' | 'outward';
export type PaymentMode = 'cash' | 'cheque' | 'bank_transfer';

export interface AccountTransaction {
  id: number;
  document_no: string;
  direction: AccountDirection;
  transaction_date: string;
  payment_mode: PaymentMode;
  amount: string;
  remarks: string | null;
  cheque_no: string | null;
  cheque_date: string | null;
  bank_name: string | null;
  bank_reference: string | null;
  transfer_date: string | null;
  status: 'draft' | 'posted' | 'void';
  cheque_status?: 'received' | 'deposited' | 'cleared' | 'bounced' | 'cancelled' | null;
  voided_at?: string | null;
  void_reason?: string | null;
  party?: { id: number; display_name: string; customer_code: string } | null;
}

export interface AccountsDashboardSnapshot {
  today_inward: string;
  today_outward: string;
  today_net_movement: string;
  month_inward: string;
  month_outward: string;
  month_net_movement: string;
  petty_cash_balance: string;
  tenant_outstanding_receivable: string;
  owner_outstanding_payable: string;
  pending_cheque_inward: string;
  pending_cheque_outward: string;
  recent_transactions: RecentAccountTransaction[];
}

export interface RecentAccountTransaction {
  id: number; document_no: string; direction: AccountDirection; transaction_date: string;
  payment_mode: PaymentMode; amount: string; status: string; party: string | null; particulars: string | null;
}

export interface PettyCashDaybookResponse {
  data: AccountTransaction[];
  meta: { opening_balance: string; total_in: string; total_out: string; closing_balance: string };
}

export interface DailyMovement { date: string; inward: string; outward: string; net: string; }
export interface PaymentModeSummary { payment_mode: PaymentMode; direction: AccountDirection; count: number; amount: string; }
export interface PettyCashRequest { transaction_date: string; direction: AccountDirection; amount: number; particulars: string; category?: string; remarks?: string; }

@Injectable({ providedIn: 'root' })
export class AccountsApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/accounts';

  getDashboard(): Observable<ApiResponse<AccountsDashboardSnapshot>> {
    return this.http.get<ApiResponse<AccountsDashboardSnapshot>>(`${this.baseUrl}/dashboard`);
  }

  getTransactions(direction: AccountDirection, params: ListQueryParams = {}): Observable<PaginatedResponse<AccountTransaction>> {
    let httpParams = new HttpParams();
    Object.entries({ page: 1, per_page: 25, ...params }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') httpParams = httpParams.set(key, String(value));
    });
    return this.http.get<PaginatedResponse<AccountTransaction>>(`${this.baseUrl}/${direction}`, { params: httpParams });
  }

  getPettyCash(): Observable<PettyCashDaybookResponse> {
    return this.http.get<PettyCashDaybookResponse>(`${this.baseUrl}/petty-cash/daybook`);
  }

  createPettyCash(payload: PettyCashRequest): Observable<ApiResponse<AccountTransaction>> {
    return this.http.post<ApiResponse<AccountTransaction>>(`${this.baseUrl}/petty-cash`, payload);
  }

  voidTransaction(id: number, reason: string): Observable<ApiResponse<AccountTransaction>> {
    return this.http.post<ApiResponse<AccountTransaction>>(`${this.baseUrl}/transactions/${id}/void`, { reason }, { headers: new HttpHeaders({ 'Idempotency-Key': `void-${id}-${Date.now()}` }) });
  }

  chequeAction(id: number, action: 'deposit' | 'clear' | 'bounce' | 'cancel'): Observable<ApiResponse<AccountTransaction>> {
    return this.http.post<ApiResponse<AccountTransaction>>(`${this.baseUrl}/transactions/${id}/cheque/${action}`, {});
  }

  getDailyMovement(): Observable<ApiResponse<DailyMovement[]>> {
    return this.http.get<ApiResponse<DailyMovement[]>>(`${this.baseUrl}/reports/daily-movement`);
  }

  getPaymentModeSummary(): Observable<ApiResponse<PaymentModeSummary[]>> {
    return this.http.get<ApiResponse<PaymentModeSummary[]>>(`${this.baseUrl}/reports/payment-modes`);
  }
}
