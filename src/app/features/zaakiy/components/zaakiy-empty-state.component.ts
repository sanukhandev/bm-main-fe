import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyOrbComponent } from './zaakiy-orb.component';

export interface PromptOption {
  label: string;
  query: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'bm-zaakiy-empty-state',
  standalone: true,
  imports: [CommonModule, ZaakiyOrbComponent],
  template: `
    <div class="max-w-3xl mx-auto py-8 sm:py-14 space-y-8 text-center">
      <!-- Gemini Welcome Greeting -->
      <div class="space-y-4 max-w-2xl mx-auto px-4">
        <div class="inline-flex items-center justify-center p-2 rounded-full bg-slate-100/80 mb-1">
          <bm-zaakiy-orb size="md" />
        </div>

        <h2 class="text-2xl sm:text-4xl font-poppins font-semibold text-slate-900 tracking-tight leading-tight">
          Hello! What would you like to check today?
        </h2>

        <p class="text-sm text-slate-500 font-normal leading-relaxed">
          Ask Zaakiy about your properties, rent collections, active tenant agreements, maintenance status, or financial briefings for your current branch workspace.
        </p>
      </div>

      <!-- Suggested Starter Prompts (Gemini Online Style Chips) -->
      <div class="pt-4 max-w-2xl mx-auto px-2">
        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-left px-1">
          Suggested Questions
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          @for (prompt of promptChips; track prompt.query) {
            <button
              type="button"
              (click)="onSelectPrompt.emit(prompt.query)"
              class="group text-left p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-500/60 hover:bg-slate-50/80 transition-all duration-150 flex items-start gap-3.5 cursor-pointer shadow-2xs"
            >
              <span class="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="prompt.icon" />
                </svg>
              </span>

              <div class="min-w-0 flex-1">
                <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                  {{ prompt.category }}
                </div>
                <div class="font-poppins font-medium text-xs sm:text-sm text-slate-800 group-hover:text-brand-900 transition-colors leading-snug">
                  {{ prompt.label }}
                </div>
              </div>
            </button>
          }
        </div>
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
      category: 'Overview',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'How much did we collect this month?',
      query: 'How much did we collect this month?',
      category: 'Collections',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Which properties are vacant?',
      query: 'Which properties are vacant?',
      category: 'Occupancy',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      label: 'Show agreements due for renewal',
      query: 'Show agreements due for renewal',
      category: 'Agreements',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'What needs immediate attention?',
      query: 'What needs attention?',
      category: 'Alerts',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    {
      label: 'Show collections trend for six months',
      query: 'Show collections trend for six months',
      category: 'Trends',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    },
  ];
}
