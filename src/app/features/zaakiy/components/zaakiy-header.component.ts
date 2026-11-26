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
    <header class="bg-white/90 backdrop-blur-xs px-3 sm:px-5 h-14 flex items-center justify-between gap-3 shrink-0 border-b border-slate-100">
      <!-- Left: Sidebar Toggle + Clean Gemini-Style Title -->
      <div class="flex items-center gap-2 min-w-0">
        <button
          type="button"
          (click)="onToggleHistory.emit()"
          [attr.aria-expanded]="historyOpen"
          aria-label="Toggle chat history"
          title="Recent chats"
          class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer shrink-0"
          [class.bg-slate-100]="historyOpen"
          [class.text-slate-900]="historyOpen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        </button>

        <div class="flex items-center gap-2 min-w-0 pl-1">
          <bm-zaakiy-orb size="sm" [pulse]="isStreaming" />
          <div class="flex items-baseline gap-2 min-w-0">
            <h1 class="font-poppins font-medium text-slate-900 text-[15px] tracking-tight">
              Zaakiy
            </h1>
            @if (activeBranch) {
              <span class="text-xs text-slate-400 truncate hidden sm:inline">
                {{ activeBranch.name }}
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Right: Minimal Ghost Controls -->
      <div class="flex items-center gap-1 shrink-0">
        @if (hasMessages) {
          <button
            type="button"
            (click)="onReset.emit()"
            title="New chat"
            class="h-9 px-3 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">New chat</span>
          </button>
        }

        <a
          routerLink="/app/about-zaakiy"
          aria-label="About Zaakiy"
          [title]="canProposeActions ? 'About Zaakiy (Approval-gated actions enabled)' : 'About Zaakiy (Read-only mode)'"
          class="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </a>
      </div>
    </header>
  `,
  styles: [],
})
export class ZaakiyHeaderComponent {
  @Input() activeBranch: Branch | null = null;
  @Input() isStreaming = false;
  @Input() hasMessages = false;
  @Input() historyOpen = false;
  @Input() threadCount = 0;
  @Input() canProposeActions = false;
  @Output() onReset = new EventEmitter<void>();
  @Output() onToggleHistory = new EventEmitter<void>();
}
