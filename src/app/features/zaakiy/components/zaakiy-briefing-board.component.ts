import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyMetricCardComponent } from './zaakiy-metric-card.component';
import { ZaakiyAnomalyCardComponent } from './zaakiy-anomaly-card.component';
import { ZaakiyStructuredBlock } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-briefing-board',
  standalone: true,
  imports: [CommonModule, ZaakiyMetricCardComponent, ZaakiyAnomalyCardComponent],
  template: `
    <div class="rounded-3xl border border-brand-800/20 bg-white p-4 sm:p-6 space-y-4 shadow-sm">
      <!-- Briefing Header Banner -->
      <div class="rounded-2xl bg-zaakiy-gradient text-white p-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#DFFF62]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-poppins font-bold text-sm sm:text-base text-white">
              Management Briefing
            </h3>
            <p class="text-[11px] text-emerald-100/90 font-medium">
              Branch Operational Overview
            </p>
          </div>
        </div>

        <span class="text-[10px] font-bold uppercase tracking-wider bg-[#DFFF62] text-brand-950 px-2.5 py-1 rounded-full shrink-0">
          Executive
        </span>
      </div>

      <!-- Bento Board Layout -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Attention (Large top tile) -->
        @if (anomalies.length > 0) {
          <div class="md:col-span-2 space-y-2">
            <h4 class="text-xs font-poppins font-semibold text-ink-soft uppercase tracking-wider">
              Attention Items ({{ anomalies.length }})
            </h4>
            <div class="space-y-2">
              @for (anomaly of anomalies.slice(0, 3); track $index) {
                <bm-zaakiy-anomaly-card [anomaly]="anomaly" />
              }
            </div>
          </div>
        }

        <!-- Collections / Key Summary Metrics -->
        @if (metrics.length > 0) {
          <div class="md:col-span-1 space-y-2">
            <h4 class="text-xs font-poppins font-semibold text-ink-soft uppercase tracking-wider">
              Key Metrics
            </h4>
            <div class="space-y-2">
              @for (metric of metrics.slice(0, 4); track metric.metric) {
                <bm-zaakiy-metric-card [metric]="metric" />
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyBriefingBoardComponent {
  @Input() blocks: ZaakiyStructuredBlock[] = [];

  get anomalies(): Array<Record<string, unknown>> {
    const block = this.blocks.find((b) => b.type === 'anomalies');
    return block?.anomalies ?? [];
  }

  get metrics() {
    const block = this.blocks.find((b) => b.type === 'summary');
    return block?.metrics ?? [];
  }
}
