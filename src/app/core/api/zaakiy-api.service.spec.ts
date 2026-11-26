import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { BranchContextService } from '../branch-context/branch-context.service';
import {
  normalizePersistedBlock,
  normalizeZaakiyEvent,
  ZaakiyApiService,
} from './zaakiy-api.service';

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

  it('normalizes done thread metadata, flat action_proposal payloads, and persisted blocks', () => {
    expect(normalizeZaakiyEvent('done', { thread_id: 'thr-1', message_id: 99, context: null })).toEqual({
      type: 'done',
      text: undefined,
      label: undefined,
      url: undefined,
      context: null,
      threadId: 'thr-1',
      messageId: 99,
    });

    const flatProposal = normalizeZaakiyEvent('action_proposal', {
      proposal_id: 'uuid-2',
      action_type: 'create_petty_cash_entry',
      title: 'Post Petty Cash Entry',
      summary: 'AED 185 outward',
      risk_level: 'high',
      status: 'pending',
      expires_at: '2026-11-26T15:00:00Z',
    });
    expect(flatProposal?.type).toBe('action_proposal');
    expect(flatProposal?.block?.proposal?.proposal_id).toBe('uuid-2');

    const persisted = normalizePersistedBlock({
      event: 'disambiguation',
      data: { query: 'Ahmed', candidates: [{ type: 'tenant', id: 7, label: 'Ahmed', follow_up_prompt: 'Tell me about tenant #7' }] },
    });
    expect(persisted?.type).toBe('disambiguation');
    expect(persisted?.candidates?.length).toBe(1);
  });
});

describe('ZaakiyApiService HITL & Thread HTTP methods', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches X-XSRF-TOKEN and X-Branch-Id headers on confirmAction and rejectAction', async () => {
    document.cookie = 'XSRF-TOKEN=test-csrf-token';
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { proposal_id: 'uuid-1', action_type: 'create_work_order', status: 'executed' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ZaakiyApiService,
        {
          provide: BranchContextService,
          useValue: { activeBranchId: () => 5 },
        },
      ],
    });
    const service = TestBed.inject(ZaakiyApiService);

    const confirmRes = await service.confirmAction('uuid-1', { priority: 'urgent' });
    expect(confirmRes.status).toBe('executed');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [confirmUrl, confirmInit] = fetchSpy.mock.calls[0];
    expect(String(confirmUrl)).toContain('/api/v1/ai/zaakiy/actions/uuid-1/confirm');
    const confirmHeaders = confirmInit?.headers as Record<string, string>;
    expect(confirmHeaders['X-XSRF-TOKEN']).toBe('test-csrf-token');
    expect(confirmHeaders['X-Branch-Id']).toBe('5');
    expect(JSON.parse(String(confirmInit?.body))).toEqual({ overrides: { priority: 'urgent' } });

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { proposal_id: 'uuid-1', action_type: 'create_work_order', status: 'rejected' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const rejectRes = await service.rejectAction('uuid-1');
    expect(rejectRes.status).toBe('rejected');
    const [rejectUrl, rejectInit] = fetchSpy.mock.calls[1];
    expect(String(rejectUrl)).toContain('/api/v1/ai/zaakiy/actions/uuid-1/reject');
    const rejectHeaders = rejectInit?.headers as Record<string, string>;
    expect(rejectHeaders['X-XSRF-TOKEN']).toBe('test-csrf-token');
    expect(rejectHeaders['X-Branch-Id']).toBe('5');
  });
});
