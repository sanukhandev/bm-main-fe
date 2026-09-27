import { Component, OnInit, inject, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  AccountsApiService,
  DailyMovement,
  PaymentModeSummary,
} from '../../core/api/accounts-api.service';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';

@Component({
  selector: 'bm-accounts-reports',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterLink,
    BmPageHeaderComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmStatusBadgeComponent,
  ],
  template: `
    <div class="max-w-[1740px] mx-auto space-y-6 font-sans text-[#0F172A]">
      <bm-page-header
        title="Accounts Reports"
        subtitle="Backend-calculated branch financial summaries & daily cashflow positions"
      >
        <a routerLink="/app/accounts/dashboard" class="bm-btn bm-btn-secondary text-xs">
          Accounts Dashboard
        </a>
      </bm-page-header>

      @if (loading()) {
        <bm-loading-state type="table"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
      } @else {
        <!-- TOP BENTO SUMMARY STRIP -->
        <div class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div
            class="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100"
          >
            <div class="space-y-1">
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
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
                <span>Total Inward</span>
              </div>
              <div class="text-2xl font-extrabold text-emerald-700 tabular-nums flex items-center">
                <dirham-symbol
                  size="0.85em"
                  weight="bold"
                  class="mr-1 text-emerald-600 select-none"
                ></dirham-symbol>
                <span>{{ totalInward() | number: '1.2-2' }}</span>
              </div>
            </div>

            <div class="space-y-1 pt-4 md:pt-0 md:pl-6">
              <div
                class="flex items-center gap-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wider"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                  />
                </svg>
                <span>Total Outward</span>
              </div>
              <div class="text-2xl font-extrabold text-rose-700 tabular-nums flex items-center">
                <dirham-symbol
                  size="0.85em"
                  weight="bold"
                  class="mr-1 text-rose-600 select-none"
                ></dirham-symbol>
                <span>{{ totalOutward() | number: '1.2-2' }}</span>
              </div>
            </div>

            <div class="space-y-1 pt-4 md:pt-0 md:pl-6">
              <div
                class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span>Net Cashflow</span>
              </div>
              <div
                class="text-2xl font-extrabold tabular-nums flex items-center"
                [class.text-emerald-700]="netCashflow() > 0"
                [class.text-rose-700]="netCashflow() < 0"
                [class.text-slate-900]="netCashflow() === 0"
              >
                <dirham-symbol
                  size="0.85em"
                  weight="bold"
                  class="mr-1 opacity-80 select-none"
                ></dirham-symbol>
                <span>{{ netCashflow() | number: '1.2-2' }}</span>
              </div>
            </div>

            <div class="space-y-1 pt-4 md:pt-0 md:pl-6">
              <div
                class="flex items-center gap-1.5 text-xs font-semibold text-purple-700 uppercase tracking-wider"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Total Transactions</span>
              </div>
              <div class="text-2xl font-extrabold text-purple-700 tabular-nums">
                {{ totalTransactionCount() }}
              </div>
            </div>
          </div>
        </div>

        <!-- BENTO MODULES GRID -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- BENTO MODULE 1: Daily Cash Movement -->
          <section
            class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Daily Cash Movement</h3>
                    <p class="text-xs text-slate-500">Day-by-day cash inflow & outflow positions</p>
                  </div>
                </div>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700"
                >
                  {{ movement().length }} Days
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr
                      class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
                    >
                      <th class="py-3 px-4">Date</th>
                      <th class="py-3 px-4">Inward</th>
                      <th class="py-3 px-4">Outward</th>
                      <th class="py-3 px-4 text-right">Net Position</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (row of movement(); track row.date) {
                      <tr class="hover:bg-slate-50/60 transition-colors">
                        <td class="py-3 px-4 font-medium text-slate-700 tabular-nums">
                          {{ row.date }}
                        </td>
                        <td class="py-3 px-4 font-semibold text-emerald-700 tabular-nums">
                          <dirham-symbol
                            size="0.85em"
                            weight="bold"
                            class="mr-1 select-none text-emerald-600/80"
                          ></dirham-symbol>
                          <span>{{ row.inward | number: '1.2-2' }}</span>
                        </td>
                        <td class="py-3 px-4 font-semibold text-rose-700 tabular-nums">
                          <dirham-symbol
                            size="0.85em"
                            weight="bold"
                            class="mr-1 select-none text-rose-600/80"
                          ></dirham-symbol>
                          <span>{{ row.outward | number: '1.2-2' }}</span>
                        </td>
                        <td
                          class="py-3 px-4 text-right font-bold tabular-nums"
                          [class.text-emerald-700]="asNumber(row.net) > 0"
                          [class.text-rose-700]="asNumber(row.net) < 0"
                          [class.text-slate-900]="asNumber(row.net) === 0"
                        >
                          <dirham-symbol
                            size="0.85em"
                            weight="bold"
                            class="mr-1 select-none opacity-80"
                          ></dirham-symbol>
                          <span>{{ row.net | number: '1.2-2' }}</span>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="4" class="p-8 text-center text-slate-500 font-medium">
                          No cash movement records available.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- BENTO MODULE 2: Payment Mode Summary -->
          <section
            class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Payment Mode Breakdown</h3>
                    <p class="text-xs text-slate-500">
                      Summary grouped by payment instrument & direction
                    </p>
                  </div>
                </div>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60"
                >
                  {{ modes().length }} Categories
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr
                      class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
                    >
                      <th class="py-3 px-4">Payment Mode</th>
                      <th class="py-3 px-4">Direction</th>
                      <th class="py-3 px-4">Record Count</th>
                      <th class="py-3 px-4 text-right">Aggregated Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (row of modes(); track row.payment_mode + row.direction) {
                      <tr class="hover:bg-slate-50/60 transition-colors">
                        <td class="py-3 px-4">
                          <bm-status-badge [status]="row.payment_mode"></bm-status-badge>
                        </td>
                        <td class="py-3 px-4">
                          <bm-status-badge [status]="row.direction"></bm-status-badge>
                        </td>
                        <td class="py-3 px-4 font-semibold text-slate-800 tabular-nums">
                          {{ row.count }} transactions
                        </td>
                        <td class="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                          <dirham-symbol
                            size="0.85em"
                            weight="bold"
                            class="mr-1 text-slate-500 select-none"
                          ></dirham-symbol>
                          <span>{{ row.amount | number: '1.2-2' }}</span>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="4" class="p-8 text-center text-slate-500 font-medium">
                          No payment mode breakdown available.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      }
    </div>
  `,
})
export class AccountsReportsComponent implements OnInit {
  private api = inject(AccountsApiService);

  movement = signal<DailyMovement[]>([]);
  modes = signal<PaymentModeSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly totalInward = computed(() =>
    this.movement().reduce((acc, row) => acc + (Number(row.inward) || 0), 0),
  );
  readonly totalOutward = computed(() =>
    this.movement().reduce((acc, row) => acc + (Number(row.outward) || 0), 0),
  );
  readonly netCashflow = computed(() => this.totalInward() - this.totalOutward());
  readonly totalTransactionCount = computed(() =>
    this.modes().reduce((acc, row) => acc + (Number(row.count) || 0), 0),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getDailyMovement().subscribe({
      next: (movement) => {
        this.movement.set(movement.data);
        this.api.getPaymentModeSummary().subscribe({
          next: (modes) => {
            this.modes.set(modes.data);
            this.loading.set(false);
          },
          error: (err) => this.fail(err),
        });
      },
      error: (err) => this.fail(err),
    });
  }

  asNumber(val: any): number {
    return Number(val) || 0;
  }

  private fail(err: { message?: string }): void {
    this.error.set(err.message || 'Unable to load accounts reports.');
    this.loading.set(false);
  }
}
