import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TrendPoint {
  period_start: string;
  label?: string;
  value: number | null;
  is_partial?: boolean;
}

@Component({
  selector: 'bm-zaakiy-trend-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-surface-200 bg-white p-4 space-y-3 shadow-2xs">
      <!-- Trend Header -->
      <div class="flex items-center justify-between gap-2">
        <div>
          <h4 class="text-xs font-poppins font-semibold text-ink">
            {{ trend['label'] || trend['metric'] || 'Verified Trend' }}
          </h4>
          <p class="text-[10px] text-slate-500 font-medium">
            Granularity: {{ trend['granularity'] || 'Period' }}
            @if (trend['as_of']) {
              · As of {{ trend['as_of'] }}
            }
          </p>
        </div>

        <span class="text-[10px] font-semibold text-brand-800 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
          Verified Series
        </span>
      </div>

      <!-- Sparkline SVG chart -->
      @if (points.length >= 2) {
        <div class="relative w-full h-24 bg-surface-50 rounded-xl p-2 border border-surface-100 flex flex-col justify-end">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
            <!-- Background Grid lines -->
            <line x1="0" y1="20" x2="300" y2="20" stroke="#E9EEEA" stroke-width="1" stroke-dasharray="2 2" />
            <line x1="0" y1="50" x2="300" y2="50" stroke="#E9EEEA" stroke-width="1" stroke-dasharray="2 2" />

            <!-- Gradient area fill -->
            @if (svgPolylineArea) {
              <polygon
                [attr.points]="svgPolylineArea"
                fill="url(#trendGradient)"
                opacity="0.35"
              />
            }

            <!-- Trend Polyline -->
            @if (svgPolylinePoints) {
              <polyline
                [attr.points]="svgPolylinePoints"
                fill="none"
                stroke="#047857"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            }

            <!-- Data Point Circles -->
            @for (pt of calculatedCoords; track pt.x + '-' + pt.y) {
              @if (pt.valid) {
                <circle
                  [attr.cx]="pt.x"
                  [attr.cy]="pt.y"
                  [attr.r]="pt.isLast ? 4.5 : 3"
                  [attr.fill]="pt.isLast ? '#DFFF62' : '#047857'"
                  [attr.stroke]="pt.isLast ? '#064E3B' : '#FFFFFF'"
                  stroke-width="1.5"
                />
              }
            }

            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10B981" />
                <stop offset="100%" stop-color="#ECFDF5" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <!-- Chart legend hint -->
          <div class="absolute bottom-1.5 right-2 text-[9px] font-semibold text-slate-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#DFFF62] border border-[#064E3B]"></span>
            <span>Latest</span>
          </div>
        </div>
      }

      <!-- Accessible Data Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left border-collapse" aria-label="Trend data points">
          <thead>
            <tr class="border-b border-surface-200 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              <th class="py-1.5 pr-2 font-medium">Period</th>
              <th class="py-1.5 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            @for (pt of points; track pt.period_start) {
              <tr class="hover:bg-surface-50/80 transition-colors">
                <td class="py-1.5 pr-2 text-slate-600 font-medium text-xs">
                  <span>{{ pt.label || pt.period_start }}</span>
                  @if (pt.is_partial) {
                    <span class="ml-1 text-[9px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                      Partial
                    </span>
                  }
                </td>
                <td class="py-1.5 text-right font-poppins font-semibold text-ink tabular-nums text-xs">
                  {{ pt.value === null ? 'Unavailable' : pt.value.toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyTrendCardComponent {
  @Input({ required: true }) trend!: Record<string, unknown>;

  get points(): TrendPoint[] {
    if (!Array.isArray(this.trend['points'])) return [];
    return this.trend['points'] as TrendPoint[];
  }

  get calculatedCoords(): Array<{ x: number; y: number; valid: boolean; isLast: boolean }> {
    const pts = this.points;
    if (pts.length === 0) return [];

    const validValues = pts.map((p) => p.value).filter((v): v is number => v !== null && typeof v === 'number');
    if (validValues.length === 0) return [];

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    const range = max - min === 0 ? 1 : max - min;

    const width = 300;
    const height = 80;
    const paddingY = 12;
    const drawHeight = height - paddingY * 2;

    return pts.map((p, idx) => {
      const x = (idx / (pts.length - 1 || 1)) * width;
      const valid = p.value !== null && typeof p.value === 'number';
      const normY = valid ? (p.value! - min) / range : 0;
      const y = height - paddingY - normY * drawHeight;
      return { x, y, valid, isLast: idx === pts.length - 1 };
    });
  }

  get svgPolylinePoints(): string {
    return this.calculatedCoords
      .filter((c) => c.valid)
      .map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(' ');
  }

  get svgPolylineArea(): string {
    const coords = this.calculatedCoords.filter((c) => c.valid);
    if (coords.length < 2) return '';
    const firstX = coords[0].x.toFixed(1);
    const lastX = coords[coords.length - 1].x.toFixed(1);
    const linePts = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    return `${firstX},80 ${linePts} ${lastX},80`;
  }
}
