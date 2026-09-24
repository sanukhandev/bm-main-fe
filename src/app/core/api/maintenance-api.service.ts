import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from './api.models';
import { InventoryItem, Vendor, WorkOrder } from '../../shared/models/maintenance.models';

@Injectable({ providedIn: 'root' })
export class MaintenanceApiService {
  private http = inject(HttpClient);
  private base = '/api/v1/maintenance';
  private params(search?: string): HttpParams {
    return search ? new HttpParams().set('search', search) : new HttpParams();
  }
  vendors(search?: string): Observable<PaginatedResponse<Vendor>> {
    return this.http.get<PaginatedResponse<Vendor>>(`${this.base}/vendors`, {
      params: this.params(search),
    });
  }
  createVendor(payload: Partial<Vendor>): Observable<ApiResponse<Vendor>> {
    return this.http.post<ApiResponse<Vendor>>(`${this.base}/vendors`, payload);
  }
  updateVendor(id: number, payload: Partial<Vendor>): Observable<ApiResponse<Vendor>> {
    return this.http.patch<ApiResponse<Vendor>>(`${this.base}/vendors/${id}`, payload);
  }
  deleteVendor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/vendors/${id}`);
  }
  inventory(search?: string): Observable<PaginatedResponse<InventoryItem>> {
    return this.http.get<PaginatedResponse<InventoryItem>>(`${this.base}/inventory`, {
      params: this.params(search),
    });
  }
  createInventory(payload: Record<string, unknown>): Observable<ApiResponse<InventoryItem>> {
    return this.http.post<ApiResponse<InventoryItem>>(`${this.base}/inventory`, payload);
  }
  updateInventory(
    id: number,
    payload: Record<string, unknown>,
  ): Observable<ApiResponse<InventoryItem>> {
    return this.http.patch<ApiResponse<InventoryItem>>(`${this.base}/inventory/${id}`, payload);
  }
  deleteInventory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/inventory/${id}`);
  }
  workOrders(search?: string): Observable<PaginatedResponse<WorkOrder>> {
    return this.http.get<PaginatedResponse<WorkOrder>>(`${this.base}/work-orders`, {
      params: this.params(search),
    });
  }
  workOrder(id: number): Observable<ApiResponse<WorkOrder>> {
    return this.http.get<ApiResponse<WorkOrder>>(`${this.base}/work-orders/${id}`);
  }
  createWorkOrder(payload: Record<string, unknown>): Observable<ApiResponse<WorkOrder>> {
    return this.http.post<ApiResponse<WorkOrder>>(`${this.base}/work-orders`, payload);
  }
  updateWorkOrder(
    id: number,
    payload: Record<string, unknown>,
  ): Observable<ApiResponse<WorkOrder>> {
    return this.http.patch<ApiResponse<WorkOrder>>(`${this.base}/work-orders/${id}`, payload);
  }
  addWorkOrderPayment(
    id: number,
    payload: Record<string, unknown>,
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.base}/work-orders/${id}/payments`, payload);
  }
  updateWorkOrderPaymentStatus(
    id: number,
    paymentId: number,
    status: 'paid' | 'defaulted',
    key: string,
  ): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.base}/work-orders/${id}/payments/${paymentId}/status`,
      { status },
      { headers: new HttpHeaders({ 'Idempotency-Key': key }) },
    );
  }
  updateWorkOrderStatus(id: number, status: string): Observable<ApiResponse<WorkOrder>> {
    return this.http.patch<ApiResponse<WorkOrder>>(`${this.base}/work-orders/${id}/status`, {
      status,
    });
  }
}
