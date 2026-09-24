import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BranchContextService } from '../branch-context/branch-context.service';
import { apiUrl } from '../config/runtime-config';

export type ZaakiyRole = 'user' | 'model';

export interface ZaakiyHistoryItem {
  role: ZaakiyRole;
  text: string;
}

export interface ZaakiyStreamEvent {
  type: 'token' | 'done' | 'navigation';
  text?: string;
  label?: string;
  url?: string;
}

function xsrfToken(): string | null {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('XSRF-TOKEN='));
  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : null;
}

@Injectable({ providedIn: 'root' })
export class ZaakiyApiService {
  private branchContext = inject(BranchContextService);

  stream(message: string, history: ZaakiyHistoryItem[]): Observable<ZaakiyStreamEvent> {
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
        body: JSON.stringify({ message, history: history.slice(-20) }),
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
              };
              if (type === 'error')
                throw new Error(payload.message || 'Zaakiy is temporarily unavailable.');
              subscriber.next({
                type: type === 'done' ? 'done' : type === 'navigation' ? 'navigation' : 'token',
                text: payload.text,
                label: payload.label,
                url: payload.url,
              });
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
