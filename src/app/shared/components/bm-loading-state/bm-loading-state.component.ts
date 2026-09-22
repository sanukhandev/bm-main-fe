import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bm-card p-6 my-4 animate-pulse">
      @if (type === 'table') {
        <div class="space-y-4">
          <div class="h-8 bg-slate-100 rounded w-1/4"></div>
          <div class="space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="h-10 bg-slate-50 rounded flex items-center justify-between px-4">
                <div class="h-4 bg-slate-200 rounded w-1/3"></div>
                <div class="h-4 bg-slate-200 rounded w-1/4"></div>
                <div class="h-4 bg-slate-200 rounded w-1/6"></div>
              </div>
            }
          </div>
        </div>
      } @else if (type === 'kpi') {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-32 bg-slate-100 rounded-2xl p-4 flex flex-col justify-between">
              <div class="h-4 bg-slate-200 rounded w-1/2"></div>
              <div class="h-8 bg-slate-200 rounded w-3/4"></div>
            </div>
          }
        </div>
      } @else {
        <div class="space-y-4">
          <div class="h-6 bg-slate-200 rounded w-1/3"></div>
          <div class="h-20 bg-slate-100 rounded w-full"></div>
        </div>
      }
    </div>
  `,
})
export class BmLoadingStateComponent {
  @Input() type: 'table' | 'kpi' | 'card' = 'table';
}
