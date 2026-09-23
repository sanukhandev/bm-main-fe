import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SummaryItem {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'normal' | 'pine' | 'sand' | 'danger';
}

@Component({
  selector: 'bm-summary-strip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bm-paper-card p-4 flex flex-wrap items-center divide-y sm:divide-y-0 sm:divide-x divide-[#D8D4CB]">
      @for (item of items; track item.label) {
        <div class="py-2 sm:py-0 px-4 first:pl-0 last:pr-0 flex-1 min-w-[140px]">
          <div class="text-[11px] font-semibold text-[#74776F] uppercase tracking-wider">
            {{ item.label }}
          </div>
          <div class="text-xl font-bold tabular-nums mt-0.5" [ngClass]="valueClass(item.variant)">
            {{ item.value }}
          </div>
          @if (item.subtext) {
            <div class="text-[11px] text-[#9A9C95] font-medium mt-0.5">{{ item.subtext }}</div>
          }
        </div>
      }
    </div>
  `,
})
export class BmSummaryStripComponent {
  @Input({ required: true }) items: SummaryItem[] = [];

  valueClass(variant?: 'normal' | 'pine' | 'sand' | 'danger'): string {
    switch (variant) {
      case 'pine':
        return 'text-[#285746]';
      case 'sand':
        return 'text-[#A77A35]';
      case 'danger':
        return 'text-[#A45454]';
      default:
        return 'text-[#1B1E1C]';
    }
  }
}
