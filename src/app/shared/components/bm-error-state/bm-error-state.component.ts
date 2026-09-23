import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bm-card p-8 border border-[#B98D91]/30 bg-[#B98D91]/10 text-center flex flex-col items-center justify-center my-6 rounded-xl">
      <div class="w-10 h-10 rounded-lg bg-[#B98D91]/20 text-[#1B1E1C] flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h4 class="text-xs font-semibold uppercase tracking-[0.08em] text-[#1B1E1C] mb-1">{{ title }}</h4>
      <p class="text-xs text-[#1B1E1C]/80 max-w-md mb-4 font-normal">{{ message }}</p>

      @if (showRetry) {
        <button type="button" (click)="retry.emit()" class="bm-btn bm-btn-secondary border-[#B98D91]/40 text-[#1B1E1C]">
          Try again
        </button>
      }
    </div>
  `,
})
export class BmErrorStateComponent {
  @Input() title = 'Failed to load data';
  @Input() message = 'We encountered an error loading this information. Please try again.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
