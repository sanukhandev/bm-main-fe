import { Component, OnInit, OnDestroy, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { DashboardApiService, DashboardMetrics } from '../../core/api/dashboard-api.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { AccountsApiService, AccountsDashboardSnapshot, RecentAccountTransaction } from '../../core/api/accounts-api.service';

@Component({
  selector: 'bm-dashboard',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterLink,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <!-- DASHBOARD CONTAINER (Neutral Slate Canvas, Max Width 1740px) -->
    <div class="max-w-[1740px] mx-auto space-y-5 font-sans text-[#0F172A]">
      
      <!-- TOP PAGE HEADER & EXECUTIVE SUMMARY STRIP -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">Executive Overview</h1>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] uppercase tracking-wider">
              {{ activeBranch()?.name || 'All Branches' }}
            </span>
          </div>
          <p class="text-xs text-[#64748B] mt-0.5">Real-time operational & financial snapshot for Baithul Madeena Real Estate ERP.</p>
        </div>

        <!-- Executive Quick Action Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <a
            routerLink="/app/customers/owners/new"
            class="h-9 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <span class="text-base leading-none font-light">+</span> Owner
          </a>
          <a
            routerLink="/app/properties/new"
            class="h-9 px-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[#334155] hover:text-[#0F172A] hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <span class="text-base leading-none font-light">+</span> Property
          </a>
          <a
            routerLink="/app/tenant-agreements/new"
            class="h-9 px-4 rounded-xl bg-[#0F172A] text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <span class="text-base leading-none font-light">+</span> New Lease Contract
          </a>
        </div>
      </div>

      <!-- EXPIRING CONTRACTS URGENT BANNER ALERT -->
      @if (metrics()?.expiring_soon_agreements && metrics()!.expiring_soon_agreements! > 0) {
        <div class="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#0F172A] flex items-center justify-between text-xs font-medium shadow-[0_4px_16px_rgba(245,158,11,0.08)]">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-[#F59E0B]/20 text-[#D97706] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span class="font-bold text-[#0F172A]">Contract Renewal Notice:</span> {{ metrics()?.expiring_soon_agreements }} tenant lease agreement(s) are expiring within the next 30 days.
            </div>
          </div>
          <a routerLink="/app/tenant-agreements" class="font-semibold text-[#047857] hover:underline flex items-center gap-1">
            Review Contracts →
          </a>
        </div>
      }

      @if (isLoading()) {
        <bm-loading-state type="kpi"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state
          title="Failed to load dashboard metrics"
          [message]="error()!"
          (retry)="loadData()"
        ></bm-error-state>
      } @else {

        <!-- 1. EDITORIAL FINANCIAL HERO CARD (~320px Height, Tactile 3D Depth) -->
        <div class="rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white relative overflow-hidden p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)] transition-all duration-300 min-h-[320px] flex flex-col justify-between"
             style="background: radial-gradient(circle at 12% 45%, rgba(16,185,129,0.05), transparent 40%), radial-gradient(circle at 88% 40%, rgba(239,68,68,0.04), transparent 40%), #FFFFFF;">
          
          <!-- Top Row Grid Structure: Left Balances | Center Hero Metric | Right Inward/Outward -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative">
            
            <!-- LEFT COLUMN (Col 3): Cash Balance & Bank/Cheque Summary -->
            <div class="lg:col-span-3 space-y-6">
              <!-- Petty Cash Balance -->
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 text-[#0F172A] flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="flex flex-col justify-center">
                  <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Petty Cash Balance</span>
                  <div class="text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums tracking-tight flex items-baseline">
                    <dirham-symbol size="18" weight="bold" class="mr-1.5 text-[#64748B] select-none"></dirham-symbol>
                    <span>{{ formatMoney(accountsSnapshot()?.petty_cash_balance) }}</span>
                  </div>
                </div>
              </div>

              <!-- Pending Cheques Inward -->
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 text-[#334155] flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <div class="flex flex-col justify-center">
                  <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Pending Cheques (In)</span>
                  <div class="text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums tracking-tight flex items-baseline">
                    <dirham-symbol size="18" weight="bold" class="mr-1.5 text-[#64748B] select-none"></dirham-symbol>
                    <span>{{ formatMoney(accountsSnapshot()?.pending_cheque_inward) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CENTER COLUMN (Col 6): Editorial Hero Net Cash Movement Metric -->
            <div class="lg:col-span-6 flex items-center justify-center py-2">
              <div class="flex items-center gap-4 sm:gap-5">
                <!-- Big Center Icon matching height of Net Movement text + number block -->
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs border"
                     [class.bg-[#ECFDF5]]="!isNetMovementNegative()"
                     [class.border-[#A7F3D0]]="!isNetMovementNegative()"
                     [class.text-[#047857]]="!isNetMovementNegative()"
                     [class.bg-[#FEF2F2]]="isNetMovementNegative()"
                     [class.border-[#FECACA]]="isNetMovementNegative()"
                     [class.text-[#DC2626]]="isNetMovementNegative()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>

                <div class="flex flex-col items-start text-left">
                  <!-- Subtext Label ABOVE the number -->
                  <span class="text-xs font-bold text-[#64748B] uppercase tracking-widest">
                    Today's Net Cash Movement
                  </span>

                  <!-- Large Newsreader Serif Hero Number (Green if >= 0, Red if < 0) -->
                  <div class="flex items-baseline gap-2 my-0.5"
                       [class.text-[#047857]]="!isNetMovementNegative()"
                       [class.text-[#DC2626]]="isNetMovementNegative()">
                    <dirham-symbol size="28" weight="semibold" class="select-none inline-block align-middle"></dirham-symbol>
                    <span class="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight tabular-nums">
                      {{ formatMoney(accountsSnapshot()?.today_net_movement) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3 text-xs text-[#64748B]">
                    <span class="font-medium">Scope: {{ activeBranch()?.name || 'All Branches' }}</span>
                    <span>•</span>
                    <span class="inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-md border border-[#E2E8F0] bg-slate-50"
                          [class.text-[#047857]]="!isNetMovementNegative()"
                          [class.text-[#DC2626]]="isNetMovementNegative()">
                      <span>{{ isNetMovementNegative() ? '- Net Outflow' : '+ Net Inflow' }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN (Col 3): Inward & Outward Summary (Big Icons, Green Inward / Red Outward) -->
            <div class="lg:col-span-3 space-y-6">
              <!-- Today's Inward -->
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#047857] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <div class="flex flex-col justify-center">
                  <span class="text-xs font-semibold uppercase tracking-wider text-[#047857]">Today's Inward</span>
                  <div class="text-2xl sm:text-3xl font-bold text-[#047857] tabular-nums tracking-tight flex items-baseline">
                    <dirham-symbol size="20" weight="bold" class="mr-1.5 select-none text-[#047857]/80"></dirham-symbol>
                    <span>{{ formatMoney(accountsSnapshot()?.today_inward) }}</span>
                  </div>
                </div>
              </div>

              <!-- Today's Outward -->
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FEF2F2] border border-[#FECACA]/60 text-[#DC2626] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <div class="flex flex-col justify-center">
                  <span class="text-xs font-semibold uppercase tracking-wider text-[#DC2626]">Today's Outward</span>
                  <div class="text-2xl sm:text-3xl font-bold text-[#DC2626] tabular-nums tracking-tight flex items-baseline">
                    <dirham-symbol size="20" weight="bold" class="mr-1.5 select-none text-[#DC2626]/80"></dirham-symbol>
                    <span>{{ formatMoney(accountsSnapshot()?.today_outward) }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Decorative Element: Vector SVG Dubai Skyline Silhouette -->
          <div class="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0">
            <svg class="w-full h-[100px] text-slate-800 opacity-[0.04] select-none" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
              <path d="M0,120 L0,110 L20,110 L20,95 L35,95 L35,110 L50,110 L50,80 L70,80 L70,60 L80,60 L80,45 L85,45 L85,60 L95,60 L95,80 L110,80 L110,110 L130,110 L130,100 L150,100 L150,110 L180,110 L180,75 L195,75 L195,65 L210,65 L210,75 L225,75 L225,110 L260,110 L260,90 L280,90 L280,110 L310,110 L310,50 L320,50 L320,30 L330,30 L330,20 L333,20 L333,5 L337,5 L337,20 L340,20 L340,30 L350,30 L350,50 L360,50 L360,110 L400,110 L400,85 L420,85 L420,110 L460,110 L460,70 L480,70 L480,110 L520,110 L520,60 L535,60 L535,40 L545,40 L545,60 L560,60 L560,110 L600,110 L600,95 L620,95 L620,110 L660,110 L660,55 L675,55 L675,35 L685,35 L685,55 L700,55 L700,110 L750,110 L750,80 L770,80 L770,110 L810,110 L810,65 L825,65 L825,45 L835,45 L835,25 L838,25 L838,0 L842,0 L842,25 L845,25 L845,45 L855,45 L855,65 L870,65 L870,110 L910,110 L910,90 L930,90 L930,110 L970,110 L970,75 L990,75 L990,110 L1030,110 L1030,85 L1050,85 L1050,110 L1100,110 L1100,95 L1120,95 L1120,110 L1200,110 L1200,120 Z"/>
            </svg>
          </div>

        </div>

        <!-- 4PX DARK INK HERO DIVIDER LINE -->
        <div class="h-[4px] bg-[#0F172A] rounded-full w-full my-4 opacity-90"></div>

        <!-- 2. HUMANIZED ASYMMETRIC BENTO GRID WITH 3D DEPTH & BACKGROUND WATERMARKS -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          
          <!-- BENTO MODULE 1 (Col 5): Accounts & Receivables Snapshot (Taller Module, Subtle Emerald Gradient) -->
          <div class="md:col-span-5 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-emerald-50/15 to-slate-50/80 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <!-- Background Opaque Watermark SVG Icon -->
            <div class="absolute -right-6 -bottom-6 text-[#047857] opacity-[0.035] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-44 h-44" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#047857] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Money Movement Position</h3>
                </div>
                <a routerLink="/app/accounts/dashboard" title="View Financial Ledger" class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all flex items-center justify-center text-xs font-bold text-[#334155] shadow-2xs">
                  ↗
                </a>
              </div>

              <!-- Frameless Position Stats with Highlighted Numbers -->
              <div class="py-4 space-y-4">
                <div class="flex items-baseline justify-between">
                  <span class="text-xs font-semibold text-[#64748B]">Tenant Receivables</span>
                  <div class="flex items-baseline text-2xl font-bold text-[#DC2626] tabular-nums">
                    <dirham-symbol size="18" weight="bold" class="mr-1.5"></dirham-symbol>
                    <span>{{ formatMoney(accountsSnapshot()?.tenant_outstanding_receivable) }}</span>
                  </div>
                </div>

                <div class="flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <span class="text-xs font-semibold text-[#64748B]">Owner Payables</span>
                  <div class="flex items-baseline text-2xl font-bold text-[#334155] tabular-nums">
                    <dirham-symbol size="18" weight="bold" class="mr-1.5 text-[#334155]"></dirham-symbol>
                    <span>{{ formatMoney(accountsSnapshot()?.owner_outstanding_payable) }}</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span class="text-[10px] text-[#047857] font-bold uppercase tracking-wider">Month Inward</span>
                    <div class="flex items-baseline text-xl font-bold text-[#047857] tabular-nums mt-0.5">
                      <dirham-symbol size="16" weight="bold" class="mr-1"></dirham-symbol>
                      <span>{{ formatMoney(accountsSnapshot()?.month_inward) }}</span>
                    </div>
                  </div>
                  <div>
                    <span class="text-[10px] text-[#DC2626] font-bold uppercase tracking-wider">Month Outward</span>
                    <div class="flex items-baseline text-xl font-bold text-[#DC2626] tabular-nums mt-0.5">
                      <dirham-symbol size="16" weight="bold" class="mr-1"></dirham-symbol>
                      <span>{{ formatMoney(accountsSnapshot()?.month_outward) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a routerLink="/app/accounts/dashboard" class="relative z-10 text-xs font-semibold text-[#047857] hover:underline inline-flex items-center gap-1 pt-1">
              Open Complete Ledger & Accounts Dashboard →
            </a>
          </div>

          <!-- BENTO MODULE 2 (Col 4): Lease Agreements Overview (Subtle Amber Gradient) -->
          <div class="md:col-span-4 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-amber-50/15 to-slate-50/80 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <!-- Background Opaque Watermark SVG Icon -->
            <div class="absolute -right-6 -bottom-6 text-[#D97706] opacity-[0.035] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-44 h-44" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]/60 text-[#D97706] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Agreements Overview</h3>
                </div>
                <a routerLink="/app/tenant-agreements" title="View Tenant Leases" class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all flex items-center justify-center text-xs font-bold text-[#334155] shadow-2xs">
                  ↗
                </a>
              </div>

              <!-- Frameless Agreements Stats with Highlighted Numbers -->
              <div class="py-4 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Tenant Leases</span>
                    <div class="text-3xl font-bold text-[#047857] tabular-nums mt-0.5">
                      {{ metrics()?.total_tenant_agreements || 0 }}
                    </div>
                    <span class="text-[10px] font-medium text-[#047857]">Active Contracts</span>
                  </div>

                  <div>
                    <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Owner Contracts</span>
                    <div class="text-3xl font-bold text-[#2563EB] tabular-nums mt-0.5">
                      {{ metrics()?.total_owner_agreements || 0 }}
                    </div>
                    <span class="text-[10px] font-medium text-[#2563EB]">Management</span>
                  </div>
                </div>

                <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></span>
                    <span class="text-xs font-semibold text-[#334155]">Expiring Soon (30 days)</span>
                  </div>
                  <span class="text-2xl font-bold text-[#D97706] tabular-nums">
                    {{ metrics()?.expiring_soon_agreements || 0 }}
                  </span>
                </div>
              </div>
            </div>

            <a routerLink="/app/tenant-agreements" class="relative z-10 text-xs font-semibold text-[#D97706] hover:underline inline-flex items-center gap-1 pt-1">
              Manage Tenant Lease Contracts →
            </a>
          </div>

          <!-- BENTO MODULE 3 (Col 3): Portfolio & Occupancy (Subtle Blue Gradient) -->
          <div class="md:col-span-3 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-blue-50/15 to-slate-50/80 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <!-- Background Opaque Watermark SVG Icon -->
            <div class="absolute -right-6 -bottom-6 text-[#2563EB] opacity-[0.035] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-44 h-44" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/60 text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Portfolio</h3>
                </div>
                <a routerLink="/app/properties" title="View Property Directory" class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all flex items-center justify-center text-xs font-bold text-[#334155] shadow-2xs">
                  ↗
                </a>
              </div>

              <!-- Frameless Portfolio Stats with Highlighted Numbers -->
              <div class="py-4 space-y-4">
                <div>
                  <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total Managed Units</span>
                  <div class="text-3xl font-bold text-[#0F172A] tabular-nums mt-0.5">
                    {{ metrics()?.total_properties || 0 }}
                  </div>
                </div>

                <div class="space-y-1 text-xs border-t border-slate-100 pt-3">
                  <div class="flex justify-between items-center text-[11px] text-[#64748B]">
                    <span>Occupancy Rate</span>
                    <span class="font-bold text-[#047857] text-sm">92%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div class="h-full bg-[#047857] rounded-full" style="width: 92%"></div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span class="text-[10px] text-[#64748B] font-semibold uppercase">Owners</span>
                    <div class="text-xl font-bold text-[#2563EB] tabular-nums mt-0.5">{{ metrics()?.total_owners || 0 }}</div>
                  </div>
                  <div>
                    <span class="text-[10px] text-[#64748B] font-semibold uppercase">Tenants</span>
                    <div class="text-xl font-bold text-[#047857] tabular-nums mt-0.5">{{ metrics()?.total_tenants || 0 }}</div>
                  </div>
                </div>
              </div>
            </div>

            <a routerLink="/app/properties" class="relative z-10 text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 pt-1">
              Property Directory →
            </a>
          </div>

          <!-- BENTO MODULE 4 (Col 4): Maintenance & Work Orders (Subtle Rose Gradient) -->
          <div class="md:col-span-4 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-rose-50/15 to-slate-50/80 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <!-- Background Opaque Watermark SVG Icon -->
            <div class="absolute -right-6 -bottom-6 text-[#DC2626] opacity-[0.035] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-44 h-44" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-xl bg-[#FEF2F2] border border-[#FECACA]/60 text-[#DC2626] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Maintenance</h3>
                </div>
                <a routerLink="/app/maintenance/work-orders" title="View Work Orders" class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all flex items-center justify-center text-xs font-bold text-[#334155] shadow-2xs">
                  ↗
                </a>
              </div>

              <!-- Frameless Maintenance Stats with Highlighted Numbers -->
              <div class="py-4 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-xs font-semibold text-[#0F172A]">Active Work Orders</span>
                    <div class="text-[10px] text-[#64748B]">Pending dispatch & repairs</div>
                  </div>
                  <span class="text-3xl font-bold text-[#DC2626] tabular-nums">
                    4
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 text-xs">
                  <a routerLink="/app/maintenance/vendors" class="hover:underline">
                    <span class="text-[10px] text-[#64748B] font-semibold uppercase">Vendors</span>
                    <div class="font-bold text-[#0F172A] text-base mt-0.5">Approved →</div>
                  </a>
                  <a routerLink="/app/maintenance/inventory" class="hover:underline">
                    <span class="text-[10px] text-[#64748B] font-semibold uppercase">Inventory</span>
                    <div class="font-bold text-[#0F172A] text-base mt-0.5">Stock Items →</div>
                  </a>
                </div>
              </div>
            </div>

            <a routerLink="/app/maintenance/work-orders" class="relative z-10 text-xs font-semibold text-[#DC2626] hover:underline inline-flex items-center gap-1 pt-1">
              Dispatch Work Orders →
            </a>
          </div>

          <!-- BENTO MODULE 5 (Col 4): Collection Progress Bar (Subtle Mint Gradient) -->
          <div class="md:col-span-4 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-emerald-50/15 to-slate-50/80 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <!-- Background Opaque Watermark SVG Icon -->
            <div class="absolute -right-6 -bottom-6 text-[#047857] opacity-[0.035] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-44 h-44" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[#047857] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Rent Collection Status</h3>
                </div>
                <a routerLink="/app/accounts/inward" title="View Inward Receipts" class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-[#0F172A] group-hover:text-white transition-all flex items-center justify-center text-xs font-bold text-[#334155] shadow-2xs">
                  ↗
                </a>
              </div>

              <!-- Frameless Collection Progress Stats with Highlighted Numbers -->
              <div class="py-4 space-y-3">
                <div class="flex justify-between items-baseline text-xs">
                  <span class="text-[#64748B] font-semibold">Monthly Collection Target</span>
                  <span class="font-bold text-[#047857] text-xl tabular-nums">78%</span>
                </div>

                <!-- Segmented Collection Bar -->
                <div class="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden flex">
                  <div class="h-full bg-[#047857] transition-all" style="width: 65%" title="Collected"></div>
                  <div class="h-full bg-[#F59E0B] transition-all" style="width: 13%" title="Pending Cheques"></div>
                  <div class="h-full bg-[#DC2626]/40 transition-all" style="width: 22%" title="Outstanding"></div>
                </div>

                <div class="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                  <div>
                    <div class="text-lg font-bold text-[#047857]">65%</div>
                    <div class="text-[10px] text-[#047857]/80 font-semibold uppercase">Collected</div>
                  </div>
                  <div>
                    <div class="text-lg font-bold text-[#D97706]">13%</div>
                    <div class="text-[10px] text-[#D97706]/80 font-semibold uppercase">Cheques</div>
                  </div>
                  <div>
                    <div class="text-lg font-bold text-[#DC2626]">22%</div>
                    <div class="text-[10px] text-[#DC2626]/80 font-semibold uppercase">Due</div>
                  </div>
                </div>
              </div>
            </div>

            <a routerLink="/app/accounts/inward" class="relative z-10 text-xs font-semibold text-[#047857] hover:underline inline-flex items-center gap-1 pt-1">
              Issue Rent Inward Receipt →
            </a>
          </div>

          <!-- BENTO MODULE 6 (Col 4): Operations Quick Action Hub (Subtle Slate Gradient) -->
          <div class="md:col-span-4 h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-slate-50/90 to-slate-100/60 border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <!-- Background Opaque Watermark SVG Icon -->
            <div class="absolute -right-6 -bottom-6 text-slate-800 opacity-[0.035] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-44 h-44" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Operations Hub</h3>
                </div>
                <span class="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">ERP Workflows</span>
              </div>

              <!-- Frameless Quick Actions Grid -->
              <div class="py-3 grid grid-cols-2 gap-2.5">
                <a
                  routerLink="/app/customers/owners/new"
                  class="flex items-center justify-between text-xs font-semibold text-[#0F172A] hover:text-[#047857] transition group/btn py-1"
                >
                  <span>+ Owner</span>
                  <span class="text-[#64748B] group-hover/btn:translate-x-1 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/customers/tenants/new"
                  class="flex items-center justify-between text-xs font-semibold text-[#0F172A] hover:text-[#047857] transition group/btn py-1"
                >
                  <span>+ Tenant</span>
                  <span class="text-[#64748B] group-hover/btn:translate-x-1 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/properties/new"
                  class="flex items-center justify-between text-xs font-semibold text-[#0F172A] hover:text-[#2563EB] transition group/btn py-1"
                >
                  <span>+ Property</span>
                  <span class="text-[#64748B] group-hover/btn:translate-x-1 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/tenant-agreements/new"
                  class="flex items-center justify-between text-xs font-semibold text-[#0F172A] hover:text-[#D97706] transition group/btn py-1"
                >
                  <span>+ Lease</span>
                  <span class="text-[#64748B] group-hover/btn:translate-x-1 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/accounts/inward"
                  class="flex items-center justify-between text-xs font-semibold text-[#047857] hover:underline transition group/btn py-1"
                >
                  <span>+ Inward</span>
                  <span class="text-[#047857] group-hover/btn:translate-x-1 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/accounts/outward"
                  class="flex items-center justify-between text-xs font-semibold text-[#DC2626] hover:underline transition group/btn py-1"
                >
                  <span>+ Voucher</span>
                  <span class="text-[#DC2626] group-hover/btn:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>

            <div class="relative z-10 text-[10px] text-[#64748B] font-medium pt-1">
              Permission-controlled real estate & ERP actions
            </div>
          </div>

        </div>

        <!-- 3. LOWER INFORMATION GRID (65% / 35% Split with Tactile 3D Depth) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pt-1">
          
          <!-- LEFT COLUMN (65% -> Col 8): Recent Transactions Table -->
          <div class="lg:col-span-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-slate-50/70 to-slate-100/40 border border-slate-200/80 p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_36px_rgba(15,23,42,0.10)] transition-all duration-300 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div>
                <h3 class="text-sm font-bold text-[#0F172A]">Recent Financial Transactions</h3>
                <p class="text-xs text-[#64748B]">Latest 5 inward & outward vouchers processed</p>
              </div>
              <a routerLink="/app/accounts/dashboard" class="text-xs font-semibold text-[#047857] hover:underline flex items-center gap-1">
                Full Financial Ledger →
              </a>
            </div>

            @if (accountsSnapshot()?.recent_transactions?.length) {
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      <th class="pb-2.5 font-semibold">Doc #</th>
                      <th class="pb-2.5 font-semibold">Date</th>
                      <th class="pb-2.5 font-semibold">Party</th>
                      <th class="pb-2.5 font-semibold">Mode</th>
                      <th class="pb-2.5 font-semibold">Direction</th>
                      <th class="pb-2.5 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200/80">
                    @for (tx of accountsSnapshot()!.recent_transactions.slice(0, 5); track tx.id) {
                      <tr class="hover:bg-slate-100/60 transition">
                        <td class="py-3 font-semibold text-[#0F172A] font-mono">{{ tx.document_no }}</td>
                        <td class="py-3 text-[#64748B]">{{ tx.transaction_date }}</td>
                        <td class="py-3 font-medium text-[#0F172A] max-w-[150px] truncate">{{ tx.party || tx.particulars || '—' }}</td>
                        <td class="py-3 capitalize text-[#64748B]">{{ tx.payment_mode.replace('_', ' ') }}</td>
                        <td class="py-3">
                          @if (tx.direction === 'inward') {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]/60">
                              Inward
                            </span>
                          } @else {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]/60">
                              Outward
                            </span>
                          }
                        </td>
                        <td class="py-3 text-right font-bold tabular-nums" [class.text-[#047857]]="tx.direction === 'inward'" [class.text-[#DC2626]]="tx.direction === 'outward'">
                          <span class="inline-flex items-center justify-end">
                            <dirham-symbol size="12" weight="bold" class="mr-1 text-[#64748B]"></dirham-symbol>
                            <span>{{ formatMoney(tx.amount) }}</span>
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="py-8 text-center text-xs text-[#64748B]">No recent transactions logged for this branch.</div>
            }
          </div>

          <!-- RIGHT COLUMN (35% -> Col 4): Latest System Notifications Stack -->
          <div class="lg:col-span-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-slate-50/70 to-slate-100/40 border border-slate-200/80 p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_36px_rgba(15,23,42,0.10)] transition-all duration-300 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div>
                <h3 class="text-sm font-bold text-[#0F172A]">System Alerts & Feed</h3>
                <p class="text-xs text-[#64748B]">Important operational reminders</p>
              </div>
              <span class="w-2.5 h-2.5 rounded-full bg-[#047857]"></span>
            </div>

            <div class="space-y-3">
              <!-- Alert Item 1: Lease Expiring -->
              @if (metrics()?.expiring_soon_agreements && metrics()!.expiring_soon_agreements! > 0) {
                <div class="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3 text-xs shadow-2xs">
                  <div class="w-6 h-6 rounded-lg bg-[#D97706] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    !
                  </div>
                  <div>
                    <div class="font-bold text-[#0F172A]">Lease Renewal Needed</div>
                    <div class="text-[11px] text-[#334155] mt-0.5">
                      {{ metrics()?.expiring_soon_agreements }} tenant agreement(s) are approaching expiry date within 30 days.
                    </div>
                  </div>
                </div>
              }

              <!-- Alert Item 2: Pending Cheque Deposit -->
              <div class="p-3 rounded-xl bg-white/90 border border-slate-200/80 flex items-start gap-3 text-xs shadow-2xs">
                <div class="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <div>
                  <div class="font-bold text-[#0F172A]">Pending Cheque Clearance</div>
                  <div class="text-[11px] text-[#64748B] mt-0.5">
                    Cheques totaling <dirham-symbol size="12" weight="bold" class="mx-0.5 inline-block align-middle"></dirham-symbol>{{ formatMoney(accountsSnapshot()?.pending_cheque_inward) }} awaiting bank deposit verification.
                  </div>
                </div>
              </div>

              <!-- Alert Item 3: Petty Cash Audit -->
              <div class="p-3 rounded-xl bg-white/90 border border-slate-200/80 flex items-start gap-3 text-xs shadow-2xs">
                <div class="w-6 h-6 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div class="font-bold text-[#0F172A]">Daily Petty Cash Balance</div>
                  <div class="text-[11px] text-[#64748B] mt-0.5">
                    Closing petty cash stands at <dirham-symbol size="12" weight="bold" class="mx-0.5 inline-block align-middle"></dirham-symbol>{{ formatMoney(accountsSnapshot()?.petty_cash_balance) }}.
                  </div>
                </div>
              </div>

              <!-- Alert Item 4: Zaakiy AI Assistant Tip -->
              <div class="p-3 rounded-xl bg-[#ECFDF5]/90 border border-[#A7F3D0]/80 flex items-start gap-3 text-xs shadow-2xs">
                <div class="w-6 h-6 rounded-lg bg-[#047857] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div class="font-bold text-[#047857]">Zaakiy Insights</div>
                  <div class="text-[11px] text-[#047857]/80 mt-0.5">
                    Collection efficiency is up 8.2% compared to last month across {{ activeBranch()?.name || 'this branch' }}.
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      }

    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardApi = inject(DashboardApiService);
  private accountsApi = inject(AccountsApiService);
  private branchContext = inject(BranchContextService);

  activeBranch = this.branchContext.activeBranch;
  metrics = signal<DashboardMetrics | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  accountsSnapshot = signal<AccountsDashboardSnapshot | null>(null);
  isAccountsLoading = signal(true);
  accountsError = signal<string | null>(null);

  private branchSub?: Subscription;

  ngOnInit(): void {
    this.loadData();
    this.loadAccounts();

    this.branchSub = this.branchContext.branchChanged$.subscribe(() => {
      this.metrics.set(null);
      this.accountsSnapshot.set(null);
      this.loadData();
      this.loadAccounts();
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardApi.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Unable to load dashboard metrics.');
        this.isLoading.set(false);
      },
    });
  }

  loadAccounts(): void {
    this.isAccountsLoading.set(true);
    this.accountsError.set(null);

    this.accountsApi.getDashboard().subscribe({
      next: (res) => {
        this.accountsSnapshot.set(res.data);
        this.isAccountsLoading.set(false);
      },
      error: (err) => {
        this.accountsError.set(err.message || 'Unable to load accounts snapshot.');
        this.isAccountsLoading.set(false);
        this.accountsSnapshot.set(null);
      },
    });
  }

  isNetMovementNegative(): boolean {
    const val = Number(this.accountsSnapshot()?.today_net_movement || 0);
    return val < 0;
  }

  formatMoney(val: string | number | undefined | null): string {
    const num = Number(val || 0);
    return num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }
}
