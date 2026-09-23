import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'bm-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        @if (breadcrumbs && breadcrumbs.length > 0) {
          <nav class="mb-1.5 flex items-center gap-2 text-[11px] text-[#1B1E1C]/50 font-semibold uppercase tracking-[0.08em]">
            @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
              <span>{{ crumb.label }}</span>
              @if (!last) {
                <span class="text-[#1B1E1C]/30">/</span>
              }
            }
          </nav>
        }
        <h1 class="text-2xl md:text-3xl font-semibold text-[#1B1E1C] tracking-tight leading-tight">
          {{ title }}
        </h1>
        @if (subtitle) {
          <p class="mt-1 text-xs text-[#1B1E1C]/60 font-medium">{{ subtitle }}</p>
        }
      </div>

      <div class="flex items-center gap-3">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class BmPageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];
}
