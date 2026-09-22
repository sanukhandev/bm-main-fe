import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bm-card p-6 relative overflow-hidden transition-all duration-200 hover:shadow-md"
      [class.bm-gradient-card]="variant === 'featured'"
      [class.bg-[#F1F4F1]]="variant === 'soft'"
    >
      <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2"
           [class.text-emerald-200]="variant === 'featured'"
           [class.text-slate-500]="variant !== 'featured'">
        <span>{{ label }}</span>
        @if (badgeText) {
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                [class.bg-[#DFFF62]]="variant === 'featured'"
                [class.text-[#022C22]]="variant === 'featured'"
                [class.bg-emerald-100]="variant !== 'featured'"
                [class.text-emerald-800]="variant !== 'featured'">
            {{ badgeText }}
          </span>
        }
      </div>

      <div class="text-3xl md:text-4xl font-semibold tabular-nums tracking-tight my-1"
           [class.text-white]="variant === 'featured'"
           [class.text-[#101214]]="variant !== 'featured'">
        {{ value }}
      </div>

      @if (subtext) {
        <p class="text-xs mt-2"
           [class.text-emerald-100]="variant === 'featured'"
           [class.text-slate-500]="variant !== 'featured'">
          {{ subtext }}
        </p>
      }
    </div>
  `,
})
export class BmKpiCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() subtext?: string;
  @Input() badgeText?: string;
  @Input() variant: 'default' | 'featured' | 'soft' = 'default';
}
