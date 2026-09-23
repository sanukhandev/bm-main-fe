import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#1B1E1C]/40 backdrop-blur-xs p-4 animate-fade-in font-sans">
        <div class="bm-card max-w-md w-full p-6 bg-[#FBFAF7] border border-[#E5E0D8] shadow-2xl rounded-xl animate-scale-up" role="dialog" aria-modal="true">
          <h3 class="text-xs font-semibold uppercase tracking-[0.08em] text-[#1B1E1C] mb-2">{{ title }}</h3>
          <p class="text-xs text-[#1B1E1C]/70 mb-6 font-normal">{{ message }}</p>

          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="cancel.emit()"
              [disabled]="isSubmitting"
              class="bm-btn bm-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirm.emit()"
              [disabled]="isSubmitting"
              [class]="confirmBtnClass"
            >
              @if (isSubmitting) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class BmConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed with this action?';
  @Input() confirmLabel = 'Confirm';
  @Input() isDanger = false;
  @Input() isSubmitting = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get confirmBtnClass(): string {
    return this.isDanger
      ? 'bm-btn bm-btn-danger'
      : 'bm-btn bm-btn-primary';
  }
}
