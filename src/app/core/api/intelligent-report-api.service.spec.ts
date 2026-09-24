import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { IntelligentReportApiService } from './intelligent-report-api.service';

describe('IntelligentReportApiService', () => {
  it('sends the selected period, custom dates, and explicit scope', () => {
    const mockHttp = {
      get: (url: string, options: { params: { get: (key: string) => string | null } }) => {
        expect(url).toBe('/api/v1/reports/intelligent');
        expect(options.params.get('period')).toBe('custom');
        expect(options.params.get('date_from')).toBe('2026-01-01');
        expect(options.params.get('date_to')).toBe('2026-03-31');
        expect(options.params.get('scope')).toBe('overall');
        return of({ data: {} });
      },
    };
    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: IntelligentReportApiService, useClass: IntelligentReportApiService },
      ],
    });
    injector.get(IntelligentReportApiService).get({ period: 'custom', date_from: '2026-01-01', date_to: '2026-03-31', scope: 'overall' }).subscribe();
  });
});
