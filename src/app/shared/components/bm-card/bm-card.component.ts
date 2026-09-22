import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bm-card p-6"
      [class.bm-gradient-card]="variant === 'gradient'"
      [class.bg-white]="variant === 'default'"
    >
      @if (title) {
        <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-semibold text-[#101214]">{{ title }}</h3>
          <ng-content select="[card-action]"></ng-content>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `,
})
export class BmCardComponent {
  @Input() title?: string;
  @Input() variant: 'default' | 'gradient' = 'default';
}
