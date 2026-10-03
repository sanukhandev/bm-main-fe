import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bm-zaakiy-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="submit()" class="space-y-1.5">
      <!-- Gemini Rounded Floating Input Container -->
      <div
        class="flex items-end gap-3 rounded-3xl border border-slate-300/80 bg-white p-2.5 sm:p-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-sm"
      >
        <textarea
          #inputArea
          [ngModel]="draft"
          (ngModelChange)="draftChange.emit($event)"
          name="message"
          rows="1"
          [disabled]="isLoading"
          (keydown.enter)="onEnter($event)"
          placeholder="Ask Zaakiy anything about properties, collections, agreements..."
          aria-label="Ask Zaakiy"
          class="flex-1 resize-none border-0 bg-transparent px-3 py-1.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60 max-h-36 min-h-[44px] font-poppins"
        ></textarea>

        <div class="flex items-center gap-2 shrink-0 pb-1 pr-1">
          @if (isLoading) {
            <button
              type="button"
              (click)="onStop.emit()"
              class="h-9 px-3.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span class="w-2 h-2 bg-rose-600 rounded-full animate-ping"></span>
              <span>Stop</span>
            </button>
          }

          <button
            type="submit"
            [disabled]="isLoading || !draft.trim()"
            aria-label="Send message to Zaakiy"
            class="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center disabled:opacity-40 disabled:hover:bg-brand-600 transition cursor-pointer shadow-xs"
          >
            @if (isLoading) {
              <svg
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            }
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between px-3 text-[11px] text-slate-400 font-normal">
        <span>Press Enter to send • Shift + Enter for new line</span>
        <span>Zaakiy ERP AI</span>
      </div>
    </form>
  `,
  styles: [],
})
export class ZaakiyComposerComponent {
  @Input() draft = '';
  @Output() draftChange = new EventEmitter<string>();
  @Input() isLoading = false;
  @Output() onSend = new EventEmitter<void>();
  @Output() onStop = new EventEmitter<void>();

  @ViewChild('inputArea') inputRef?: ElementRef<HTMLTextAreaElement>;

  onEnter(event: Event): void {
    const kb = event as KeyboardEvent;
    if (!kb.shiftKey) {
      kb.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    if (this.draft.trim() && !this.isLoading) {
      this.onSend.emit();
    }
  }
}
