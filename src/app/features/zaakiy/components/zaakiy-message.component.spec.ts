import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ZaakiyMessageComponent, ZaakiyMessageModel } from './zaakiy-message.component';

describe('ZaakiyMessageComponent', () => {
  const createComponent = (message: ZaakiyMessageModel, isLoading = false, isLast = true) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ZaakiyMessageComponent],
    });
    const fixture = TestBed.createComponent(ZaakiyMessageComponent);
    fixture.componentInstance.message = message;
    fixture.componentInstance.isLoading = isLoading;
    fixture.componentInstance.isLast = isLast;
    fixture.detectChanges();
    return fixture;
  };

  it('routes tenant and owner customer records to /app/customers/:id and agreements to agreement routes', () => {
    const fixture = createComponent({ role: 'model', text: 'Ok', blocks: [] });
    const component = fixture.componentInstance;

    expect(component.recordRoute({ type: 'tenant', id: 42 })).toBe('/app/customers/42');
    expect(component.recordRoute({ type: 'owner', id: 19 })).toBe('/app/customers/19');
    expect(component.recordRoute({ type: 'customer', id: 5 })).toBe('/app/customers/5');
    expect(component.recordRoute({ type: 'vendor', id: 9 })).toBe('/app/customers/9');
    expect(component.recordRoute({ type: 'tenant_agreement', id: 7 })).toBe('/app/tenant-agreements/7');
    expect(component.recordRoute({ type: 'owner_agreement', id: 8 })).toBe('/app/owner-agreements/8');
    expect(component.recordRoute({ type: 'property', id: 11 })).toBe('/app/properties/11');
    expect(component.recordRoute({ type: 'work_order', id: 14 })).toBe('/app/maintenance/work-orders/14');
  });

  it('renders dedicated comparison, trend, explanation, and anomaly cards using backend DTO fields', () => {
    const fixture = createComponent({
      role: 'model',
      text: 'Summary ready.',
      blocks: [
        {
          type: 'comparison',
          comparisons: [
            {
              metric: 'collections.collected_amount',
              label: 'Collected amount',
              current_value: 12000,
              comparison_value: 10000,
              absolute_delta: 2000,
              percentage_delta: 20,
            },
          ],
        },
        {
          type: 'trend',
          trends: [
            {
              metric: 'collections.collected_amount',
              label: 'Collected amount',
              granularity: 'month',
              points: [
                { period_start: '2026-09-01', label: 'Sep 2026', value: 10000 },
                { period_start: '2026-10-01', label: 'Oct 2026', value: 12000 },
              ],
            },
          ],
        },
        {
          type: 'explanation',
          explanations: [
            {
              metric: 'collections.collected_amount',
              label: 'Collected amount',
              drivers: [{ key: 't1', label: 'Ahmed Al Mansoori', absolute_delta: 2000 }],
              residual_delta: 0,
            },
          ],
        },
        {
          type: 'anomalies',
          anomalies: [
            {
              code: 'COLLECTION_DROP_SIGNIFICANT',
              label: 'Significant collection drop',
              severity: 'attention',
              rule: 'percentage_delta <= -25%',
              baseline_value: 20000,
              threshold: { percentage: -25, absolute: -10000 },
            },
          ],
        },
      ],
    });

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('bm-zaakiy-comparison-card')).not.toBeNull();
    expect(el.querySelector('bm-zaakiy-trend-card')).not.toBeNull();
    expect(el.querySelector('bm-zaakiy-explanation-card')).not.toBeNull();
    expect(el.querySelector('bm-zaakiy-anomaly-card')).not.toBeNull();
    expect(el.textContent).toContain('12,000');
    expect(el.textContent).toContain('Ahmed Al Mansoori');
    expect(el.textContent).toContain('percentage_delta <= -25%');
    expect(el.textContent).not.toContain('[object Object]');
  });

  it('keeps per-message navigation actions on earlier messages and formats query parameters', () => {
    const fixture = createComponent(
      {
        role: 'model',
        text: 'Tenant overview.',
        blocks: [],
        actions: [
          { label: 'View tenant', url: '/app/customers/42' },
          { label: 'View tenant outstanding', url: '/app/reports/tenant-outstanding', query: { customer_id: 42 } },
        ],
      },
      false,
      false,
    );

    const navigateSpy = vi.fn();
    fixture.componentInstance.onNavigate.subscribe(navigateSpy);

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const outstandingBtn = buttons.find((btn) => btn.textContent?.includes('View tenant outstanding'));
    expect(outstandingBtn).toBeDefined();
    outstandingBtn!.click();
    expect(navigateSpy).toHaveBeenCalledWith('/app/reports/tenant-outstanding?customer_id=42');
  });

  it('displays live statusLabel while streaming before tokens arrive', () => {
    const fixture = createComponent(
      {
        role: 'model',
        text: '',
        blocks: [],
        statusLabel: 'Analyzing branch data...',
      },
      true,
      true,
    );

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Analyzing branch data...');
  });
});
