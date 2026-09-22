import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bm-card p-6 relative overflow-hidden transition-all duration-200 hover:shadow-md border border-slate-200/80"
      [class.bm-gradient-card]="variant === 'featured'"
      [class.bg-[#F1F5F9]]="variant === 'soft'"
    >
      <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2"
           [class.text-[#ecf39e]]="variant === 'featured'"
           [class.text-[#576633]]="variant !== 'featured'">
        <span>{{ label }}</span>
        @if (badgeText) {
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                [class.bg-[#ecf39e]]="variant === 'featured'"
                [class.text-[#132a13]]="variant === 'featured'"
                [class.bg-[#d0e6cd]]="variant !== 'featured'"
                [class.text-[#1e351b]]="variant !== 'featured'">
            {{ badgeText }}
          </span>
        }
      </div>

      <div class="text-3xl md:text-4xl font-semibold tabular-nums tracking-tight my-1"
           [class.text-white]="variant === 'featured'"
           [class.text-[#0b190b]]="variant !== 'featured'">
        {{ value }}
      </div>

      @if (subtext) {
        <p class="text-xs mt-2"
           [class.text-[#d0e6cd]]="variant === 'featured'"
           [class.text-[#576633]]="variant !== 'featured'">
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
