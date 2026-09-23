import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, ListQueryParams } from './api.models';
import { Property, CreatePropertyDto } from '../../shared/models/property.models';

@Injectable({
  providedIn: 'root',
})
export class PropertiesApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/properties';

  getProperties(params?: ListQueryParams): Observable<PaginatedResponse<Property>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    return this.http.get<PaginatedResponse<Property>>(this.baseUrl, { params: httpParams });
  }

  getAvailableProperties(params: ListQueryParams): Observable<PaginatedResponse<Property>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') httpParams = httpParams.set(key, String(params[key]));
    });
    return this.http.get<PaginatedResponse<Property>>(`${this.baseUrl}/available`, { params: httpParams });
  }

  getProperty(id: number): Observable<ApiResponse<Property>> {
    return this.http.get<ApiResponse<Property>>(`${this.baseUrl}/${id}`);
  }

  createProperty(dto: CreatePropertyDto): Observable<ApiResponse<Property>> {
    return this.http.post<ApiResponse<Property>>(this.baseUrl, dto);
  }

  updateProperty(id: number, dto: Partial<CreatePropertyDto>): Observable<ApiResponse<Property>> {
    return this.http.patch<ApiResponse<Property>>(`${this.baseUrl}/${id}`, dto);
  }

  archiveProperty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
