import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, ListQueryParams } from './api.models';
import { TenantAgreement } from '../../shared/models/agreement.models';

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

  updateAgreement(id: number, payload: Partial<TenantAgreement>): Observable<ApiResponse<TenantAgreement>> {
    return this.http.patch<ApiResponse<TenantAgreement>>(`${this.baseUrl}/${id}`, payload);
  }

  terminateAgreement(id: number, reason?: string): Observable<ApiResponse<TenantAgreement>> {
    return this.http.delete<ApiResponse<TenantAgreement>>(`${this.baseUrl}/${id}`, {
      body: { reason: reason || 'Terminated via interface.' },
    });
  }

  updateInstallmentStatus(agreementId: number, installmentId: number, status: 'paid' | 'defaulted'): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.baseUrl}/${agreementId}/installments/${installmentId}/status`, { status });
  }

  transition(id: number, status: 'approved' | 'commenced' | 'on_hold' | 'terminated', reason?: string): Observable<ApiResponse<TenantAgreement>> { return this.http.patch<ApiResponse<TenantAgreement>>(`${this.baseUrl}/${id}/status`, { status, reason }); }
  raiseDispute(id: number, subject: string, description: string): Observable<ApiResponse<unknown>> { return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/${id}/disputes`, { subject, description }); }
  addDisputeComment(id: number, comment: string): Observable<ApiResponse<unknown>> { return this.http.post<ApiResponse<unknown>>(`/api/v1/agreement-disputes/${id}/comments`, { comment }); }
  addAdditionalPayment(id: number, payload: { direction: 'inward' | 'outward'; category: string; amount: number; terms?: string }): Observable<ApiResponse<unknown>> { return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/${id}/additional-payments`, payload); }

}
