import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
    <div class="max-w-[1740px] mx-auto space-y-6 font-sans text-[#0F172A]">
      <bm-page-header
        title="Audit Trail"
        subtitle="Append-only branch activity history, user actions, and system access telemetry"
      ></bm-page-header>

      <!-- TOP BENTO SUMMARY STRIP -->
      <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div
          class="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100"
        >
          <div class="space-y-1">
            <div
              class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Logged Audit Events</span>
            </div>
            <div class="text-2xl font-extrabold text-slate-900 tabular-nums">
              {{ paginationMeta()?.total || logs().length }} Records
            </div>
          </div>

          <div class="space-y-1 pt-4 sm:pt-0 sm:pl-6">
            <div
              class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Active System Actors</span>
            </div>
            <div class="text-2xl font-extrabold text-emerald-700 tabular-nums">
              {{ uniqueActorsCount() }} Users
            </div>
          </div>

          <div class="space-y-1 pt-4 sm:pt-0 sm:pl-6">
            <div
              class="flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wider"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Audited Entity Types</span>
            </div>
            <div class="text-2xl font-extrabold text-blue-700 tabular-nums">
              {{ uniqueEntitiesCount() }} Entities
            </div>
          </div>
        </div>
      </div>

      <!-- BENTO FILTER TOOLBAR CARD -->
      <div
        class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
      >
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >From Date</label
          >
          <input class="bm-input" type="date" [(ngModel)]="filters.date_from" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >To Date</label
          >
          <input class="bm-input" type="date" [(ngModel)]="filters.date_to" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >Activity Search</label
          >
          <input
            class="bm-input"
            [(ngModel)]="filters.search"
            placeholder="Search activity or actor..."
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >Action Name</label
          >
          <input class="bm-input" [(ngModel)]="filters.action" placeholder="Action name..." />
        </div>
        <div class="flex gap-2">
          <button
            class="bm-btn bm-btn-primary text-xs flex-1 cursor-pointer"
            type="button"
            (click)="load(1)"
          >
            Apply
          </button>
          <button
            class="bm-btn bm-btn-secondary text-xs cursor-pointer"
            type="button"
            (click)="reset()"
          >
            Reset
          </button>
        </div>
      </div>

      @if (loading()) {
        <bm-loading-state type="table"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
      } @else {
        <!-- BENTO TABLE CONTAINER -->
        <div class="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
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
                    <td class="p-4">
                      <span
                        class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                      >
                        {{ label(log.action) }}
                      </span>
                    </td>
                    <td class="p-4 text-slate-700 font-medium">
                      {{ log.entity_type || 'System'
                      }}{{ log.entity_id ? ' #' + log.entity_id : '' }}
                    </td>
                    <td class="p-4">
                      <details class="group">
                        <summary
                          class="cursor-pointer text-emerald-700 hover:text-emerald-800 font-semibold select-none inline-flex items-center gap-1"
                        >
                          <span>View changes</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-3.5 w-3.5 group-open:rotate-180 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>
                        <div
                          class="mt-2 text-xs space-y-1.5 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 font-mono text-slate-700"
                        >
                          <div>
                            <strong class="text-slate-900 font-sans">Before:</strong>
                            {{ json(log.before) }}
                          </div>
                          <div>
                            <strong class="text-slate-900 font-sans">After:</strong>
                            {{ json(log.after) }}
                          </div>
                          <div>
                            <strong class="text-slate-900 font-sans">Metadata:</strong>
                            {{ json(log.metadata) }}
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
    </div>
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

  readonly uniqueActorsCount = computed(() => {
    const actors = new Set<string>();
    for (const log of this.logs()) {
      if (log.actor?.name) actors.add(log.actor.name);
    }
    return actors.size;
  });

  readonly uniqueEntitiesCount = computed(() => {
    const entities = new Set<string>();
    for (const log of this.logs()) {
      if (log.entity_type) entities.add(log.entity_type);
    }
    return entities.size;
  });

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
