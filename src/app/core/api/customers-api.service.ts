import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, ListQueryParams } from './api.models';
import { Customer, CustomerProfile, CreateCustomerDto } from '../../shared/models/customer.models';

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

  getCustomerProfile(id: number): Observable<ApiResponse<{ customer: Customer; profile: CustomerProfile }>> {
    return this.http.get<ApiResponse<{ customer: Customer; profile: CustomerProfile }>>(`${this.baseUrl}/${id}/profile`);
  }

  createCustomer(dto: CreateCustomerDto): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(this.baseUrl, dto);
  }

  extractIdentity(document: File, role: 'owner' | 'tenant'): Observable<ApiResponse<IdentityExtraction>> {
    const form = new FormData();
    form.append('document', document);
    form.append('role', role);
    return this.http.post<ApiResponse<IdentityExtraction>>(`${this.baseUrl}/identity-extract`, form);
  }

  updateCustomer(id: number, dto: Partial<CreateCustomerDto>): Observable<ApiResponse<Customer>> {
    return this.http.patch<ApiResponse<Customer>>(`${this.baseUrl}/${id}`, dto);
  }

  archiveCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export interface IdentityExtraction {
  fields: Partial<Pick<Customer, 'display_name' | 'legal_name' | 'identity_no' | 'country_code' | 'state_or_emirate' | 'city' | 'address_line_1'>>;
  confidence: Record<string, number>;
  warnings: string[];
}
