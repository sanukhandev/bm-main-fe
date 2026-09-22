import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, ListQueryParams } from './api.models';
import { Customer, CreateCustomerDto } from '../../shared/models/customer.models';

@Injectable({
  providedIn: 'root',
})
export class CustomersApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/customers';

  getCustomers(params?: ListQueryParams): Observable<PaginatedResponse<Customer>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    return this.http.get<PaginatedResponse<Customer>>(this.baseUrl, { params: httpParams });
  }

  getCustomer(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.baseUrl}/${id}`);
  }

  createCustomer(dto: CreateCustomerDto): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(this.baseUrl, dto);
  }

  updateCustomer(id: number, dto: Partial<CreateCustomerDto>): Observable<ApiResponse<Customer>> {
    return this.http.patch<ApiResponse<Customer>>(`${this.baseUrl}/${id}`, dto);
  }

  archiveCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
