import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bm-zaakiy-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border-t border-surface-200/90 p-3 sm:p-4 bg-white/90 backdrop-blur-xs rounded-b-3xl shrink-0">
      <!-- Fast Follow-up Prompt Chips (if available) -->
      @if (suggestions && suggestions.length > 0) {
        <div class="flex flex-wrap gap-1.5 mb-2.5 px-1 overflow-x-auto">
          @for (sug of suggestions; track sug) {
            <button
              type="button"
              (click)="onSendPrompt.emit(sug)"
              class="rounded-full border border-brand-200 bg-brand-50 hover:bg-brand-100 px-3 py-1 text-[11px] font-semibold text-brand-800 transition cursor-pointer shrink-0"
            >
              {{ sug }}
            </button>
          }
        </div>
      }

      <form (ngSubmit)="submit()" class="space-y-2">
        <div
          class="flex items-end gap-2.5 rounded-2xl border border-surface-200 bg-surface-50 p-2 sm:p-2.5 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-2xs"
        >
          <textarea
            #inputArea
            [ngModel]="draft"
            (ngModelChange)="draftChange.emit($event)"
            name="message"
            rows="1"
            [disabled]="isLoading"
            (keydown.enter)="onEnter($event)"
            placeholder="Ask Zaakiy about properties, collections, agreements, or maintenance..."
            aria-label="Ask Zaakiy"
            class="flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-ink placeholder-slate-400 focus:outline-none disabled:opacity-60 max-h-32 min-h-[40px] font-poppins"
          ></textarea>

          <div class="flex items-center gap-2 shrink-0 pb-0.5">
            @if (isLoading) {
              <button
                type="button"
                (click)="onStop.emit()"
                class="h-9 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span class="w-2 h-2 bg-rose-600 rounded-xs animate-pulse"></span>
                <span>Stop</span>
              </button>
            }

            <button
              type="submit"
              [disabled]="isLoading || !draft.trim()"
              aria-label="Send message to Zaakiy"
              class="w-9 h-9 rounded-xl bg-zaakiy-gradient text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
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
                  class="h-4 w-4 text-[#DFFF62]"
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

        <div class="flex items-center justify-between px-1 text-[10px] text-slate-400 font-medium">
          <span>Shift + Enter for line break</span>
          <span>Read-only active branch workspace</span>
        </div>
      </form>
    </div>
  `,
  styles: [],
})
export class ZaakiyComposerComponent {
  @Input() draft = '';
  @Output() draftChange = new EventEmitter<string>();
  @Input() isLoading = false;
  @Input() suggestions: string[] = [];
  @Output() onSend = new EventEmitter<void>();
  @Output() onSendPrompt = new EventEmitter<string>();
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
