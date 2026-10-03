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

  it('ignores unknown events and preserves backend errors', () => {
    expect(normalizeZaakiyEvent('future_event', { value: 1 })).toBeNull();
    expect(() => normalizeZaakiyEvent('error', { message: 'Unavailable' })).toThrow('Unavailable');
  });
});
