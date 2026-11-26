import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyThreadSummary } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-thread-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <aside class="w-full sm:w-64 lg:w-72 border-b sm:border-b-0 sm:border-r border-slate-200/80 bg-slate-50/70 flex flex-col shrink-0 max-h-60 sm:max-h-none font-poppins">
        <div class="px-3.5 py-3 border-b border-slate-200/70 flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-slate-700">Recent Chats</span>
          <button
            type="button"
            (click)="onNewChat.emit()"
            class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-800 transition cursor-pointer"
          >
            + New
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          @if (loading) {
            <div class="px-2 py-4 text-xs text-slate-400 text-center">Loading history...</div>
          } @else if (threads.length === 0) {
            <div class="px-2 py-4 text-xs text-slate-400 text-center">
              No saved conversations in this branch yet.
            </div>
          } @else {
            @for (thread of threads; track thread.uuid) {
              <div
                class="group flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs transition"
                [ngClass]="{
                  'bg-brand-50 border border-brand-200/80 text-brand-900 font-semibold': activeThreadId === thread.uuid,
                  'hover:bg-white border border-transparent text-slate-700': activeThreadId !== thread.uuid
                }"
              >
                <button
                  type="button"
                  (click)="onSelectThread.emit(thread.uuid)"
                  class="flex-1 min-w-0 text-left truncate cursor-pointer"
                  [title]="thread.title"
                >
                  {{ thread.title }}
                </button>
                <button
                  type="button"
                  (click)="onDeleteThread.emit(thread.uuid); $event.stopPropagation()"
                  aria-label="Delete conversation"
                  title="Delete conversation"
                  class="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            }
          }
        </div>
      </aside>
    }
  `,
  styles: [],
})
export class ZaakiyThreadSidebarComponent {
  @Input() open = false;
  @Input() loading = false;
  @Input() threads: ZaakiyThreadSummary[] = [];
  @Input() activeThreadId: string | null = null;

  @Output() onSelectThread = new EventEmitter<string>();
  @Output() onDeleteThread = new EventEmitter<string>();
  @Output() onNewChat = new EventEmitter<void>();
}
