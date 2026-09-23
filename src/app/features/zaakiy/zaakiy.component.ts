import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ZaakiyApiService, ZaakiyHistoryItem } from '../../core/api/zaakiy-api.service';

interface ZaakiyMessage {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'bm-zaakiy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="h-full min-h-[calc(100vh-12rem)] flex flex-col max-w-5xl mx-auto">
      <header class="flex items-center justify-between gap-4 mb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <div
              class="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 3v2m0 14v2M3 12h2m14 0h2m-4.2-6.8l1.4-1.4M6.8 17.2l-1.4 1.4m0-13.6l1.4 1.4m10.4 10.4l1.4 1.4M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h1 class="font-display text-3xl text-[#0F172A]">Ask Zaakiy</h1>
              <p class="text-xs text-[#64748B] mt-0.5">Your branch-aware ERP assistant</p>
            </div>
          </div>
        </div>
        <div
          class="hidden sm:flex items-center gap-2 text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] rounded-full px-3 py-1.5"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          Read-only assistant
        </div>
      </header>

      <div
        class="flex-1 min-h-[420px] bg-white border border-[#E2E8F0] rounded-3xl shadow-[0_12px_36px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col"
      >
        <div class="flex-1 overflow-y-auto p-4 sm:p-7 space-y-5" aria-live="polite">
          @if (messages().length === 0) {
            <div
              class="h-full min-h-[360px] flex flex-col items-center justify-center text-center px-4"
            >
              <div
                class="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center mb-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.5 4.5a2.5 2.5 0 015 0v.5h.5A3.5 3.5 0 0118.5 8.5v4A3.5 3.5 0 0115 16h-1.5l-3 3v-3H9A3.5 3.5 0 015.5 12.5v-4A3.5 3.5 0 019 5h.5v-.5zM9 9h6M9 12h3"
                  />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-[#0F172A]">What would you like to know?</h2>
              <p class="text-sm text-[#64748B] max-w-md mt-1.5">
                Ask about your current branch's owners, properties, agreements, payments, work
                orders, or dashboard metrics.
              </p>
              <div class="flex flex-wrap justify-center gap-2 mt-6 max-w-xl">
                @for (prompt of suggestions; track prompt) {
                  <button
                    type="button"
                    (click)="ask(prompt)"
                    class="text-xs text-[#334155] border border-[#E2E8F0] rounded-full px-3 py-2 hover:border-[#10B981] hover:text-[#047857] transition cursor-pointer"
                  >
                    {{ prompt }}
                  </button>
                }
              </div>
            </div>
          } @else {
            @for (message of messages(); track $index) {
              <div class="flex gap-3" [class.justify-end]="message.role === 'user'">
                @if (message.role === 'model') {
                  <div
                    class="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shrink-0 mt-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.7"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 3v2m0 14v2M3 12h2m14 0h2m-4.2-6.8l1.4-1.4M6.8 17.2l-1.4 1.4m0-13.6l1.4 1.4m10.4 10.4l1.4 1.4M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                }
                <div
                  class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap"
                  [class.bg-[#F1F5F9]]="message.role === 'model'"
                  [class.text-[#334155]]="message.role === 'model'"
                  [class.bg-[#0F172A]]="message.role === 'user'"
                  [class.text-white]="message.role === 'user'"
                >
                  {{ message.text || (loading() && message.role === 'model' ? 'Thinking...' : '') }}
                </div>
              </div>
            }
            @if (actions().length > 0) {
              <div class="flex flex-wrap gap-2 pl-11">
                @for (action of actions(); track action.url) {
                  <button
                    type="button"
                    (click)="navigate(action.url)"
                    class="inline-flex items-center gap-2 text-xs font-semibold text-[#047857] border border-[#A7F3D0] bg-[#ECFDF5] rounded-full px-3 py-2 hover:bg-[#D1FAE5] transition cursor-pointer"
                  >
                    {{ action.label }}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.75"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 12h14m-6-6l6 6-6 6"
                      />
                    </svg>
                  </button>
                }
              </div>
            }
          }
        </div>

        @if (error()) {
          <div
            class="mx-4 sm:mx-7 mb-3 rounded-xl bg-[#FEF2F2] border border-red-100 text-red-700 text-xs px-3 py-2.5"
          >
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="send()" class="border-t border-[#E2E8F0] p-3 sm:p-4 bg-[#FAFCFB]">
          <div
            class="flex items-end gap-2 rounded-2xl border border-[#CBD5E1] bg-white p-2 focus-within:border-[#047857] focus-within:ring-2 focus-within:ring-[#D1FAE5]"
          >
            <textarea
              [(ngModel)]="draft"
              name="message"
              rows="1"
              [disabled]="loading()"
              (keydown.enter)="onEnter($event)"
              placeholder="Ask Zaakiy about your ERP..."
              aria-label="Ask Zaakiy"
              class="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none disabled:opacity-60"
            ></textarea>
            <button
              type="submit"
              [disabled]="loading() || !draft.trim()"
              aria-label="Send message"
              class="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <p class="text-[10px] text-[#94A3B8] mt-2 px-2">
            Zaakiy can explain verified ERP data. It cannot post or change records.
          </p>
        </form>
      </div>
    </section>
  `,
})
export class ZaakiyComponent implements OnDestroy {
  private zaakiy = inject(ZaakiyApiService);
  private router = inject(Router);
  private stream?: Subscription;

  draft = '';
  loading = signal(false);
  error = signal<string | null>(null);
  messages = signal<ZaakiyMessage[]>([]);
  actions = signal<Array<{ label: string; url: string }>>([]);
  suggestions = [
    'How many properties are occupied?',
    'Which agreements expire soon?',
    'What is outstanding from tenants?',
    'Show open work orders',
  ];

  ask(prompt: string): void {
    this.draft = prompt;
    this.send();
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.send();
    }
  }

  send(): void {
    const message = this.draft.trim();
    if (!message || this.loading()) return;

    const history = this.messages().map(({ role, text }): ZaakiyHistoryItem => ({ role, text }));
    this.draft = '';
    this.error.set(null);
    this.actions.set([]);
    this.loading.set(true);
    this.messages.update((items) => [
      ...items,
      { role: 'user', text: message },
      { role: 'model', text: '' },
    ]);

    this.stream?.unsubscribe();
    this.stream = this.zaakiy.stream(message, history).subscribe({
      next: (event) => {
        if (event.type === 'navigation' && event.label && event.url) {
          this.actions.update((items) =>
            items.some((item) => item.url === event.url)
              ? items
              : [...items, { label: event.label!, url: event.url! }],
          );
        }
        if (event.type === 'token' && event.text) {
          this.messages.update((items) =>
            items.map((item, index) =>
              index === items.length - 1 ? { ...item, text: item.text + event.text } : item,
            ),
          );
        }
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.error.set(error.message);
        this.messages.update((items) => items.slice(0, -1));
      },
      complete: () => this.loading.set(false),
    });
  }

  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }

  ngOnDestroy(): void {
    this.stream?.unsubscribe();
  }
}
