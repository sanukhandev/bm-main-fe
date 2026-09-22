import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationMeta } from '../../../core/api/api.models';

@Component({
  selector: 'bm-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (meta && meta.total > 0) {
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-3.5 px-6 bg-white border-t border-slate-100 text-xs text-slate-500">
        <div>
          Showing
          <span class="font-semibold text-slate-900 tabular-nums">{{ meta.from || 1 }}</span>
          to
          <span class="font-semibold text-slate-900 tabular-nums">{{ meta.to || meta.total }}</span>
          of
          <span class="font-semibold text-slate-900 tabular-nums">{{ meta.total }}</span>
          results
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Previous Button -->
          <button
            type="button"
            (click)="onPageChange(meta.current_page - 1)"
            [disabled]="meta.current_page <= 1"
            title="Previous Page"
            aria-label="Previous Page"
            class="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white shadow-2xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden md:inline">Previous</span>
          </button>

          <!-- Page Number Buttons -->
          <div class="flex items-center gap-1">
            @for (p of pageNumbers; track $index) {
              @if (p === '...') {
                <span class="w-8 h-8 flex items-center justify-center text-slate-400 font-medium select-none">...</span>
              } @else {
                <button
                  type="button"
                  (click)="onPageChange(+p)"
                  [class.bg-[#132a13]]="meta.current_page === p"
                  [class.text-white]="meta.current_page === p"
                  [class.font-semibold]="meta.current_page === p"
                  [class.shadow-2xs]="meta.current_page === p"
                  [class.bg-white]="meta.current_page !== p"
                  [class.text-slate-700]="meta.current_page !== p"
                  [class.hover:bg-slate-100]="meta.current_page !== p"
                  [class.border]="meta.current_page !== p"
                  [class.border-slate-200]="meta.current_page !== p"
                  class="w-8 h-8 rounded-lg text-xs transition flex items-center justify-center tabular-nums"
                >
                  {{ p }}
                </button>
              }
            }
          </div>

          <!-- Next Button -->
          <button
            type="button"
            (click)="onPageChange(meta.current_page + 1)"
            [disabled]="meta.current_page >= meta.last_page"
            title="Next Page"
            aria-label="Next Page"
            class="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white shadow-2xs"
          >
            <span class="hidden md:inline">Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class BmPaginationComponent {
  @Input() meta?: PaginationMeta;
  @Output() pageChange = new EventEmitter<number>();

  get pageNumbers(): (number | string)[] {
    if (!this.meta) return [];
    const current = this.meta.current_page;
    const last = this.meta.last_page;
    const delta = 1;
    const range: (number | string)[] = [];

    for (let i = 1; i <= last; i++) {
      if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  }

  onPageChange(page: number): void {
    if (this.meta && page >= 1 && page <= this.meta.last_page) {
      this.pageChange.emit(page);
    }
  }
}
