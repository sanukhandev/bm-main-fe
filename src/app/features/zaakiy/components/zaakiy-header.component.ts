import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Branch } from '../../../core/branch-context/branch.models';
import { ZaakiyOrbComponent } from './zaakiy-orb.component';

@Component({
  selector: 'bm-zaakiy-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ZaakiyOrbComponent],
  template: `
    <header class="bg-white border-b border-surface-200/90 px-4 sm:px-6 py-3.5 rounded-t-3xl flex flex-wrap items-center justify-between gap-3 shrink-0">
      <!-- Left: Identity & Status -->
      <div class="flex items-center gap-3.5 min-w-0">
        <!-- Identity Mark Orb -->
        <bm-zaakiy-orb size="md" />

        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="font-poppins font-bold text-ink text-base sm:text-lg tracking-tight">
              ZaakiyV3RSE
            </h1>

            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-[10px] font-semibold text-brand-800">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              Verified ERP data · Read-only
            </span>
          </div>

          <p class="text-xs text-ink-soft font-medium truncate mt-0.5">
            Intelligent ERP copilot
          </p>
        </div>
      </div>

      <!-- Right: Branch Context, Status, Controls -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Active Branch Context Indicator (Security Critical) -->
        @if (activeBranch) {
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 border border-surface-200 text-xs font-semibold text-ink shadow-2xs">
            <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span class="text-slate-500 font-normal">Branch:</span>
            <span class="text-brand-900 font-bold">{{ activeBranch.name }}</span>
          </div>
        }

        <!-- Connection / Ready State -->
        <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
             [ngClass]="{
               'bg-emerald-50 text-emerald-700 border border-emerald-200': !isStreaming,
               'bg-amber-50 text-amber-700 border border-amber-200': isStreaming
             }">
          <span class="w-1.5 h-1.5 rounded-full"
                [ngClass]="{ 'bg-emerald-500': !isStreaming, 'bg-amber-500 animate-ping': isStreaming }"></span>
          <span>{{ isStreaming ? 'Streaming payload...' : 'Ready' }}</span>
        </div>

        <!-- About Zaakiy Button Link -->
        <a
          routerLink="/app/about-zaakiy"
          class="text-xs font-semibold px-3 py-1.5 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 text-ink transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>About</span>
        </a>

        <!-- Reset Chat Button -->
        @if (hasMessages) {
          <button
            type="button"
            (click)="onReset.emit()"
            class="text-xs font-semibold px-3 py-1.5 rounded-xl border border-surface-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Reset active chat session"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden sm:inline">Reset</span>
          </button>
        }
      </div>
    </header>
  `,
  styles: [],
})
export class ZaakiyHeaderComponent {
  @Input() activeBranch: Branch | null = null;
  @Input() isStreaming = false;
  @Input() hasMessages = false;
  @Output() onReset = new EventEmitter<void>();
}
