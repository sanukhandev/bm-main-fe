import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ReportType =
  | 'owner-agreements'
  | 'tenant-agreements'
  | 'agreement-expiry'
  | 'tenant-outstanding'
  | 'owner-payables'
  | 'inward-receipts'
  | 'outward-vouchers'
  | 'daily-cash-movement'
  | 'petty-cash';

export interface ReportRow {
  [key: string]: string | number | null | ReportRow[];
}
export interface ReportSummary {
  [key: string]: string | number | null;
}
export interface ReportResponse {
  data: ReportRow[];
  links?: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    summary?: ReportSummary;
  };
  summary?: ReportSummary;
}
export interface ReportFilters {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  per_page?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private http = inject(HttpClient);

  get(type: ReportType, filters: ReportFilters = {}): Observable<ReportResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    });
    return this.http.get<ReportResponse>(`/api/v1/reports/${type}`, { params });
  }
}
