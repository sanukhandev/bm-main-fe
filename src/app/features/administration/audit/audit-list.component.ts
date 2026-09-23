import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditApiService, AuditLog } from '../../../core/api/audit-api.service';
import { BmErrorStateComponent } from '../../../shared/components/bm-error-state/bm-error-state.component';
import { BmLoadingStateComponent } from '../../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmPageHeaderComponent } from '../../../shared/components/bm-page-header/bm-page-header.component';

@Component({
  selector: 'bm-audit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BmPageHeaderComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <bm-page-header
      title="Audit Trail"
      subtitle="Append-only branch activity history"
    ></bm-page-header>
    <div class="bm-card p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <input class="bm-input" type="date" [(ngModel)]="filters.date_from" /><input
        class="bm-input"
        type="date"
        [(ngModel)]="filters.date_to"
      /><input class="bm-input" [(ngModel)]="filters.search" placeholder="Search activity" /><input
        class="bm-input"
        [(ngModel)]="filters.action"
        placeholder="Action"
      />
      <div class="flex gap-2">
        <button class="bm-btn bm-btn-primary text-xs" (click)="load()">Apply</button
        ><button class="bm-btn bm-btn-secondary text-xs" (click)="reset()">Reset</button>
      </div>
    </div>
    @if (loading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
    } @else {
      <div class="bm-card overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="p-4">Date & Time</th>
              <th class="p-4">User</th>
              <th class="p-4">Action</th>
              <th class="p-4">Entity</th>
              <th class="p-4">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (log of logs(); track log.id) {
              <tr>
                <td class="p-4 whitespace-nowrap">{{ log.created_at | date: 'medium' }}</td>
                <td class="p-4">{{ log.actor?.name || 'System' }}</td>
                <td class="p-4 font-semibold">{{ label(log.action) }}</td>
                <td class="p-4">
                  {{ log.entity_type || 'System' }}{{ log.entity_id ? ' #' + log.entity_id : '' }}
                </td>
                <td class="p-4">
                  <details>
                    <summary class="cursor-pointer text-emerald-700">View changes</summary>
                    <div class="mt-2 text-xs space-y-1">
                      <div>Before: {{ json(log.before) }}</div>
                      <div>After: {{ json(log.after) }}</div>
                      <div>Metadata: {{ json(log.metadata) }}</div>
                    </div>
                  </details>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="p-8 text-center text-slate-500">
                  No audit activity found for the selected filters.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (lastPage() > 1) {
        <div class="flex justify-between mt-4">
          <button
            class="bm-btn bm-btn-secondary text-xs"
            [disabled]="page() <= 1"
            (click)="load(page() - 1)"
          >
            Previous</button
          ><span class="text-sm">Page {{ page() }} of {{ lastPage() }}</span
          ><button
            class="bm-btn bm-btn-secondary text-xs"
            [disabled]="page() >= lastPage()"
            (click)="load(page() + 1)"
          >
            Next
          </button>
        </div>
      }
    }
  `,
})
export class AuditListComponent implements OnInit {
  private api = inject(AuditApiService);
  logs = signal<AuditLog[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  page = signal(1);
  lastPage = signal(1);
  filters: { date_from: string; date_to: string; search: string; action: string } = {
    date_from: '',
    date_to: '',
    search: '',
    action: '',
  };
  ngOnInit(): void {
    this.load();
  }
  load(page = this.page()): void {
    this.loading.set(true);
    this.error.set(null);
    this.page.set(page);
    this.api.getLogs({ ...this.filters, page, per_page: 25 }).subscribe({
      next: (response) => {
        this.logs.set(response.data);
        this.lastPage.set(response.meta.last_page);
        this.loading.set(false);
      },
      error: (err) => {
        this.logs.set([]);
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
