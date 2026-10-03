import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyOrbComponent } from './zaakiy-orb.component';
import { ZaakiyMetricCardComponent } from './zaakiy-metric-card.component';
import { ZaakiyComparisonCardComponent } from './zaakiy-comparison-card.component';
import { ZaakiyTrendCardComponent } from './zaakiy-trend-card.component';
import { ZaakiyExplanationCardComponent } from './zaakiy-explanation-card.component';
import { ZaakiyAnomalyCardComponent } from './zaakiy-anomaly-card.component';
import { ZaakiyRecordCardComponent } from './zaakiy-record-card.component';
import { ZaakiyBriefingBoardComponent } from './zaakiy-briefing-board.component';
import { ZaakiyStructuredBlock } from '../../../core/api/zaakiy-api.service';

export interface ZaakiyMessageModel {
  role: 'user' | 'model';
  text: string;
  blocks: ZaakiyStructuredBlock[];
}

@Component({
  selector: 'bm-zaakiy-message',
  standalone: true,
  imports: [
    CommonModule,
    ZaakiyOrbComponent,
    ZaakiyMetricCardComponent,
    ZaakiyComparisonCardComponent,
    ZaakiyTrendCardComponent,
    ZaakiyExplanationCardComponent,
    ZaakiyAnomalyCardComponent,
    ZaakiyRecordCardComponent,
    ZaakiyBriefingBoardComponent,
  ],
  template: `
    <div
      class="flex gap-3.5 transition-all duration-200"
      [class.justify-end]="message.role === 'user'"
    >
      <!-- Zaakiy Avatar -->
      @if (message.role === 'model') {
        <div class="mt-0.5 shrink-0">
          <bm-zaakiy-orb size="sm" />
        </div>
      }

      <div
        class="max-w-[92%] sm:max-w-[85%] lg:max-w-[80%] flex flex-col"
        [class.items-end]="message.role === 'user'"
      >
        <!-- Metadata Line -->
        <div class="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400 font-medium">
          <span>{{ message.role === 'user' ? 'You' : 'ZaakiyV3RSE' }}</span>
          @if (message.role === 'model' && message.text) {
            <span>•</span>
            <button
              type="button"
              (click)="copyMessageText()"
              class="text-slate-400 hover:text-slate-600 transition flex items-center gap-1 cursor-pointer"
            >
              @if (copied()) {
                <span class="text-brand-600 font-semibold">Copied!</span>
              } @else {
                <span>Copy</span>
              }
            </button>
          }
        </div>

        <!-- Message Bubble Body -->
        <div
          class="text-xs sm:text-sm leading-relaxed transition-all duration-150"
          [ngClass]="{
            'bg-surface-100 text-ink rounded-2xl rounded-tr-xs px-4 py-3 shadow-2xs border border-surface-200/80': message.role === 'user',
            'text-ink py-1 rounded-2xl w-full': message.role === 'model'
          }"
        >
          @if (message.role === 'user') {
            <div class="whitespace-pre-wrap font-poppins font-normal">{{ message.text }}</div>
          } @else {
            @if (message.text) {
              <div
                class="zaakiy-formatted-text space-y-2 font-poppins text-ink"
                [innerHTML]="formattedMarkdown"
              ></div>
            } @else if (isLoading && isLast) {
              <div class="flex items-center gap-2 text-slate-500 py-1">
                <span class="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                <span class="text-xs italic font-medium">Querying verified ERP backend stream...</span>
              </div>
            }
          }
        </div>

        <!-- Structured SSE Event Intelligence Blocks -->
        @if (message.role === 'model' && message.blocks.length > 0) {
          <div class="mt-3.5 space-y-3 w-full" aria-label="Structured intelligence results">
            <!-- Management Briefing special bento view -->
            @if (isBriefingPayload) {
              <bm-zaakiy-briefing-board [blocks]="message.blocks" />
            } @else {
              @for (block of message.blocks; track $index) {
                <!-- Summary Metrics Grid -->
                @if (block.type === 'summary' && block.metrics?.length) {
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    @for (metric of block.metrics; track metric.metric) {
                      <bm-zaakiy-metric-card [metric]="metric" />
                    }
                  </div>
                }

                <!-- Records List -->
                @if (block.type === 'records' && block.records?.length) {
                  <div class="rounded-2xl border border-surface-200 bg-white p-3.5 space-y-2 shadow-2xs">
                    <div class="text-[10px] font-poppins font-semibold uppercase tracking-wider text-slate-400">
                      Verified Records ({{ block.records?.length }})
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      @for (record of block.records; track (record.type || '') + ':' + (record.id || '') + ':' + (record.label || '')) {
                        <bm-zaakiy-record-card [record]="record" />
                      }
                    </div>
                  </div>
                }

                <!-- Comparisons -->
                @if (block.type === 'comparison' && block.comparisons?.length) {
                  <div class="space-y-2">
                    @for (comparison of block.comparisons; track $index) {
                      <bm-zaakiy-comparison-card [comparison]="comparison" />
                    }
                  </div>
                }

                <!-- Trends -->
                @if (block.type === 'trend' && block.trends?.length) {
                  <div class="space-y-2">
                    @for (trend of block.trends; track $index) {
                      <bm-zaakiy-trend-card [trend]="trend" />
                    }
                  </div>
                }

                <!-- Measured Drivers Explanation -->
                @if (block.type === 'explanation' && block.explanations?.length) {
                  <div class="space-y-2">
                    @for (explanation of block.explanations; track $index) {
                      <bm-zaakiy-explanation-card [explanation]="explanation" />
                    }
                  </div>
                }

                <!-- Anomaly / Attention Items -->
                @if (block.type === 'anomalies' && block.anomalies?.length) {
                  <div class="space-y-2">
                    @for (anomaly of block.anomalies; track $index) {
                      <bm-zaakiy-anomaly-card [anomaly]="anomaly" />
                    }
                  </div>
                }

                <!-- Compound Query Sections -->
                @if (block.type === 'sections' && block.sections?.length) {
                  <div class="space-y-2">
                    @for (section of block.sections; track section['code'] || $index) {
                      <div class="rounded-2xl border border-surface-200 bg-white p-3.5 shadow-2xs">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="w-2 h-2 rounded-full bg-brand-500"></span>
                          <span class="text-xs font-poppins font-semibold text-ink">
                            {{ section['title'] || section['code'] }}
                          </span>
                        </div>
                        @if (section['status']) {
                          <span class="text-[10px] text-slate-500 font-medium">
                            {{ section['status'] }}
                          </span>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- Warnings -->
                @if (block.type === 'warnings' && block.warnings?.length) {
                  <div class="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 space-y-1">
                    @for (warning of block.warnings; track warning['code'] || $index) {
                      <div class="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ warning['message'] || warning['code'] }}</span>
                      </div>
                    }
                  </div>
                }

                <!-- Backend Suggestions Chips -->
                @if (block.type === 'suggestions' && block.suggestions?.length) {
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    @for (suggestion of block.suggestions; track suggestion) {
                      <button
                        type="button"
                        (click)="onSelectPrompt.emit(suggestion)"
                        class="rounded-full border border-brand-100 bg-brand-50 hover:bg-brand-100 px-3 py-1 text-[11px] font-semibold text-brand-800 transition cursor-pointer"
                      >
                        {{ suggestion }}
                      </button>
                    }
                  </div>
                }
              }
            }
          </div>
        }

        <!-- AI Navigation Actions -->
        @if (message.role === 'model' && isLast && actions.length > 0) {
          <div class="flex flex-wrap gap-2 mt-3">
            @for (action of actions; track action.url) {
              <button
                type="button"
                (click)="onNavigate.emit(action.url)"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 bg-brand-50 border border-brand-200/80 rounded-full px-3.5 py-1.5 hover:bg-brand-100 transition cursor-pointer shadow-2xs"
              >
                <span>{{ action.label }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
      :host ::ng-deep .zaakiy-formatted-text strong {
        font-weight: 600;
        color: #101214;
      }
      :host ::ng-deep .zaakiy-formatted-text code {
        background-color: rgba(233, 238, 234, 0.8);
        padding: 0.15rem 0.4rem;
        border-radius: 0.375rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.75rem;
        color: #064e3b;
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
export class ZaakiyMessageComponent {
  @Input({ required: true }) message!: ZaakiyMessageModel;
  @Input() isLoading = false;
  @Input() isLast = false;
  @Input() actions: Array<{ label: string; url: string }> = [];
  @Output() onSelectPrompt = new EventEmitter<string>();
  @Output() onNavigate = new EventEmitter<string>();

  copied = signal(false);

  get isBriefingPayload(): boolean {
    return this.message.blocks.some((b) => b.type === 'summary') && this.message.blocks.some((b) => b.type === 'anomalies');
  }

  copyMessageText(): void {
    if (!this.message.text) return;
    navigator.clipboard.writeText(this.message.text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(null as unknown as boolean), 2000);
    });
  }

  get formattedMarkdown(): string {
    if (!this.message.text) return '';
    let formatted = this.message.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

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

    return output.join('');
  }
}
