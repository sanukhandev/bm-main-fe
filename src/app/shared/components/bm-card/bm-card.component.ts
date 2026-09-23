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
      [class.bg-[#FBFAF7]]="variant === 'default'"
    >
      @if (title) {
        <div class="mb-4 flex items-center justify-between border-b border-[#E5E0D8] pb-3">
          <h3 class="text-xs font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]">{{ title }}</h3>
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
