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
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'pending_approval':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'commenced':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold';
      case 'expired':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'terminated':
      case 'inactive':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'archived':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  });

  dotClass = computed(() => {
    const s = (this.status || '').toLowerCase();
    switch (s) {
      case 'draft':
        return 'bg-slate-400';
      case 'pending_approval':
        return 'bg-amber-500';
      case 'approved':
        return 'bg-emerald-500';
      case 'commenced':
        return 'bg-emerald-600';
      case 'expired':
        return 'bg-slate-400';
      case 'terminated':
      case 'inactive':
        return 'bg-rose-500';
      case 'active':
        return 'bg-emerald-500';
      case 'archived':
        return 'bg-amber-600';
      default:
        return 'bg-slate-400';
    }
  });

  formatLabel(val: string): string {
    if (!val) return '';
    return val.replace(/_/g, ' ');
  }
}
