import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyOrbComponent } from './zaakiy-orb.component';

export interface PromptOption {
  label: string;
  query: string;
  category: string;
  icon: string;
  span?: string;
}

@Component({
  selector: 'bm-zaakiy-empty-state',
  standalone: true,
  imports: [CommonModule, ZaakiyOrbComponent],
  template: `
    <div class="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      <!-- Top Hero Bento Card -->
      <div class="relative overflow-hidden rounded-3xl bg-zaakiy-gradient text-white p-6 sm:p-8 shadow-md border border-brand-700/40">
        <!-- Background Ambient Accent Glow -->
        <div class="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-brand-400/20 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#DFFF62]/10 blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="space-y-3 max-w-xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-100">
              <bm-zaakiy-orb size="sm" />
              <span>Intelligent ERP Copilot</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-poppins font-bold tracking-tight text-white leading-tight">
              Meet ZaakiyV3RSE
            </h2>

            <p class="text-sm text-emerald-100/90 leading-relaxed font-normal">
              Ask about your properties, collections, agreements, renewals, vacancy, maintenance, trends, anomalies, or request a full management briefing.
            </p>

            <div class="flex flex-wrap gap-2 pt-1 text-[11px] font-medium text-emerald-200">
              <span class="bg-black/20 px-2.5 py-1 rounded-full border border-white/10">Verified ERP payloads</span>
              <span class="bg-black/20 px-2.5 py-1 rounded-full border border-white/10">Active branch isolated</span>
              <span class="bg-black/20 px-2.5 py-1 rounded-full border border-white/10">Read-only safety</span>
            </div>
          </div>

          <div class="shrink-0 hidden sm:block">
            <bm-zaakiy-orb size="lg" />
          </div>
        </div>
      </div>

      <!-- Suggested Interactive Prompts Bento Grid -->
      <div>
        <h3 class="text-xs font-poppins font-semibold text-ink-soft uppercase tracking-wider mb-3 px-1">
          Primary Suggested Operations
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          @for (prompt of promptChips; track prompt.query) {
            <button
              type="button"
              (click)="onSelectPrompt.emit(prompt.query)"
              class="group relative text-left p-4 rounded-2xl bg-white border border-surface-200/90 hover:border-brand-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div class="flex items-center justify-between text-xs text-brand-700 font-semibold mb-2">
                  <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ prompt.category }}</span>
                  <span class="w-6 h-6 rounded-lg bg-surface-100 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors flex items-center justify-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="prompt.icon" />
                    </svg>
                  </span>
                </div>

                <div class="font-poppins font-semibold text-xs text-ink group-hover:text-brand-900 transition-colors leading-snug">
                  {{ prompt.label }}
                </div>
              </div>

              <div class="mt-4 pt-2 border-t border-surface-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-brand-700 transition-colors font-medium">
                <span>Ask copilot</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
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
      label: 'What needs attention?',
      query: 'What needs attention?',
      category: 'Alerts',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    {
      label: 'Show agreements due for renewal',
      query: 'Show agreements due for renewal',
      category: 'Agreements',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'How is maintenance?',
      query: 'How is maintenance?',
      category: 'Work Orders',
      icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
    },
    {
      label: 'Show collections trend for six months',
      query: 'Show collections trend for six months',
      category: 'Trends',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    },
    {
      label: 'Anything unusual?',
      query: 'Anything unusual?',
      category: 'Anomalies',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
  ];
}
