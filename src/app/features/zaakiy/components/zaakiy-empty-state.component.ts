import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyOrbComponent } from './zaakiy-orb.component';

export interface PromptOption {
  label: string;
  query: string;
}

@Component({
  selector: 'bm-zaakiy-empty-state',
  standalone: true,
  imports: [CommonModule, ZaakiyOrbComponent],
  template: `
    <div class="max-w-2xl mx-auto pt-12 sm:pt-20 pb-8 px-4 flex flex-col items-start space-y-8">
      <!-- Clean Gemini-Style Greeting -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2.5">
          <bm-zaakiy-orb size="md" />
          <span class="text-sm font-medium text-slate-500 font-poppins">Zaakiy</span>
        </div>

        <h2 class="text-3xl sm:text-4xl font-poppins font-medium tracking-tight leading-tight text-slate-900">
          <span class="bg-gradient-to-r from-emerald-700 via-teal-600 to-slate-800 bg-clip-text text-transparent">
            How can I help today?
          </span>
        </h2>

        <p class="text-sm text-slate-500 font-normal leading-relaxed max-w-lg">
          Ask about collections, occupancy, agreements, maintenance, or prepare actions for your review.
        </p>
      </div>

      <!-- Quiet, Minimal Prompt Starters (No Pills or Category Chrome) -->
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        @for (prompt of promptChips; track prompt.query) {
          <button
            type="button"
            (click)="onSelectPrompt.emit(prompt.query)"
            class="group text-left px-4 py-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100/90 transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer"
          >
            <span class="font-poppins text-[13px] font-normal text-slate-700 group-hover:text-slate-950 leading-snug">
              {{ prompt.label }}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.75"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyEmptyStateComponent {
  @Output() onSelectPrompt = new EventEmitter<string>();

  readonly promptChips: PromptOption[] = [
    {
      label: 'Give me a management briefing',
      query: 'Give me a management briefing',
    },
    {
      label: 'How much did we collect this month?',
      query: 'How much did we collect this month?',
    },
    {
      label: 'Which properties are vacant?',
      query: 'Which properties are vacant?',
    },
    {
      label: 'Show agreements due for renewal',
      query: 'Show agreements due for renewal',
    },
  ];
}
