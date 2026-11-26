import { describe, expect, it } from 'vitest';
import { normalizeZaakiyEvent } from './zaakiy-api.service';

describe('normalizeZaakiyEvent', () => {
  it('preserves legacy token and navigation events', () => {
    expect(normalizeZaakiyEvent('token', { text: 'Hello' })).toEqual({ type: 'token', text: 'Hello' });
    expect(normalizeZaakiyEvent('navigation', { label: 'Properties', url: '/properties' })).toEqual({
      type: 'navigation',
      label: 'Properties',
      url: '/properties',
    });
  });

  it('normalizes structured events without recalculating values', () => {
    const event = normalizeZaakiyEvent('comparison', { comparisons: [{ absolute_delta: -20, percentage_delta: null }] });

    expect(event).toEqual({
      type: 'comparison',
      block: { type: 'comparison', comparisons: [{ absolute_delta: -20, percentage_delta: null }] },
    });
  });

  it('normalizes status, multi-navigation, disambiguation, and action_proposal events', () => {
    expect(normalizeZaakiyEvent('status', { label: 'Analyzing branch data...' })).toEqual({
      type: 'status',
      label: 'Analyzing branch data...',
    });

    expect(
      normalizeZaakiyEvent('navigation', {
        label: 'View tenant outstanding',
        url: '/app/reports/tenant-outstanding',
        query: { customer_id: 42 },
      }),
    ).toEqual({
      type: 'navigation',
      label: 'View tenant outstanding',
      url: '/app/reports/tenant-outstanding',
      query: { customer_id: 42 },
    });

    expect(
      normalizeZaakiyEvent('disambiguation', {
        candidates: [{ type: 'tenant', id: 1, label: 'Ahmed' }],
      }),
    ).toEqual({
      type: 'disambiguation',
      block: {
        type: 'disambiguation',
        candidates: [{ type: 'tenant', id: 1, label: 'Ahmed' }],
      },
    });

    expect(
      normalizeZaakiyEvent('action_proposal', {
        proposal: { proposal_id: 'uuid-1', action_type: 'create_work_order' },
      }),
    ).toEqual({
      type: 'action_proposal',
      block: {
        type: 'action_proposal',
        proposal: { proposal_id: 'uuid-1', action_type: 'create_work_order' },
      },
    });
  });

  it('ignores unknown events and preserves backend errors', () => {
    expect(normalizeZaakiyEvent('future_event', { value: 1 })).toBeNull();
    expect(() => normalizeZaakiyEvent('error', { message: 'Unavailable' })).toThrow('Unavailable');
  });
});
