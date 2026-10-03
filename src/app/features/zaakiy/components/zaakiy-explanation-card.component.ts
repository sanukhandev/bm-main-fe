import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-zaakiy-explanation-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-surface-200 bg-white p-4 space-y-3 shadow-2xs">
      <div class="flex items-center justify-between gap-2">
        <div>
          <h4 class="text-xs font-poppins font-semibold text-ink">
            {{ explanation['title'] || 'Measured drivers' }}
          </h4>
          <p class="text-[10px] text-slate-500 font-medium">
            Deterministic backend attribution
          </p>
        </div>
        <span class="text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
          Verified Analysis
        </span>
      </div>

      <div class="space-y-1.5 text-xs">
        @for (driver of drivers; track driver['key'] || driver['label']) {
          <div class="flex items-center justify-between gap-3 p-2 rounded-xl bg-surface-50 border border-surface-100 hover:bg-surface-100/60 transition">
            <span class="font-medium text-slate-800 text-xs truncate">
              {{ driver['label'] || driver['key'] || 'Contributor' }}
            </span>
            <span
              class="font-poppins font-semibold text-xs tabular-nums shrink-0"
              [class.text-emerald-700]="isPositive(driver['absolute_delta'])"
              [class.text-rose-700]="isNegative(driver['absolute_delta'])"
              [class.text-slate-700]="!isPositive(driver['absolute_delta']) && !isNegative(driver['absolute_delta'])"
            >
              {{ formatDelta(driver['absolute_delta']) }}
            </span>
          </div>
        }

        @if (explanation['residual_delta'] !== undefined && explanation['residual_delta'] !== null) {
          <div class="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50/80 border border-dashed border-slate-200 text-xs text-slate-500 mt-2">
            <span class="font-medium italic text-[11px]">Other contributors</span>
            <span class="font-poppins font-semibold tabular-nums text-slate-700">
              {{ formatDelta(explanation['residual_delta']) }}
            </span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyExplanationCardComponent {
  @Input({ required: true }) explanation!: Record<string, unknown>;

  get drivers(): Array<Record<string, unknown>> {
    return Array.isArray(this.explanation['drivers'])
      ? (this.explanation['drivers'] as Array<Record<string, unknown>>)
      : [];
  }

  isPositive(val: unknown): boolean {
    return Number(val) > 0;
  }

  isNegative(val: unknown): boolean {
    return Number(val) < 0;
  }

  formatDelta(val: unknown): string {
    if (val === null || val === undefined) return '—';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    const prefix = num > 0 ? '+' : '';
    return `${prefix}AED ${Math.abs(num).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
}
