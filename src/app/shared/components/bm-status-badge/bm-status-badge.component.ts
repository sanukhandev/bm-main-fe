import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 h-[22px] rounded-full text-[11px] font-semibold capitalize border shadow-2xs whitespace-nowrap"
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
      // Approved / Active / Commenced / Paid / Completed / Resolved / Occupied / Available / Inward
      case 'active':
      case 'approved':
      case 'commenced':
      case 'paid':
      case 'completed':
      case 'resolved':
      case 'occupied':
      case 'available':
      case 'inward':
      case 'credit':
      case 'owner':
        return 'bg-[#DDE5DD] text-[#193D32] border-[#285746]/20';

      // Pending / In Progress / Open / Assigned / Cheque / Medium / Normal
      case 'draft':
        return 'bg-[#EAE6DE] text-[#74776F] border-[#D8D4CB]';
      case 'pending_approval':
      case 'pending':
      case 'in_progress':
      case 'open':
      case 'assigned':
      case 'cheque':
      case 'medium':
      case 'normal':
      case 'partially_paid':
        return 'bg-[#EEE6D5] text-[#A77A35] border-[#D6C49D]/30';

      // Terminated / Inactive / Overdue / Defaulted / Cancelled / Urgent / High / Outward / Void
      case 'terminated':
      case 'inactive':
      case 'overdue':
      case 'defaulted':
      case 'cancelled':
      case 'urgent':
      case 'high':
      case 'outward':
      case 'debit':
      case 'under_maintenance':
      case 'unpaid':
      case 'void':
        return 'bg-[#EDDEDF] text-[#A45454] border-[#B98D91]/30';

      // Tenant / Individual / Monthly / Quarterly / Bank Transfer / Low
      case 'tenant':
      case 'residential':
      case 'individual':
      case 'monthly':
      case 'quarterly':
      case 'bank_transfer':
      case 'apartment':
      case 'villa':
      case 'low':
      case 'sent':
        return 'bg-[#DDE5E6] text-[#567C83] border-[#829A9E]/30';

      // Commercial / Organization
      case 'commercial':
      case 'organization':
      case 'semi_annual':
      case 'annual':
      case 'shop':
      case 'office':
      case 'warehouse':
      case 'space':
      case 'labor_camp':
      case 'land':
      case 'converted':
        return 'bg-[#E6E5D8] text-[#969875] border-[#969875]/30';

      // Expired / Archived / Vacant / Closed / Cash
      case 'expired':
      case 'archived':
      case 'vacant':
      case 'closed':
      case 'cash':
      case 'service':
      case 'inventory':
      default:
        return 'bg-[#E2DED5] text-[#74776F] border-[#D8D4CB]';
    }
  });

  dotClass = computed(() => {
    const s = (this.status || '').toLowerCase();
    switch (s) {
      case 'active':
      case 'approved':
      case 'commenced':
      case 'paid':
      case 'completed':
      case 'resolved':
      case 'occupied':
      case 'available':
      case 'inward':
      case 'credit':
      case 'owner':
        return 'bg-[#285746]';

      case 'pending_approval':
      case 'pending':
      case 'in_progress':
      case 'open':
      case 'assigned':
      case 'cheque':
      case 'medium':
      case 'normal':
        return 'bg-[#A77A35]';

      case 'terminated':
      case 'inactive':
      case 'overdue':
      case 'defaulted':
      case 'cancelled':
      case 'urgent':
      case 'high':
      case 'outward':
      case 'debit':
      case 'under_maintenance':
        return 'bg-[#A45454]';

      case 'tenant':
      case 'residential':
      case 'individual':
      case 'monthly':
      case 'quarterly':
      case 'bank_transfer':
      case 'apartment':
      case 'villa':
      case 'low':
        return 'bg-[#567C83]';

      default:
        return 'bg-[#74776F]';
    }
  });

  formatLabel(val: string): string {
    if (!val) return '';
    return val.replace(/_/g, ' ');
  }
}
