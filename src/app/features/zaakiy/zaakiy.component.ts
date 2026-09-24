import {
  Component,
  OnDestroy,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { ZaakiyApiService, ZaakiyHistoryItem } from '../../core/api/zaakiy-api.service';

interface ZaakiyMessage {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'bm-zaakiy',
  standalone: true,
  imports: [CommonModule, FormsModule, BmPageHeaderComponent],
  template: `
    <div class="max-w-[1240px] w-full mx-auto pb-8 flex flex-col h-[calc(100vh-6.5rem)]">
      <!-- Page Header -->
      <bm-page-header
        title="Zaakiy AI Assistant"
        subtitle="Real-time branch intelligence, financial breakdown & contract analytics"
      >
        <div class="flex items-center gap-2">
          <!-- Active Branch Context Indicator -->
          @if (activeBranch()) {
            <div
              class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-slate-500 font-normal">Branch:</span>
              <span>{{ activeBranch()?.name }}</span>
            </div>
          }

          <!-- New Session / Reset Button -->
          @if (messages().length > 0) {
            <button
              type="button"
              (click)="resetChat()"
              class="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reset Chat</span>
            </button>
          }
        </div>
      </bm-page-header>

      <!-- Main Chat Surface Container -->
      <div
        class="flex-1 bg-white border border-slate-200/90 rounded-[24px] shadow-xs overflow-hidden flex flex-col min-h-0"
      >
        <!-- Top Workspace Bar -->
        <div
          class="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between shrink-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-zaakiy text-xs font-bold shadow-xs tracking-wider"
            >
              Zv3
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-zaakiy text-sm font-bold text-slate-900 tracking-tight"
                  >ZaakiyV3RSE</span
                >
                <span
                  class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold"
                >
                  Active AI Engine
                </span>
              </div>
              <p class="text-[11px] text-slate-500 font-medium">
                Scope restricted to verified active branch records
              </p>
            </div>
          </div>

          <div class="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span>Press</span>
            <kbd
              class="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-semibold text-[10px] text-slate-600 shadow-2xs"
            >
              Enter
            </kbd>
            <span>to send</span>
          </div>
        </div>

        <!-- Scrollable Messages Area -->
        <div
          #scrollContainer
          class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          aria-live="polite"
        >
          @if (messages().length === 0) {
            <!-- Empty State Prompt Showcase -->
            <div
              class="max-w-3xl mx-auto py-6 flex flex-col items-center justify-center text-center"
            >
              <div
                class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100 shadow-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.75"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <h2 class="text-xl font-bold text-slate-900 tracking-tight">
                How can I assist your ERP workflow today?
              </h2>
              <p class="text-xs text-slate-500 max-w-lg mt-1.5 leading-relaxed">
                Ask about live rent collections, vacant property units, upcoming lease expirations,
                or pending maintenance work orders.
              </p>

              <!-- Categorized Prompt Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 w-full text-left">
                @for (cat of promptCategories; track cat.title) {
                  <div
                    class="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 transition-colors"
                  >
                    <div class="flex items-center gap-2 mb-2">
                      <div
                        class="w-6 h-6 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0"
                      >
                        {{ cat.badge }}
                      </div>
                      <span class="text-xs font-semibold text-slate-900">{{ cat.title }}</span>
                    </div>
                    <div class="space-y-1.5">
                      @for (prompt of cat.prompts; track prompt) {
                        <button
                          type="button"
                          (click)="ask(prompt)"
                          class="w-full text-left text-xs text-slate-600 hover:text-emerald-700 hover:bg-white p-2 rounded-xl border border-transparent hover:border-slate-200 transition flex items-center justify-between group cursor-pointer"
                        >
                          <span class="truncate">{{ prompt }}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <!-- Chat Conversation History -->
            @for (message of messages(); track $index) {
              <div class="flex gap-3.5" [class.justify-end]="message.role === 'user'">
                <!-- AI Avatar -->
                @if (message.role === 'model') {
                  <div
                    class="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-zaakiy font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs"
                  >
                    Zv3
                  </div>
                }

                <div
                  class="max-w-[88%] sm:max-w-[78%] flex flex-col"
                  [class.items-end]="message.role === 'user'"
                >
                  <!-- Bubble Header / Metadata -->
                  <div
                    class="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400 font-medium"
                  >
                    <span>{{ message.role === 'user' ? 'You' : 'ZaakiyV3RSE' }}</span>
                    @if (message.role === 'model' && message.text) {
                      <span>•</span>
                      <button
                        type="button"
                        (click)="copyText(message.text, $index)"
                        class="text-slate-400 hover:text-slate-600 transition flex items-center gap-1 cursor-pointer"
                      >
                        @if (copiedIndex() === $index) {
                          <span class="text-emerald-600 font-semibold">Copied!</span>
                        } @else {
                          <span>Copy</span>
                        }
                      </button>
                    }
                  </div>

                  <!-- Bubble Content Box -->
                  <div
                    class="rounded-2xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs"
                    [class.bg-slate-900]="message.role === 'user'"
                    [class.text-white]="message.role === 'user'"
                    [class.rounded-tr-xs]="message.role === 'user'"
                    [class.bg-slate-50/90]="message.role === 'model'"
                    [class.border]="message.role === 'model'"
                    [class.border-slate-200/80]="message.role === 'model'"
                    [class.text-slate-800]="message.role === 'model'"
                    [class.rounded-tl-xs]="message.role === 'model'"
                  >
                    @if (message.role === 'user') {
                      <div class="whitespace-pre-wrap">{{ message.text }}</div>
                    } @else {
                      @if (message.text) {
                        <div
                          class="zaakiy-formatted-text space-y-2"
                          [innerHTML]="formatMarkdown(message.text)"
                        ></div>
                      } @else if (loading() && $last) {
                        <div class="flex items-center gap-2 text-slate-500 py-1">
                          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span class="text-xs italic">Analyzing branch records...</span>
                        </div>
                      }
                    }
                  </div>

                  <!-- AI Navigation Action Suggestions -->
                  @if (message.role === 'model' && $last && actions().length > 0) {
                    <div class="flex flex-wrap gap-2 mt-3 pt-1">
                      @for (action of actions(); track action.url) {
                        <button
                          type="button"
                          (click)="navigate(action.url)"
                          class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 rounded-full px-3.5 py-1.5 hover:bg-emerald-100 hover:border-emerald-300 transition cursor-pointer shadow-2xs"
                        >
                          <span>{{ action.label }}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-3.5 w-3.5 text-emerald-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>

        <!-- Error Alert Bar -->
        @if (error()) {
          <div
            class="mx-6 mb-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-2.5 flex items-center justify-between shadow-2xs"
          >
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-rose-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ error() }}</span>
            </div>
            <button
              type="button"
              (click)="error.set(null)"
              class="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        }

        <!-- Bottom Chat Input Bar -->
        <form (ngSubmit)="send()" class="border-t border-slate-200/90 p-4 bg-slate-50/60 shrink-0">
          <div
            class="flex items-end gap-2.5 rounded-2xl border border-slate-300/80 bg-white p-2.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition shadow-2xs"
          >
            <textarea
              #inputArea
              [(ngModel)]="draft"
              name="message"
              rows="1"
              [disabled]="loading()"
              (keydown.enter)="onEnter($event)"
              placeholder="Ask Zaakiy about properties, collections, leases, or work orders..."
              aria-label="Ask Zaakiy"
              class="flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-60 max-h-32 min-h-[38px]"
            ></textarea>

            <div class="flex items-center gap-2 shrink-0">
              @if (loading()) {
                <button
                  type="button"
                  (click)="stopStreaming()"
                  class="h-9 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span class="w-2 h-2 bg-rose-500 rounded-xs"></span>
                  <span>Stop</span>
                </button>
              }

              <button
                type="submit"
                [disabled]="loading() || !draft.trim()"
                aria-label="Send message"
                class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
              >
                @if (loading()) {
                  <svg
                    class="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                } @else {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 19V5m0 0l-7 7m7-7l7 7"
                    />
                  </svg>
                }
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
            <span>Shift + Enter for new line</span>
            <span>Read-only verified branch assistant</span>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .zaakiy-formatted-text strong {
        font-weight: 600;
        color: #0f172a;
      }
      :host ::ng-deep .zaakiy-formatted-text code {
        background-color: rgba(226, 232, 240, 0.8);
        padding: 0.15rem 0.4rem;
        border-radius: 0.375rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.75rem;
        color: #0f172a;
      }
      :host ::ng-deep .zaakiy-formatted-text ul {
        list-style-type: disc;
        padding-left: 1.25rem;
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;
      }
      :host ::ng-deep .zaakiy-formatted-text ol {
        list-style-type: decimal;
        padding-left: 1.25rem;
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;
      }
    `,
  ],
})
export class ZaakiyComponent implements OnDestroy {
  private zaakiy = inject(ZaakiyApiService);
  private branchContext = inject(BranchContextService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private stream?: Subscription;

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;

  draft = '';
  loading = signal(false);
  error = signal<string | null>(null);
  messages = signal<ZaakiyMessage[]>([]);
  actions = signal<Array<{ label: string; url: string }>>([]);
  copiedIndex = signal<number | null>(null);

  readonly activeBranch = this.branchContext.activeBranch;

  readonly promptCategories = [
    {
      title: 'Properties & Occupancy',
      badge: '01',
      prompts: [
        'How many properties are occupied vs vacant?',
        'List units currently needing maintenance',
      ],
    },
    {
      title: 'Contracts & Leases',
      badge: '02',
      prompts: ['Which tenant agreements expire in 30 days?', 'Summarize active owner contracts'],
    },
    {
      title: 'Accounts & Collections',
      badge: '03',
      prompts: [
        'What is total rent collection this month?',
        'Show list of overdue tenant payments',
      ],
    },
    {
      title: 'Work Orders & Repairs',
      badge: '04',
      prompts: ['Show all open high-priority work orders', 'Which vendors have active tickets?'],
    },
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

    this.scrollToBottom();

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
          this.scrollToBottom();
        }
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.error.set(error.message);
        this.messages.update((items) => items.slice(0, -1));
      },
      complete: () => {
        this.loading.set(false);
        this.scrollToBottom();
      },
    });
  }

  stopStreaming(): void {
    if (this.stream) {
      this.stream.unsubscribe();
      this.loading.set(false);
    }
  }

  resetChat(): void {
    this.stopStreaming();
    this.messages.set([]);
    this.actions.set([]);
    this.error.set(null);
    this.draft = '';
  }

  copyText(text: string, index: number): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    });
  }

  formatMarkdown(text: string): SafeHtml {
    if (!text) return '';

    let formatted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Bold text **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Inline code `code`
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

    // List processing
    const lines = formatted.split('\n');
    let inUnordered = false;
    let inOrdered = false;
    const output: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inUnordered) {
          if (inOrdered) {
            output.push('</ol>');
            inOrdered = false;
          }
          output.push('<ul>');
          inUnordered = true;
        }
        output.push(`<li>${trimmed.slice(2)}</li>`);
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (!inOrdered) {
          if (inUnordered) {
            output.push('</ul>');
            inUnordered = false;
          }
          output.push('<ol>');
          inOrdered = true;
        }
        output.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
      } else {
        if (inUnordered) {
          output.push('</ul>');
          inUnordered = false;
        }
        if (inOrdered) {
          output.push('</ol>');
          inOrdered = false;
        }
        if (trimmed) {
          output.push(`<p>${trimmed}</p>`);
        }
      }
    }

    if (inUnordered) output.push('</ul>');
    if (inOrdered) output.push('</ol>');

    return this.sanitizer.bypassSecurityTrustHtml(output.join(''));
  }

  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }

  ngOnDestroy(): void {
    this.stopStreaming();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
