import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bm-zaakiy-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="submit()" class="space-y-2">
      <!-- Signature Gemini Soft Pill Input -->
      <div
        class="flex items-end gap-2 rounded-[28px] bg-slate-100/85 hover:bg-slate-100 focus-within:bg-white border border-transparent focus-within:border-slate-200 focus-within:shadow-md px-3.5 py-2 transition-all duration-200"
      >
        <textarea
          #inputArea
          [ngModel]="draft"
          (ngModelChange)="draftChange.emit($event)"
          name="message"
          rows="1"
          [disabled]="isLoading"
          (keydown.enter)="onEnter($event)"
          placeholder="Ask Zaakiy"
          aria-label="Ask Zaakiy"
          class="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60 max-h-36 min-h-[40px] font-poppins leading-snug"
        ></textarea>

        <div class="flex items-center gap-1.5 shrink-0 pb-0.5">
          @if (isLoading) {
            <button
              type="button"
              (click)="onStop.emit()"
              aria-label="Stop generating"
              title="Stop generating"
              class="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
            >
              <span class="w-3 h-3 rounded-[2px] bg-white"></span>
            </button>
          } @else {
            <button
              type="submit"
              [disabled]="!draft.trim()"
              aria-label="Send message to Zaakiy"
              class="w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer"
              [ngClass]="{
                'bg-slate-900 hover:bg-emerald-700 text-white shadow-xs': draft.trim(),
                'bg-transparent text-slate-300 cursor-not-allowed': !draft.trim()
              }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.25"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
              </svg>
            </button>
          }
        </div>
      </div>

      <p class="text-center text-[11px] text-slate-400 font-normal">
        Zaakiy uses verified branch ERP data. Proposed actions always require your confirmation.
      </p>
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
