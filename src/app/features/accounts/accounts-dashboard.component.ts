import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountsApiService, AccountsDashboardSnapshot } from '../../core/api/accounts-api.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';

@Component({
  selector: 'bm-accounts-dashboard',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, RouterLink, BmLoadingStateComponent, BmErrorStateComponent],
  template: `
    <!-- ACCOUNTS DASHBOARD CONTAINER -->
    <div class="max-w-[1740px] mx-auto space-y-5 font-sans text-[#0F172A]">
      <!-- TOP PAGE HEADER & ACCOUNTS ACTION STRIP -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              Accounts & Financial Ledger
            </h1>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] uppercase tracking-wider"
            >
              {{ activeBranch()?.name || 'All Branches' }}
            </span>
          </div>
          <p class="text-xs text-[#64748B] mt-0.5">
            Real-time cash flow, collection receipts, disbursements, and receivables ledger.
          </p>
        </div>

        <!-- Financial Quick Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <a
            routerLink="/app/accounts/inward"
            class="h-9 px-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/80 text-[#047857] hover:bg-[#D1FAE5] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <span class="text-base leading-none font-light">+</span> Inward Receipt
          </a>
          <a
            routerLink="/app/accounts/outward"
            class="h-9 px-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA]/80 text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <span class="text-base leading-none font-light">+</span> Outward Voucher
          </a>
          <a
            routerLink="/app/accounts/petty-cash"
            class="h-9 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            Petty Cash Daybook
          </a>
        </div>
      </div>

      @if (loading()) {
        <bm-loading-state type="kpi"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state>
      } @else {
        <!-- 1. EDITORIAL FINANCIAL HERO STRIP (Tactile 3D Elevation, Dubai Skyline Watermark) -->
        <div
          class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-slate-100/70 border border-slate-200/80 p-6 sm:p-7 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition-all duration-300"
        >
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <!-- LEFT COLUMN (Col 3): Petty Cash Balance & Pending Cheques Inward -->
            <div
              class="lg:col-span-3 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-6 lg:pb-0 lg:pr-6"
            >
              <!-- Petty Cash Balance -->
              <div class="flex items-center gap-3.5">
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 text-[#0F172A] flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 sm:h-7 sm:w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div class="flex flex-col justify-center">
                  <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider"
                    >Petty Cash Balance</span
                  >
                  <div
                    class="text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums tracking-tight flex items-baseline"
                  >
                    <dirham-symbol
                      size="18"
                      weight="bold"
                      class="mr-1.5 text-[#64748B] select-none"
                    ></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.petty_cash_balance) }}</span>
                  </div>
                </div>
              </div>

              <!-- Pending Cheques Inward -->
              <div class="flex items-center gap-3.5">
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 text-[#334155] flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 sm:h-7 sm:w-7"
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
                <div class="flex flex-col justify-center">
                  <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider"
                    >Pending Cheques (In)</span
                  >
                  <div
                    class="text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums tracking-tight flex items-baseline"
                  >
                    <dirham-symbol
                      size="18"
                      weight="bold"
                      class="mr-1.5 text-[#64748B] select-none"
                    ></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.pending_cheque_inward) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CENTER COLUMN (Col 6): Editorial Net Cash Movement Hero Number -->
            <div class="lg:col-span-6 flex items-center justify-center py-2">
              <div class="flex items-center gap-4 sm:gap-5">
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs border"
                  [class.bg-[#ECFDF5]]="!isNetMovementNegative()"
                  [class.border-[#A7F3D0]]="!isNetMovementNegative()"
                  [class.text-[#047857]]="!isNetMovementNegative()"
                  [class.bg-[#FEF2F2]]="isNetMovementNegative()"
                  [class.border-[#FECACA]]="isNetMovementNegative()"
                  [class.text-[#DC2626]]="isNetMovementNegative()"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-7 w-7 sm:h-8 sm:w-8"
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

                <div class="flex flex-col items-start text-left">
                  <span class="text-xs font-bold text-[#64748B] uppercase tracking-widest">
                    Today's Net Cash Movement
                  </span>

                  <div
                    class="flex items-baseline gap-2 my-0.5"
                    [class.text-[#047857]]="!isNetMovementNegative()"
                    [class.text-[#DC2626]]="isNetMovementNegative()"
                  >
                    <dirham-symbol
                      size="28"
                      weight="semibold"
                      class="select-none inline-block align-middle"
                    ></dirham-symbol>
                    <span
                      class="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight tabular-nums"
                    >
                      {{ formatMoney(snapshot()?.today_net_movement) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3 text-xs text-[#64748B]">
                    <span class="font-medium"
                      >Scope: {{ activeBranch()?.name || 'All Branches' }}</span
                    >
                    <span>•</span>
                    <span
                      class="inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-md border border-[#E2E8F0] bg-slate-50"
                      [class.text-[#047857]]="!isNetMovementNegative()"
                      [class.text-[#DC2626]]="isNetMovementNegative()"
                    >
                      <span>{{ isNetMovementNegative() ? '- Net Outflow' : '+ Net Inflow' }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN (Col 3): Today's Inward & Outward Receipts -->
            <div
              class="lg:col-span-3 space-y-6 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-6 lg:pt-0 lg:pl-6"
            >
              <!-- Today's Inward -->
              <div class="flex items-center gap-3.5">
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#047857] flex items-center justify-center shrink-0 shadow-2xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 sm:h-7 sm:w-7"
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
                  <span class="text-xs font-semibold uppercase tracking-wider text-[#047857]"
                    >Today's Inward</span
                  >
                  <div
                    class="text-2xl sm:text-3xl font-bold text-[#047857] tabular-nums tracking-tight flex items-baseline"
                  >
                    <dirham-symbol
                      size="20"
                      weight="bold"
                      class="mr-1.5 select-none text-[#047857]/80"
                    ></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.today_inward) }}</span>
                  </div>
                </div>
              </div>

              <!-- Today's Outward -->
              <div class="flex items-center gap-3.5">
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FEF2F2] border border-[#FECACA]/60 text-[#DC2626] flex items-center justify-center shrink-0 shadow-2xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 sm:h-7 sm:w-7"
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
                  <span class="text-xs font-semibold uppercase tracking-wider text-[#DC2626]"
                    >Today's Outward</span
                  >
                  <div
                    class="text-2xl sm:text-3xl font-bold text-[#DC2626] tabular-nums tracking-tight flex items-baseline"
                  >
                    <dirham-symbol
                      size="20"
                      weight="bold"
                      class="mr-1.5 select-none text-[#DC2626]/80"
                    ></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.today_outward) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Skyline Vector Silhouette -->
          <div class="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0">
            <svg
              class="w-full h-[100px] text-slate-800 opacity-[0.04] select-none"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path
                d="M0,120 L0,110 L20,110 L20,95 L35,95 L35,110 L50,110 L50,80 L70,80 L70,60 L80,60 L80,45 L85,45 L85,60 L95,60 L95,80 L110,80 L110,110 L130,110 L130,100 L150,100 L150,110 L180,110 L180,75 L195,75 L195,65 L210,65 L210,75 L225,75 L225,110 L260,110 L260,90 L280,90 L280,110 L310,110 L310,50 L320,50 L320,30 L330,30 L330,20 L333,20 L333,5 L337,5 L337,20 L340,20 L340,30 L350,30 L350,50 L360,50 L360,110 L400,110 L400,85 L420,85 L420,110 L460,110 L460,70 L480,70 L480,110 L520,110 L520,60 L535,60 L535,40 L545,40 L545,60 L560,60 L560,110 L600,110 L600,95 L620,95 L620,110 L660,110 L660,55 L675,55 L675,35 L685,35 L685,55 L700,55 L700,110 L750,110 L750,80 L770,80 L770,110 L810,110 L810,65 L825,65 L825,45 L835,45 L835,25 L838,25 L838,0 L842,0 L842,25 L845,25 L845,45 L855,45 L855,65 L870,65 L870,110 L910,110 L910,90 L930,90 L930,110 L970,110 L970,75 L990,75 L990,110 L1030,110 L1030,85 L1050,85 L1050,110 L1100,110 L1100,95 L1120,95 L1120,110 L1200,110 L1200,120 Z"
              />
            </svg>
          </div>
        </div>

        <div class="h-[4px] bg-[#0F172A] rounded-full w-full my-4 opacity-90"></div>

        <!-- 2. FRAMELESS ACCOUNTS BENTO GRID WITH ACCENT HIGHLIGHTED NUMBERS -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          <!-- BENTO MODULE 1 (Col 5): Monthly Cash Flow Position -->
          <div
            class="md:col-span-5 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-emerald-50/15 to-slate-50/80 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <div
              class="absolute -right-6 -bottom-6 text-[#047857] opacity-[0.035] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-44 h-44"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#047857] flex items-center justify-center shrink-0 shadow-2xs"
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Monthly Cash Flow Position
                  </h3>
                </div>
                <a
                  routerLink="/app/accounts/inward"
                  title="View Inward Receipts"
                  class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all flex items-center justify-center text-xs font-bold text-[#334155] shadow-2xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 17L17 7M17 7H7M17 7V17"
                    />
                  </svg>
                </a>
              </div>

              <!-- Frameless Position Stats -->
              <div class="py-4 space-y-4">
                <div class="flex items-baseline justify-between">
                  <span class="text-xs font-semibold text-[#64748B]">Month Total Inward</span>
                  <div class="flex items-baseline text-2xl font-bold text-[#047857] tabular-nums">
                    <dirham-symbol size="18" weight="bold" class="mr-1.5"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.month_inward) }}</span>
                  </div>
                </div>

                <div class="flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <span class="text-xs font-semibold text-[#64748B]">Month Total Outward</span>
                  <div class="flex items-baseline text-2xl font-bold text-[#DC2626] tabular-nums">
                    <dirham-symbol size="18" weight="bold" class="mr-1.5"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.month_outward) }}</span>
                  </div>
                </div>

                <div class="flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <span class="text-xs font-bold text-[#0F172A]">Month Net Cash Flow</span>
                  <div
                    class="flex items-baseline text-2xl font-bold tabular-nums"
                    [class.text-[#047857]]="!isMonthNetNegative()"
                    [class.text-[#DC2626]]="isMonthNetNegative()"
                  >
                    <dirham-symbol size="18" weight="bold" class="mr-1.5"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.month_net_movement) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <a
              routerLink="/app/accounts/inward"
              class="relative z-10 text-xs font-semibold text-[#047857] hover:underline inline-flex items-center gap-1 pt-1"
            >
              Issue New Collection Receipt →
            </a>
          </div>

          <!-- BENTO MODULE 2 (Col 4): Receivables & Payables Ledger -->
          <div
            class="md:col-span-4 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-amber-50/15 to-slate-50/80 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <div
              class="absolute -right-6 -bottom-6 text-[#D97706] opacity-[0.035] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-44 h-44"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]/60 text-[#D97706] flex items-center justify-center shrink-0 shadow-2xs"
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Outstanding Schedules
                  </h3>
                </div>
                <a
                  routerLink="/app/tenant-agreements"
                  title="View Tenant Schedules"
                  class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all flex items-center justify-center text-xs font-bold text-[#334155] shadow-2xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 17L17 7M17 7H7M17 7V17"
                    />
                  </svg>
                </a>
              </div>

              <!-- Frameless Ledger Stats -->
              <div class="py-4 space-y-4">
                <div>
                  <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider"
                    >Tenant Outstanding Receivables</span
                  >
                  <div
                    class="flex items-baseline text-2xl font-bold text-[#DC2626] tabular-nums mt-0.5"
                  >
                    <dirham-symbol size="18" weight="bold" class="mr-1.5"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.tenant_outstanding_receivable) }}</span>
                  </div>
                  <span class="text-[10px] font-medium text-[#DC2626]">Overdue & Pending Rent</span>
                </div>

                <div class="border-t border-slate-100 pt-3">
                  <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider"
                    >Owner Outstanding Payables</span
                  >
                  <div
                    class="flex items-baseline text-2xl font-bold text-[#334155] tabular-nums mt-0.5"
                  >
                    <dirham-symbol
                      size="18"
                      weight="bold"
                      class="mr-1.5 text-[#334155]"
                    ></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.owner_outstanding_payable) }}</span>
                  </div>
                  <span class="text-[10px] font-medium text-[#2563EB]">Owner Payout Queue</span>
                </div>
              </div>
            </div>

            <a
              routerLink="/app/owner-agreements"
              class="relative z-10 text-xs font-semibold text-[#D97706] hover:underline inline-flex items-center gap-1 pt-1"
            >
              View Owner Settlement Schedules →
            </a>
          </div>

          <!-- BENTO MODULE 3 (Col 3): Bank Cheques Clearance Queue -->
          <div
            class="md:col-span-3 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-blue-50/15 to-slate-50/80 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <div
              class="absolute -right-6 -bottom-6 text-[#2563EB] opacity-[0.035] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-44 h-44"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/60 text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs"
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
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Cheque Queue
                  </h3>
                </div>
                <a
                  routerLink="/app/accounts/inward"
                  title="View Inward Cheques"
                  class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all flex items-center justify-center text-xs font-bold text-[#334155] shadow-2xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 17L17 7M17 7H7M17 7V17"
                    />
                  </svg>
                </a>
              </div>

              <!-- Frameless Cheque Stats -->
              <div class="py-4 space-y-4">
                <div>
                  <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider"
                    >Inward Pending Deposit</span
                  >
                  <div
                    class="flex items-baseline text-xl font-bold text-[#D97706] tabular-nums mt-0.5"
                  >
                    <dirham-symbol size="16" weight="bold" class="mr-1"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.pending_cheque_inward) }}</span>
                  </div>
                </div>

                <div class="border-t border-slate-100 pt-3">
                  <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider"
                    >Outward Pending Clearance</span
                  >
                  <div
                    class="flex items-baseline text-xl font-bold text-[#2563EB] tabular-nums mt-0.5"
                  >
                    <dirham-symbol size="16" weight="bold" class="mr-1"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.pending_cheque_outward) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <a
              routerLink="/app/accounts/inward"
              class="relative z-10 text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 pt-1"
            >
              Process Bank Deposits →
            </a>
          </div>
        </div>

        <!-- 3. RECENT FINANCIAL TRANSACTIONS LEDGER TABLE (Tactile 3D Elevation) -->
        <div
          class="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-slate-50/70 to-slate-100/40 border border-slate-200/80 p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_36px_rgba(15,23,42,0.10)] transition-all duration-300 space-y-4 mt-2"
        >
          <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div>
              <h3 class="text-sm font-bold text-[#0F172A]">Recent Voucher Transactions</h3>
              <p class="text-xs text-[#64748B]">
                Posted inward receipts and outward payment vouchers for
                {{ activeBranch()?.name || 'this branch' }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <a
                routerLink="/app/accounts/inward"
                class="text-xs font-semibold text-[#047857] hover:underline"
              >
                + Inward Receipt
              </a>
              <span class="text-slate-300">•</span>
              <a
                routerLink="/app/accounts/outward"
                class="text-xs font-semibold text-[#DC2626] hover:underline"
              >
                + Outward Voucher
              </a>
            </div>
          </div>

          @if (snapshot()?.recent_transactions?.length) {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr
                    class="border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-[#64748B]"
                  >
                    <th class="pb-2.5 font-semibold">Document #</th>
                    <th class="pb-2.5 font-semibold">Date</th>
                    <th class="pb-2.5 font-semibold">Party Name</th>
                    <th class="pb-2.5 font-semibold">Particulars</th>
                    <th class="pb-2.5 font-semibold">Direction</th>
                    <th class="pb-2.5 font-semibold">Mode</th>
                    <th class="pb-2.5 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200/80">
                  @for (row of snapshot()?.recent_transactions || []; track row.id) {
                    <tr class="hover:bg-slate-100/60 transition">
                      <td class="py-3 font-semibold text-[#0F172A] font-mono">
                        {{ row.document_no }}
                      </td>
                      <td class="py-3 text-[#64748B]">{{ row.transaction_date }}</td>
                      <td class="py-3 font-medium text-[#0F172A] max-w-[180px] truncate">
                        {{ row.party || 'Miscellaneous' }}
                      </td>
                      <td class="py-3 text-[#64748B] max-w-[200px] truncate">
                        {{ row.particulars || '—' }}
                      </td>
                      <td class="py-3">
                        @if (row.direction === 'inward') {
                          <span
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]/60"
                          >
                            Inward
                          </span>
                        } @else {
                          <span
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]/60"
                          >
                            Outward
                          </span>
                        }
                      </td>
                      <td class="py-3 capitalize text-[#64748B]">
                        {{ row.payment_mode.replace('_', ' ') }}
                      </td>
                      <td
                        class="py-3 text-right font-bold tabular-nums"
                        [class.text-[#047857]]="row.direction === 'inward'"
                        [class.text-[#DC2626]]="row.direction === 'outward'"
                      >
                        <span class="inline-flex items-center justify-end">
                          <dirham-symbol
                            size="12"
                            weight="bold"
                            class="mr-1 text-[#64748B]"
                          ></dirham-symbol>
                          <span>{{ formatMoney(row.amount) }}</span>
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="py-8 text-center text-xs text-[#64748B]">
              No recent vouchers posted for this branch.
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AccountsDashboardComponent implements OnInit, OnDestroy {
  private api = inject(AccountsApiService);
  private branchContext = inject(BranchContextService);

  activeBranch = this.branchContext.activeBranch;
  snapshot = signal<AccountsDashboardSnapshot | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  private branchSub?: Subscription;

  ngOnInit(): void {
    this.load();
    this.branchSub = this.branchContext.branchChanged$.subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getDashboard().subscribe({
      next: (res) => {
        this.snapshot.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load accounts dashboard.');
        this.loading.set(false);
      },
    });
  }

  isNetMovementNegative(): boolean {
    const val = Number(this.snapshot()?.today_net_movement || 0);
    return val < 0;
  }

  isMonthNetNegative(): boolean {
    const val = Number(this.snapshot()?.month_net_movement || 0);
    return val < 0;
  }

  formatMoney(val: string | number | undefined | null): string {
    const num = Number(val || 0);
    return num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
