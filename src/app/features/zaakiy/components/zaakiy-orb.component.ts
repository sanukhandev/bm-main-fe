import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-zaakiy-orb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative flex items-center justify-center shrink-0 select-none"
      [ngClass]="{
        'w-6 h-6': size === 'sm',
        'w-9 h-9': size === 'md',
        'w-11 h-11': size === 'lg'
      }"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-full h-full transition-transform duration-500"
        [class.animate-spin]="pulse"
        [style.animation-duration]="pulse ? '6s' : null"
      >
        <defs>
          <linearGradient id="zaakiySparkle" x1="3" y1="3" x2="25" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#10B981" />
            <stop offset="55%" stop-color="#059669" />
            <stop offset="100%" stop-color="#0D9488" />
          </linearGradient>
        </defs>
        <path
          d="M14 2C14.8 9.2 18.8 13.2 26 14C18.8 14.8 14.8 18.8 14 26C13.2 18.8 9.2 14.8 2 14C9.2 13.2 13.2 9.2 14 2Z"
          fill="url(#zaakiySparkle)"
        />
      </svg>
    </div>
  `,
  styles: [],
})
export class ZaakiyOrbComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() pulse = false;
}
