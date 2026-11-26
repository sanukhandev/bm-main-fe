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
import { AuthService } from '../../core/auth/auth.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import {
  ZaakiyApiService,
  ZaakiyConversationContext,
  ZaakiyFeedback,
  ZaakiyHistoryItem,
  ZaakiyNavigationAction,
  ZaakiyStructuredBlock,
  ZaakiyThreadSummary,
} from '../../core/api/zaakiy-api.service';

import { ZaakiyHeaderComponent } from './components/zaakiy-header.component';
import { ZaakiyEmptyStateComponent } from './components/zaakiy-empty-state.component';
import {
  ZaakiyMessageComponent,
  ZaakiyMessageModel,
  ZaakiyProposalUiState,
} from './components/zaakiy-message.component';
import { ZaakiyComposerComponent } from './components/zaakiy-composer.component';
import { ZaakiyThreadSidebarComponent } from './components/zaakiy-thread-sidebar.component';

@Component({
  selector: 'bm-zaakiy',
  standalone: true,
  imports: [
    CommonModule,
    ZaakiyHeaderComponent,
    ZaakiyEmptyStateComponent,
    ZaakiyMessageComponent,
    ZaakiyComposerComponent,
    ZaakiyThreadSidebarComponent,
  ],
  template: `
    <div class="w-full max-w-6xl mx-auto flex flex-col h-[calc(100vh-5rem)] pb-3 px-2 sm:px-4">
      <!-- Main Agentic Workspace Canvas -->
      <div class="flex-1 bg-white border border-surface-200/90 rounded-3xl shadow-xs overflow-hidden flex flex-col min-h-0">
        <!-- Top Workspace Header -->
        <bm-zaakiy-header
          [activeBranch]="activeBranch()"
          [isStreaming]="loading()"
          [hasMessages]="messages().length > 0"
          [historyOpen]="historyOpen()"
          [threadCount]="threads().length"
          [canProposeActions]="canProposeActions()"
          (onReset)="resetChat()"
          (onToggleHistory)="toggleHistory()"
        />

        <div class="flex-1 flex flex-col sm:flex-row min-h-0 relative bg-slate-50/30">
          <!-- Collapsible Branch-Scoped Thread History Drawer -->
          <bm-zaakiy-thread-sidebar
            [open]="historyOpen()"
            [loading]="threadsLoading()"
            [threads]="threads()"
            [activeThreadId]="activeThreadId()"
            (onSelectThread)="selectThread($event)"
            (onDeleteThread)="deleteThread($event)"
            (onNewChat)="resetChat()"
          />

          <!-- Chat Column -->
          <div class="flex-1 flex flex-col min-h-0 min-w-0">
            <!-- Scrollable Messages Container -->
            <div
              #scrollContainer
              class="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6"
              aria-live="polite"
            >
              @if (messages().length === 0) {
                <bm-zaakiy-empty-state (onSelectPrompt)="ask($event)" />
              } @else {
                <div class="max-w-3xl mx-auto space-y-6">
                  @for (message of messages(); track $index) {
                    <bm-zaakiy-message
                      [message]="message"
                      [isLoading]="loading()"
                      [isLast]="$last"
                      [actions]="actions()"
                      [proposalStates]="proposalStates()"
                      (onSelectPrompt)="ask($event)"
                      (onNavigate)="navigate($event)"
                      (onConfirmProposal)="confirmProposal($event)"
                      (onRejectProposal)="rejectProposal($event)"
                      (onFeedback)="submitFeedback($event)"
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

            <!-- Sticky Floating Composer -->
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
    </div>
  `,
  styles: [],
})
export class ZaakiyComponent implements OnInit, OnDestroy {
  private zaakiy = inject(ZaakiyApiService);
  private auth = inject(AuthService);
  private branchContext = inject(BranchContextService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private stream?: Subscription;
  private branchSubscription: Subscription;
  private queryParamsSubscription?: Subscription;

  conversationContext = signal<ZaakiyConversationContext | null>(null);
  activeThreadId = signal<string | null>(null);
  threads = signal<ZaakiyThreadSummary[]>([]);
  threadsLoading = signal(false);
  historyOpen = signal(false);
  proposalStates = signal<Record<string, ZaakiyProposalUiState>>({});

  draft = '';
  loading = signal(false);
  error = signal<string | null>(null);
  messages = signal<ZaakiyMessageModel[]>([]);
  actions = signal<ZaakiyNavigationAction[]>([]);

  readonly activeBranch = this.branchContext.activeBranch;
  readonly canProposeActions = computed(
    () =>
      this.auth.hasPermission('maintenance.manage') ||
      this.auth.hasPermission('customers.manage') ||
      this.auth.hasPermission('accounts.post') ||
      this.auth.hasPermission('agreements.manage'),
  );

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;

  constructor() {
    this.branchSubscription = this.branchContext.branchChanged$.subscribe(() => {
      this.resetChat();
      void this.refreshThreads();
    });
  }

  ngOnInit(): void {
    void this.refreshThreads();
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

  toggleHistory(): void {
    const next = !this.historyOpen();
    this.historyOpen.set(next);
    if (next) {
      void this.refreshThreads();
    }
  }

  async refreshThreads(): Promise<void> {
    if (!this.branchContext.activeBranchId()) {
      this.threads.set([]);
      return;
    }
    this.threadsLoading.set(true);
    try {
      this.threads.set(await this.zaakiy.listThreads());
    } catch {
      // Keep workspace usable even if history fetch fails transiently.
    } finally {
      this.threadsLoading.set(false);
    }
  }

  async selectThread(uuid: string): Promise<void> {
    if (this.loading()) return;
    this.error.set(null);
    try {
      const detail = await this.zaakiy.getThread(uuid);
      this.activeThreadId.set(detail.uuid);
      this.conversationContext.set(null);
      this.actions.set([]);
      this.proposalStates.set({});
      this.messages.set(
        detail.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          text: msg.text,
          blocks: msg.blocks,
          actions: msg.actions,
          feedback: msg.feedback ?? null,
        })),
      );
      this.scrollToBottom();
    } catch (err) {
      this.error.set((err as Error).message || 'Unable to load conversation.');
    }
  }

  async deleteThread(uuid: string): Promise<void> {
    try {
      await this.zaakiy.deleteThread(uuid);
      this.threads.update((items) => items.filter((item) => item.uuid !== uuid));
      if (this.activeThreadId() === uuid) {
        this.resetChat();
      }
    } catch (err) {
      this.error.set((err as Error).message || 'Unable to delete conversation.');
    }
  }

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
      { role: 'model', text: '', blocks: [], actions: [], statusLabel: 'Analyzing branch data...' },
    ]);

    this.scrollToBottom();

    this.stream?.unsubscribe();
    this.stream = this.zaakiy
      .stream(message, history, this.conversationContext(), this.activeThreadId())
      .subscribe({
        next: (event) => {
          if (event.type === 'status' && event.label) {
            this.messages.update((items) =>
              items.map((item, index) =>
                index === items.length - 1 ? { ...item, statusLabel: event.label } : item,
              ),
            );
          }
          if (event.type === 'done') {
            this.conversationContext.set(event.context ?? null);
            if (event.threadId) {
              this.activeThreadId.set(event.threadId);
            }
            this.messages.update((items) =>
              items.map((item, index) =>
                index === items.length - 1
                  ? {
                      ...item,
                      statusLabel: undefined,
                      ...(event.messageId ? { id: event.messageId } : {}),
                    }
                  : item,
              ),
            );
            void this.refreshThreads();
          }
          if (event.type === 'navigation') {
            const incoming: ZaakiyNavigationAction[] = event.items?.length
              ? event.items
              : event.label && event.url
                ? [{ label: event.label, url: event.url, ...(event.query ? { query: event.query } : {}) }]
                : [];
            if (incoming.length > 0) {
              const actionKey = (a: ZaakiyNavigationAction) => `${a.url}|${JSON.stringify(a.query ?? {})}`;
              this.messages.update((items) =>
                items.map((item, index) => {
                  if (index !== items.length - 1) return item;
                  const existing = item.actions ?? [];
                  const merged = [...existing];
                  for (const action of incoming) {
                    if (!merged.some((a) => actionKey(a) === actionKey(action))) {
                      merged.push(action);
                    }
                  }
                  return { ...item, actions: merged };
                }),
              );
            }
          }
          if (event.type === 'token' && event.text) {
            this.messages.update((items) =>
              items.map((item, index) =>
                index === items.length - 1
                  ? { ...item, text: item.text + event.text, statusLabel: undefined }
                  : item,
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

  async confirmProposal(event: { proposalId: string; overrides: Record<string, unknown> }): Promise<void> {
    this.proposalStates.update((states) => ({
      ...states,
      [event.proposalId]: { ...states[event.proposalId], submitting: true, error: null },
    }));
    try {
      const result = await this.zaakiy.confirmAction(event.proposalId, event.overrides);
      this.proposalStates.update((states) => ({
        ...states,
        [event.proposalId]: {
          submitting: false,
          error: null,
          status: 'executed',
          result_label: result.label,
          result_route: result.route,
        },
      }));
    } catch (err) {
      this.proposalStates.update((states) => ({
        ...states,
        [event.proposalId]: {
          ...states[event.proposalId],
          submitting: false,
          error: (err as Error).message || 'Unable to execute this proposal.',
        },
      }));
    }
  }

  async rejectProposal(proposalId: string): Promise<void> {
    this.proposalStates.update((states) => ({
      ...states,
      [proposalId]: { ...states[proposalId], submitting: true, error: null },
    }));
    try {
      await this.zaakiy.rejectAction(proposalId);
      this.proposalStates.update((states) => ({
        ...states,
        [proposalId]: { submitting: false, error: null, status: 'rejected' },
      }));
    } catch (err) {
      this.proposalStates.update((states) => ({
        ...states,
        [proposalId]: {
          ...states[proposalId],
          submitting: false,
          error: (err as Error).message || 'Unable to reject this proposal.',
        },
      }));
    }
  }

  async submitFeedback(event: { messageId: number; feedback: ZaakiyFeedback }): Promise<void> {
    try {
      const saved = await this.zaakiy.submitFeedback(event.messageId, event.feedback);
      this.messages.update((items) =>
        items.map((item) => (item.id === saved.id ? { ...item, feedback: saved.feedback } : item)),
      );
    } catch (err) {
      this.error.set((err as Error).message || 'Unable to submit feedback.');
    }
  }

  stopStreaming(): void {
    if (this.stream) {
      this.stream.unsubscribe();
      this.loading.set(false);
    }
  }

  resetChat(): void {
    this.stopStreaming();
    this.activeThreadId.set(null);
    this.messages.set([]);
    this.actions.set([]);
    this.proposalStates.set({});
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
