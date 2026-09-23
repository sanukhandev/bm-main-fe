import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, ListQueryParams } from './api.models';
import {
  AgreementAction,
  PaymentMode,
  TenantAgreement,
} from '../../shared/models/agreement.models';

@Injectable({
  providedIn: 'root',
})
export class TenantAgreementsApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/tenant-agreements';

  getAgreements(params?: ListQueryParams): Observable<PaginatedResponse<TenantAgreement>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    return this.http.get<PaginatedResponse<TenantAgreement>>(this.baseUrl, { params: httpParams });
  }

  getAgreement(id: number): Observable<ApiResponse<TenantAgreement>> {
    return this.http.get<ApiResponse<TenantAgreement>>(`${this.baseUrl}/${id}`);
  }

  createAgreement(payload: Partial<TenantAgreement>): Observable<ApiResponse<TenantAgreement>> {
    return this.http.post<ApiResponse<TenantAgreement>>(this.baseUrl, payload);
  }

  updateAgreement(
    id: number,
    payload: Partial<TenantAgreement>,
  ): Observable<ApiResponse<TenantAgreement>> {
    return this.http.patch<ApiResponse<TenantAgreement>>(`${this.baseUrl}/${id}`, payload);
  }

  terminateAgreement(id: number, reason?: string): Observable<ApiResponse<TenantAgreement>> {
    return this.lifecycle(id, 'terminate', { reason: reason || 'Terminated via interface.' });
  }

  updateInstallmentStatus(
    agreementId: number,
    installmentId: number,
    status: 'paid' | 'defaulted',
  ): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.baseUrl}/${agreementId}/installments/${installmentId}/status`,
      { status },
    );
  }

  postPayment(
    id: number,
    payload: {
      installment_id: number;
      amount: number;
      payment_mode: PaymentMode;
      payment_date: string;
      remarks?: string;
      cheque_no?: string;
      cheque_date?: string;
      bank_name?: string;
      bank_reference?: string;
      transfer_date?: string;
    },
    idempotencyKey: string,
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/${id}/payments`, payload, {
      headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }),
    });
  }

  lifecycle(
    id: number,
    action: AgreementAction,
    payload: {
      reason?: string;
      new_end_date?: string;
      start_date?: string;
      end_date?: string;
    } = {},
  ): Observable<ApiResponse<TenantAgreement>> {
    return this.http.post<ApiResponse<TenantAgreement>>(`${this.baseUrl}/${id}/${action}`, payload);
  }
  transition(
    id: number,
    status: 'pending_approval' | 'approved' | 'commenced' | 'on_hold',
    reason?: string,
  ): Observable<ApiResponse<TenantAgreement>> {
    const action: AgreementAction =
      status === 'pending_approval'
        ? 'submit'
        : status === 'approved'
          ? 'approve'
          : status === 'on_hold'
            ? 'hold'
            : 'commence';
    return this.lifecycle(id, action, { reason });
  }
  raiseDispute(id: number, subject: string, description: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/${id}/disputes`, {
      subject,
      description,
    });
  }
  addDisputeComment(id: number, comment: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`/api/v1/agreement-disputes/${id}/comments`, {
      comment,
    });
  }
  addAdditionalPayment(
    id: number,
    payload: {
      direction: 'inward' | 'outward';
      category: string;
      particulars: string;
      amount: number;
      due_date: string;
      payment_mode: 'cash' | 'cheque' | 'bank_transfer';
      cheque_no?: string;
      cheque_date?: string;
      bank_name?: string;
      bank_reference?: string;
      transfer_date?: string;
      terms?: string;
    },
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/${id}/additional-payments`,
      payload,
    );
  }
  updateAdditionalPaymentStatus(
    agreementId: number,
    paymentId: number,
    status: 'paid' | 'defaulted',
  ): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.baseUrl}/${agreementId}/additional-payments/${paymentId}/status`,
      { status },
    );
  }
}
