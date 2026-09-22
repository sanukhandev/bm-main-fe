import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bm-card p-12 text-center flex flex-col items-center justify-center my-6">
      <div class="w-16 h-16 rounded-full bg-emerald-50 text-[#064E3B] flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>

      <h3 class="text-lg font-semibold text-[#101214] mb-1">{{ title }}</h3>
      <p class="text-sm text-[#64748B] max-w-sm mb-6">{{ description }}</p>

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
