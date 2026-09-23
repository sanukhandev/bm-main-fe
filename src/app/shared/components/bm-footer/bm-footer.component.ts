import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="py-4 text-center text-xs text-slate-500 font-medium select-none">
      Created by <span class="font-zaakiy font-bold text-emerald-800">Zv3</span> and powered by <span class="font-zaakiy font-bold text-emerald-800">ZaakiyV3RSE</span> with all rights reserved to <span class="font-semibold text-slate-700">Deertwhales 2026</span>
    </footer>
  `,
})
export class BmFooterComponent {}
