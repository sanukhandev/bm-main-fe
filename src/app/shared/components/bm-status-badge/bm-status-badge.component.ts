import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize border"
      [ngClass]="badgeClass()"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass()"></span>
      {{ formatLabel(status) }}
    </span>
  `,
})
export class BmStatusBadgeComponent {
  @Input({ required: true }) status!: string;

  badgeClass = computed(() => {
    const s = (this.status || '').toLowerCase();
    switch (s) {
      case 'draft':
        return 'bg-[#f8fad9] text-[#1e351b] border-[#d3ddbb]';
      case 'pending_approval':
        return 'bg-[#f4f8c6] text-[#424809] border-[#deea58]';
      case 'approved':
        return 'bg-[#d0e6cd] text-[#132a13] border-[#a0cc9b]';
      case 'commenced':
        return 'bg-[#e9eedd] text-[#132a13] border-[#90a955] font-semibold';
      case 'expired':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'terminated':
      case 'inactive':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'active':
        return 'bg-[#d0e6cd] text-[#132a13] border-[#a0cc9b]';
      case 'archived':
        return 'bg-[#f4f8c6] text-[#424809] border-[#deea58]';
      default:
        return 'bg-[#f8fad9] text-[#1e351b] border-[#d3ddbb]';
    }
  });

  dotClass = computed(() => {
    const s = (this.status || '').toLowerCase();
    switch (s) {
      case 'draft':
        return 'bg-[#90a955]';
      case 'pending_approval':
        return 'bg-[#858f12]';
      case 'approved':
        return 'bg-[#31572c]';
      case 'commenced':
        return 'bg-[#4f772d]';
      case 'expired':
        return 'bg-slate-400';
      case 'terminated':
      case 'inactive':
        return 'bg-rose-500';
      case 'active':
        return 'bg-[#31572c]';
      case 'archived':
        return 'bg-[#858f12]';
      default:
        return 'bg-[#90a955]';
    }
  });

  formatLabel(val: string): string {
    if (!val) return '';
    return val.replace(/_/g, ' ');
  }
}
