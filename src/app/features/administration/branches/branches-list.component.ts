import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmPageHeaderComponent } from '../../../shared/components/bm-page-header/bm-page-header.component';
import { BmStatusBadgeComponent } from '../../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../../shared/components/bm-error-state/bm-error-state.component';
import { AdministrationApiService } from '../../../core/api/administration-api.service';
import { Branch } from '../../../core/branch-context/branch.models';

@Component({
  selector: 'bm-branches-list',
  standalone: true,
  imports: [
    CommonModule,
    BmPageHeaderComponent,
    BmStatusBadgeComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <bm-page-header
      title="Branches Administration"
      subtitle="Super Admin multi-branch organization control"
    >
    </bm-page-header>

    @if (isLoading()) {
      <bm-loading-state type="table"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadBranches()"></bm-error-state>
    } @else {
      <div class="bm-card overflow-hidden max-w-5xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
              >
                <th class="py-3.5 px-4">Branch Code</th>
                <th class="py-3.5 px-4">Branch Name</th>
                <th class="py-3.5 px-4">Timezone</th>
                <th class="py-3.5 px-4">Currency</th>
                <th class="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (b of branches(); track b.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-emerald-900 tabular-nums">
                    [{{ b.code }}]
                  </td>
                  <td class="py-3.5 px-4 font-medium text-slate-900">
                    {{ b.name }}
                  </td>
                  <td class="py-3.5 px-4 text-slate-600">
                    {{ b.timezone }}
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-800 uppercase">
                    {{ b.currency_code }}
                  </td>
                  <td class="py-3.5 px-4">
                    <bm-status-badge [status]="b.status"></bm-status-badge>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class BranchesListComponent implements OnInit {
  private api = inject(AdministrationApiService);

  branches = signal<Branch[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(silent = false): void {
    if (!silent && this.branches().length === 0) {
      this.isLoading.set(true);
    }
    this.error.set(null);

    this.api.getBranches().subscribe({
      next: (res) => {
        this.branches.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load branch registry.');
        this.isLoading.set(false);
      },
    });
  }
}
