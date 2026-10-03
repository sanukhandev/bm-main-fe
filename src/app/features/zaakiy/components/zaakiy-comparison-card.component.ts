import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-zaakiy-comparison-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-surface-200 bg-white p-4 transition hover:shadow-xs">
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="text-xs font-poppins font-semibold text-ink">
          {{ comparison['label'] || comparison['metric'] || 'Metric Comparison' }}
        </span>
        @if (comparison['period_label']) {
          <span class="text-[10px] font-medium text-slate-500 bg-surface-100 px-2 py-0.5 rounded-full">
            {{ comparison['period_label'] }}
          </span>
        }
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div class="bg-surface-50 p-2.5 rounded-xl border border-surface-100">
          <div class="text-[10px] text-slate-500 font-medium mb-0.5">Current</div>
          <div class="font-poppins font-semibold text-ink text-sm tabular-nums">
            {{ formatVal(comparison['current_value']) }}
          </div>
        </div>

        <div class="bg-surface-50 p-2.5 rounded-xl border border-surface-100">
          <div class="text-[10px] text-slate-500 font-medium mb-0.5">Previous</div>
          <div class="font-poppins font-semibold text-slate-600 text-sm tabular-nums">
            {{ formatVal(comparison['comparison_value']) }}
          </div>
        </div>

        <div class="col-span-2 sm:col-span-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex flex-col justify-center">
          <div class="text-[10px] text-slate-500 font-medium mb-0.5 flex items-center justify-between">
            <span>Change</span>
            <!-- Factual Neutral Arrow -->
            <span class="text-slate-600 font-bold">
              @if (isPositiveDelta) {
                ↑
              } @else if (isNegativeDelta) {
                ↓
              } @else {
                →
              }
            </span>
          </div>
          <div class="font-poppins font-semibold text-ink text-xs tabular-nums flex items-baseline gap-1">
            <span>{{ formatVal(comparison['absolute_delta']) }}</span>
            @if (hasPctDelta) {
              <span class="text-[10px] text-slate-600 font-medium">
                ({{ comparison['percentage_delta'] }}%)
              </span>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyComparisonCardComponent {
  @Input({ required: true }) comparison!: Record<string, unknown>;

  formatVal(val: unknown): string {
    if (val === null || val === undefined) return '—';
    return typeof val === 'number' ? val.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(val);
  }

  get isPositiveDelta(): boolean {
    const delta = Number(this.comparison['absolute_delta'] ?? 0);
    return delta > 0;
  }

  get isNegativeDelta(): boolean {
    const delta = Number(this.comparison['absolute_delta'] ?? 0);
    return delta < 0;
  }

  get hasPctDelta(): boolean {
    return this.comparison['percentage_delta'] !== null && this.comparison['percentage_delta'] !== undefined;
  }
}
