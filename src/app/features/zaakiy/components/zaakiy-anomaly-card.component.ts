import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-zaakiy-anomaly-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-2xl border p-4 space-y-2.5 transition-all duration-200 shadow-2xs"
      [ngClass]="{
        'bg-rose-50/70 border-rose-200/90 text-rose-950': severity === 'critical',
        'bg-amber-50/70 border-amber-200/90 text-amber-950': severity === 'attention',
        'bg-emerald-50/50 border-emerald-200/70 text-slate-900': severity === 'info'
      }"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <!-- Restrained severity badge chip -->
          <div
            class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
            [ngClass]="{
              'bg-rose-900 text-rose-100': severity === 'critical',
              'bg-amber-700 text-amber-50': severity === 'attention',
              'bg-emerald-800 text-emerald-50': severity === 'info'
            }"
          >
            @if (severity === 'critical') {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            } @else if (severity === 'attention') {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          </div>

          <div>
            <h4 class="text-xs font-poppins font-semibold capitalize">
              {{ anomaly['label'] || anomaly['code'] || 'Verified Observation' }}
            </h4>
            <span
              class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5"
              [ngClass]="{
                'bg-rose-200/80 text-rose-900': severity === 'critical',
                'bg-amber-200/80 text-amber-900': severity === 'attention',
                'bg-emerald-200/80 text-emerald-900': severity === 'info'
              }"
            >
              {{ severity }}
            </span>
          </div>
        </div>
      </div>

      <!-- Verified Observation Details -->
      @if (anomaly['observation'] || anomaly['message'] || anomaly['description']) {
        <p class="text-xs leading-relaxed opacity-90 font-medium">
          {{ anomaly['observation'] || anomaly['message'] || anomaly['description'] }}
        </p>
      }

      <!-- Baseline & Threshold -->
      <div class="flex flex-wrap items-center gap-3 text-[11px] pt-1 opacity-80 border-t border-black/5">
        @if (anomaly['baseline'] !== undefined && anomaly['baseline'] !== null) {
          <span>Baseline: <strong>{{ anomaly['baseline'] }}</strong></span>
        }
        @if (anomaly['threshold'] !== undefined && anomaly['threshold'] !== null) {
          <span>Threshold: <strong>{{ anomaly['threshold'] }}</strong></span>
        }
        @if (anomaly['record_url']) {
          <a
            [href]="anomaly['record_url']"
            class="text-xs font-semibold underline underline-offset-2 ml-auto hover:opacity-100"
          >
            View record →
          </a>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyAnomalyCardComponent {
  @Input({ required: true }) anomaly!: Record<string, unknown>;

  get severity(): 'critical' | 'attention' | 'info' {
    const s = String(this.anomaly['severity'] || 'info').toLowerCase();
    if (s === 'critical' || s === 'high') return 'critical';
    if (s === 'attention' || s === 'medium' || s === 'warning') return 'attention';
    return 'info';
  }
}
