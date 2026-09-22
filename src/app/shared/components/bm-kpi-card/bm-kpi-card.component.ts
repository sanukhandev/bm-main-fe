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
      class="bg-white rounded-[20px] p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full relative group"
      [class.bg-gradient-to-br]="variant === 'featured'"
      [class.from-[#063D2C]]="variant === 'featured'"
      [class.to-[#166534]]="variant === 'featured'"
      [class.text-white]="variant === 'featured'"
      [class.border-transparent]="variant === 'featured'"
    >
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2.5">
            @if (icon) {
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                [class.bg-[#d0e6cd]/60]="variant !== 'featured'"
                [class.text-[#132a13]]="variant !== 'featured'"
                [class.bg-white/15]="variant === 'featured'"
                [class.text-[#ecf39e]]="variant === 'featured'"
              >
                @switch (icon) {
                  @case ('owners') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                  @case ('tenants') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 07 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  @case ('properties') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  @case ('owner_agreements') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  @case ('tenant_agreements') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  }
                  @case ('inward') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  }
                  @case ('outward') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  }
                  @case ('petty_cash') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  @case ('receivable') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  @case ('payable') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  }
                }
              </div>
            }
            <span
              class="text-[12px] font-semibold uppercase tracking-wider"
              [class.text-[#ecf39e]]="variant === 'featured'"
              [class.text-slate-600]="variant !== 'featured'"
            >
              {{ label }}
            </span>
          </div>

          @if (badgeText) {
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
              [class.bg-[#ecf39e]]="variant === 'featured'"
              [class.text-[#132a13]]="variant === 'featured'"
              [class.bg-[#d0e6cd]]="variant !== 'featured'"
              [class.text-[#1e351b]]="variant !== 'featured'"
            >
              {{ badgeText }}
            </span>
          }
        </div>

        <div
          class="text-3xl lg:text-4xl font-semibold tabular-nums tracking-tight my-1"
          [class.text-white]="variant === 'featured'"
          [class.text-[#0b190b]]="variant !== 'featured'"
        >
          {{ value }}
        </div>
      </div>

      @if (subtext) {
        <p
          class="text-xs mt-3 font-normal"
          [class.text-[#d0e6cd]]="variant === 'featured'"
          [class.text-slate-500]="variant !== 'featured'"
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
