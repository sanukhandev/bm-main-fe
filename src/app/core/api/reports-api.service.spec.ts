import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ReportsApiService } from './reports-api.service';

describe('ReportsApiService', () => {
  it('requests a typed report with server-side filters', () => {
    const mockHttp = { get: (url: string, options: { params: { get: (key: string) => string | null } }) => { expect(url).toBe('/api/v1/reports/owner-agreements'); expect(options.params.get('date_from')).toBe('2026-01-01'); expect(options.params.get('page')).toBe('2'); return of({ data: [], meta: { summary: {} } }); } };
    const injector = Injector.create({ providers: [{ provide: HttpClient, useValue: mockHttp }, { provide: ReportsApiService, useClass: ReportsApiService }] });
    injector.get(ReportsApiService).get('owner-agreements', { date_from: '2026-01-01', page: 2 }).subscribe();
  });
});
