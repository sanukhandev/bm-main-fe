import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-info-pair',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class.flex-col]="!inline"
      [class.flex-row]="inline"
      [class.items-center]="inline"
      class="flex gap-1"
    >
      <div
        class="text-[11px] font-semibold text-[#74776F] uppercase tracking-wider shrink-0"
        [class.w-28]="inline"
      >
        {{ label }}
      </div>
      <div
        class="text-xs font-semibold text-[#1B1E1C] truncate"
        [class.font-display]="isDisplay"
        [class.text-lg]="isDisplay"
      >
        <ng-content>{{ value }}</ng-content>
      </div>
    </div>
  `,
})
export class BmInfoPairComponent {
  @Input({ required: true }) label!: string;
  @Input() value?: string | number;
  @Input() inline = false;
  @Input() isDisplay = false;
}
