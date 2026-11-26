import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyOrbComponent } from './zaakiy-orb.component';
import { ZaakiyComparisonCardComponent } from './zaakiy-comparison-card.component';
import { ZaakiyTrendCardComponent } from './zaakiy-trend-card.component';
import { ZaakiyExplanationCardComponent } from './zaakiy-explanation-card.component';
import { ZaakiyAnomalyCardComponent } from './zaakiy-anomaly-card.component';
import { ZaakiyActionProposalCardComponent } from './zaakiy-action-proposal-card.component';
import { ZaakiyDisambiguationCardComponent } from './zaakiy-disambiguation-card.component';
import {
  ZaakiyActionProposal,
  ZaakiyFeedback,
  ZaakiyMetricCard,
  ZaakiyNavigationAction,
  ZaakiyStructuredBlock,
  ZaakiyStructuredRecord,
} from '../../../core/api/zaakiy-api.service';

export interface ZaakiyProposalUiState {
  submitting?: boolean;
  error?: string | null;
  status?: 'pending' | 'executed' | 'rejected' | 'expired';
  result_label?: string;
  result_route?: string;
}

export interface ZaakiyMessageModel {
  id?: number;
  role: 'user' | 'model';
  text: string;
  blocks: ZaakiyStructuredBlock[];
  actions?: ZaakiyNavigationAction[];
  statusLabel?: string;
  feedback?: ZaakiyFeedback | null;
}

@Component({
  selector: 'bm-zaakiy-message',
  standalone: true,
  imports: [
    CommonModule,
    ZaakiyOrbComponent,
    ZaakiyComparisonCardComponent,
    ZaakiyTrendCardComponent,
    ZaakiyExplanationCardComponent,
    ZaakiyAnomalyCardComponent,
    ZaakiyActionProposalCardComponent,
    ZaakiyDisambiguationCardComponent,
  ],
  template: `
    <div
      class="flex gap-3.5 transition-all duration-200"
      [class.justify-end]="message.role === 'user'"
    >
      <!-- Gemini-Style Sparkle Avatar for Assistant -->
      @if (message.role === 'model') {
        <div class="mt-1 shrink-0">
          <bm-zaakiy-orb size="sm" [pulse]="isLoading && isLast && !message.text" />
        </div>
      }

      <div
        class="min-w-0 flex flex-col"
        [ngClass]="{
          'max-w-[82%] items-end': message.role === 'user',
          'flex-1 max-w-full': message.role === 'model'
        }"
      >
        <!-- Message Body -->
        @if (message.role === 'user') {
          <div class="bg-slate-100 text-slate-900 rounded-3xl rounded-tr-md px-4 py-2.5 text-[15px] leading-relaxed font-poppins whitespace-pre-wrap">
            {{ message.text }}
          </div>
        } @else {
          <div class="text-[15px] leading-7 font-poppins text-slate-800 w-full">
            @if (message.text) {
              <div
                class="zaakiy-formatted-text space-y-2.5"
                [innerHTML]="formattedMarkdown"
              ></div>
            } @else if (isLoading && isLast) {
              <div class="flex items-center gap-2 text-slate-500 py-1">
                <span class="text-sm font-normal animate-pulse">
                  {{ message.statusLabel || 'Thinking...' }}
                </span>
              </div>
            }
          </div>
        }

        <!-- Structured Data Blocks (Clean Flat Hierarchy, Zero Pill Clutter) -->
        @if (message.role === 'model' && message.blocks.length > 0) {
          <div class="mt-3 space-y-3.5 w-full">
            @for (block of message.blocks; track $index) {
              <!-- Summary Metrics: Minimal Borderless Grid (No Pill Soup) -->
              @if (block.type === 'summary' && block.metrics?.length) {
                <div class="py-3 border-y border-slate-100 space-y-2">
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                    @for (metric of visibleMetrics(block.metrics!, $index); track metric.metric) {
                      <div class="min-w-0">
                        <div class="text-[11px] text-slate-400 font-normal truncate">{{ metric.label }}</div>
                        <div class="text-sm font-semibold text-slate-900 tabular-nums mt-0.5">
                          {{ formatMetricValue(metric) }}
                        </div>
                      </div>
                    }
                  </div>
                  @if (block.metrics!.length > 6) {
                    <button
                      type="button"
                      (click)="toggleMetrics($index)"
                      class="text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer pt-1"
                    >
                      {{ isMetricsExpanded($index) ? 'Show fewer figures' : 'Show all ' + block.metrics!.length + ' verified figures' }}
                    </button>
                  }
                </div>
              }

              <!-- Verified Records: Clean Flat List -->
              @if (block.type === 'records' && block.records?.length) {
                <div class="rounded-2xl border border-slate-200/70 bg-white divide-y divide-slate-100 overflow-hidden text-xs font-poppins">
                  @for (record of block.records; track (record.type || '') + ':' + (record.id || '') + ':' + (record.label || '')) {
                    <div class="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-slate-50/70 transition">
                      <div class="min-w-0 flex items-center gap-2.5">
                        <span class="font-medium text-slate-900 truncate">{{ record.label || record.type }}</span>
                        @if (record.status) {
                          <span class="text-[11px] text-slate-400 capitalize shrink-0">{{ record.status }}</span>
                        }
                      </div>
                      @if (recordRoute(record)) {
                        <button
                          type="button"
                          (click)="onNavigate.emit(recordRoute(record)!)"
                          class="text-xs font-medium text-emerald-700 hover:text-emerald-900 cursor-pointer transition shrink-0"
                        >
                          Open →
                        </button>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Dedicated Analytics Cards -->
              @if (block.type === 'comparison' && block.comparisons?.length) {
                <div class="space-y-2">
                  @for (comparison of block.comparisons; track $index) {
                    <bm-zaakiy-comparison-card [comparison]="comparison" />
                  }
                </div>
              }

              @if (block.type === 'trend' && block.trends?.length) {
                <div class="space-y-2">
                  @for (trend of block.trends; track $index) {
                    <bm-zaakiy-trend-card [trend]="trend" />
                  }
                </div>
              }

              @if (block.type === 'explanation' && block.explanations?.length) {
                <div class="space-y-2">
                  @for (exp of block.explanations; track $index) {
                    <bm-zaakiy-explanation-card [explanation]="exp" />
                  }
                </div>
              }

              @if (block.type === 'anomalies' && block.anomalies?.length) {
                <div class="space-y-2">
                  @for (anomaly of block.anomalies; track $index) {
                    <bm-zaakiy-anomaly-card [anomaly]="anomaly" />
                  }
                </div>
              }

              <!-- Warnings: Quiet Inline Note -->
              @if (block.type === 'warnings' && block.warnings?.length) {
                <div class="space-y-1 text-xs text-slate-500">
                  @for (warn of block.warnings; track $index) {
                    <div class="flex items-start gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <span>{{ warn['message'] || warn['code'] }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Disambiguation Candidates -->
              @if (block.type === 'disambiguation' && block.candidates?.length) {
                <bm-zaakiy-disambiguation-card
                  [query]="block.query"
                  [candidates]="block.candidates!"
                  (onSelectPrompt)="onSelectPrompt.emit($event)"
                />
              }

              <!-- Human-in-the-Loop Action Proposal Card -->
              @if (block.type === 'action_proposal' && block.proposal) {
                <bm-zaakiy-action-proposal-card
                  [proposal]="mergedProposal(block.proposal)"
                  [submitting]="proposalState(block.proposal.proposal_id)?.submitting ?? false"
                  [errorMessage]="proposalState(block.proposal.proposal_id)?.error ?? null"
                  (onConfirm)="onConfirmProposal.emit($event)"
                  (onReject)="onRejectProposal.emit($event)"
                  (onNavigate)="onNavigate.emit($event)"
                />
              }

              <!-- Follow-Up Suggestions: Clean Quiet Rows (No Pill Walls) -->
              @if (block.type === 'suggestions' && block.suggestions?.length && isLast) {
                <div class="pt-2 border-t border-slate-100 divide-y divide-slate-100/80">
                  @for (sug of block.suggestions!.slice(0, 3); track sug) {
                    <button
                      type="button"
                      (click)="onSelectPrompt.emit(sug)"
                      class="w-full text-left py-2 px-1 text-[13px] text-slate-600 hover:text-slate-950 transition flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <span>{{ sug }}</span>
                      <span class="text-slate-300 group-hover:text-emerald-600 transition">→</span>
                    </button>
                  }
                </div>
              }
            }
          </div>
        }

        <!-- Quiet Inline Navigation Links (No Loud Solid Button Pills) -->
        @if (message.role === 'model' && resolvedActions.length > 0) {
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
            @for (action of resolvedActions; track formatActionUrl(action)) {
              <button
                type="button"
                (click)="onNavigate.emit(formatActionUrl(action))"
                class="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/70 px-2 py-1 -ml-2 rounded-lg transition cursor-pointer"
              >
                <span>{{ action.label }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            }
          </div>
        }

        <!-- Gemini-Style Subtle Bottom Icon Toolbar (Copy + Thumbs Up/Down) -->
        @if (message.role === 'model' && message.text && !(isLoading && isLast)) {
          <div class="flex items-center gap-1 mt-2 -ml-1.5 text-slate-400">
            <button
              type="button"
              (click)="copyMessageText()"
              [title]="copied() ? 'Copied' : 'Copy response'"
              aria-label="Copy response"
              class="w-8 h-8 rounded-full hover:bg-slate-100 hover:text-slate-700 transition flex items-center justify-center cursor-pointer"
              [class.text-emerald-600]="copied()"
            >
              @if (copied()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            </button>

            @if (message.id) {
              <button
                type="button"
                (click)="onFeedback.emit({ messageId: message.id!, feedback: 'helpful' })"
                title="Good response"
                class="w-8 h-8 rounded-full hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                [ngClass]="{
                  'text-emerald-600 bg-emerald-50': message.feedback === 'helpful',
                  'text-slate-400 hover:text-slate-700': message.feedback !== 'helpful'
                }"
              >
                <span class="sr-only">Helpful</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                </svg>
              </button>

              <button
                type="button"
                (click)="onFeedback.emit({ messageId: message.id!, feedback: 'unhelpful' })"
                title="Needs work"
                class="w-8 h-8 rounded-full hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
                [ngClass]="{
                  'text-rose-600 bg-rose-50': message.feedback === 'unhelpful',
                  'text-slate-400 hover:text-slate-700': message.feedback !== 'unhelpful'
                }"
              >
                <span class="sr-only">Needs work</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
                </svg>
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .zaakiy-formatted-text h1,
      :host ::ng-deep .zaakiy-formatted-text h2,
      :host ::ng-deep .zaakiy-formatted-text h3 {
        font-weight: 600;
        color: #0f172a;
        margin-top: 1rem;
        margin-bottom: 0.35rem;
      }
      :host ::ng-deep .zaakiy-formatted-text h3 {
        font-size: 0.95rem;
      }
      :host ::ng-deep .zaakiy-formatted-text strong {
        font-weight: 600;
        color: #0f172a;
      }
      :host ::ng-deep .zaakiy-formatted-text em {
        font-style: italic;
        color: #475569;
      }
      :host ::ng-deep .zaakiy-formatted-text code {
        background-color: #f1f5f9;
        padding: 0.1rem 0.35rem;
        border-radius: 0.375rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.8rem;
        color: #047857;
      }
      :host ::ng-deep .zaakiy-formatted-text ul {
        list-style-type: disc;
        padding-left: 1.25rem;
        margin-top: 0.375rem;
        margin-bottom: 0.5rem;
      }
      :host ::ng-deep .zaakiy-formatted-text ol {
        list-style-type: decimal;
        padding-left: 1.25rem;
        margin-top: 0.375rem;
        margin-bottom: 0.5rem;
      }
      :host ::ng-deep .zaakiy-formatted-text li {
        margin-bottom: 0.3rem;
      }
      :host ::ng-deep .zaakiy-formatted-text p {
        margin-bottom: 0.5rem;
        line-height: 1.7;
      }
    `,
  ],
})
export class ZaakiyMessageComponent {
  @Input({ required: true }) message!: ZaakiyMessageModel;
  @Input() isLoading = false;
  @Input() isLast = false;
  @Input() actions: ZaakiyNavigationAction[] = [];
  @Input() proposalStates: Record<string, ZaakiyProposalUiState> = {};
  @Output() onSelectPrompt = new EventEmitter<string>();
  @Output() onNavigate = new EventEmitter<string>();
  @Output() onConfirmProposal = new EventEmitter<{ proposalId: string; overrides: Record<string, unknown> }>();
  @Output() onRejectProposal = new EventEmitter<string>();
  @Output() onFeedback = new EventEmitter<{ messageId: number; feedback: ZaakiyFeedback }>();

  copied = signal(false);
  private expandedMetrics = signal<Record<number, boolean>>({});

  visibleMetrics(metrics: ZaakiyMetricCard[], blockIndex: number): ZaakiyMetricCard[] {
    return this.isMetricsExpanded(blockIndex) ? metrics : metrics.slice(0, 6);
  }

  isMetricsExpanded(blockIndex: number): boolean {
    return this.expandedMetrics()[blockIndex] === true;
  }

  toggleMetrics(blockIndex: number): void {
    this.expandedMetrics.update((state) => ({
      ...state,
      [blockIndex]: !state[blockIndex],
    }));
  }

  proposalState(proposalId: string): ZaakiyProposalUiState | undefined {
    return this.proposalStates[proposalId];
  }

  mergedProposal(proposal: ZaakiyActionProposal): ZaakiyActionProposal {
    const state = this.proposalStates[proposal.proposal_id];
    if (!state) return proposal;
    return {
      ...proposal,
      status: state.status ?? proposal.status,
      result_label: state.result_label ?? proposal.result_label,
      result_route: state.result_route ?? proposal.result_route,
    };
  }

  get resolvedActions(): ZaakiyNavigationAction[] {
    if (this.message.actions && this.message.actions.length > 0) {
      return this.message.actions;
    }
    return this.isLast ? this.actions : [];
  }

  formatActionUrl(action: ZaakiyNavigationAction): string {
    if (!action.query || Object.keys(action.query).length === 0) {
      return action.url;
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(action.query)) {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    if (!qs) return action.url;
    return `${action.url}${action.url.includes('?') ? '&' : '?'}${qs}`;
  }

  copyMessageText(): void {
    if (!this.message.text) return;
    navigator.clipboard.writeText(this.message.text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  recordRoute(record: ZaakiyStructuredRecord): string | null {
    if (!record.id) return null;
    const type = (record.type || '').toLowerCase();
    if (
      type === 'tenant' ||
      type === 'owner' ||
      type === 'customer' ||
      type === 'vendor' ||
      type === 'tenant_profile'
    ) {
      return `/app/customers/${record.id}`;
    }
    if (type.includes('property')) return `/app/properties/${record.id}`;
    if (type.includes('tenant_agreement') || type.includes('lease')) return `/app/tenant-agreements/${record.id}`;
    if (type.includes('owner_agreement') || type.includes('management')) return `/app/owner-agreements/${record.id}`;
    if (type.includes('work_order') || type.includes('maintenance')) return `/app/maintenance/work-orders/${record.id}`;
    if (type === 'invoice') return `/app/billing/invoices/${record.id}`;
    if (type === 'quotation') return `/app/billing/quotations/${record.id}`;
    return null;
  }

  formatMetricValue(metric: ZaakiyMetricCard): string {
    const val = metric.value;
    if (metric.unit === 'AED' && typeof val === 'number') {
      return `AED ${val.toLocaleString()}`;
    }
    if (metric.unit === 'AED' && typeof val === 'string' && !Number.isNaN(Number(val))) {
      return `AED ${Number(val).toLocaleString()}`;
    }
    if (metric.unit === 'percent' && typeof val === 'number') {
      return `${val}%`;
    }
    return String(val ?? '');
  }

  get formattedMarkdown(): string {
    if (!this.message.text) return '';
    let formatted = this.message.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Headings (support ####, ###, ##, #)
    formatted = formatted.replace(/^#### (.*$)/gim, '<h3>$1</h3>');
    formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold, italic, code
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

    const lines = formatted.split('\n');
    let inUnordered = false;
    let inOrdered = false;
    const output: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('<h3>') || trimmed.startsWith('<h2>') || trimmed.startsWith('<h1>')) {
        if (inUnordered) { output.push('</ul>'); inUnordered = false; }
        if (inOrdered) { output.push('</ol>'); inOrdered = false; }
        output.push(trimmed);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inUnordered) {
          if (inOrdered) { output.push('</ol>'); inOrdered = false; }
          output.push('<ul>');
          inUnordered = true;
        }
        output.push(`<li>${trimmed.slice(2)}</li>`);
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (!inOrdered) {
          if (inUnordered) { output.push('</ul>'); inUnordered = false; }
          output.push('<ol>');
          inOrdered = true;
        }
        output.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
      } else {
        if (inUnordered) { output.push('</ul>'); inUnordered = false; }
        if (inOrdered) { output.push('</ol>'); inOrdered = false; }
        if (trimmed) {
          output.push(`<p>${trimmed}</p>`);
        }
      }
    }

    if (inUnordered) output.push('</ul>');
    if (inOrdered) output.push('</ol>');

    return output.join('');
  }
}
