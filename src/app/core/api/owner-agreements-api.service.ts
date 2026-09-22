import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, ListQueryParams } from './api.models';
import { OwnerAgreement } from '../../shared/models/agreement.models';

@Injectable({
  providedIn: 'root',
})
export class OwnerAgreementsApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/owner-agreements';

  getAgreements(params?: ListQueryParams): Observable<PaginatedResponse<OwnerAgreement>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    return this.http.get<PaginatedResponse<OwnerAgreement>>(this.baseUrl, { params: httpParams });
  }

  getAgreement(id: number): Observable<ApiResponse<OwnerAgreement>> {
    return this.http.get<ApiResponse<OwnerAgreement>>(`${this.baseUrl}/${id}`);
  }

  createAgreement(payload: Partial<OwnerAgreement>): Observable<ApiResponse<OwnerAgreement>> {
    return this.http.post<ApiResponse<OwnerAgreement>>(this.baseUrl, payload);
  }

  updateAgreement(id: number, payload: Partial<OwnerAgreement>): Observable<ApiResponse<OwnerAgreement>> {
    return this.http.patch<ApiResponse<OwnerAgreement>>(`${this.baseUrl}/${id}`, payload);
  }

  terminateAgreement(id: number, reason?: string): Observable<ApiResponse<OwnerAgreement>> {
    return this.http.delete<ApiResponse<OwnerAgreement>>(`${this.baseUrl}/${id}`, {
      body: { reason: reason || 'Terminated via interface.' },
    });
  }

  // Lifecycle status updates (submit, approve, etc.)
  updateStatus(id: number, status: string, reason?: string): Observable<ApiResponse<OwnerAgreement>> {
    return this.http.patch<ApiResponse<OwnerAgreement>>(`${this.baseUrl}/${id}/status`, { status, reason });
  }
}
