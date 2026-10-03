import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyOrbComponent } from './zaakiy-orb.component';
import { ZaakiyMetricCard, ZaakiyStructuredBlock } from '../../../core/api/zaakiy-api.service';

export interface ZaakiyMessageModel {
  role: 'user' | 'model';
  text: string;
  blocks: ZaakiyStructuredBlock[];
}

@Component({
  selector: 'bm-zaakiy-message',
  standalone: true,
  imports: [CommonModule, ZaakiyOrbComponent],
  template: `
    <div
      class="flex gap-3 sm:gap-4 transition-all duration-200"
      [class.justify-end]="message.role === 'user'"
    >
      <!-- Zaakiy Avatar -->
      @if (message.role === 'model') {
        <div class="mt-1 shrink-0">
          <bm-zaakiy-orb size="sm" />
        </div>
      }

      <div
        class="max-w-[95%] sm:max-w-[88%] flex flex-col"
        [class.items-end]="message.role === 'user'"
      >
        <!-- Author / Time Line -->
        <div class="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400 font-medium">
          <span>{{ message.role === 'user' ? 'You' : 'Zaakiy' }}</span>
          @if (message.role === 'model' && message.text) {
            <span>•</span>
            <button
              type="button"
              (click)="copyMessageText()"
              class="text-slate-400 hover:text-slate-600 transition flex items-center gap-1 cursor-pointer"
            >
              @if (copied()) {
                <span class="text-emerald-600 font-semibold">Copied</span>
              } @else {
                <span>Copy</span>
              }
            </button>
          }
        </div>

        <!-- Message Body Container -->
        <div
          class="text-sm leading-relaxed font-poppins transition-all"
          [ngClass]="{
            'bg-slate-100 text-slate-800 rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-2xs': message.role === 'user',
            'text-slate-800 py-1 w-full': message.role === 'model'
          }"
        >
          @if (message.role === 'user') {
            <div class="whitespace-pre-wrap font-normal">{{ message.text }}</div>
          } @else {
            <!-- Rich Text Format Stream -->
            @if (message.text) {
              <div
                class="zaakiy-formatted-text space-y-2 text-slate-800"
                [innerHTML]="formattedMarkdown"
              ></div>
            } @else if (isLoading && isLast) {
              <div class="flex items-center gap-2 text-slate-400 py-2">
                <span class="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                <span class="text-xs italic font-medium">Zaakiy is thinking...</span>
              </div>
            }
          }
        </div>

        <!-- Structured SSE Events rendered as Clean Rich Text (instead of aggressive cards) -->
        @if (message.role === 'model' && message.blocks.length > 0) {
          <div class="mt-3 space-y-3 w-full">
            @for (block of message.blocks; track $index) {
              <!-- Summary Metrics: Clean Inline Rich Badges -->
              @if (block.type === 'summary' && block.metrics?.length) {
                <div class="my-3 flex flex-wrap gap-2 font-poppins text-xs">
                  @for (metric of block.metrics; track metric.metric) {
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                      <span class="text-slate-500 font-normal">{{ metric.label }}:</span>
                      <span class="font-semibold text-slate-900 font-mono">{{ formatMetricValue(metric) }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Verified Records: Clean Structured List -->
              @if (block.type === 'records' && block.records?.length) {
                <div class="my-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2 text-xs font-poppins">
                  <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Verified Records ({{ block.records?.length }})
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    @for (record of block.records; track (record.type || '') + ':' + (record.id || '') + ':' + (record.label || '')) {
                      <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                        <div class="truncate min-w-0 pr-2">
                          <div class="font-semibold text-slate-900 truncate">{{ record.label || record.type }}</div>
                          @if (record.id) {
                            <div class="text-[10px] text-slate-400 font-mono">ID: #{{ record.id }}</div>
                          }
                        </div>
                        @if (record.status) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                            {{ record.status }}
                          </span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Trends & Comparisons: Structured Text Highlights -->
              @if ((block.type === 'trend' && block.trends?.length) || (block.type === 'comparison' && block.comparisons?.length)) {
                <div class="my-3 space-y-2 text-xs font-poppins">
                  @for (item of (block.trends || block.comparisons); track $index) {
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <div class="flex items-center justify-between font-semibold text-slate-900">
                        <span>{{ item['title'] || item['label'] || item['metric'] || 'Analysis Item' }}</span>
                        @if (item['change'] || item['value']) {
                          <span class="font-bold font-mono text-emerald-700">
                            {{ item['change'] || item['value'] }}
                          </span>
                        }
                      </div>
                      @if (item['description'] || item['detail'] || item['summary']) {
                        <p class="text-slate-600 italic text-[11px] leading-relaxed">
                          {{ item['description'] || item['detail'] || item['summary'] }}
                        </p>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Explanations: Bullet List Rich Text -->
              @if (block.type === 'explanation' && block.explanations?.length) {
                <div class="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs font-poppins">
                  @for (exp of block.explanations; track $index) {
                    <div class="space-y-0.5">
                      <div class="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                        <span>{{ exp['title'] || exp['factor'] || 'Key Driver' }}</span>
                      </div>
                      @if (exp['impact'] || exp['description']) {
                        <p class="text-slate-600 pl-3 text-[11px] leading-relaxed">
                          {{ exp['impact'] || exp['description'] }}
                        </p>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Anomalies / Attention Items Callout -->
              @if (block.type === 'anomalies' && block.anomalies?.length) {
                <div class="my-3 space-y-2 text-xs font-poppins">
                  @for (anomaly of block.anomalies; track $index) {
                    <div class="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-1">
                      <div class="font-semibold flex items-center gap-2 text-amber-900">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{{ anomaly['title'] || anomaly['type'] || anomaly['label'] || 'Attention Required' }}</span>
                      </div>
                      @if (anomaly['description'] || anomaly['message'] || anomaly['detail']) {
                        <p class="text-amber-800/90 text-xs pl-6 leading-relaxed">
                          {{ anomaly['description'] || anomaly['message'] || anomaly['detail'] }}
                        </p>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Sections: Clean Headers -->
              @if (block.type === 'sections' && block.sections?.length) {
                <div class="my-3 space-y-2 text-xs font-poppins">
                  @for (sec of block.sections; track $index) {
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                      <span class="font-semibold text-slate-900">{{ sec['title'] || sec['code'] }}</span>
                      @if (sec['status']) {
                        <span class="text-[10px] text-slate-500 font-medium">{{ sec['status'] }}</span>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Warnings Alert Line -->
              @if (block.type === 'warnings' && block.warnings?.length) {
                <div class="my-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  @for (warn of block.warnings; track $index) {
                    <div class="flex items-start gap-2">
                      <span class="font-bold text-amber-600">•</span>
                      <span>{{ warn['message'] || warn['code'] }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Next Question Suggestions (chips below message) -->
              @if (block.type === 'suggestions' && block.suggestions?.length) {
                <div class="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span class="text-[11px] font-semibold text-slate-400 shrink-0">Follow-up questions:</span>
                  @for (sug of block.suggestions; track sug) {
                    <button
                      type="button"
                      (click)="onSelectPrompt.emit(sug)"
                      class="rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-brand-300 text-slate-700 hover:text-brand-900 px-3.5 py-1.5 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{{ sug }}</span>
                    </button>
                  }
                </div>
              }
            }
          </div>
        }

        <!-- Next CTA Action Buttons (Prominent navigation pills) -->
        @if (message.role === 'model' && isLast && actions.length > 0) {
          <div class="flex flex-wrap items-center gap-2 mt-4 pt-1">
            <span class="text-[11px] font-semibold text-slate-400 shrink-0 w-full sm:w-auto">Suggested Actions:</span>
            @for (action of actions; track action.url) {
              <button
                type="button"
                (click)="onNavigate.emit(action.url)"
                class="inline-flex items-center gap-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-full px-4 py-2 transition cursor-pointer shadow-xs"
              >
                <span>{{ action.label }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
        font-weight: 700;
        color: #0f172a;
        margin-top: 0.75rem;
        margin-bottom: 0.25rem;
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
        padding: 0.15rem 0.4rem;
        border-radius: 0.375rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.75rem;
        color: #047857;
      }
      :host ::ng-deep .zaakiy-formatted-text ul {
        list-style-type: disc;
        padding-left: 1.25rem;
        margin-top: 0.375rem;
        margin-bottom: 0.375rem;
      }
      :host ::ng-deep .zaakiy-formatted-text ol {
        list-style-type: decimal;
        padding-left: 1.25rem;
        margin-top: 0.375rem;
        margin-bottom: 0.375rem;
      }
      :host ::ng-deep .zaakiy-formatted-text li {
        margin-bottom: 0.25rem;
      }
      :host ::ng-deep .zaakiy-formatted-text p {
        margin-bottom: 0.375rem;
        line-height: 1.6;
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

  copyMessageText(): void {
    if (!this.message.text) return;
    navigator.clipboard.writeText(this.message.text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  formatMetricValue(metric: ZaakiyMetricCard): string {
    const val = metric.value;
    if (metric.unit === 'AED' && typeof val === 'number') {
      return `AED ${val.toLocaleString()}`;
    }
    if (metric.unit === 'percent' && typeof val === 'number') {
      return `${val}%`;
    }
    return String(val ?? '');
  }

  get formattedMarkdown(): string {
    if (!this.message.text) return '';
    let formatted = this.message.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Headings
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
