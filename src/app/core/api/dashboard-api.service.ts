import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
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
}

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private http = inject(HttpClient);

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<ApiResponse<DashboardMetrics>>('/api/v1/dashboard/metrics').pipe(
      map((res) => res.data),
      catchError(() => {
        // Fallback default structure if backend endpoint returns 404
        return of({
          total_owners: 0,
          total_tenants: 0,
          total_properties: 0,
          total_owner_agreements: 0,
          total_tenant_agreements: 0,
          commenced_owner_agreements: 0,
          commenced_tenant_agreements: 0,
          expiring_soon_agreements: 0,
        });
      })
    );
  }
}
