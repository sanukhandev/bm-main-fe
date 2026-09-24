import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditApiService, AuditLog } from '../../../core/api/audit-api.service';
import { BmErrorStateComponent } from '../../../shared/components/bm-error-state/bm-error-state.component';
import { BmLoadingStateComponent } from '../../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmPageHeaderComponent } from '../../../shared/components/bm-page-header/bm-page-header.component';
import { BmPaginationComponent } from '../../../shared/components/bm-pagination/bm-pagination.component';
import { PaginationMeta } from '../../../core/api/api.models';

@Component({
  selector: 'bm-audit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BmPageHeaderComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmPaginationComponent,
  ],
  template: `
    <bm-page-header
      title="Audit Trail"
      subtitle="Append-only branch activity history and system access logs"
    ></bm-page-header>

    <div class="bm-card p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <div>
        <label class="text-xs text-slate-500 font-medium mb-1 block">From Date</label>
        <input class="bm-input" type="date" [(ngModel)]="filters.date_from" />
      </div>
      <div>
        <label class="text-xs text-slate-500 font-medium mb-1 block">To Date</label>
        <input class="bm-input" type="date" [(ngModel)]="filters.date_to" />
      </div>
      <div>
        <label class="text-xs text-slate-500 font-medium mb-1 block">Activity Search</label>
        <input class="bm-input" [(ngModel)]="filters.search" placeholder="Search activity..." />
      </div>
      <div>
        <label class="text-xs text-slate-500 font-medium mb-1 block">Action</label>
        <input class="bm-input" [(ngModel)]="filters.action" placeholder="Action name..." />
      </div>
      <div class="flex gap-2">
        <button class="bm-btn bm-btn-primary text-xs flex-1 cursor-pointer" (click)="load(1)">
          Apply
        </button>
        <button class="bm-btn bm-btn-secondary text-xs cursor-pointer" (click)="reset()">
          Reset
        </button>
      </div>
    </div>

    @if (loading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
    } @else {
      <div class="bm-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
              >
                <th class="p-4">Date & Time</th>
                <th class="p-4">User</th>
                <th class="p-4">Action</th>
                <th class="p-4">Entity</th>
                <th class="p-4">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (log of logs(); track log.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-4 whitespace-nowrap text-slate-600 font-medium tabular-nums">
                    {{ log.created_at | date: 'medium' }}
                  </td>
                  <td class="p-4 font-semibold text-slate-900">
                    {{ log.actor?.name || 'System' }}
                  </td>
                  <td class="p-4 font-semibold text-emerald-800">{{ label(log.action) }}</td>
                  <td class="p-4 text-slate-700">
                    {{ log.entity_type || 'System' }}{{ log.entity_id ? ' #' + log.entity_id : '' }}
                  </td>
                  <td class="p-4">
                    <details class="group">
                      <summary
                        class="cursor-pointer text-emerald-700 hover:text-emerald-800 font-medium select-none"
                      >
                        View changes
                      </summary>
                      <div
                        class="mt-2 text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-slate-700"
                      >
                        <div>
                          <strong class="text-slate-900">Before:</strong> {{ json(log.before) }}
                        </div>
                        <div>
                          <strong class="text-slate-900">After:</strong> {{ json(log.after) }}
                        </div>
                        <div>
                          <strong class="text-slate-900">Metadata:</strong> {{ json(log.metadata) }}
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="p-8 text-center text-slate-500 font-medium">
                    No audit activity found for the selected filters.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (paginationMeta()) {
          <bm-pagination [meta]="paginationMeta()!" (pageChange)="load($event)"></bm-pagination>
        }
      </div>
    }
  `,
})
export class AuditListComponent implements OnInit {
  private api = inject(AuditApiService);
  logs = signal<AuditLog[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  paginationMeta = signal<PaginationMeta | null>(null);

  filters: { date_from: string; date_to: string; search: string; action: string } = {
    date_from: '',
    date_to: '',
    search: '',
    action: '',
  };

  ngOnInit(): void {
    this.load(1);
  }

  load(page = 1): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getLogs({ ...this.filters, page, per_page: 20 }).subscribe({
      next: (response) => {
        this.logs.set(response.data);
        this.paginationMeta.set(response.meta);
        this.loading.set(false);
      },
      error: (err) => {
        this.logs.set([]);
        this.paginationMeta.set(null);
        this.error.set(err?.error?.message || err?.message || 'Unable to load audit trail.');
        this.loading.set(false);
      },
    });
  }

  reset(): void {
    this.filters = { date_from: '', date_to: '', search: '', action: '' };
    this.load(1);
  }

  label(action: string): string {
    return action
      .split('.')
      .map((part) => part.replaceAll('_', ' '))
      .join(' ')
      .replace(/\b\w/g, (part) => part.toUpperCase());
  }

  json(value: Record<string, unknown> | null): string {
    return value ? JSON.stringify(value) : '—';
  }
}
