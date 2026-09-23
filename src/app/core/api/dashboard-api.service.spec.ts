import { describe, expect, it } from 'vitest';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { DashboardApiService } from './dashboard-api.service';

describe('DashboardApiService', () => {
  it('loads the typed operational dashboard read model', () => {
    const mockHttp = {
      get: (url: string) => {
        expect(url).toBe('/api/v1/dashboard/operational');
        return of({
          data: {
            summary: {
              owners: 2,
              tenants: 3,
              properties: 4,
              owner_agreements_active: 1,
              tenant_agreements_active: 2,
            },
          },
        });
      },
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: DashboardApiService, useClass: DashboardApiService },
      ],
    });

    const service = injector.get(DashboardApiService);
    let result: unknown;
    service.getMetrics().subscribe((data) => (result = data));

    expect(result).toEqual({
      summary: {
        owners: 2,
        tenants: 3,
        properties: 4,
        owner_agreements_active: 1,
        tenant_agreements_active: 2,
      },
    });
  });
});
