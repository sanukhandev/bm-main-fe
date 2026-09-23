import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 bm-modal-backdrop font-sans"
      >
        <div
          class="relative w-full max-w-md bg-white border border-slate-200/90 shadow-2xl rounded-2xl overflow-hidden bm-modal-content"
          role="dialog"
          aria-modal="true"
        >
          <div class="p-6">
            <div class="flex items-start gap-3.5">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                [ngClass]="isDanger ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'"
              >
                @if (isDanger) {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                } @else {
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900 tracking-tight mb-1">
                  {{ title }}
                </h3>
                <p class="text-xs text-slate-600 leading-relaxed font-normal">{{ message }}</p>
              </div>
            </div>
          </div>

          <div
            class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3"
          >
            <button
              type="button"
              (click)="cancel.emit()"
              [disabled]="isSubmitting"
              class="bm-btn bm-btn-secondary text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirm.emit()"
              [disabled]="isSubmitting"
              [class]="confirmBtnClass"
              class="text-xs rounded-xl shadow-2xs"
            >
              @if (isSubmitting) {
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
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
    return this.isDanger ? 'bm-btn bm-btn-danger' : 'bm-btn bm-btn-primary';
  }
}
