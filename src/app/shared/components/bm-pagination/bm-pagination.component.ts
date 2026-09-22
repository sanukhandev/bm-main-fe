import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationMeta } from '../../../core/api/api.models';

@Component({
  selector: 'bm-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (meta && meta.total > 0) {
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6 bg-white border-t border-slate-100 text-xs text-slate-500">
        <div>
          Showing
          <span class="font-medium text-slate-800">{{ meta.from || 1 }}</span>
          to
          <span class="font-medium text-slate-800">{{ meta.to || meta.total }}</span>
          of
          <span class="font-medium text-slate-800">{{ meta.total }}</span>
          results
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="onPageChange(meta.current_page - 1)"
            [disabled]="meta.current_page <= 1"
            class="bm-btn bm-btn-secondary h-8 px-3 text-xs"
          >
            Previous
          </button>

          <span class="px-2 font-medium text-slate-700">
            Page {{ meta.current_page }} of {{ meta.last_page }}
          </span>

          <button
            type="button"
            (click)="onPageChange(meta.current_page + 1)"
            [disabled]="meta.current_page >= meta.last_page"
            class="bm-btn bm-btn-secondary h-8 px-3 text-xs"
          >
            Next
          </button>
        </div>
      </div>
    }
  `,
})
export class BmPaginationComponent {
  @Input() meta?: PaginationMeta;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(page: number): void {
    if (this.meta && page >= 1 && page <= this.meta.last_page) {
      this.pageChange.emit(page);
    }
  }
}
