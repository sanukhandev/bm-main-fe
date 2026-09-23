import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer
      class="py-4 text-center text-xs text-[#1B1E1C]/40 font-normal select-none tracking-wide"
    >
      <span class="font-medium text-[#1B1E1C]/55">Baithul Madeena Real Estate ERP</span>
      <span class="mx-2 text-[#1B1E1C]/25">•</span>
      Created by <span class="font-zaakiy font-semibold text-[#193D32]/60">Zv3</span>
      <span class="mx-2 text-[#1B1E1C]/25">•</span>
      Powered by <span class="font-zaakiy font-semibold text-[#193D32]/60">ZaakiyV3rse</span>
      <span class="mx-2 text-[#1B1E1C]/25">•</span>
      © 2026 Desertwhales
    </footer>
  `,
})
export class BmFooterComponent {}
