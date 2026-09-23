import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type KpiIconType =
  | 'owners'
  | 'tenants'
  | 'properties'
  | 'owner_agreements'
  | 'tenant_agreements'
  | 'inward'
  | 'outward'
  | 'petty_cash'
  | 'receivable'
  | 'payable';

@Component({
  selector: 'bm-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-[#FBFAF7] rounded-xl p-5 border border-[#E5E0D8] shadow-xs hover:border-[#193D32]/30 transition-all duration-200 flex flex-col justify-between h-full relative group"
      [class.bg-[#193D32]]="variant === 'featured'"
      [class.text-white]="variant === 'featured'"
      [class.border-transparent]="variant === 'featured'"
    >
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <span
              class="text-[10px] font-semibold uppercase tracking-[0.08em]"
              [class.text-[#9CAF9F]]="variant === 'featured'"
              [class.text-[#1B1E1C]/60]="variant !== 'featured'"
            >
              {{ label }}
            </span>
          </div>

          @if (badgeText) {
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold shrink-0"
              [class.bg-white/15]="variant === 'featured'"
              [class.text-white]="variant === 'featured'"
              [class.bg-[#9CAF9F]/20]="variant !== 'featured'"
              [class.text-[#193D32]]="variant !== 'featured'"
            >
              {{ badgeText }}
            </span>
          }
        </div>

        <div
          class="text-3xl lg:text-4xl font-semibold tabular-nums tracking-tight my-1"
          [class.text-white]="variant === 'featured'"
          [class.text-[#1B1E1C]]="variant !== 'featured'"
        >
          {{ value }}
        </div>
      </div>

      @if (subtext) {
        <p
          class="text-xs mt-3 font-normal"
          [class.text-[#9CAF9F]]="variant === 'featured'"
          [class.text-[#1B1E1C]/50]="variant !== 'featured'"
        >
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
  @Input() icon?: KpiIconType;
  @Input() variant: 'default' | 'featured' | 'soft' = 'default';
}
