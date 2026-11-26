import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BranchContextService } from '../branch-context/branch-context.service';
import { apiUrl } from '../config/runtime-config';

export type ZaakiyRole = 'user' | 'model';
export type ZaakiyFeedback = 'helpful' | 'unhelpful';

export interface ZaakiyHistoryItem {
  role: ZaakiyRole;
  text: string;
}

export interface ZaakiyConversationContext {
  intent?: string | null;
  domain?: string | null;
  subject?: string | null;
  metric?: string | null;
  entities: Array<{ type: string; id: number; label?: string }>;
  time_range?: { from: string; to: string; label?: string } | null;
  comparison_range?: { from: string; to: string; label?: string } | null;
  filters: Record<string, unknown>;
  sort: Record<string, unknown>;
  result_references: Array<{ type: string; id: number; label?: string }>;
  branch_context: { branch_id?: number; branch_code?: string };
  meta?: Record<string, unknown>;
}

export interface ZaakiyMetricCard {
  metric: string;
  label: string;
  value: string | number | boolean;
  unit: 'AED' | 'count' | 'percent' | 'days' | 'date' | string;
  format_hint?: string;
}

export interface ZaakiyStructuredRecord {
  type?: string;
  id?: number;
  label?: string;
  status?: string;
  fields?: Record<string, unknown>;
}

export interface ZaakiyNavigationAction {
  label: string;
  url: string;
  query?: Record<string, unknown>;
}

export interface ZaakiyDisambiguationCandidate {
  type: string;
  id: number;
  label: string;
  code?: string;
  subtitle?: string;
  status?: string;
  follow_up_prompt?: string;
}

export interface ZaakiyActionProposalField {
  key: string;
  label: string;
  value: string;
}

export interface ZaakiyActionProposalEditableField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date';
  value: string | number | null;
  options?: string[];
}

export interface ZaakiyActionProposal {
  proposal_id: string;
  action_type: string;
  title?: string;
  summary?: string;
  branch_name?: string;
  risk_level?: 'low' | 'medium' | 'high' | string;
  status?: 'pending' | 'executed' | 'rejected' | 'expired';
  expires_at?: string;
  fields?: ZaakiyActionProposalField[];
  editable_fields?: ZaakiyActionProposalEditableField[];
  result_label?: string;
  result_route?: string;
}

export interface ZaakiyActionExecutionResult {
  proposal_id: string;
  action_type: string;
  status: 'executed' | 'rejected';
  entity_type?: string;
  entity_id?: number;
  label?: string;
  route?: string;
}

export interface ZaakiyThreadSummary {
  uuid: string;
  title: string;
  last_message_at: string | null;
  created_at: string | null;
}

export interface ZaakiyPersistedMessage {
  id: number;
  role: ZaakiyRole;
  text: string;
  blocks: ZaakiyStructuredBlock[];
  actions: ZaakiyNavigationAction[];
  feedback?: ZaakiyFeedback | null;
  created_at?: string | null;
}

export interface ZaakiyThreadDetail {
  uuid: string;
  title: string;
  last_message_at: string | null;
  messages: ZaakiyPersistedMessage[];
}

export interface ZaakiyStructuredBlock {
  type:
    | 'summary'
    | 'records'
    | 'comparison'
    | 'trend'
    | 'explanation'
    | 'anomalies'
    | 'sections'
    | 'warnings'
    | 'suggestions'
    | 'disambiguation'
    | 'action_proposal';
  metrics?: ZaakiyMetricCard[];
  records?: ZaakiyStructuredRecord[];
  comparisons?: Array<Record<string, unknown>>;
  trends?: Array<Record<string, unknown>>;
  explanations?: Array<Record<string, unknown>>;
  anomalies?: Array<Record<string, unknown>>;
  sections?: Array<Record<string, unknown>>;
  warnings?: Array<Record<string, unknown>>;
  suggestions?: string[];
  query?: string;
  candidates?: ZaakiyDisambiguationCandidate[];
  proposal?: ZaakiyActionProposal;
}

export type ZaakiyStructuredEventType = ZaakiyStructuredBlock['type'];

export interface ZaakiyStreamEvent {
  type: 'token' | 'done' | 'navigation' | 'status' | 'error' | ZaakiyStructuredEventType;
  text?: string;
  label?: string;
  url?: string;
  query?: Record<string, unknown>;
  items?: ZaakiyNavigationAction[];
  context?: ZaakiyConversationContext | null;
  threadId?: string;
  messageId?: number;
  block?: ZaakiyStructuredBlock;
}

const STRUCTURED_EVENT_TYPES: ZaakiyStructuredEventType[] = [
  'summary',
  'records',
  'comparison',
  'trend',
  'explanation',
  'anomalies',
  'sections',
  'warnings',
  'suggestions',
  'disambiguation',
  'action_proposal',
];

export function normalizeZaakiyEvent(
  type: string | undefined,
  payload: Record<string, unknown>,
): ZaakiyStreamEvent | null {
  if (type === 'error') {
    throw new Error((payload['message'] as string | undefined) || 'Zaakiy is temporarily unavailable.');
  }
  if (type === 'status') {
    return {
      type: 'status',
      label: (payload['label'] as string | undefined) || 'Analyzing branch data...',
    };
  }
  if (type === 'done' || type === 'navigation' || type === 'token') {
    const event: ZaakiyStreamEvent = {
      type,
      text: payload['text'] as string | undefined,
      label: payload['label'] as string | undefined,
      url: payload['url'] as string | undefined,
      context: payload['context'] as ZaakiyConversationContext | null | undefined,
    };
    if (type === 'done') {
      if (typeof payload['thread_id'] === 'string') {
        event.threadId = payload['thread_id'];
      }
      if (typeof payload['message_id'] === 'number') {
        event.messageId = payload['message_id'];
      }
    }
    if (payload['query'] && typeof payload['query'] === 'object') {
      event.query = payload['query'] as Record<string, unknown>;
    }
    if (Array.isArray(payload['items'])) {
      event.items = payload['items'] as ZaakiyNavigationAction[];
    }
    return event;
  }
  if (!type || !STRUCTURED_EVENT_TYPES.includes(type as ZaakiyStructuredEventType)) {
    return null;
  }

  if (type === 'action_proposal') {
    const proposal =
      payload['proposal'] && typeof payload['proposal'] === 'object'
        ? (payload['proposal'] as ZaakiyActionProposal)
        : typeof payload['proposal_id'] === 'string'
          ? (payload as unknown as ZaakiyActionProposal)
          : undefined;
    return {
      type: 'action_proposal',
      block: {
        type: 'action_proposal',
        ...(proposal ? { proposal } : {}),
      },
    };
  }

  return {
    type: type as ZaakiyStructuredEventType,
    block: { type: type as ZaakiyStructuredEventType, ...payload } as ZaakiyStructuredBlock,
  };
}

export function normalizePersistedBlock(raw: unknown): ZaakiyStructuredBlock | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  if (typeof record['event'] === 'string' && record['data'] && typeof record['data'] === 'object') {
    return normalizeZaakiyEvent(record['event'], record['data'] as Record<string, unknown>)?.block ?? null;
  }
  if (typeof record['type'] === 'string') {
    return normalizeZaakiyEvent(record['type'], record)?.block ?? null;
  }
  return null;
}

function xsrfToken(): string | null {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='));
  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : null;
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
    errors?: Record<string, string[]>;
  } | null;
  if (body?.errors) {
    const firstError = Object.values(body.errors).flat()[0];
    if (firstError) return firstError;
  }
  return body?.message || fallback;
}

@Injectable({ providedIn: 'root' })
export class ZaakiyApiService {
  private branchContext = inject(BranchContextService);

  private buildHeaders(accept = 'application/json'): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: accept,
      'Content-Type': 'application/json',
    };
    const token = xsrfToken();
    const branchId = this.branchContext.activeBranchId();
    if (token) headers['X-XSRF-TOKEN'] = token;
    if (branchId) headers['X-Branch-Id'] = String(branchId);
    return headers;
  }

  stream(
    message: string,
    history: ZaakiyHistoryItem[],
    conversationContext: ZaakiyConversationContext | null = null,
    threadId: string | null = null,
  ): Observable<ZaakiyStreamEvent> {
    return new Observable((subscriber) => {
      const controller = new AbortController();

      void fetch(apiUrl('/api/v1/ai/zaakiy/chat'), {
        method: 'POST',
        credentials: 'include',
        headers: this.buildHeaders('application/json, text/event-stream'),
        body: JSON.stringify({
          message,
          ...(threadId ? { thread_id: threadId } : {}),
          history: history.slice(-20),
          ...(conversationContext ? { conversation_context: conversationContext } : {}),
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok || !response.body) {
            throw new Error(await parseErrorMessage(response, 'Zaakiy is temporarily unavailable.'));
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { value, done } = await reader.read();
            buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
            const events = buffer.split('\n\n');
            buffer = events.pop() || '';
            for (const event of events) {
              const lines = event.split('\n');
              const type = lines
                .find((line) => line.startsWith('event:'))
                ?.slice(6)
                .trim();
              const data = lines
                .find((line) => line.startsWith('data:'))
                ?.slice(5)
                .trim();
              if (!data) continue;
              const payload = JSON.parse(data) as Record<string, unknown>;
              const normalized = normalizeZaakiyEvent(type, payload);
              if (normalized) subscriber.next(normalized);
            }
            if (done) break;
          }
          subscriber.complete();
        })
        .catch((error: Error) => {
          if (error.name !== 'AbortError') subscriber.error(error);
        });

      return () => controller.abort();
    });
  }

  async listThreads(): Promise<ZaakiyThreadSummary[]> {
    const response = await fetch(apiUrl('/api/v1/ai/zaakiy/threads'), {
      method: 'GET',
      credentials: 'include',
      headers: this.buildHeaders(),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Unable to load conversation history.'));
    }
    const json = (await response.json()) as { data?: ZaakiyThreadSummary[] };
    return Array.isArray(json.data) ? json.data : [];
  }

  async getThread(uuid: string): Promise<ZaakiyThreadDetail> {
    const response = await fetch(apiUrl(`/api/v1/ai/zaakiy/threads/${encodeURIComponent(uuid)}`), {
      method: 'GET',
      credentials: 'include',
      headers: this.buildHeaders(),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Unable to open this conversation.'));
    }
    const json = (await response.json()) as {
      data: {
        uuid: string;
        title: string;
        last_message_at: string | null;
        messages: Array<{
          id: number;
          role: ZaakiyRole;
          text: string;
          blocks?: unknown[];
          actions?: ZaakiyNavigationAction[];
          feedback?: ZaakiyFeedback | null;
          created_at?: string | null;
        }>;
      };
    };

    return {
      uuid: json.data.uuid,
      title: json.data.title,
      last_message_at: json.data.last_message_at,
      messages: (json.data.messages || []).map((msg) => ({
        id: msg.id,
        role: msg.role,
        text: msg.text,
        blocks: (msg.blocks || [])
          .map((item) => normalizePersistedBlock(item))
          .filter((item): item is ZaakiyStructuredBlock => item !== null),
        actions: Array.isArray(msg.actions) ? msg.actions : [],
        feedback: msg.feedback ?? null,
        created_at: msg.created_at ?? null,
      })),
    };
  }

  async deleteThread(uuid: string): Promise<void> {
    const response = await fetch(apiUrl(`/api/v1/ai/zaakiy/threads/${encodeURIComponent(uuid)}`), {
      method: 'DELETE',
      credentials: 'include',
      headers: this.buildHeaders(),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Unable to delete conversation.'));
    }
  }

  async submitFeedback(
    messageId: number,
    feedback: ZaakiyFeedback,
    note?: string,
  ): Promise<{ id: number; feedback: ZaakiyFeedback }> {
    const response = await fetch(apiUrl(`/api/v1/ai/zaakiy/messages/${messageId}/feedback`), {
      method: 'POST',
      credentials: 'include',
      headers: this.buildHeaders(),
      body: JSON.stringify({ feedback, ...(note ? { note } : {}) }),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Unable to save feedback.'));
    }
    const json = (await response.json()) as { data: { id: number; feedback: ZaakiyFeedback } };
    return json.data;
  }

  async confirmAction(
    proposalId: string,
    overrides?: Record<string, unknown>,
  ): Promise<ZaakiyActionExecutionResult> {
    const response = await fetch(
      apiUrl(`/api/v1/ai/zaakiy/actions/${encodeURIComponent(proposalId)}/confirm`),
      {
        method: 'POST',
        credentials: 'include',
        headers: this.buildHeaders(),
        body: JSON.stringify(overrides && Object.keys(overrides).length > 0 ? { overrides } : {}),
      },
    );
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Unable to confirm this action.'));
    }
    const json = (await response.json()) as { data: ZaakiyActionExecutionResult };
    return json.data;
  }

  async rejectAction(proposalId: string): Promise<ZaakiyActionExecutionResult> {
    const response = await fetch(
      apiUrl(`/api/v1/ai/zaakiy/actions/${encodeURIComponent(proposalId)}/reject`),
      {
        method: 'POST',
        credentials: 'include',
        headers: this.buildHeaders(),
        body: JSON.stringify({}),
      },
    );
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Unable to reject this action.'));
    }
    const json = (await response.json()) as { data: ZaakiyActionExecutionResult };
    return json.data;
  }
}
