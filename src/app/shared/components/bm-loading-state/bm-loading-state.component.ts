import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmSpinnerComponent } from '../bm-spinner/bm-spinner.component';

@Component({
  selector: 'bm-loading-state',
  standalone: true,
  imports: [CommonModule, BmSpinnerComponent],
  template: `
    <div [class]="containerClass">
      @if (type === 'table') {
        <!-- Table Skeleton Loader -->
        <div class="space-y-4 animate-pulse">
          <div class="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div class="h-6 bg-slate-200/80 rounded-lg w-1/4"></div>
            <div class="flex items-center gap-2">
              <div class="h-9 bg-slate-200/70 rounded-xl w-32"></div>
              <div class="h-9 bg-slate-200/70 rounded-xl w-24"></div>
            </div>
          </div>
          
          <div class="overflow-hidden border border-slate-100 rounded-xl bg-white shadow-xs">
            <div class="h-10 bg-slate-100/70 flex items-center justify-between px-4">
              <div class="h-4 bg-slate-200 rounded w-1/6"></div>
              <div class="h-4 bg-slate-200 rounded w-1/4"></div>
              <div class="h-4 bg-slate-200 rounded w-1/5"></div>
              <div class="h-4 bg-slate-200 rounded w-1/6"></div>
            </div>
            <div class="divide-y divide-slate-100">
              @for (i of rowsArray; track i) {
                <div class="h-14 flex items-center justify-between px-4 hover:bg-slate-50/50 transition-colors">
                  <div class="flex items-center gap-3 w-1/4">
                    <div class="w-8 h-8 rounded-full bg-slate-200/80 shrink-0"></div>
                    <div class="h-4 bg-slate-200/90 rounded w-3/4"></div>
                  </div>
                  <div class="h-4 bg-slate-200/70 rounded w-1/4"></div>
                  <div class="h-6 bg-emerald-100/60 rounded-full w-20"></div>
                  <div class="h-4 bg-slate-200/70 rounded w-1/6"></div>
                </div>
              }
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="h-4 bg-slate-200/60 rounded w-48"></div>
            <div class="h-8 bg-slate-200/60 rounded-lg w-36"></div>
          </div>
        </div>
      } @else if (type === 'kpi') {
        <!-- KPI Metrics Skeleton -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between h-32 relative overflow-hidden">
              <div class="flex items-center justify-between">
                <div class="h-4 bg-slate-200/80 rounded w-1/2"></div>
                <div class="w-10 h-10 rounded-xl bg-emerald-50"></div>
              </div>
              <div class="space-y-2">
                <div class="h-8 bg-slate-200/90 rounded-lg w-3/4"></div>
                <div class="h-3 bg-slate-200/60 rounded w-2/3"></div>
              </div>
            </div>
          }
        </div>
      } @else if (type === 'form') {
        <!-- Form Fields Skeleton Loader -->
        <div class="space-y-6 animate-pulse">
          <div class="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-5">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="w-10 h-10 rounded-xl bg-emerald-100/80"></div>
              <div class="space-y-1.5 flex-1">
                <div class="h-5 bg-slate-200/80 rounded w-1/4"></div>
                <div class="h-3.5 bg-slate-200/60 rounded w-1/3"></div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="space-y-2">
                  <div class="h-4 bg-slate-200/80 rounded w-1/3"></div>
                  <div class="h-11 bg-slate-100 rounded-xl border border-slate-200/50 w-full"></div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else if (type === 'detail') {
        <!-- Detail Document Skeleton Loader -->
        <div class="space-y-6 animate-pulse">
          <div class="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div class="space-y-2">
                <div class="h-7 bg-slate-200/90 rounded-lg w-64"></div>
                <div class="h-4 bg-slate-200/60 rounded w-48"></div>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-10 bg-slate-200/70 rounded-xl w-28"></div>
                <div class="h-10 bg-slate-200/70 rounded-xl w-28"></div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @for (i of [1, 2, 3]; track i) {
                <div class="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                  <div class="h-3.5 bg-slate-200/70 rounded w-1/3"></div>
                  <div class="h-6 bg-slate-200/90 rounded w-2/3"></div>
                </div>
              }
            </div>

            <div class="h-48 bg-slate-50 rounded-xl border border-slate-100"></div>
          </div>
        </div>
      } @else if (type === 'spinner') {
        <!-- Inline / Centered Animated Spinner -->
        <div class="py-12 flex flex-col items-center justify-center text-center">
          <bm-spinner size="xl" color="emerald" [label]="message || 'Loading data...'"></bm-spinner>
        </div>
      } @else {
        <!-- General Card Skeleton Loader -->
        <div class="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4 animate-pulse">
          <div class="h-6 bg-slate-200/80 rounded w-1/3"></div>
          <div class="h-24 bg-slate-100 rounded-xl border border-slate-100 w-full"></div>
        </div>
      }
    </div>
  `,
})
export class BmLoadingStateComponent {
  @Input() type: 'table' | 'kpi' | 'card' | 'form' | 'detail' | 'spinner' = 'table';
  @Input() rows = 5;
  @Input() message?: string;
  @Input() fullHeight = false;

  get containerClass(): string {
    return `w-full ${this.fullHeight ? 'min-h-[300px] flex items-center justify-center' : 'my-3'}`;
  }

  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i + 1);
  }
}
