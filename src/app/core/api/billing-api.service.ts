import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from './api.models';
import { Invoice, Quotation, BillingPayment } from '../../shared/models/billing.models';

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private http = inject(HttpClient); private base = '/api/v1';
  quotations(): Observable<PaginatedResponse<Quotation>> { return this.http.get<PaginatedResponse<Quotation>>(`${this.base}/quotations`, { params: { per_page: 100 } }); }
  quotation(id: number): Observable<ApiResponse<Quotation>> { return this.http.get<ApiResponse<Quotation>>(`${this.base}/quotations/${id}`); }
  createQuotation(payload: unknown): Observable<ApiResponse<Quotation>> { return this.http.post<ApiResponse<Quotation>>(`${this.base}/quotations`, payload); }
  updateQuotation(id: number, payload: unknown): Observable<ApiResponse<Quotation>> { return this.http.patch<ApiResponse<Quotation>>(`${this.base}/quotations/${id}`, payload); }
  deleteQuotation(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/quotations/${id}`); }
  convertQuotation(id: number): Observable<ApiResponse<Invoice>> { return this.http.post<ApiResponse<Invoice>>(`${this.base}/quotations/${id}/convert-to-invoice`, {}); }
  addQuotationPayment(id: number, payload: unknown): Observable<ApiResponse<BillingPayment>> { return this.http.post<ApiResponse<BillingPayment>>(`${this.base}/quotations/${id}/payments`, payload); }
  updateQuotationPayment(id: number, paymentId: number, status: string, key: string): Observable<ApiResponse<unknown>> { return this.http.patch<ApiResponse<unknown>>(`${this.base}/quotations/${id}/payments/${paymentId}/status`, { status }, { headers: new HttpHeaders({ 'Idempotency-Key': key }) }); }
  invoices(): Observable<PaginatedResponse<Invoice>> { return this.http.get<PaginatedResponse<Invoice>>(`${this.base}/invoices`, { params: { per_page: 100 } }); }
  invoice(id: number): Observable<ApiResponse<Invoice>> { return this.http.get<ApiResponse<Invoice>>(`${this.base}/invoices/${id}`); }
  createInvoice(payload: unknown): Observable<ApiResponse<Invoice>> { return this.http.post<ApiResponse<Invoice>>(`${this.base}/invoices`, payload); }
  updateInvoice(id: number, payload: unknown): Observable<ApiResponse<Invoice>> { return this.http.patch<ApiResponse<Invoice>>(`${this.base}/invoices/${id}`, payload); }
  deleteInvoice(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/invoices/${id}`); }
  addInvoicePayment(id: number, payload: unknown): Observable<ApiResponse<BillingPayment>> { return this.http.post<ApiResponse<BillingPayment>>(`${this.base}/invoices/${id}/payments`, payload); }
  updateInvoicePayment(id: number, paymentId: number, status: string, key: string): Observable<ApiResponse<unknown>> { return this.http.patch<ApiResponse<unknown>>(`${this.base}/invoices/${id}/payments/${paymentId}/status`, { status }, { headers: new HttpHeaders({ 'Idempotency-Key': key }) }); }
}
