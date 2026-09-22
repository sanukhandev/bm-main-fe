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

}
