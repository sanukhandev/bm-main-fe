import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bm-card p-10 text-center flex flex-col items-center justify-center my-6 bg-[#FBFAF7] border border-[#E5E0D8] rounded-xl"
    >
      <div
        class="w-12 h-12 rounded-lg bg-[#9CAF9F]/20 text-[#193D32] flex items-center justify-center mb-3"
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
            stroke-width="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>

      <h3 class="text-xs font-semibold uppercase tracking-[0.08em] text-[#1B1E1C] mb-1">
        {{ title }}
      </h3>
      <p class="text-xs text-[#1B1E1C]/60 max-w-sm mb-5 font-normal">{{ description }}</p>

      @if (actionLabel) {
        <button type="button" (click)="action.emit()" class="bm-btn bm-btn-primary">
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
