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
          <nav class="mb-1 flex items-center gap-2 text-xs text-slate-500 font-medium">
            @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
              <span>{{ crumb.label }}</span>
              @if (!last) {
                <span class="text-slate-300">/</span>
              }
            }
          </nav>
        }
        <h1 class="text-2xl md:text-[30px] font-semibold text-[#101214] tracking-tight leading-tight">
          {{ title }}
        </h1>
        @if (subtitle) {
          <p class="mt-1 text-sm text-[#64748B]">{{ subtitle }}</p>
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
