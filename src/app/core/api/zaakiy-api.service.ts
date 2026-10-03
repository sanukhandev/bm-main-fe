import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BranchContextService } from '../branch-context/branch-context.service';
import { apiUrl } from '../config/runtime-config';

export type ZaakiyRole = 'user' | 'model';

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

export interface ZaakiyStructuredBlock {
  type: 'summary' | 'records' | 'comparison' | 'trend' | 'explanation' | 'anomalies' | 'sections' | 'warnings' | 'suggestions';
  metrics?: ZaakiyMetricCard[];
  records?: ZaakiyStructuredRecord[];
  comparisons?: Array<Record<string, unknown>>;
  trends?: Array<Record<string, unknown>>;
  explanations?: Array<Record<string, unknown>>;
  anomalies?: Array<Record<string, unknown>>;
  sections?: Array<Record<string, unknown>>;
  warnings?: Array<Record<string, unknown>>;
  suggestions?: string[];
}

export type ZaakiyStructuredEventType = ZaakiyStructuredBlock['type'];

export interface ZaakiyStreamEvent {
  type: 'token' | 'done' | 'navigation' | 'error' | ZaakiyStructuredEventType;
  text?: string;
  label?: string;
  url?: string;
  context?: ZaakiyConversationContext | null;
  block?: ZaakiyStructuredBlock;
}

export function normalizeZaakiyEvent(type: string | undefined, payload: Record<string, unknown>): ZaakiyStreamEvent | null {
  if (type === 'error') {
    throw new Error((payload['message'] as string | undefined) || 'Zaakiy is temporarily unavailable.');
  }
  if (type === 'done' || type === 'navigation' || type === 'token') {
    return {
      type,
      text: payload['text'] as string | undefined,
      label: payload['label'] as string | undefined,
      url: payload['url'] as string | undefined,
      context: payload['context'] as ZaakiyConversationContext | null | undefined,
    };
  }
  const structuredTypes: ZaakiyStructuredEventType[] = [
    'summary',
    'records',
    'comparison',
    'trend',
    'explanation',
    'anomalies',
    'sections',
    'warnings',
    'suggestions',
  ];
  if (!type || !structuredTypes.includes(type as ZaakiyStructuredEventType)) return null;

  return { type: type as ZaakiyStructuredEventType, block: { type: type as ZaakiyStructuredEventType, ...payload } };
}

function xsrfToken(): string | null {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='));
  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : null;
}

@Injectable({ providedIn: 'root' })
export class ZaakiyApiService {
  private branchContext = inject(BranchContextService);

  stream(
    message: string,
    history: ZaakiyHistoryItem[],
    conversationContext: ZaakiyConversationContext | null = null,
  ): Observable<ZaakiyStreamEvent> {
    return new Observable((subscriber) => {
      const controller = new AbortController();
      const headers: Record<string, string> = {
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
      };
      const token = xsrfToken();
      const branchId = this.branchContext.activeBranchId();
      if (token) headers['X-XSRF-TOKEN'] = token;
      if (branchId) headers['X-Branch-Id'] = String(branchId);

      void fetch(apiUrl('/api/v1/ai/zaakiy/chat'), {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          message,
          history: history.slice(-20),
          ...(conversationContext ? { conversation_context: conversationContext } : {}),
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok || !response.body) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.message || 'Zaakiy is temporarily unavailable.');
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
              const payload = JSON.parse(data) as {
                text?: string;
                message?: string;
                label?: string;
                url?: string;
                context?: ZaakiyConversationContext | null;
                metrics?: ZaakiyMetricCard[];
                records?: ZaakiyStructuredRecord[];
                comparisons?: Array<Record<string, unknown>>;
                trends?: Array<Record<string, unknown>>;
                explanations?: Array<Record<string, unknown>>;
                anomalies?: Array<Record<string, unknown>>;
                sections?: Array<Record<string, unknown>>;
                warnings?: Array<Record<string, unknown>>;
                suggestions?: string[];
              };
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
}
