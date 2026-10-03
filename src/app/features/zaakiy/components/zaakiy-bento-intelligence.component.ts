import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyMetricCardComponent } from './zaakiy-metric-card.component';
import { ZaakiyComparisonCardComponent } from './zaakiy-comparison-card.component';
import { ZaakiyTrendCardComponent } from './zaakiy-trend-card.component';
import { ZaakiyExplanationCardComponent } from './zaakiy-explanation-card.component';
import { ZaakiyAnomalyCardComponent } from './zaakiy-anomaly-card.component';
import { ZaakiyRecordCardComponent } from './zaakiy-record-card.component';
import { ZaakiyMetricCard, ZaakiyStructuredBlock, ZaakiyStructuredRecord } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-bento-intelligence',
  standalone: true,
  imports: [
    CommonModule,
    ZaakiyMetricCardComponent,
    ZaakiyComparisonCardComponent,
    ZaakiyTrendCardComponent,
    ZaakiyExplanationCardComponent,
    ZaakiyAnomalyCardComponent,
    ZaakiyRecordCardComponent,
  ],
  template: `
    <div class="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
      <!-- Section Header -->
      <div class="flex items-center justify-between gap-2 pb-2 border-b border-surface-200">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
          <h3 class="font-poppins font-semibold text-xs text-ink uppercase tracking-wider">
            Structured Intelligence
          </h3>
        </div>
        <span class="text-[10px] font-bold text-slate-400 bg-surface-100 px-2 py-0.5 rounded-full">
          Bento Workspace
        </span>
      </div>

      <!-- Active Structured Intelligence Cards -->
      @if (hasStructuredData) {
        <!-- Summary Metrics Grid -->
        @if (summaryMetrics.length > 0) {
          <div class="space-y-2">
            <h4 class="text-[10px] font-poppins font-semibold uppercase tracking-wider text-slate-400">
              Key Metrics
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (metric of summaryMetrics; track metric.metric) {
                <bm-zaakiy-metric-card [metric]="metric" />
              }
            </div>
          </div>
        }

        <!-- Attention / Anomalies -->
        @if (anomalies.length > 0) {
          <div class="space-y-2">
            <h4 class="text-[10px] font-poppins font-semibold uppercase tracking-wider text-rose-600">
              Attention Required ({{ anomalies.length }})
            </h4>
            <div class="space-y-2">
              @for (anomaly of anomalies; track $index) {
                <bm-zaakiy-anomaly-card [anomaly]="anomaly" />
              }
            </div>
          </div>
        }

        <!-- Comparison Cards -->
        @if (comparisons.length > 0) {
          <div class="space-y-2">
            <h4 class="text-[10px] font-poppins font-semibold uppercase tracking-wider text-slate-400">
              Period Comparison
            </h4>
            @for (comp of comparisons; track $index) {
              <bm-zaakiy-comparison-card [comparison]="comp" />
            }
          </div>
        }

        <!-- Trends -->
        @if (trends.length > 0) {
          <div class="space-y-2">
            <h4 class="text-[10px] font-poppins font-semibold uppercase tracking-wider text-slate-400">
              Metric Trend
            </h4>
            @for (tr of trends; track $index) {
              <bm-zaakiy-trend-card [trend]="tr" />
            }
          </div>
        }

        <!-- Measured Drivers -->
        @if (explanations.length > 0) {
          <div class="space-y-2">
            @for (exp of explanations; track $index) {
              <bm-zaakiy-explanation-card [explanation]="exp" />
            }
          </div>
        }

        <!-- Records -->
        @if (records.length > 0) {
          <div class="space-y-2">
            <h4 class="text-[10px] font-poppins font-semibold uppercase tracking-wider text-slate-400">
              Context Records
            </h4>
            <div class="space-y-2 max-h-72 overflow-y-auto">
              @for (rec of records; track (rec.type || '') + ':' + (rec.id || '')) {
                <bm-zaakiy-record-card [record]="rec" />
              }
            </div>
          </div>
        }
      } @else {
        <!-- Default Supporting Intelligence Surface Cards -->
        <div class="space-y-3">
          <!-- Featured Insight Tile -->
          <div class="rounded-2xl bg-zaakiy-gradient text-white p-4 shadow-2xs space-y-2">
            <div class="flex items-center justify-between text-[10px] text-brand-100 font-semibold uppercase tracking-wider">
              <span>Branch Copilot</span>
              <span class="w-2 h-2 rounded-full bg-[#DFFF62]"></span>
            </div>
            <h4 class="font-poppins font-bold text-sm text-white">
              Verified Real-Estate Intelligence
            </h4>
            <p class="text-xs text-emerald-100/90 leading-relaxed font-normal">
              Structured responses stream live metrics, comparisons, trends, explanations, and attention alerts calculated directly on the backend.
            </p>
          </div>

          <!-- Quick Actions Tile -->
          <div class="rounded-2xl border border-surface-200 bg-white p-4 space-y-2.5">
            <h4 class="text-xs font-poppins font-semibold text-ink">
              Quick Operations
            </h4>
            <div class="space-y-1.5 text-xs">
              @for (prompt of quickPrompts; track prompt) {
                <button
                  type="button"
                  (click)="onSelectPrompt.emit(prompt)"
                  class="w-full text-left px-3 py-2 rounded-xl bg-surface-50 hover:bg-brand-50 hover:text-brand-900 border border-surface-100 hover:border-brand-200 transition flex items-center justify-between cursor-pointer group text-slate-700"
                >
                  <span class="truncate font-medium text-[11px]">{{ prompt }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              }
            </div>
          </div>

          <!-- Trust & Scope Card -->
          <div class="rounded-2xl border border-surface-200 bg-surface-50 p-3.5 space-y-1.5 text-[11px] text-slate-600">
            <div class="font-poppins font-semibold text-xs text-ink flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Security & Permission Scope</span>
            </div>
            <p class="text-[11px] text-slate-500 leading-normal">
              Zaakiy never executes client-side financial calculations or write actions. Data access is strictly branch and permission isolated.
            </p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class ZaakiyBentoIntelligenceComponent {
  @Input() blocks: ZaakiyStructuredBlock[] = [];
  @Output() onSelectPrompt = new EventEmitter<string>();

  readonly quickPrompts = [
    'Management briefing',
    'Rent collections this month',
    'Vacant properties list',
    'Agreements expiring in 30 days',
    'Open work order backlog',
  ];

  get hasStructuredData(): boolean {
    return this.blocks.length > 0;
  }

  get summaryMetrics(): ZaakiyMetricCard[] {
    const block = this.blocks.find((b) => b.type === 'summary');
    return block?.metrics ?? [];
  }

  get anomalies(): Array<Record<string, unknown>> {
    const block = this.blocks.find((b) => b.type === 'anomalies');
    return block?.anomalies ?? [];
  }

  get comparisons(): Array<Record<string, unknown>> {
    const block = this.blocks.find((b) => b.type === 'comparison');
    return block?.comparisons ?? [];
  }

  get trends(): Array<Record<string, unknown>> {
    const block = this.blocks.find((b) => b.type === 'trend');
    return block?.trends ?? [];
  }

  get explanations(): Array<Record<string, unknown>> {
    const block = this.blocks.find((b) => b.type === 'explanation');
    return block?.explanations ?? [];
  }

  get records(): ZaakiyStructuredRecord[] {
    const block = this.blocks.find((b) => b.type === 'records');
    return block?.records ?? [];
  }
}
