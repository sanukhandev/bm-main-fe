import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Branch } from '../../../core/branch-context/branch.models';
import { ZaakiyOrbComponent } from './zaakiy-orb.component';

@Component({
  selector: 'bm-zaakiy-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ZaakiyOrbComponent],
  template: `
    <header class="bg-white border-b border-slate-100 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
      <!-- Left: Identity & Status -->
      <div class="flex items-center gap-3 min-w-0">
        <bm-zaakiy-orb size="sm" />

        <div class="min-w-0 flex items-center gap-2.5">
          <h1 class="font-poppins font-semibold text-slate-900 text-base sm:text-lg tracking-tight">
            Zaakiy
          </h1>

          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-medium text-emerald-800">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Verified ERP • Read-only
          </span>
        </div>
      </div>

      <!-- Right: Active Branch, Streaming state & Action Controls -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        @if (activeBranch) {
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs font-medium text-slate-700">
            <span class="w-2 h-2 rounded-full bg-brand-500"></span>
            <span class="text-slate-400 font-normal">Branch:</span>
            <span class="text-slate-900 font-semibold">{{ activeBranch.name }}</span>
          </div>
        }

        <!-- Connection / Ready State Indicator -->
        <div
          class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          [ngClass]="{
            'text-emerald-700 bg-emerald-50': !isStreaming,
            'text-amber-700 bg-amber-50': isStreaming
          }"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            [ngClass]="{ 'bg-emerald-500': !isStreaming, 'bg-amber-500 animate-pulse': isStreaming }"
          ></span>
          <span>{{ isStreaming ? 'Thinking...' : 'Ready' }}</span>
        </div>

        <!-- About Zaakiy Button Link -->
        <a
          routerLink="/app/about-zaakiy"
          class="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="About Zaakiy Copilot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="hidden sm:inline">About</span>
        </a>

        <!-- Reset / New Chat Button -->
        @if (hasMessages) {
          <button
            type="button"
            (click)="onReset.emit()"
            class="text-xs font-medium px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Start new chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
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
