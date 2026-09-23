import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { DashboardApiService } from './dashboard-api.service';

describe('DashboardApiService', () => {
  let service: DashboardApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DashboardApiService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DashboardApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the typed operational dashboard read model', () => {
    let result: unknown;
    service.getMetrics().subscribe((data) => (result = data));

    const request = http.expectOne('/api/v1/dashboard/operational');
    expect(request.request.method).toBe('GET');
    request.flush({ data: { summary: { owners: 2, tenants: 3, properties: 4, owner_agreements_active: 1, tenant_agreements_active: 2 } } });

    expect(result).toEqual({ summary: { owners: 2, tenants: 3, properties: 4, owner_agreements_active: 1, tenant_agreements_active: 2 } });
  });
});
