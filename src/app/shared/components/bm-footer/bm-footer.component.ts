import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="py-4 text-center text-xs text-[#1B1E1C]/60 font-medium select-none tracking-wide">
      Created by <span class="font-zaakiy font-bold text-[#193D32]">Zv3</span> and powered by <span class="font-zaakiy font-bold text-[#193D32]">ZaakiyV3RSE</span> with all rights reserved to <span class="font-semibold text-[#1B1E1C]">Deertwhales 2026</span>
    </footer>
  `,
})
export class BmFooterComponent {}
