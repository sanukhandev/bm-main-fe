import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import {
  ZaakiyApiService,
  ZaakiyConversationContext,
  ZaakiyHistoryItem,
  ZaakiyStructuredBlock,
} from '../../core/api/zaakiy-api.service';

import { ZaakiyHeaderComponent } from './components/zaakiy-header.component';
import { ZaakiyEmptyStateComponent } from './components/zaakiy-empty-state.component';
import { ZaakiyMessageComponent, ZaakiyMessageModel } from './components/zaakiy-message.component';
import { ZaakiyComposerComponent } from './components/zaakiy-composer.component';

@Component({
  selector: 'bm-zaakiy',
  standalone: true,
  imports: [
    CommonModule,
    ZaakiyHeaderComponent,
    ZaakiyEmptyStateComponent,
    ZaakiyMessageComponent,
    ZaakiyComposerComponent,
  ],
  template: `
    <div class="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-5rem)] pb-3 px-2 sm:px-4">
      <!-- Gemini-Style Main Chat Canvas Surface -->
      <div class="flex-1 bg-white border border-surface-200/90 rounded-3xl shadow-xs overflow-hidden flex flex-col min-h-0">
        <!-- Top Workspace Header -->
        <bm-zaakiy-header
          [activeBranch]="activeBranch()"
          [isStreaming]="loading()"
          [hasMessages]="messages().length > 0"
          (onReset)="resetChat()"
        />

        <!-- Centered Single-Column Chat Area (No Sidebars) -->
        <div class="flex-1 flex flex-col min-h-0 relative bg-slate-50/30">
          <!-- Scrollable Messages Container -->
          <div
            #scrollContainer
            class="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6"
            aria-live="polite"
          >
            @if (messages().length === 0) {
              <!-- Empty State Showcase -->
              <bm-zaakiy-empty-state (onSelectPrompt)="ask($event)" />
            } @else {
              <!-- Chat Messages Flow -->
              <div class="max-w-3xl mx-auto space-y-6">
                @for (message of messages(); track $index) {
                  <bm-zaakiy-message
                    [message]="message"
                    [isLoading]="loading()"
                    [isLast]="$last"
                    [actions]="actions()"
                    (onSelectPrompt)="ask($event)"
                    (onNavigate)="navigate($event)"
                  />
                }
              </div>
            }
          </div>

          <!-- Error Alert Banner -->
          @if (error()) {
            <div class="max-w-3xl mx-auto w-full px-4 sm:px-8 mb-2">
              <div
                class="rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 flex items-center justify-between shadow-2xs"
              >
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ error() }}</span>
                </div>
                <button
                  type="button"
                  (click)="error.set(null)"
                  class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          }

          <!-- Sticky Floating Gemini Composer -->
          <div class="px-4 sm:px-8 pb-4 pt-1 bg-gradient-to-t from-white via-white/95 to-transparent shrink-0">
            <div class="max-w-3xl mx-auto">
              <bm-zaakiy-composer
                [(draft)]="draft"
                [isLoading]="loading()"
                (onSend)="send()"
                (onStop)="stopStreaming()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyComponent implements OnInit, OnDestroy {
  private zaakiy = inject(ZaakiyApiService);
  private branchContext = inject(BranchContextService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private stream?: Subscription;
  private branchSubscription: Subscription;
  private queryParamsSubscription?: Subscription;

  conversationContext = signal<ZaakiyConversationContext | null>(null);
  draft = '';
  loading = signal(false);
  error = signal<string | null>(null);
  messages = signal<ZaakiyMessageModel[]>([]);
  actions = signal<Array<{ label: string; url: string }>>([]);

  readonly activeBranch = this.branchContext.activeBranch;

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;

  constructor() {
    this.branchSubscription = this.branchContext.branchChanged$.subscribe(() => {
      this.resetChat();
    });
  }

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe((params) => {
      const initialQuery = params['q'];
      if (initialQuery && typeof initialQuery === 'string' && initialQuery.trim()) {
        this.ask(initialQuery.trim());
      }
    });
  }

  readonly allStructuredBlocks = computed(() => {
    const msgs = this.messages();
    const blocks: ZaakiyStructuredBlock[] = [];
    for (const m of msgs) {
      if (m.role === 'model' && m.blocks.length > 0) {
        blocks.push(...m.blocks);
      }
    }
    return blocks;
  });

  readonly latestSuggestions = computed(() => {
    const blocks = this.allStructuredBlocks();
    for (let i = blocks.length - 1; i >= 0; i--) {
      if (blocks[i].type === 'suggestions' && blocks[i].suggestions?.length) {
        return blocks[i].suggestions!;
      }
    }
    return [];
  });

  ask(prompt: string): void {
    this.draft = prompt;
    this.send();
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
      { role: 'user', text: message, blocks: [] },
      { role: 'model', text: '', blocks: [] },
    ]);

    this.scrollToBottom();

    this.stream?.unsubscribe();
    this.stream = this.zaakiy.stream(message, history, this.conversationContext()).subscribe({
      next: (event) => {
        if (event.type === 'done') {
          this.conversationContext.set(event.context ?? null);
        }
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
        if (event.block) {
          this.messages.update((items) =>
            items.map((item, index) =>
              index === items.length - 1 ? { ...item, blocks: [...item.blocks, event.block!] } : item,
            ),
          );
          this.scrollToBottom();
        }
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message);
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
    this.conversationContext.set(null);
  }

  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }

  ngOnDestroy(): void {
    this.stopStreaming();
    this.branchSubscription.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
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
