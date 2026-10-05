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
import { formatUaeDate, formatMoney } from '../../shared/utils/uae-formatters';

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
        <!-- CREATIVE BENTO HERO 3-GRID ASYMMETRIC SECTION -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 mb-6">
          <!-- Grid 1: Dark Slate Executive Net Movement Hero Card (lg:col-span-5) -->
          <div
            class="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between group transition-all duration-300"
          >
            <div
              class="absolute -right-12 -bottom-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500"
            >
              <svg class="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-2">
                  <span class="relative flex h-2.5 w-2.5">
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                    ></span>
                    <span
                      class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"
                    ></span>
                  </span>
                  <span class="text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                    Accounts Ledger Net Position
                  </span>
                </div>

                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  {{ activeBranch()?.code || 'ALL' }}
                </span>
              </div>

              <div class="mt-2">
                <span class="text-xs font-medium text-slate-400 block mb-1"
                  >Today's Net Cash Movement</span
                >
                <div
                  class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight tabular-nums flex items-baseline gap-2"
                >
                  <dirham-symbol
                    size="0.8em"
                    weight="bold"
                    class="text-emerald-400 select-none shrink-0"
                  ></dirham-symbol>
                  <span
                    [class.text-emerald-400]="isNetMovementPositive()"
                    [class.text-rose-400]="isNetMovementNegative()"
                    [class.text-slate-300]="isNetMovementZero()"
                  >
                    {{ formatMoney(snapshot()?.today_net_movement) }}
                  </span>
                </div>
              </div>
            </div>

            <div
              class="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between relative z-10 text-xs"
            >
              <span class="text-slate-400 font-medium">Flow Status:</span>
              <span
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors duration-200"
                [class.bg-emerald-500/20]="isNetMovementPositive()"
                [class.text-emerald-300]="isNetMovementPositive()"
                [class.bg-rose-500/20]="isNetMovementNegative()"
                [class.text-rose-300]="isNetMovementNegative()"
                [class.bg-slate-800]="isNetMovementZero()"
                [class.text-slate-300]="isNetMovementZero()"
              >
                {{
                  isNetMovementNegative()
                    ? '↓ Net Outflow'
                    : isNetMovementPositive()
                      ? '↑ Net Inflow'
                      : '• Balanced'
                }}
              </span>
            </div>
          </div>

          <!-- Grid 2: 2x2 Interactive Financial Metric Bento Cards (lg:col-span-4) -->
          <div class="lg:col-span-4 grid grid-cols-2 gap-3">
            <!-- Stat 1: Petty Cash -->
            <div
              class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                  >Petty Cash</span
                >
                <div
                  class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div class="my-1">
                <div class="text-[11px] text-slate-400 font-semibold">AED</div>
                <div class="text-lg font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {{ formatMoney(snapshot()?.petty_cash_balance) }}
                </div>
              </div>
              <span class="text-[10px] text-slate-500 font-medium">Ledger Balance</span>
            </div>

            <!-- Stat 2: Pending Cheques -->
            <div
              class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-amber-700 uppercase tracking-wider"
                  >Pending Cheques</span
                >
                <div
                  class="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                </div>
              </div>
              <div class="my-1">
                <div class="text-[11px] text-amber-600 font-semibold">AED</div>
                <div class="text-lg font-extrabold text-amber-600 tracking-tight tabular-nums">
                  {{ formatMoney(snapshot()?.pending_cheque_inward) }}
                </div>
              </div>
              <span class="text-[10px] text-amber-700 font-medium">Inward Clearing</span>
            </div>

            <!-- Stat 3: Today's Inward -->
            <div
              class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider"
                  >Today's Inward</span
                >
                <div
                  class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </div>
              </div>
              <div class="my-1">
                <div class="text-[11px] text-emerald-600 font-semibold">AED</div>
                <div class="text-lg font-extrabold text-emerald-600 tracking-tight tabular-nums">
                  {{ formatMoney(snapshot()?.today_inward) }}
                </div>
              </div>
              <span class="text-[10px] text-emerald-700 font-medium">Total Receipts</span>
            </div>

            <!-- Stat 4: Today's Outward -->
            <div
              class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-rose-700 uppercase tracking-wider"
                  >Today's Outward</span
                >
                <div
                  class="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 13l-5 5m0 0l-5-5m5 5V6"
                    />
                  </svg>
                </div>
              </div>
              <div class="my-1">
                <div class="text-[11px] text-rose-600 font-semibold">AED</div>
                <div class="text-lg font-extrabold text-rose-600 tracking-tight tabular-nums">
                  {{ formatMoney(snapshot()?.today_outward) }}
                </div>
              </div>
              <span class="text-[10px] text-rose-700 font-medium">Disbursements</span>
            </div>
          </div>

          <!-- Grid 3: Financial Quick Launcher (lg:col-span-3) -->
          <div
            class="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span class="text-xs font-bold text-slate-800 uppercase tracking-wider"
                  >Accounts Actions</span
                >
                <span class="text-[10px] font-mono text-slate-400">LEDGER</span>
              </div>

              <div class="space-y-2">
                <a
                  routerLink="/app/accounts/inward"
                  class="w-full p-2.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-between transition border border-emerald-200/60 shadow-2xs"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs"
                      >+</span
                    >
                    <span>Inward Receipt</span>
                  </div>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>

                <a
                  routerLink="/app/accounts/outward"
                  class="w-full p-2.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-between transition border border-rose-200/60 shadow-2xs"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="w-5 h-5 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs"
                      >+</span
                    >
                    <span>Outward Voucher</span>
                  </div>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>

                <a
                  routerLink="/app/accounts/petty-cash"
                  class="w-full p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition border border-slate-200/60"
                >
                  <span>Petty Cash Daybook</span>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium">Operating Currency</span>
              <span class="font-bold text-slate-800">AED</span>
            </div>
          </div>
        </div>

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
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-[#64748B]">Month Total Inward</span>
                  <div class="flex items-center text-2xl font-bold text-[#047857] tabular-nums">
                    <dirham-symbol size="0.95em" weight="bold" class="mr-1.5"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.month_inward) }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span class="text-xs font-semibold text-[#64748B]">Month Total Outward</span>
                  <div class="flex items-center text-2xl font-bold text-[#DC2626] tabular-nums">
                    <dirham-symbol size="0.95em" weight="bold" class="mr-1.5"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.month_outward) }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span class="text-xs font-bold text-[#0F172A]">Month Net Cash Flow</span>
                  <div
                    class="flex items-center text-2xl font-bold tabular-nums"
                    [class.text-[#047857]]="!isMonthNetNegative()"
                    [class.text-[#DC2626]]="isMonthNetNegative()"
                  >
                    <dirham-symbol size="0.95em" weight="bold" class="mr-1.5"></dirham-symbol>
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
                    class="flex items-center text-2xl font-bold text-[#DC2626] tabular-nums mt-0.5"
                  >
                    <dirham-symbol size="0.95em" weight="bold" class="mr-1.5"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.tenant_outstanding_receivable) }}</span>
                  </div>
                  <span class="text-[10px] font-medium text-[#DC2626]">Overdue & Pending Rent</span>
                </div>

                <div class="border-t border-slate-100 pt-3">
                  <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider"
                    >Owner Outstanding Payables</span
                  >
                  <div
                    class="flex items-center text-2xl font-bold text-[#334155] tabular-nums mt-0.5"
                  >
                    <dirham-symbol
                      size="0.95em"
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
                    class="flex items-center text-xl font-bold text-[#D97706] tabular-nums mt-0.5"
                  >
                    <dirham-symbol size="0.95em" weight="bold" class="mr-1"></dirham-symbol>
                    <span>{{ formatMoney(snapshot()?.pending_cheque_inward) }}</span>
                  </div>
                </div>

                <div class="border-t border-slate-100 pt-3">
                  <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider"
                    >Outward Pending Clearance</span
                  >
                  <div
                    class="flex items-center text-xl font-bold text-[#2563EB] tabular-nums mt-0.5"
                  >
                    <dirham-symbol size="0.95em" weight="bold" class="mr-1"></dirham-symbol>
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
                      <td class="py-3 text-[#64748B]">{{ formatDate(row.transaction_date) }}</td>
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
                            size="0.95em"
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
  formatDate = formatUaeDate;
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

  isNetMovementPositive(): boolean {
    const val = Number(this.snapshot()?.today_net_movement || 0);
    return val > 0;
  }

  isNetMovementZero(): boolean {
    const val = Number(this.snapshot()?.today_net_movement || 0);
    return val === 0;
  }

  isMonthNetNegative(): boolean {
    const val = Number(this.snapshot()?.month_net_movement || 0);
    return val < 0;
  }

  formatMoney = formatMoney;
}
