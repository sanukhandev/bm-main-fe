import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyDisambiguationCandidate } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-disambiguation-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-brand-200/80 bg-brand-50/40 p-3.5 space-y-2.5 font-poppins">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-brand-800">
          Select Intended Record
        </span>
        @if (query) {
          <span class="text-[11px] text-slate-500">Matches for "{{ query }}"</span>
        }
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        @for (candidate of candidates; track candidate.type + ':' + candidate.id) {
          <button
            type="button"
            (click)="selectCandidate(candidate)"
            class="text-left p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-brand-400 hover:bg-brand-50/40 transition flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
          >
            <div class="min-w-0">
              <div class="text-xs font-semibold text-slate-900 truncate">{{ candidate.label }}</div>
              @if (candidate.subtitle) {
                <div class="text-[10px] text-slate-500 truncate">{{ candidate.subtitle }}</div>
              }
            </div>
            <span class="text-[10px] font-semibold text-brand-700 shrink-0">Select →</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyDisambiguationCardComponent {
  @Input() query?: string;
  @Input({ required: true }) candidates: ZaakiyDisambiguationCandidate[] = [];
  @Output() onSelectPrompt = new EventEmitter<string>();

  selectCandidate(candidate: ZaakiyDisambiguationCandidate): void {
    const prompt =
      candidate.follow_up_prompt ||
      `Tell me about ${candidate.type} #${candidate.id} (${candidate.label})`;
    this.onSelectPrompt.emit(prompt);
  }
}
