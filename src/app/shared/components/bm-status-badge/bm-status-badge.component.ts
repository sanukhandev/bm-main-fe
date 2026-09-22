import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bm-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border shadow-2xs"
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
      // Emerald Triage (Active, Approved, Commenced, Paid, Completed, Resolved, Occupied, Available, Inward, Credit, Owner)
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';

      // Amber Triage (Draft, Pending Approval, Pending, In Progress, Open, Assigned, Cheque, Medium, Normal)
      case 'draft':
      case 'pending_approval':
      case 'pending':
      case 'in_progress':
      case 'open':
      case 'assigned':
      case 'cheque':
      case 'medium':
      case 'normal':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';

      // Rose Triage (Terminated, Inactive, Overdue, Defaulted, Cancelled, Urgent, High, Outward, Debit, Under Maintenance)
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
        return 'bg-rose-50 text-rose-700 border-rose-200/80';

      // Blue Triage (Tenant, Residential, Individual, Monthly, Quarterly, Bank Transfer, Low, Apartment, Villa)
      case 'tenant':
      case 'residential':
      case 'individual':
      case 'monthly':
      case 'quarterly':
      case 'bank_transfer':
      case 'apartment':
      case 'villa':
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';

      // Purple Triage (Commercial, Organization, Semi Annual, Annual, Shop, Office, Warehouse, Space, Labor Camp, Land)
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
        return 'bg-purple-50 text-purple-700 border-purple-200/80';

      // Slate Triage (Expired, Archived, Vacant, Closed, Cash, Service, Inventory)
      case 'expired':
      case 'archived':
      case 'vacant':
      case 'closed':
      case 'cash':
      case 'service':
      case 'inventory':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/80';
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
        return 'bg-emerald-500';

      case 'draft':
      case 'pending_approval':
      case 'pending':
      case 'in_progress':
      case 'open':
      case 'assigned':
      case 'cheque':
      case 'medium':
      case 'normal':
        return 'bg-amber-500';

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
        return 'bg-rose-500';

      case 'tenant':
      case 'residential':
      case 'individual':
      case 'monthly':
      case 'quarterly':
      case 'bank_transfer':
      case 'apartment':
      case 'villa':
      case 'low':
        return 'bg-blue-500';

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
        return 'bg-purple-500';

      default:
        return 'bg-slate-400';
    }
  });

  formatLabel(val: string): string {
    if (!val) return '';
    return val.replace(/_/g, ' ');
  }
}
