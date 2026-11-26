import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyDisambiguationCandidate } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-disambiguation-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-200/80 bg-white overflow-hidden font-poppins">
      <div class="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
        <span class="font-medium text-slate-700">Which record did you mean?</span>
        @if (query) {
          <span class="text-[11px] text-slate-400">"{{ query }}"</span>
        }
      </div>

      <div class="divide-y divide-slate-100">
        @for (candidate of candidates; track candidate.type + ':' + candidate.id) {
          <button
            type="button"
            (click)="selectCandidate(candidate)"
            class="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div class="min-w-0">
              <div class="text-xs font-medium text-slate-900 truncate">{{ candidate.label }}</div>
              @if (candidate.subtitle) {
                <div class="text-[11px] text-slate-400 truncate">{{ candidate.subtitle }}</div>
              }
            </div>
            <span class="text-xs text-slate-300 group-hover:text-emerald-600 transition shrink-0">→</span>
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
