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
          <div class="flex items-center justify-between gap-4 pb-2 border-b border-[#E5E0D8]">
            <div class="h-6 bg-[#E5E0D8] rounded-lg w-1/4"></div>
            <div class="flex items-center gap-2">
              <div class="h-9 bg-[#E5E0D8] rounded-lg w-32"></div>
              <div class="h-9 bg-[#E5E0D8] rounded-lg w-24"></div>
            </div>
          </div>

          <div class="overflow-hidden border border-[#E5E0D8] rounded-xl bg-[#FBFAF7]">
            <div class="h-10 bg-[#F2EFE9] flex items-center justify-between px-4">
              <div class="h-3 bg-[#E5E0D8] rounded w-1/6"></div>
              <div class="h-3 bg-[#E5E0D8] rounded w-1/4"></div>
              <div class="h-3 bg-[#E5E0D8] rounded w-1/5"></div>
              <div class="h-3 bg-[#E5E0D8] rounded w-1/6"></div>
            </div>
            <div class="divide-y divide-[#E5E0D8]">
              @for (i of rowsArray; track i) {
                <div class="h-14 flex items-center justify-between px-4">
                  <div class="flex items-center gap-3 w-1/4">
                    <div class="w-7 h-7 rounded-lg bg-[#E5E0D8] shrink-0"></div>
                    <div class="h-3.5 bg-[#E5E0D8] rounded w-3/4"></div>
                  </div>
                  <div class="h-3.5 bg-[#E5E0D8] rounded w-1/4"></div>
                  <div class="h-5 bg-[#9CAF9F]/30 rounded-full w-20"></div>
                  <div class="h-3.5 bg-[#E5E0D8] rounded w-1/6"></div>
                </div>
              }
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="h-3.5 bg-[#E5E0D8] rounded w-48"></div>
            <div class="h-8 bg-[#E5E0D8] rounded-lg w-36"></div>
          </div>
        </div>
      } @else if (type === 'kpi') {
        <!-- KPI Metrics Skeleton -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          @for (i of [1, 2, 3, 4]; track i) {
            <div
              class="p-5 bg-[#FBFAF7] border border-[#E5E0D8] rounded-xl flex flex-col justify-between h-32 relative overflow-hidden"
            >
              <div class="flex items-center justify-between">
                <div class="h-3.5 bg-[#E5E0D8] rounded w-1/2"></div>
                <div class="w-8 h-8 rounded-lg bg-[#9CAF9F]/20"></div>
              </div>
              <div class="space-y-2">
                <div class="h-7 bg-[#E5E0D8] rounded-lg w-3/4"></div>
                <div class="h-3 bg-[#E5E0D8] rounded w-2/3"></div>
              </div>
            </div>
          }
        </div>
      } @else if (type === 'form') {
        <!-- Form Fields Skeleton Loader -->
        <div class="space-y-6 animate-pulse">
          <div class="p-6 bg-[#FBFAF7] border border-[#E5E0D8] rounded-xl space-y-5">
            <div class="flex items-center gap-3 border-b border-[#E5E0D8] pb-4">
              <div class="w-9 h-9 rounded-lg bg-[#9CAF9F]/20"></div>
              <div class="space-y-1.5 flex-1">
                <div class="h-4 bg-[#E5E0D8] rounded w-1/4"></div>
                <div class="h-3 bg-[#E5E0D8] rounded w-1/3"></div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="space-y-2">
                  <div class="h-3 bg-[#E5E0D8] rounded w-1/3"></div>
                  <div class="h-10 bg-[#F2EFE9] rounded-lg border border-[#E5E0D8] w-full"></div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else if (type === 'detail') {
        <!-- Detail Document Skeleton Loader -->
        <div class="space-y-6 animate-pulse">
          <div class="p-6 bg-[#FBFAF7] border border-[#E5E0D8] rounded-xl space-y-6">
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-5"
            >
              <div class="space-y-2">
                <div class="h-6 bg-[#E5E0D8] rounded-lg w-64"></div>
                <div class="h-3.5 bg-[#E5E0D8] rounded w-48"></div>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-9 bg-[#E5E0D8] rounded-lg w-28"></div>
                <div class="h-9 bg-[#E5E0D8] rounded-lg w-28"></div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @for (i of [1, 2, 3]; track i) {
                <div class="p-4 bg-[#F2EFE9]/50 rounded-lg space-y-2 border border-[#E5E0D8]">
                  <div class="h-3 bg-[#E5E0D8] rounded w-1/3"></div>
                  <div class="h-5 bg-[#E5E0D8] rounded w-2/3"></div>
                </div>
              }
            </div>

            <div class="h-48 bg-[#F2EFE9]/50 rounded-lg border border-[#E5E0D8]"></div>
          </div>
        </div>
      } @else if (type === 'spinner') {
        <!-- Inline / Centered Animated Spinner -->
        <div class="py-12 flex flex-col items-center justify-center text-center">
          <bm-spinner size="xl" color="emerald" [label]="message || 'Loading data...'"></bm-spinner>
        </div>
      } @else {
        <!-- General Card Skeleton Loader -->
        <div class="p-6 bg-[#FBFAF7] border border-[#E5E0D8] rounded-xl space-y-4 animate-pulse">
          <div class="h-5 bg-[#E5E0D8] rounded w-1/3"></div>
          <div class="h-24 bg-[#F2EFE9] rounded-lg border border-[#E5E0D8] w-full"></div>
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
