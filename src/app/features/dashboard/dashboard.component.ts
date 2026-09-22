import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmCardComponent } from '../../shared/components/bm-card/bm-card.component';
import { BmKpiCardComponent } from '../../shared/components/bm-kpi-card/bm-kpi-card.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { DashboardApiService, DashboardMetrics } from '../../core/api/dashboard-api.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { AccountsApiService, AccountsDashboardSnapshot } from '../../core/api/accounts-api.service';

@Component({
  selector: 'bm-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BmPageHeaderComponent,
    BmCardComponent,
    BmKpiCardComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <bm-page-header
      title="Dashboard"
      [subtitle]="'Overview of ' + (activeBranch()?.name || 'Branch') + ' operations and financial activity.'"
    >
      <a routerLink="/app/properties/new" class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-100 transition">
        + Add Property
      </a>
      <a routerLink="/app/tenant-agreements/new" class="bm-btn bm-btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition">
        + New Tenant Agreement
      </a>
    </bm-page-header>

    @if (metrics()?.expiring_soon_agreements && metrics()!.expiring_soon_agreements! > 0) {
      <div class="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-center justify-between text-xs font-medium">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span class="font-semibold text-amber-950">Action Required:</span> {{ metrics()?.expiring_soon_agreements }} tenant agreement(s) expiring within 30 days.
          </div>
        </div>
        <a routerLink="/app/tenant-agreements" class="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 underline underline-offset-2">
          Review Agreements →
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
      <!-- LEVEL 2: Operational KPI Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <bm-kpi-card
          label="Total Owners"
          [value]="metrics()?.total_owners || 0"
          icon="owners"
          subtext="Registered property owners"
        ></bm-kpi-card>

        <bm-kpi-card
          label="Total Tenants"
          [value]="metrics()?.total_tenants || 0"
          icon="tenants"
          subtext="Active leasing tenants"
        ></bm-kpi-card>

        <bm-kpi-card
          label="Properties"
          [value]="metrics()?.total_properties || 0"
          icon="properties"
          subtext="Total rentable assets"
        ></bm-kpi-card>

        <bm-kpi-card
          label="Owner Agreements"
          [value]="metrics()?.total_owner_agreements || 0"
          icon="owner_agreements"
          subtext="Owner contracts"
        ></bm-kpi-card>

        <bm-kpi-card
          label="Tenant Agreements"
          [value]="metrics()?.total_tenant_agreements || 0"
          icon="tenant_agreements"
          badgeText="Active"
          subtext="Leased customer contracts"
        ></bm-kpi-card>
      </div>

      <!-- LEVEL 3: Split Grid (Portfolio Overview + Quick Actions) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Active Branch Portfolio Feature Panel -->
        <div class="lg:col-span-2">
          <bm-card variant="gradient">
            <div class="p-1.5 flex flex-col justify-between h-full">
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#ecf39e] text-[11px] font-semibold uppercase tracking-wider border border-white/10">
                    <span class="w-2 h-2 rounded-full bg-[#ecf39e] animate-pulse"></span>
                    Active Branch Portfolio
                  </span>
                  <span class="text-xs text-[#a0cc9b] font-medium">{{ activeBranch()?.code || 'N/A' }}</span>
                </div>

                <h3 class="text-xl lg:text-2xl font-semibold text-white tracking-tight mb-2">
                  {{ activeBranch()?.name || 'Default Branch' }} Scope
                </h3>
                <p class="text-xs lg:text-sm text-[#d0e6cd] font-light max-w-xl mb-6 leading-relaxed">
                  All property leasing, owner agreements, tenant collection schedules, and maintenance operations reflect strict verified branch-level isolation.
                </p>
              </div>

              <div>
                <div class="grid grid-cols-3 gap-4 border-t border-white/15 pt-4 text-xs mb-5">
                  <div>
                    <div class="text-[#a0cc9b] font-medium text-[11px] uppercase tracking-wider">Branch Code</div>
                    <div class="text-white font-semibold text-sm mt-0.5">{{ activeBranch()?.code || 'N/A' }}</div>
                  </div>
                  <div>
                    <div class="text-[#a0cc9b] font-medium text-[11px] uppercase tracking-wider">Currency</div>
                    <div class="text-white font-semibold text-sm mt-0.5">{{ activeBranch()?.currency_code || 'AED' }}</div>
                  </div>
                  <div>
                    <div class="text-[#a0cc9b] font-medium text-[11px] uppercase tracking-wider">Timezone</div>
                    <div class="text-white font-semibold text-sm mt-0.5 truncate">{{ activeBranch()?.timezone || 'Asia/Dubai' }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3 pt-1">
                  <a
                    routerLink="/app/properties"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/15"
                  >
                    <span>View Properties</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[#ecf39e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                  <a
                    routerLink="/app/tenant-agreements"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/15"
                  >
                    <span>View Agreements</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[#ecf39e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </bm-card>
        </div>

        <!-- Quick Actions Panel -->
        <div>
          <bm-card title="Quick Actions">
            <div class="space-y-2.5">
              <a
                routerLink="/app/customers/new"
                class="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-xs font-medium text-slate-900 transition border border-slate-200/80 group"
              >
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-lg bg-[#d0e6cd] text-[#132a13] flex items-center justify-center font-semibold text-sm group-hover:bg-[#4ba64b] group-hover:text-white transition">+</span>
                  <span class="font-semibold text-slate-800">Register Customer</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                routerLink="/app/properties/new"
                class="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-xs font-medium text-slate-900 transition border border-slate-200/80 group"
              >
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-lg bg-[#d0e6cd] text-[#132a13] flex items-center justify-center font-semibold text-sm group-hover:bg-[#4ba64b] group-hover:text-white transition">+</span>
                  <span class="font-semibold text-slate-800">Add Property Asset</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                routerLink="/app/owner-agreements/new"
                class="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-xs font-medium text-slate-900 transition border border-slate-200/80 group"
              >
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-lg bg-[#d0e6cd] text-[#132a13] flex items-center justify-center font-semibold text-sm group-hover:bg-[#4ba64b] group-hover:text-white transition">+</span>
                  <span class="font-semibold text-slate-800">Draft Owner Agreement</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                routerLink="/app/tenant-agreements/new"
                class="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-xs font-medium text-slate-900 transition border border-slate-200/80 group"
              >
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-lg bg-[#d0e6cd] text-[#132a13] flex items-center justify-center font-semibold text-sm group-hover:bg-[#4ba64b] group-hover:text-white transition">+</span>
                  <span class="font-semibold text-slate-800">New Tenant Agreement</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </bm-card>
        </div>
      </div>

      <!-- LEVEL 4: Accounts Snapshot Single Container -->
      <div class="bg-white rounded-[20px] p-6 border border-slate-200/90 shadow-xs">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900 tracking-tight">Accounts Snapshot</h3>
              <p class="text-xs text-slate-500 font-normal">Real-time ledger and cash flow positions</p>
            </div>
          </div>
          <a routerLink="/app/accounts/dashboard" class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1">
            <span>View Accounts</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        @if (isAccountsLoading()) {
          <div class="py-6 flex items-center justify-center text-xs text-slate-400 gap-2">
            <svg class="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading accounts snapshot...</span>
          </div>
        } @else if (accountsError()) {
          <div class="py-4 text-xs text-slate-500 flex items-center justify-between bg-slate-50 px-4 rounded-xl border border-slate-200/60">
            <span>Unable to load account snapshot data at this time.</span>
            <button (click)="loadAccounts()" class="font-semibold text-emerald-700 hover:underline">Retry</button>
          </div>
        } @else if (accountsSnapshot()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <!-- 1. Today's Inward -->
            <div class="py-2 sm:py-0 sm:px-4 first:pl-0">
              <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Today's Inward
              </div>
              <div class="whitespace-nowrap tabular-nums font-semibold tracking-tight text-xl my-1 flex items-baseline gap-1"
                   [class.text-slate-400]="formatMoney(accountsSnapshot()?.today_inward).isZero"
                   [class.text-emerald-700]="!formatMoney(accountsSnapshot()?.today_inward).isZero">
                <span class="text-xs font-semibold text-slate-400 uppercase">AED</span>
                <span>{{ formatMoney(accountsSnapshot()?.today_inward).amount }}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-normal">Posted receipts</div>
            </div>

            <!-- 2. Today's Outward -->
            <div class="py-2 sm:py-0 sm:px-4">
              <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Today's Outward
              </div>
              <div class="whitespace-nowrap tabular-nums font-semibold tracking-tight text-xl my-1 flex items-baseline gap-1"
                   [class.text-slate-400]="formatMoney(accountsSnapshot()?.today_outward).isZero"
                   [class.text-slate-900]="!formatMoney(accountsSnapshot()?.today_outward).isZero">
                <span class="text-xs font-semibold text-slate-400 uppercase">AED</span>
                <span>{{ formatMoney(accountsSnapshot()?.today_outward).amount }}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-normal">Posted payments</div>
            </div>

            <!-- 3. Petty Cash -->
            <div class="py-2 sm:py-0 sm:px-4">
              <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Petty Cash
              </div>
              <div class="whitespace-nowrap tabular-nums font-semibold tracking-tight text-xl my-1 flex items-baseline gap-1"
                   [class.text-slate-400]="formatMoney(accountsSnapshot()?.petty_cash_balance).isZero"
                   [class.text-slate-900]="!formatMoney(accountsSnapshot()?.petty_cash_balance).isZero">
                <span class="text-xs font-semibold text-slate-400 uppercase">AED</span>
                <span>{{ formatMoney(accountsSnapshot()?.petty_cash_balance).amount }}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-normal">Current balance</div>
            </div>

            <!-- 4. Tenant Receivable -->
            <div class="py-2 sm:py-0 sm:px-4">
              <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Tenant Receivable
              </div>
              <div class="whitespace-nowrap tabular-nums font-semibold tracking-tight text-xl my-1 flex items-baseline gap-1"
                   [class.text-slate-400]="formatMoney(accountsSnapshot()?.tenant_outstanding_receivable).isZero"
                   [class.text-slate-900]="!formatMoney(accountsSnapshot()?.tenant_outstanding_receivable).isZero">
                <span class="text-xs font-semibold text-slate-400 uppercase">AED</span>
                <span>{{ formatMoney(accountsSnapshot()?.tenant_outstanding_receivable).amount }}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-normal">Outstanding</div>
            </div>

            <!-- 5. Owner Payable -->
            <div class="py-2 sm:py-0 sm:px-4 last:pr-0">
              <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 whitespace-nowrap">
                Owner Payable
              </div>
              <div class="whitespace-nowrap tabular-nums font-semibold tracking-tight text-xl my-1 flex items-baseline gap-1"
                   [class.text-slate-400]="formatMoney(accountsSnapshot()?.owner_outstanding_payable).isZero"
                   [class.text-slate-900]="!formatMoney(accountsSnapshot()?.owner_outstanding_payable).isZero">
                <span class="text-xs font-semibold text-slate-400 uppercase">AED</span>
                <span>{{ formatMoney(accountsSnapshot()?.owner_outstanding_payable).amount }}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-normal whitespace-nowrap">Outstanding balance</div>
            </div>
          </div>
        }
      </div>
    }
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

  formatMoney(val: string | number | undefined | null): { currency: string; amount: string; isZero: boolean } {
    const num = Number(val || 0);
    const isZero = num === 0;
    const amount = num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return { currency: 'AED', amount, isZero };
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }
}
