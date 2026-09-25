import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/50 p-8 sm:p-10 shadow-2xs relative overflow-hidden text-center flex flex-col items-center justify-center my-6 transition-all duration-300 font-sans"
    >
      <!-- Icon Container -->
      <div
        class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center mb-3 shadow-2xs shrink-0 relative z-10 transition-transform duration-300 hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.75"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>

      <!-- Title Badge -->
      <span
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider mb-2 relative z-10"
      >
        <span>{{ title }}</span>
      </span>

      <!-- Description -->
      <p
        class="text-xs sm:text-sm text-slate-600 font-medium max-w-sm leading-relaxed text-center relative z-10 my-1"
      >
        {{ description }}
      </p>

      @if (actionLabel) {
        <button
          type="button"
          (click)="action.emit()"
          class="mt-4 bm-btn bm-btn-primary text-xs font-bold px-5 py-2.5 shadow-md hover:shadow-lg transition relative z-10"
        >
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
})
export class BmEmptyStateComponent {
  @Input() title = 'No records found';
  @Input() description = 'There are no items to display right now.';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
