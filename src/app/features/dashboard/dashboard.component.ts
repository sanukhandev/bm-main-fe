import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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
  imports: [
    CommonModule,
    RouterLink,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <!-- DASHBOARD CONTAINER (Warm Off-White Canvas, Max Width 1740px) -->
    <div class="max-w-[1740px] mx-auto space-y-4 font-sans text-[#171816]">
      
      <!-- TOP PAGE HEADER & EXECUTIVE SUMMARY STRIP -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#171816]">Executive Overview</h1>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5F1EA] text-[#285746] border border-[#A9D5BF]/30 uppercase tracking-wider">
              {{ activeBranch()?.name || 'All Branches' }}
            </span>
          </div>
          <p class="text-xs text-[#777972] mt-0.5">Real-time operational & financial snapshot for Baithul Madeena Real Estate ERP.</p>
        </div>

        <!-- Executive Quick Action Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <a
            routerLink="/app/customers/owners/new"
            class="h-9 px-3.5 rounded-xl bg-white border border-[#E6E3DD] text-[#393A36] hover:text-[#171816] hover:bg-[#FAFAF7] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <span class="text-base leading-none font-light">+</span> Owner
          </a>
          <a
            routerLink="/app/properties/new"
            class="h-9 px-3.5 rounded-xl bg-white border border-[#E6E3DD] text-[#393A36] hover:text-[#171816] hover:bg-[#FAFAF7] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <span class="text-base leading-none font-light">+</span> Property
          </a>
          <a
            routerLink="/app/tenant-agreements/new"
            class="h-9 px-4 rounded-xl bg-[#171816] text-[#FAFAF7] hover:bg-[#285746] text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <span class="text-base leading-none font-light">+</span> New Lease Contract
          </a>
        </div>
      </div>

      <!-- EXPIRING CONTRACTS URGENT BANNER ALERT -->
      @if (metrics()?.expiring_soon_agreements && metrics()!.expiring_soon_agreements! > 0) {
        <div class="p-3.5 rounded-2xl bg-[#F5ECCE] border border-[#E7CF8B] text-[#171816] flex items-center justify-between text-xs font-medium shadow-2xs">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-[#A77A35]/20 text-[#A77A35] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span class="font-bold text-[#171816]">Contract Renewal Notice:</span> {{ metrics()?.expiring_soon_agreements }} tenant lease agreement(s) are expiring within the next 30 days.
            </div>
          </div>
          <a routerLink="/app/tenant-agreements" class="font-semibold text-[#285746] hover:underline flex items-center gap-1">
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

        <!-- 1. EDITORIAL FINANCIAL HERO CARD (~320px Height) -->
        <div class="rounded-2xl border border-[#E6E3DD] bg-[#FAFAF7] relative overflow-hidden p-6 sm:p-8 shadow-2xs min-h-[320px] flex flex-col justify-between"
             style="background: radial-gradient(circle at 12% 45%, rgba(169,213,191,0.22), transparent 38%), radial-gradient(circle at 88% 40%, rgba(223,167,180,0.14), transparent 35%), #FAFAF7;">
          
          <!-- Top Row: Left Balances | Center Hero Metric | Right Receipts -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10 relative">
            
            <!-- LEFT COLUMN (Col 3): Cash Balance & Bank/Cheque Summary -->
            <div class="lg:col-span-3 space-y-4">
              <div class="p-3.5 rounded-xl bg-white/80 border border-[#E6E3DD] backdrop-blur-xs shadow-2xs">
                <div class="flex items-center gap-2 text-[10px] font-semibold text-[#777972] uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-[#285746]"></span>
                  Petty Cash Balance
                </div>
                <div class="text-xl font-bold text-[#171816] tabular-nums mt-1">
                  <span class="text-xs text-[#777972] font-normal mr-1">د.إ</span>
                  {{ formatMoney(accountsSnapshot()?.petty_cash_balance) }}
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-white/80 border border-[#E6E3DD] backdrop-blur-xs shadow-2xs">
                <div class="flex items-center gap-2 text-[10px] font-semibold text-[#777972] uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-[#567C83]"></span>
                  Pending Cheques (In)
                </div>
                <div class="text-xl font-bold text-[#171816] tabular-nums mt-1">
                  <span class="text-xs text-[#777972] font-normal mr-1">د.إ</span>
                  {{ formatMoney(accountsSnapshot()?.pending_cheque_inward) }}
                </div>
              </div>
            </div>

            <!-- CENTER COLUMN (Col 6): Editorial Hero Metric -->
            <div class="lg:col-span-6 text-center space-y-2 py-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5F1EA] text-[#285746] border border-[#A9D5BF]/40 text-[11px] font-semibold tracking-wider uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Today's Net Cash Movement</span>
              </div>

              <!-- Newsreader Serif Hero Number with Dirham Symbol -->
              <div class="flex items-baseline justify-center gap-2 my-2">
                <span class="text-xl sm:text-2xl font-serif text-[#777972] font-light select-none">د.إ</span>
                <span class="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#171816] tracking-tight tabular-nums">
                  {{ formatMoney(accountsSnapshot()?.today_net_movement) }}
                </span>
              </div>

              <div class="flex items-center justify-center gap-3 text-xs text-[#777972]">
                <span class="font-medium">Scope: {{ activeBranch()?.name || 'All Branches' }}</span>
                <span>•</span>
                <span class="inline-flex items-center gap-1 text-[#285746] font-semibold bg-white/70 px-2.5 py-0.5 rounded-md border border-[#E6E3DD]">
                  <span>+12.5%</span> vs yesterday
                </span>
              </div>
            </div>

            <!-- RIGHT COLUMN (Col 3): Inward & Outward Receipts Cards -->
            <div class="lg:col-span-3 space-y-3">
              <div class="p-3.5 rounded-xl bg-[#E5F1EA] border border-[#A9D5BF]/40 shadow-2xs">
                <div class="flex items-center justify-between text-[11px] font-semibold text-[#285746] uppercase tracking-wider">
                  <span>Today's Inward</span>
                  <span class="w-5 h-5 rounded-full bg-[#285746] text-white flex items-center justify-center text-[10px]">↑</span>
                </div>
                <div class="text-xl font-bold text-[#285746] tabular-nums mt-1">
                  <span class="text-xs text-[#285746]/70 font-normal mr-1">د.إ</span>
                  {{ formatMoney(accountsSnapshot()?.today_inward) }}
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-[#F3E3E7] border border-[#DFA7B4]/40 shadow-2xs">
                <div class="flex items-center justify-between text-[11px] font-semibold text-[#B98D91] uppercase tracking-wider">
                  <span>Today's Outward</span>
                  <span class="w-5 h-5 rounded-full bg-[#B98D91] text-white flex items-center justify-center text-[10px]">↓</span>
                </div>
                <div class="text-xl font-bold text-[#B98D91] tabular-nums mt-1">
                  <span class="text-xs text-[#B98D91]/70 font-normal mr-1">د.إ</span>
                  {{ formatMoney(accountsSnapshot()?.today_outward) }}
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Decorative Element: Vector SVG Dubai Skyline Silhouette -->
          <div class="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0">
            <svg class="w-full h-[100px] text-[#285746] opacity-[0.10] select-none" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
              <path d="M0,120 L0,110 L20,110 L20,95 L35,95 L35,110 L50,110 L50,80 L70,80 L70,60 L80,60 L80,45 L85,45 L85,60 L95,60 L95,80 L110,80 L110,110 L130,110 L130,100 L150,100 L150,110 L180,110 L180,75 L195,75 L195,65 L210,65 L210,75 L225,75 L225,110 L260,110 L260,90 L280,90 L280,110 L310,110 L310,50 L320,50 L320,30 L330,30 L330,20 L333,20 L333,5 L337,5 L337,20 L340,20 L340,30 L350,30 L350,50 L360,50 L360,110 L400,110 L400,85 L420,85 L420,110 L460,110 L460,70 L480,70 L480,110 L520,110 L520,60 L535,60 L535,40 L545,40 L545,60 L560,60 L560,110 L600,110 L600,95 L620,95 L620,110 L660,110 L660,55 L675,55 L675,35 L685,35 L685,55 L700,55 L700,110 L750,110 L750,80 L770,80 L770,110 L810,110 L810,65 L825,65 L825,45 L835,45 L835,25 L838,25 L838,0 L842,0 L842,25 L845,25 L845,45 L855,45 L855,65 L870,65 L870,110 L910,110 L910,90 L930,90 L930,110 L970,110 L970,75 L990,75 L990,110 L1030,110 L1030,85 L1050,85 L1050,110 L1100,110 L1100,95 L1120,95 L1120,110 L1200,110 L1200,120 Z"/>
            </svg>
          </div>

        </div>

        <!-- 5PX DARK INK HERO DIVIDER LINE -->
        <div class="h-[5px] bg-[#171816] rounded-full w-full my-4"></div>

        <!-- 2. ASYMMETRIC 12-COLUMN BENTO GRID (10-12px Gaps) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5">
          
          <!-- BENTO MODULE 1 (Col 5): Accounts & Receivables Snapshot -->
          <div class="md:col-span-5 rounded-2xl bg-[#FAFAF7] border border-[#E6E3DD] p-5 flex flex-col justify-between shadow-2xs hover:border-[#171816]/30 transition group">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-[#E6E3DD]">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-[#E5F1EA] text-[#285746] flex items-center justify-center text-xs font-bold">
                    $
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#171816]">Money Movement Position</h3>
                </div>
                <a routerLink="/app/accounts/dashboard" title="View Financial Ledger" class="w-7 h-7 rounded-full bg-black/5 group-hover:bg-[#171816] group-hover:text-white transition flex items-center justify-center text-xs font-bold">
                  ↗
                </a>
              </div>

              <div class="py-4 space-y-3">
                <div class="p-3 rounded-xl bg-white border border-[#E6E3DD] flex items-center justify-between text-xs">
                  <span class="text-[#777972] font-medium">Tenant Receivables</span>
                  <span class="font-bold text-[#B98D91] tabular-nums text-sm">
                    د.إ {{ formatMoney(accountsSnapshot()?.tenant_outstanding_receivable) }}
                  </span>
                </div>

                <div class="p-3 rounded-xl bg-white border border-[#E6E3DD] flex items-center justify-between text-xs">
                  <span class="text-[#777972] font-medium">Owner Payables</span>
                  <span class="font-bold text-[#393A36] tabular-nums text-sm">
                    د.إ {{ formatMoney(accountsSnapshot()?.owner_outstanding_payable) }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div class="p-2.5 rounded-lg bg-[#E5F1EA]/60 border border-[#A9D5BF]/30">
                    <div class="text-[10px] text-[#285746] uppercase font-bold">Month Inward</div>
                    <div class="font-bold text-[#285746] tabular-nums text-sm mt-0.5">
                      د.إ {{ formatMoney(accountsSnapshot()?.month_inward) }}
                    </div>
                  </div>
                  <div class="p-2.5 rounded-lg bg-[#F3E3E7]/60 border border-[#DFA7B4]/30">
                    <div class="text-[10px] text-[#B98D91] uppercase font-bold">Month Outward</div>
                    <div class="font-bold text-[#B98D91] tabular-nums text-sm mt-0.5">
                      د.إ {{ formatMoney(accountsSnapshot()?.month_outward) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a routerLink="/app/accounts/dashboard" class="text-xs font-semibold text-[#285746] hover:underline inline-flex items-center gap-1 pt-1">
              Open Complete Ledger & Accounts Dashboard →
            </a>
          </div>

          <!-- BENTO MODULE 2 (Col 4): Lease Agreements & Contract Overview -->
          <div class="md:col-span-4 rounded-2xl bg-[#FAFAF7] border border-[#E6E3DD] p-5 flex flex-col justify-between shadow-2xs hover:border-[#171816]/30 transition group">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-[#E6E3DD]">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-[#F5ECCE] text-[#A77A35] flex items-center justify-center text-xs font-bold">
                    📜
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#171816]">Agreements Overview</h3>
                </div>
                <a routerLink="/app/tenant-agreements" title="View Tenant Leases" class="w-7 h-7 rounded-full bg-black/5 group-hover:bg-[#171816] group-hover:text-white transition flex items-center justify-center text-xs font-bold">
                  ↗
                </a>
              </div>

              <div class="py-4 space-y-3">
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="p-3 rounded-xl bg-white border border-[#E6E3DD]">
                    <div class="text-[10px] text-[#777972] font-semibold uppercase">Tenant Leases</div>
                    <div class="text-2xl font-bold text-[#171816] tabular-nums mt-1">
                      {{ metrics()?.total_tenant_agreements || 0 }}
                    </div>
                    <div class="text-[10px] text-[#285746] font-medium mt-0.5">Active Contracts</div>
                  </div>

                  <div class="p-3 rounded-xl bg-white border border-[#E6E3DD]">
                    <div class="text-[10px] text-[#777972] font-semibold uppercase">Owner Contracts</div>
                    <div class="text-2xl font-bold text-[#171816] tabular-nums mt-1">
                      {{ metrics()?.total_owner_agreements || 0 }}
                    </div>
                    <div class="text-[10px] text-[#567C83] font-medium mt-0.5">Management</div>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-[#F5ECCE]/50 border border-[#E7CF8B]/50 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-[#A77A35] animate-pulse"></span>
                    <span class="text-[#393A36] font-medium">Expiring Soon (30 days)</span>
                  </div>
                  <span class="font-bold text-[#A77A35] tabular-nums text-sm">
                    {{ metrics()?.expiring_soon_agreements || 0 }}
                  </span>
                </div>
              </div>
            </div>

            <a routerLink="/app/tenant-agreements" class="text-xs font-semibold text-[#A77A35] hover:underline inline-flex items-center gap-1 pt-1">
              Manage Tenant Lease Contracts →
            </a>
          </div>

          <!-- BENTO MODULE 3 (Col 3): Properties & Portfolio Occupancy -->
          <div class="md:col-span-3 rounded-2xl bg-[#FAFAF7] border border-[#E6E3DD] p-5 flex flex-col justify-between shadow-2xs hover:border-[#171816]/30 transition group">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-[#E6E3DD]">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-[#E4F0F3] text-[#567C83] flex items-center justify-center text-xs font-bold">
                    🏢
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#171816]">Portfolio</h3>
                </div>
                <a routerLink="/app/properties" title="View Property Directory" class="w-7 h-7 rounded-full bg-black/5 group-hover:bg-[#171816] group-hover:text-white transition flex items-center justify-center text-xs font-bold">
                  ↗
                </a>
              </div>

              <div class="py-4 space-y-3">
                <div>
                  <div class="text-[10px] text-[#777972] font-semibold uppercase">Total Managed Units</div>
                  <div class="text-3xl font-bold text-[#171816] tabular-nums mt-0.5">
                    {{ metrics()?.total_properties || 0 }}
                  </div>
                </div>

                <div class="space-y-1.5 text-xs">
                  <div class="flex justify-between items-center text-[11px] text-[#777972]">
                    <span>Occupancy Rate</span>
                    <span class="font-bold text-[#285746]">92%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-[#E6E3DD] overflow-hidden">
                    <div class="h-full bg-[#285746] rounded-full" style="width: 92%"></div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                  <div class="p-2 rounded-lg bg-white border border-[#E6E3DD]">
                    <div class="text-[#777972]">Owners</div>
                    <div class="font-bold text-[#171816] text-xs mt-0.5">{{ metrics()?.total_owners || 0 }}</div>
                  </div>
                  <div class="p-2 rounded-lg bg-white border border-[#E6E3DD]">
                    <div class="text-[#777972]">Tenants</div>
                    <div class="font-bold text-[#171816] text-xs mt-0.5">{{ metrics()?.total_tenants || 0 }}</div>
                  </div>
                </div>
              </div>
            </div>

            <a routerLink="/app/properties" class="text-xs font-semibold text-[#567C83] hover:underline inline-flex items-center gap-1 pt-1">
              Property Directory →
            </a>
          </div>

          <!-- BENTO MODULE 4 (Col 4): Maintenance & Work Orders -->
          <div class="md:col-span-4 rounded-2xl bg-[#FAFAF7] border border-[#E6E3DD] p-5 flex flex-col justify-between shadow-2xs hover:border-[#171816]/30 transition group">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-[#E6E3DD]">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-[#F3E3E7] text-[#B98D91] flex items-center justify-center text-xs font-bold">
                    🔧
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#171816]">Maintenance</h3>
                </div>
                <a routerLink="/app/maintenance/work-orders" title="View Work Orders" class="w-7 h-7 rounded-full bg-black/5 group-hover:bg-[#171816] group-hover:text-white transition flex items-center justify-center text-xs font-bold">
                  ↗
                </a>
              </div>

              <div class="py-4 space-y-3">
                <div class="p-3 rounded-xl bg-white border border-[#E6E3DD] flex items-center justify-between text-xs">
                  <div>
                    <div class="font-semibold text-[#171816]">Active Work Orders</div>
                    <div class="text-[10px] text-[#777972]">Pending dispatch & repairs</div>
                  </div>
                  <span class="w-7 h-7 rounded-full bg-[#F3E3E7] text-[#B98D91] font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <a routerLink="/app/maintenance/vendors" class="p-2.5 rounded-lg bg-white border border-[#E6E3DD] hover:bg-[#FAFAF7] transition">
                    <div class="text-[10px] text-[#777972] font-semibold uppercase">Vendors</div>
                    <div class="font-bold text-[#171816] text-sm mt-0.5">Approved</div>
                  </a>
                  <a routerLink="/app/maintenance/inventory" class="p-2.5 rounded-lg bg-white border border-[#E6E3DD] hover:bg-[#FAFAF7] transition">
                    <div class="text-[10px] text-[#777972] font-semibold uppercase">Inventory</div>
                    <div class="font-bold text-[#171816] text-sm mt-0.5">Stock Items</div>
                  </a>
                </div>
              </div>
            </div>

            <a routerLink="/app/maintenance/work-orders" class="text-xs font-semibold text-[#B98D91] hover:underline inline-flex items-center gap-1 pt-1">
              Dispatch Work Orders →
            </a>
          </div>

          <!-- BENTO MODULE 5 (Col 4): Collection Progress Bar -->
          <div class="md:col-span-4 rounded-2xl bg-[#FAFAF7] border border-[#E6E3DD] p-5 flex flex-col justify-between shadow-2xs hover:border-[#171816]/30 transition group">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-[#E6E3DD]">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-[#E5F1EA] text-[#285746] flex items-center justify-center text-xs font-bold">
                    📊
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#171816]">Rent Collection Status</h3>
                </div>
                <a routerLink="/app/accounts/inward" title="View Inward Receipts" class="w-7 h-7 rounded-full bg-black/5 group-hover:bg-[#171816] group-hover:text-white transition flex items-center justify-center text-xs font-bold">
                  ↗
                </a>
              </div>

              <div class="py-4 space-y-3">
                <div class="flex justify-between items-baseline text-xs">
                  <span class="text-[#777972] font-medium">Monthly Collection Target</span>
                  <span class="font-bold text-[#285746] text-sm tabular-nums">78% Achieved</span>
                </div>

                <!-- Segmented Collection Bar -->
                <div class="w-full h-3 rounded-full bg-[#E6E3DD] overflow-hidden flex">
                  <div class="h-full bg-[#285746] transition-all" style="width: 65%" title="Collected"></div>
                  <div class="h-full bg-[#E7CF8B] transition-all" style="width: 13%" title="Pending Cheques"></div>
                  <div class="h-full bg-[#DFA7B4]/50 transition-all" style="width: 22%" title="Outstanding"></div>
                </div>

                <div class="grid grid-cols-3 gap-1 text-[10px] text-center pt-1">
                  <div class="p-1.5 rounded bg-[#E5F1EA]">
                    <div class="font-bold text-[#285746]">65%</div>
                    <div class="text-[#285746]/70">Collected</div>
                  </div>
                  <div class="p-1.5 rounded bg-[#F5ECCE]">
                    <div class="font-bold text-[#A77A35]">13%</div>
                    <div class="text-[#A77A35]/70">Cheques</div>
                  </div>
                  <div class="p-1.5 rounded bg-[#F3E3E7]">
                    <div class="font-bold text-[#B98D91]">22%</div>
                    <div class="text-[#B98D91]/70">Due</div>
                  </div>
                </div>
              </div>
            </div>

            <a routerLink="/app/accounts/inward" class="text-xs font-semibold text-[#285746] hover:underline inline-flex items-center gap-1 pt-1">
              Issue Rent Inward Receipt →
            </a>
          </div>

          <!-- BENTO MODULE 6 (Col 4): Operations Quick Action Hub -->
          <div class="md:col-span-4 rounded-2xl bg-[#FAFAF7] border border-[#E6E3DD] p-5 flex flex-col justify-between shadow-2xs hover:border-[#171816]/30 transition group">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-[#E6E3DD]">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-[#171816] text-[#FAFAF7] flex items-center justify-center text-xs font-bold">
                    ⚡
                  </div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#171816]">Operations Hub</h3>
                </div>
                <span class="text-[10px] font-semibold text-[#777972] uppercase">ERP Workflows</span>
              </div>

              <div class="py-3 grid grid-cols-2 gap-2">
                <a
                  routerLink="/app/customers/owners/new"
                  class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6E3DD] hover:bg-[#FAFAF7] hover:border-[#171816]/30 text-xs font-semibold text-[#171816] transition group/btn"
                >
                  <span>+ Owner</span>
                  <span class="text-[#777972] group-hover/btn:translate-x-0.5 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/customers/tenants/new"
                  class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6E3DD] hover:bg-[#FAFAF7] hover:border-[#171816]/30 text-xs font-semibold text-[#171816] transition group/btn"
                >
                  <span>+ Tenant</span>
                  <span class="text-[#777972] group-hover/btn:translate-x-0.5 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/properties/new"
                  class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6E3DD] hover:bg-[#FAFAF7] hover:border-[#171816]/30 text-xs font-semibold text-[#171816] transition group/btn"
                >
                  <span>+ Property</span>
                  <span class="text-[#777972] group-hover/btn:translate-x-0.5 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/tenant-agreements/new"
                  class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6E3DD] hover:bg-[#FAFAF7] hover:border-[#171816]/30 text-xs font-semibold text-[#171816] transition group/btn"
                >
                  <span>+ Lease</span>
                  <span class="text-[#777972] group-hover/btn:translate-x-0.5 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/accounts/inward"
                  class="flex items-center justify-between p-2.5 rounded-xl bg-[#E5F1EA] border border-[#A9D5BF]/40 hover:bg-[#E5F1EA]/80 text-xs font-semibold text-[#285746] transition group/btn"
                >
                  <span>+ Inward</span>
                  <span class="text-[#285746] group-hover/btn:translate-x-0.5 transition-transform">→</span>
                </a>

                <a
                  routerLink="/app/accounts/outward"
                  class="flex items-center justify-between p-2.5 rounded-xl bg-[#F3E3E7] border border-[#DFA7B4]/40 hover:bg-[#F3E3E7]/80 text-xs font-semibold text-[#B98D91] transition group/btn"
                >
                  <span>+ Voucher</span>
                  <span class="text-[#B98D91] group-hover/btn:translate-x-0.5 transition-transform">→</span>
                </a>
              </div>
            </div>

            <div class="text-[10px] text-[#777972] font-medium pt-1">
              Permission-controlled real estate & ERP actions
            </div>
          </div>

        </div>

        <!-- 3. LOWER INFORMATION GRID (65% / 35% Split) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          
          <!-- LEFT COLUMN (65% -> Col 8): Recent Transactions Table -->
          <div class="lg:col-span-8 rounded-2xl bg-[#FAFAF7] border border-[#E6E3DD] p-5 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-[#E6E3DD]">
              <div>
                <h3 class="text-sm font-bold text-[#171816]">Recent Financial Transactions</h3>
                <p class="text-xs text-[#777972]">Latest 5 inward & outward vouchers processed</p>
              </div>
              <a routerLink="/app/accounts/dashboard" class="text-xs font-semibold text-[#285746] hover:underline flex items-center gap-1">
                Full Financial Ledger →
              </a>
            </div>

            @if (accountsSnapshot()?.recent_transactions?.length) {
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="border-b border-[#E6E3DD] text-[10px] font-bold uppercase tracking-wider text-[#777972]">
                      <th class="pb-2.5 font-semibold">Doc #</th>
                      <th class="pb-2.5 font-semibold">Date</th>
                      <th class="pb-2.5 font-semibold">Party</th>
                      <th class="pb-2.5 font-semibold">Mode</th>
                      <th class="pb-2.5 font-semibold">Direction</th>
                      <th class="pb-2.5 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#E6E3DD]">
                    @for (tx of accountsSnapshot()!.recent_transactions.slice(0, 5); track tx.id) {
                      <tr class="hover:bg-black/2 transition">
                        <td class="py-3 font-semibold text-[#171816] font-mono">{{ tx.document_no }}</td>
                        <td class="py-3 text-[#777972]">{{ tx.transaction_date }}</td>
                        <td class="py-3 font-medium text-[#171816] max-w-[150px] truncate">{{ tx.party || tx.particulars || '—' }}</td>
                        <td class="py-3 capitalize text-[#777972]">{{ tx.payment_mode.replace('_', ' ') }}</td>
                        <td class="py-3">
                          @if (tx.direction === 'inward') {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5F1EA] text-[#285746]">
                              Inward
                            </span>
                          } @else {
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3E3E7] text-[#B98D91]">
                              Outward
                            </span>
                          }
                        </td>
                        <td class="py-3 text-right font-bold tabular-nums" [class.text-[#285746]]="tx.direction === 'inward'" [class.text-[#B98D91]]="tx.direction === 'outward'">
                          <span class="text-[10px] text-[#777972] font-normal mr-1">د.إ</span>
                          {{ formatMoney(tx.amount) }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="py-8 text-center text-xs text-[#777972]">No recent transactions logged for this branch.</div>
            }
          </div>

          <!-- RIGHT COLUMN (35% -> Col 4): Latest System Notifications Stack -->
          <div class="lg:col-span-4 rounded-2xl bg-[#FAFAF7] border border-[#E6E3DD] p-5 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-[#E6E3DD]">
              <div>
                <h3 class="text-sm font-bold text-[#171816]">System Alerts & Feed</h3>
                <p class="text-xs text-[#777972]">Important operational reminders</p>
              </div>
              <span class="w-2 h-2 rounded-full bg-[#285746]"></span>
            </div>

            <div class="space-y-3">
              <!-- Alert Item 1: Lease Expiring -->
              @if (metrics()?.expiring_soon_agreements && metrics()!.expiring_soon_agreements! > 0) {
                <div class="p-3 rounded-xl bg-[#F5ECCE] border border-[#E7CF8B] flex items-start gap-3 text-xs">
                  <div class="w-6 h-6 rounded-lg bg-[#A77A35] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    !
                  </div>
                  <div>
                    <div class="font-bold text-[#171816]">Lease Renewal Needed</div>
                    <div class="text-[11px] text-[#393A36] mt-0.5">
                      {{ metrics()?.expiring_soon_agreements }} tenant agreement(s) are approaching expiry date within 30 days.
                    </div>
                  </div>
                </div>
              }

              <!-- Alert Item 2: Pending Cheque Deposit -->
              <div class="p-3 rounded-xl bg-white border border-[#E6E3DD] flex items-start gap-3 text-xs">
                <div class="w-6 h-6 rounded-lg bg-[#E4F0F3] text-[#567C83] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  🏦
                </div>
                <div>
                  <div class="font-bold text-[#171816]">Pending Cheque Clearance</div>
                  <div class="text-[11px] text-[#777972] mt-0.5">
                    Cheques totaling د.إ {{ formatMoney(accountsSnapshot()?.pending_cheque_inward) }} awaiting bank deposit verification.
                  </div>
                </div>
              </div>

              <!-- Alert Item 3: Petty Cash Audit -->
              <div class="p-3 rounded-xl bg-white border border-[#E6E3DD] flex items-start gap-3 text-xs">
                <div class="w-6 h-6 rounded-lg bg-[#E5F1EA] text-[#285746] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  💵
                </div>
                <div>
                  <div class="font-bold text-[#171816]">Daily Petty Cash Balance</div>
                  <div class="text-[11px] text-[#777972] mt-0.5">
                    Closing petty cash stands at د.إ {{ formatMoney(accountsSnapshot()?.petty_cash_balance) }}.
                  </div>
                </div>
              </div>

              <!-- Alert Item 4: Zaakiy AI Assistant Tip -->
              <div class="p-3 rounded-xl bg-[#E5F1EA] border border-[#A9D5BF]/40 flex items-start gap-3 text-xs">
                <div class="w-6 h-6 rounded-lg bg-[#285746] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✨
                </div>
                <div>
                  <div class="font-bold text-[#285746]">Zaakiy Insights</div>
                  <div class="text-[11px] text-[#285746]/80 mt-0.5">
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

  formatMoney(val: string | number | undefined | null): string {
    const num = Number(val || 0);
    return num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }
}
