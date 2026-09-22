import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bm-card p-8 border-rose-200 bg-rose-50/50 text-center flex flex-col items-center justify-center my-6">
      <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h4 class="text-base font-semibold text-rose-900 mb-1">{{ title }}</h4>
      <p class="text-sm text-rose-700 max-w-md mb-4">{{ message }}</p>

      @if (showRetry) {
        <button type="button" (click)="retry.emit()" class="bm-btn bm-btn-secondary border-rose-300 hover:bg-rose-100 text-rose-800">
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
