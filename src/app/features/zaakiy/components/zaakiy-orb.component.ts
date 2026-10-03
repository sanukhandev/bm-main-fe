import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-zaakiy-orb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative flex items-center justify-center shrink-0 rounded-full transition-transform duration-300 hover:scale-105"
      [ngClass]="{
        'w-7 h-7': size === 'sm',
        'w-9 h-9': size === 'md',
        'w-12 h-12': size === 'lg'
      }"
    >
      <!-- Deep Emerald Orb Base -->
      <div
        class="absolute inset-0 rounded-full bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022C22] shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),0_4px_12px_rgba(6,78,59,0.3)] border border-emerald-500/30"
      ></div>

      <!-- Soft Inner Radial Glow -->
      <div
        class="absolute inset-1 rounded-full bg-radial from-[#10B981]/40 via-transparent to-transparent opacity-80"
      ></div>

      <!-- Tiny Signature Lime Highlight Accent (#DFFF62) -->
      <div
        class="absolute top-1.5 right-1.5 rounded-full bg-[#DFFF62] shadow-[0_0_6px_#DFFF62]"
        [ngClass]="{
          'w-1 h-1': size === 'sm',
          'w-1.5 h-1.5': size === 'md',
          'w-2 h-2': size === 'lg'
        }"
      ></div>

      <!-- Subtle Geometric Inner Core -->
      <div
        class="relative z-10 text-white font-poppins font-semibold text-[10px] tracking-wider flex items-center justify-center"
        [ngClass]="{
          'text-[9px]': size === 'sm',
          'text-[11px]': size === 'md',
          'text-[13px]': size === 'lg'
        }"
      >
        <span class="text-emerald-200">Z</span><span class="text-[#DFFF62]">v3</span>
      </div>
    </div>
  `,
  styles: [],
})
export class ZaakiyOrbComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
