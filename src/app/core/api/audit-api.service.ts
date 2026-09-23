import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './api.models';

export interface AuditActor { id: number; name: string; email: string; }
export interface AuditBranch { id: number; name: string; }
export interface AuditLog { id: number; action: string; entity_type: string | null; entity_id: number | null; actor: AuditActor | null; branch: AuditBranch | null; before: Record<string, unknown> | null; after: Record<string, unknown> | null; metadata: Record<string, unknown> | null; created_at: string; }
export interface AuditFilters { date_from?: string; date_to?: string; actor_user_id?: number; action?: string; entity_type?: string; search?: string; page?: number; per_page?: number; }

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private http = inject(HttpClient);

  getLogs(filters: AuditFilters = {}): Observable<PaginatedResponse<AuditLog>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') params = params.set(key, String(value)); });
    return this.http.get<PaginatedResponse<AuditLog>>('/api/v1/audit-logs', { params });
  }
}
