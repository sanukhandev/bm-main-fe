import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { AuditApiService } from './audit-api.service';

describe('AuditApiService', () => {
  it('requests paginated audit logs with filters', () => {
    const mockHttp = {
      get: (url: string, options: { params: { get: (key: string) => string | null } }) => {
        expect(url).toBe('/api/v1/audit-logs');
        expect(options.params.get('action')).toBe('property.updated');
        expect(options.params.get('date_from')).toBe('2026-01-01');
        expect(options.params.get('page')).toBe('2');
        return of({ data: [], meta: { current_page: 2 } });
      },
    };
    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: AuditApiService, useClass: AuditApiService },
      ],
    });

    injector.get(AuditApiService).getLogs({ action: 'property.updated', date_from: '2026-01-01', page: 2 }).subscribe();
  });
});
