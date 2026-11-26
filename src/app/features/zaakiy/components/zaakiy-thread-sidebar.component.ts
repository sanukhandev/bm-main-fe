import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyThreadSummary } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-thread-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <aside class="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/70 flex flex-col shrink-0 max-h-60 sm:max-h-none font-poppins">
        <div class="p-3">
          <button
            type="button"
            (click)="onNewChat.emit()"
            class="w-full px-3.5 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium transition flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>New chat</span>
          </button>
        </div>

        <div class="px-4 pb-1.5 text-[11px] font-medium text-slate-400">
          Recent
        </div>

        <div class="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          @if (loading) {
            <div class="px-3 py-4 text-xs text-slate-400">Loading...</div>
          } @else if (threads.length === 0) {
            <div class="px-3 py-4 text-xs text-slate-400">
              No recent chats yet.
            </div>
          } @else {
            @for (thread of threads; track thread.uuid) {
              <div
                class="group flex items-center gap-1 rounded-full px-3 py-2 text-xs transition"
                [ngClass]="{
                  'bg-emerald-50/90 text-emerald-900 font-medium': activeThreadId === thread.uuid,
                  'hover:bg-slate-200/50 text-slate-700': activeThreadId !== thread.uuid
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
                  class="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-rose-600 p-0.5 rounded-full transition cursor-pointer shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
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
