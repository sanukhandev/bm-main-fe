import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, ListQueryParams } from './api.models';
import { Branch } from '../branch-context/branch.models';
import { UserAdmin, RoleAdmin } from '../../shared/models/admin.models';

@Injectable({
  providedIn: 'root',
})
export class AdministrationApiService {
  private http = inject(HttpClient);

  // Branches
  getBranches(): Observable<ApiResponse<Branch[]>> {
    return this.http.get<ApiResponse<Branch[]>>('/api/v1/auth/branches');
  }

  createBranch(data: Partial<Branch>): Observable<ApiResponse<Branch>> {
    return this.http.post<ApiResponse<Branch>>('/api/v1/admin/branches', data);
  }

  updateBranch(id: number, data: Partial<Branch>): Observable<ApiResponse<Branch>> {
    return this.http.patch<ApiResponse<Branch>>(`/api/v1/admin/branches/${id}`, data);
  }

  // Users
  getUsers(params?: ListQueryParams): Observable<PaginatedResponse<UserAdmin>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    return this.http.get<PaginatedResponse<UserAdmin>>('/api/v1/admin/users', {
      params: httpParams,
    });
  }

  createUser(data: Partial<UserAdmin>): Observable<ApiResponse<UserAdmin>> {
    return this.http.post<ApiResponse<UserAdmin>>('/api/v1/admin/users', data);
  }

  updateUser(id: number, data: Partial<UserAdmin>): Observable<ApiResponse<UserAdmin>> {
    return this.http.patch<ApiResponse<UserAdmin>>(`/api/v1/admin/users/${id}`, data);
  }

  // Roles
  getRoles(): Observable<ApiResponse<RoleAdmin[]>> {
    return this.http.get<ApiResponse<RoleAdmin[]>>('/api/v1/admin/roles');
  }
}
