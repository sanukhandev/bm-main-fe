import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyMetricCard } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="group relative overflow-hidden rounded-2xl bg-white border border-surface-200/90 p-4 transition-all duration-200 hover:shadow-md hover:border-brand-500/30 flex flex-col justify-between"
      [ngClass]="{
        'col-span-1': span === '1x1',
        'col-span-1 sm:col-span-2': span === '2x1',
        'col-span-1 row-span-2': span === '1x2'
      }"
    >
      <!-- Top Label & Icon Header -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="text-[11px] font-poppins font-medium text-ink-soft uppercase tracking-wider">
          {{ metric.label }}
        </span>

        <div class="w-6 h-6 rounded-lg bg-surface-100 flex items-center justify-center text-brand-700 text-xs shrink-0">
          @if (metric.unit === 'AED') {
            <span class="font-bold text-[10px]">د.إ</span>
          } @else if (metric.unit === 'percent') {
            <span class="font-bold text-[10px]">%</span>
          } @else if (metric.unit === 'days') {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 012 2h2a2 2 0 012-2z" />
            </svg>
          }
        </div>
      </div>

      <!-- Main Value -->
      <div class="mt-1">
        <div class="flex items-baseline gap-1.5 font-poppins font-semibold text-ink text-xl sm:text-2xl tabular-nums tracking-tight">
          @if (metric.unit === 'AED') {
            <span class="text-xs font-medium text-brand-700">AED</span>
          }
          <span>{{ formattedValue }}</span>
          @if (metric.unit === 'percent') {
            <span class="text-sm font-medium text-ink-soft">%</span>
          }
        </div>
      </div>

      <!-- Context Footer hint -->
      <div class="mt-2.5 pt-2 border-t border-surface-100 flex items-center justify-between text-[11px] text-ink-soft font-medium">
        <span class="text-[10px] text-brand-800 bg-brand-50 px-2 py-0.5 rounded-full font-semibold border border-brand-100">
          Verified ERP
        </span>
        @if (metric.unit === 'count' || metric.unit === 'days') {
          <span class="capitalize text-slate-500">{{ metric.unit }}</span>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyMetricCardComponent {
  @Input({ required: true }) metric!: ZaakiyMetricCard;
  @Input() span: '1x1' | '2x1' | '1x2' = '1x1';

  get formattedValue(): string {
    const val = this.metric.value;
    if (val === null || val === undefined) return '—';
    if (typeof val === 'number') {
      return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return String(val);
  }
}
