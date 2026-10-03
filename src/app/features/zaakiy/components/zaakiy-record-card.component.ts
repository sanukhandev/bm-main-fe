import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ZaakiyStructuredRecord } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-record-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="group rounded-2xl border border-surface-200 bg-white p-3.5 space-y-2 transition-all duration-200 hover:border-brand-500/40 hover:shadow-xs">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="text-xs font-poppins font-semibold text-ink group-hover:text-brand-800 transition-colors">
            {{ record.label || record.type || 'Record' }}
          </h4>
          <div class="flex items-center gap-1.5 mt-0.5">
            @if (record.type) {
              <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {{ record.type }}
              </span>
            }
            @if (record.status) {
              <span class="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-100">
                {{ record.status }}
              </span>
            }
          </div>
        </div>

        @if (recordUrl) {
          <button
            type="button"
            (click)="navigateToRecord()"
            class="text-xs font-semibold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 cursor-pointer transition shrink-0 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-xl"
          >
            <span>View</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        }
      </div>

      <!-- Record Facts -->
      @if (recordFieldsList.length > 0) {
        <div class="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600 border-t border-surface-100">
          @for (fact of recordFieldsList; track fact.key) {
            <div class="flex flex-col">
              <span class="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{{ fact.key }}</span>
              <span class="font-medium text-slate-800 truncate">{{ fact.value }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [],
})
export class ZaakiyRecordCardComponent {
  @Input({ required: true }) record!: ZaakiyStructuredRecord;
  private router = inject(Router);

  get recordUrl(): string | null {
    if (!this.record.type || !this.record.id) return null;
    const t = this.record.type.toLowerCase();
    if (t.includes('property')) return `/app/properties/${this.record.id}`;
    if (t.includes('tenant') || t.includes('agreement')) return `/app/tenant-agreements/${this.record.id}`;
    if (t.includes('owner')) return `/app/owner-agreements/${this.record.id}`;
    if (t.includes('customer')) return `/app/customers/${this.record.id}`;
    if (t.includes('work') || t.includes('maintenance')) return `/app/maintenance/work-orders/${this.record.id}`;
    return null;
  }

  navigateToRecord(): void {
    if (this.recordUrl) {
      this.router.navigateByUrl(this.recordUrl);
    }
  }

  get recordFieldsList(): Array<{ key: string; value: string }> {
    if (!this.record.fields) return [];
    return Object.entries(this.record.fields)
      .slice(0, 4)
      .map(([k, v]) => ({
        key: k.replace(/_/g, ' '),
        value: typeof v === 'number' ? v.toLocaleString('en-US') : String(v),
      }));
  }
}
