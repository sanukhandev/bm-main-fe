import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IntelligentReportApiService,
  IntelligentReportData,
  IntelligentReportPeriod,
  IntelligentReportScope,
} from '../../core/api/intelligent-report-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';

@Component({
  selector: 'bm-intelligent-report',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, RouterLink, BmErrorStateComponent, BmLoadingStateComponent],
  template: `
    <div class="max-w-[1740px] mx-auto space-y-6 font-sans text-[#0F172A]">
      <!-- TOP EXECUTIVE PAGE HEADER & ACTIONS -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span
              class="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md"
            >
              AI Analytics & Intelligence
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Intelligent Report & Leakage Detection
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated financial performance, operating margin analysis, and deterministic leakage
            findings.
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <button
            class="bm-btn bm-btn-secondary text-xs flex items-center gap-1.5"
            type="button"
            (click)="load()"
            [disabled]="loading()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-slate-500"
              [class.animate-spin]="loading()"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            class="bm-btn bm-btn-primary text-xs flex items-center gap-1.5"
            type="button"
            (click)="download()"
            [disabled]="loading() || downloadingPdf()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>{{ downloadingPdf() ? 'Exporting PDF...' : 'Export PDF Report' }}</span>
          </button>
        </div>
      </div>

      <!-- BENTO CONTROL FILTER CARD -->
      <div
        class="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/70 p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] relative overflow-hidden"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end relative z-10">
          <!-- Period Selector -->
          <div class="lg:col-span-3">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reporting Period
            </label>
            <select
              class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
              [(ngModel)]="period"
              (ngModelChange)="periodChanged()"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <!-- Custom Date Range Inputs -->
          @if (period === 'custom') {
            <div class="lg:col-span-3">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <input
                type="date"
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                [(ngModel)]="dateFrom"
              />
            </div>
            <div class="lg:col-span-3">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <input
                type="date"
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                [(ngModel)]="dateTo"
              />
            </div>
          }

          <!-- Scope Selector (SuperAdmin only) -->
          @if (isSuperAdmin()) {
            <div class="lg:col-span-3">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Analytics Scope
              </label>
              <select
                class="w-full h-11 px-3.5 rounded-xl border border-slate-300/90 bg-white text-slate-900 text-xs font-semibold shadow-2xs focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-150"
                [(ngModel)]="scope"
              >
                <option value="branch">Active Branch Context</option>
                <option value="overall">Overall Enterprise (All Branches)</option>
              </select>
            </div>
          }

          <!-- Submit Button -->
          <div class="lg:col-span-3">
            <button
              type="button"
              (click)="load()"
              [disabled]="loading()"
              class="w-full h-11 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold tracking-wide shadow-md transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
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
              <span>Generate AI Analysis</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MAIN REPORT BODY CONTENT -->
      @if (loading()) {
        <bm-loading-state type="card"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
      } @else if (report()) {
        <!-- REPORT METADATA STRIP -->
        <div class="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Scope: {{ report()!.scope.label }}</span>
            <span>•</span>
            <span>Period: {{ report()!.period.from }} to {{ report()!.period.to }}</span>
          </div>
          <span class="font-mono text-slate-400"
            >Granularity: {{ report()!.period.granularity }}</span
          >
        </div>

        <!-- 1. EDITORIAL BENTO HERO CARD: OPERATIONAL PROFIT / LOSS & LIQUIDITY -->
        <div
          class="rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white relative overflow-hidden p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)] transition-all duration-300 min-h-[300px] flex flex-col justify-between"
        >
          <!-- Static Top-to-Bottom Light Yellow Ambient Shade Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-amber-400/12 via-amber-300/4 to-transparent pointer-events-none z-0"
          ></div>

          <!-- Bottom Fluid Wave Animation Overlay (Green for Profit, Red for Deficit) -->
          <div
            class="absolute bottom-0 inset-x-0 h-44 sm:h-52 pointer-events-none overflow-hidden z-0 transition-opacity duration-500"
          >
            <!-- Background Gradient Tint -->
            <div
              class="absolute inset-0 transition-colors duration-500 bg-gradient-to-t"
              [class.from-emerald-500/15]="number('operational_profit_loss') >= 0"
              [class.via-emerald-500/5]="number('operational_profit_loss') >= 0"
              [class.from-rose-500/15]="number('operational_profit_loss') < 0"
              [class.via-rose-500/5]="number('operational_profit_loss') < 0"
              [class.to-transparent]="true"
            ></div>

            <!-- Secondary Soft Background Wave Silhouette -->
            <svg
              class="absolute bottom-0 inset-x-0 w-full h-full animate-wave-bottom-slow transition-colors duration-500 select-none opacity-40"
              [class.text-emerald-500/25]="number('operational_profit_loss') >= 0"
              [class.text-rose-500/25]="number('operational_profit_loss') < 0"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path
                d="M0,45 C200,85 400,35 600,65 C800,25 1000,70 1200,40 C1300,25 1380,60 1440,50 L1440,120 L0,120 Z"
              ></path>
            </svg>

            <!-- Primary Animated SVG Bottom Wave Silhouette -->
            <svg
              class="absolute bottom-0 inset-x-0 w-full h-full animate-wave-bottom transition-colors duration-500 select-none"
              [class.text-emerald-500/20]="number('operational_profit_loss') >= 0"
              [class.text-rose-500/20]="number('operational_profit_loss') < 0"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path
                d="M0,65 C160,25 320,95 480,50 C640,10 800,75 960,35 C1120,70 1280,20 1440,55 L1440,120 L0,120 Z"
              ></path>
            </svg>
          </div>

          <!-- Top Row Grid Structure: Left Centerpiece Metric | Center In/Out Statistics | Right Dirham Watermark Symbol -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative">
            <!-- LEFT COLUMN (Col 6): Centerpiece Net Operational Result -->
            <div class="lg:col-span-6 space-y-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                Net Operational Result
              </span>

              <div
                class="flex items-center gap-3 text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight tabular-nums transition-colors duration-300"
                [class.text-[#047857]]="number('operational_profit_loss') >= 0"
                [class.text-[#DC2626]]="number('operational_profit_loss') < 0"
              >
                <dirham-symbol
                  size="0.85em"
                  weight="bold"
                  class="select-none shrink-0"
                ></dirham-symbol>
                <span>{{ formatMoney(report()!.summary['operational_profit_loss']) }}</span>
              </div>

              <div class="flex items-center gap-3 pt-1">
                <span
                  class="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-md border"
                  [class.bg-emerald-50]="number('operational_profit_loss') >= 0"
                  [class.text-[#047857]]="number('operational_profit_loss') >= 0"
                  [class.border-emerald-200]="number('operational_profit_loss') >= 0"
                  [class.bg-rose-50]="number('operational_profit_loss') < 0"
                  [class.text-[#DC2626]]="number('operational_profit_loss') < 0"
                  [class.border-rose-200]="number('operational_profit_loss') < 0"
                >
                  {{
                    number('operational_profit_loss') >= 0
                      ? '+ Operational Surplus'
                      : '- Operational Deficit'
                  }}
                </span>
                <span class="text-xs text-slate-500 font-medium">
                  Operating Margin:
                  <strong class="text-slate-900 font-extrabold"
                    >{{ report()!.summary.operating_margin_percent ?? '—' }}%</strong
                  >
                </span>
              </div>
            </div>

            <!-- MIDDLE COLUMN (Col 4): Operating Income & Operating Cost Statistics (Clean inline, NO inner cards) -->
            <div class="lg:col-span-4 space-y-6">
              <!-- Operating Income (Inline statistics without nested card box) -->
              <div class="flex items-center gap-3.5">
                <div
                  class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#047857] flex items-center justify-center shrink-0 shadow-2xs"
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
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </div>
                <div class="flex flex-col justify-center">
                  <span
                    class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#047857]"
                  >
                    Operating Income
                  </span>
                  <div
                    class="text-2xl sm:text-3xl font-bold text-[#047857] tabular-nums tracking-tight flex items-center"
                  >
                    <dirham-symbol
                      size="0.95em"
                      weight="bold"
                      class="mr-1.5 select-none text-[#047857]/80"
                    ></dirham-symbol>
                    <span>{{ formatMoney(report()!.summary['operating_income']) }}</span>
                  </div>
                </div>
              </div>

              <!-- Operating Cost (Inline statistics without nested card box) -->
              <div class="flex items-center gap-3.5">
                <div
                  class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 text-[#DC2626] flex items-center justify-center shrink-0 shadow-2xs"
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
                      d="M17 13l-5 5m0 0l-5-5m5 5V6"
                    />
                  </svg>
                </div>
                <div class="flex flex-col justify-center">
                  <span
                    class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#DC2626]"
                  >
                    Operating Cost
                  </span>
                  <div
                    class="text-2xl sm:text-3xl font-bold text-[#DC2626] tabular-nums tracking-tight flex items-center"
                  >
                    <dirham-symbol
                      size="0.95em"
                      weight="bold"
                      class="mr-1.5 select-none text-[#DC2626]/80"
                    ></dirham-symbol>
                    <span>{{ formatMoney(report()!.summary['operating_cost']) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN (Col 2): Dirham Symbol Watermark Badge at Right End -->
            <div class="lg:col-span-2 flex items-center justify-end">
              <div
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-center text-slate-400/70 shadow-inner select-none transition-transform hover:scale-105 duration-300"
              >
                <dirham-symbol size="3.5em" weight="bold"></dirham-symbol>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 6-CARD TACTILE BENTO METRICS GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Card 1: Net Cash Movement -->
          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
              >Net Cash Movement</span
            >
            <div
              class="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1 flex items-center"
            >
              <dirham-symbol
                size="0.85em"
                weight="bold"
                class="mr-1.5 text-slate-500 select-none"
              ></dirham-symbol>
              <span>{{ formatMoney(report()!.summary['net_cash_movement']) }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Net movement during selected period</p>
          </div>

          <!-- Card 2: Collection Efficiency -->
          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
              >Collection Efficiency</span
            >
            <div
              class="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1 flex items-baseline gap-1"
            >
              <span>{{ report()!.summary.collection_efficiency_percent ?? '—' }}</span>
              <span class="text-sm font-semibold text-slate-500">%</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Tenant invoice collection performance</p>
          </div>

          <!-- Card 3: Pending Cheques -->
          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-amber-800 uppercase tracking-wider block"
              >Pending Cheques</span
            >
            <div
              class="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums mt-1 flex items-center"
            >
              <dirham-symbol
                size="0.85em"
                weight="bold"
                class="mr-1.5 text-amber-600 select-none"
              ></dirham-symbol>
              <span>{{ formatMoney(report()!.summary['pending_cheque_value']) }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Uncleared incoming cheques</p>
          </div>

          <!-- Card 4: Tenant Receivables -->
          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
              >Tenant Receivables</span
            >
            <div
              class="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1 flex items-center"
            >
              <dirham-symbol
                size="0.85em"
                weight="bold"
                class="mr-1.5 text-slate-500 select-none"
              ></dirham-symbol>
              <span>{{ formatMoney(report()!.summary['tenant_receivables']) }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Outstanding tenant balances</p>
          </div>

          <!-- Card 5: Owner Payables -->
          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
              >Owner Payables</span
            >
            <div
              class="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1 flex items-center"
            >
              <dirham-symbol
                size="0.85em"
                weight="bold"
                class="mr-1.5 text-slate-500 select-none"
              ></dirham-symbol>
              <span>{{ formatMoney(report()!.summary['owner_payables']) }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Due to property owners</p>
          </div>

          <!-- Card 6: Overdue Installments -->
          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-rose-800 uppercase tracking-wider block"
              >Overdue Installments</span
            >
            <div
              class="text-2xl sm:text-3xl font-extrabold text-rose-600 tabular-nums mt-1 flex items-center"
            >
              <dirham-symbol
                size="0.85em"
                weight="bold"
                class="mr-1.5 text-rose-600/80 select-none"
              ></dirham-symbol>
              <span>{{ formatMoney(report()!.summary['overdue_installments']?.amount) }}</span>
            </div>
            <p class="text-xs text-rose-700 font-semibold mt-1">
              {{ report()!.summary['overdue_installments']?.count || 0 }} Overdue Payments
            </p>
          </div>
        </div>

        <!-- 3. TRENDS & PROPERTY OPERATIONS BENTO SECTION -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <!-- Income vs Cost Trend Module (Col 7) -->
          <div
            class="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Income vs Operating Cost</h3>
                    <p class="text-xs text-slate-500">Periodical trend breakdown</p>
                  </div>
                </div>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700"
                >
                  {{ report()!.trends.income_vs_cost.length }} Periods
                </span>
              </div>

              <div class="space-y-4 mt-4">
                @for (row of report()!.trends.income_vs_cost; track row.period) {
                  <div>
                    <div
                      class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      <span>{{ row.period }}</span>
                      <div class="flex items-center gap-2 tabular-nums">
                        <span class="text-emerald-700">In: AED {{ formatMoney(row.income) }}</span>
                        <span class="text-slate-400">/</span>
                        <span class="text-rose-600">Out: AED {{ formatMoney(row.cost) }}</span>
                      </div>
                    </div>
                    <div class="h-2.5 overflow-hidden rounded-full bg-slate-100 flex">
                      <div
                        class="h-full bg-emerald-600 transition-all duration-500"
                        [style.width.%]="bar(row.income)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Property Operations Module (Col 5) -->
          <div
            class="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m-5 0V11m0 0V9a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900">Property & Occupancy</h3>
                  <p class="text-xs text-slate-500">Real estate operational capacity</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mt-5">
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
                    >Occupied Units</span
                  >
                  <strong class="text-2xl font-extrabold text-emerald-700 mt-1 block tabular-nums">
                    {{ report()!.summary.occupied_properties }}
                  </strong>
                </div>

                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
                    >Available Units</span
                  >
                  <strong class="text-2xl font-extrabold text-blue-600 mt-1 block tabular-nums">
                    {{ report()!.summary.available_properties }}
                  </strong>
                </div>

                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
                    >Occupancy Rate</span
                  >
                  <strong class="text-2xl font-extrabold text-slate-900 mt-1 block tabular-nums">
                    {{ report()!.summary.occupancy_percent ?? '—' }}%
                  </strong>
                </div>

                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
                    >Expiring Contracts</span
                  >
                  <strong class="text-2xl font-extrabold text-amber-600 mt-1 block tabular-nums">
                    {{
                      report()!.summary.expiring_agreements.tenant +
                        report()!.summary.expiring_agreements.owner
                    }}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. AUTOMATED LEAKAGE DETECTION BENTO TABLE -->
        <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0"
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">Leakage Detection & Risk Alerts</h3>
                <p class="text-xs text-slate-500">
                  Deterministic revenue leakage and anomaly findings
                </p>
              </div>
            </div>
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60"
            >
              {{ report()!.findings.length }} Findings Detected
            </span>
          </div>

          @if (!report()!.findings.length) {
            <div class="p-6 text-center bg-emerald-50/50 rounded-xl border border-emerald-200/60">
              <p class="text-xs text-emerald-800 font-semibold">
                ✓ No deterministic revenue leakage findings detected for this period.
              </p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr
                    class="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold"
                  >
                    <th class="py-2.5 px-3">Severity</th>
                    <th class="py-2.5 px-3">Finding Detail</th>
                    <th class="py-2.5 px-3">Calculation Basis</th>
                    <th class="py-2.5 px-3 text-right">Financial Exposure</th>
                    <th class="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  @for (finding of report()!.findings; track finding.title) {
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-3 px-3">
                        <span
                          class="uppercase text-[10px] font-extrabold px-2.5 py-0.5 rounded border inline-flex items-center gap-1"
                          [class.bg-rose-50]="finding.severity === 'high'"
                          [class.text-rose-700]="finding.severity === 'high'"
                          [class.border-rose-200]="finding.severity === 'high'"
                          [class.bg-amber-50]="finding.severity === 'medium'"
                          [class.text-amber-700]="finding.severity === 'medium'"
                          [class.border-amber-200]="finding.severity === 'medium'"
                          [class.bg-slate-100]="finding.severity === 'low'"
                          [class.text-slate-700]="finding.severity === 'low'"
                          [class.border-slate-200]="finding.severity === 'low'"
                        >
                          ● {{ finding.severity }}
                        </span>
                      </td>
                      <td class="py-3 px-3">
                        <div class="font-bold text-slate-900">{{ finding.title }}</div>
                        <div class="text-xs text-slate-500 mt-0.5">{{ finding.description }}</div>
                      </td>
                      <td class="py-3 px-3 text-slate-600 italic">
                        {{ finding.calculation_basis || '—' }}
                      </td>
                      <td class="py-3 px-3 text-right font-bold text-rose-600 tabular-nums">
                        @if (finding.amount) {
                          <dirham-symbol
                            size="0.85em"
                            weight="bold"
                            class="mr-1 text-rose-500 select-none"
                          ></dirham-symbol>
                          <span>{{ formatMoney(finding.amount) }}</span>
                        } @else {
                          <span>—</span>
                        }
                      </td>
                      <td class="py-3 px-3 text-right">
                        @if (finding.navigation) {
                          <a
                            [routerLink]="finding.navigation"
                            class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                          >
                            <span>Review</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </a>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- 5. ENTERPRISE BRANCH COMPARISON MATRIX (When scope is overall) -->
        @if (report()!.branch_comparison.length) {
          <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0"
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
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900">Branch Performance Comparison</h3>
                  <p class="text-xs text-slate-500">Cross-branch financial operational results</p>
                </div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr
                    class="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold"
                  >
                    <th class="py-2.5 px-3">Branch Name</th>
                    <th class="py-2.5 px-3 text-right">Operating Income</th>
                    <th class="py-2.5 px-3 text-right">Operating Cost</th>
                    <th class="py-2.5 px-3 text-right">Operational Result</th>
                    <th class="py-2.5 px-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  @for (b of report()!.branch_comparison; track b.branch_id) {
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-3 px-3 font-bold text-slate-900">{{ b.branch }}</td>
                      <td class="py-3 px-3 text-right text-emerald-700 font-bold tabular-nums">
                        <dirham-symbol
                          size="0.85em"
                          weight="bold"
                          class="mr-1 text-emerald-600 select-none"
                        ></dirham-symbol>
                        <span>{{ formatMoney(b.operating_income) }}</span>
                      </td>
                      <td class="py-3 px-3 text-right text-rose-600 font-bold tabular-nums">
                        <dirham-symbol
                          size="0.85em"
                          weight="bold"
                          class="mr-1 text-rose-500 select-none"
                        ></dirham-symbol>
                        <span>{{ formatMoney(b.operating_cost) }}</span>
                      </td>
                      <td
                        class="py-3 px-3 text-right font-extrabold tabular-nums"
                        [class.text-[#047857]]="Number(b.operational_result) >= 0"
                        [class.text-[#DC2626]]="Number(b.operational_result) < 0"
                      >
                        <dirham-symbol
                          size="0.85em"
                          weight="bold"
                          class="mr-1 select-none"
                        ></dirham-symbol>
                        <span>{{ formatMoney(b.operational_result) }}</span>
                      </td>
                      <td class="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {{ b.margin ?? '—' }}%
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- 6. ACCOUNTING AUDIT NOTE BANNER -->
        <div
          class="rounded-2xl border-l-4 border-amber-500 bg-amber-50/70 p-5 border border-amber-200/60 shadow-2xs flex items-start gap-4"
        >
          <div
            class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="text-xs text-slate-700 leading-relaxed font-medium">
            <span class="font-bold text-amber-900 block mb-0.5"
              >Accounting Audit Disclosure & Basis of Computation</span
            >
            <p>{{ report()!.accounting_note }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class IntelligentReportComponent implements OnInit {
  private api = inject(IntelligentReportApiService);
  private auth = inject(AuthService);

  report = signal<IntelligentReportData | null>(null);
  loading = signal(false);
  downloadingPdf = signal(false);
  error = signal<string | null>(null);

  period: IntelligentReportPeriod = 'this_month';
  scope: IntelligentReportScope = 'branch';
  dateFrom = '';
  dateTo = '';

  readonly isSuperAdmin = this.auth.isSuperAdmin;
  readonly Number = Number;

  ngOnInit(): void {
    this.load();
  }

  periodChanged(): void {
    if (this.period !== 'custom') {
      this.dateFrom = '';
      this.dateTo = '';
    }
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .get({
        period: this.period,
        scope: this.scope,
        date_from: this.dateFrom || undefined,
        date_to: this.dateTo || undefined,
      })
      .subscribe({
        next: (response) => {
          this.report.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Unable to load the Intelligent Report.');
          this.report.set(null);
          this.loading.set(false);
        },
      });
  }

  download(): void {
    this.downloadingPdf.set(true);
    this.api
      .pdf({
        period: this.period,
        scope: this.scope,
        date_from: this.dateFrom || undefined,
        date_to: this.dateTo || undefined,
      })
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = 'BM-Intelligent-Report.pdf';
          anchor.click();
          URL.revokeObjectURL(url);
          this.downloadingPdf.set(false);
        },
        error: () => {
          this.error.set('Unable to generate the PDF report.');
          this.downloadingPdf.set(false);
        },
      });
  }

  value(key: string): string {
    const val = this.report()?.summary[key];
    return val === null || val === undefined ? '—' : String(val);
  }

  number(key: string): number {
    return Number(this.report()?.summary[key] ?? 0);
  }

  bar(value: string): number {
    const max = Math.max(
      ...(this.report()?.trends.income_vs_cost.map((row) => Number(row.income)) || [1]),
    );
    return Math.min(100, (Number(value) / Math.max(1, max)) * 100);
  }

  formatMoney(val: string | number | undefined | null): string {
    if (val === null || val === undefined || val === '') return '0.00';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
