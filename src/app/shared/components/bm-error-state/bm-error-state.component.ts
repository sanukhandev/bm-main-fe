import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-2xl sm:rounded-3xl border border-rose-200/90 bg-gradient-to-br from-white via-rose-50/50 to-slate-50 p-6 sm:p-8 shadow-[0_10px_30px_rgba(244,63,94,0.06)] relative overflow-hidden text-center flex flex-col items-center justify-center my-6 transition-all duration-300 font-sans"
    >
      <!-- Background Ambient Glow Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-transparent pointer-events-none z-0"
      ></div>

      <!-- Icon Container with Subtle Breathing Animation -->
      <div
        class="w-12 h-12 rounded-2xl bg-rose-100/80 text-rose-600 border border-rose-200/90 flex items-center justify-center mb-3 shadow-2xs shrink-0 relative z-10 transition-transform duration-300 hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-rose-600 animate-pulse"
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
      </div>

      <!-- Error Category Badge -->
      <span
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 text-rose-800 border border-rose-200/80 text-[11px] font-extrabold uppercase tracking-wider mb-2 relative z-10"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
        <span>{{ title }}</span>
      </span>

      <!-- Error Message text with High Readability -->
      <p
        class="text-xs sm:text-sm text-slate-800 font-semibold max-w-md leading-relaxed text-center relative z-10 my-1"
      >
        {{ message }}
      </p>

      @if (showRetry) {
        <button
          type="button"
          (click)="retry.emit()"
          class="group mt-4 px-5 py-2.5 rounded-xl border border-rose-200/90 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 text-xs font-extrabold shadow-2xs transition-all duration-200 flex items-center gap-2 cursor-pointer relative z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-rose-600 transition-transform group-hover:rotate-180 duration-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Try again</span>
        </button>
      }
    </div>
  `,
})
export class BmErrorStateComponent {
  @Input() title = 'Failed to load data';
  @Input() message = 'We encountered an error loading this information. Please try again.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
