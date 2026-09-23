import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { DashboardApiService, DashboardMetrics } from '../../core/api/dashboard-api.service';
import { BranchContextService } from '../../core/branch-context/branch-context.service';
import { AccountsApiService, AccountsDashboardSnapshot } from '../../core/api/accounts-api.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'bm-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BmPageHeaderComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <bm-page-header
      title="Executive Overview"
      [subtitle]="'Operational & financial summary for ' + (activeBranch()?.name || 'Branch') + ' scope.'"
    >
      <a routerLink="/app/properties/new" class="bm-btn bm-btn-secondary">
        + Add Property
      </a>
      <a routerLink="/app/tenant-agreements/new" class="bm-btn bm-btn-primary">
        + New Lease Agreement
      </a>
    </bm-page-header>

    @if (metrics()?.expiring_soon_agreements && metrics()!.expiring_soon_agreements! > 0) {
      <div class="mb-6 p-4 rounded-xl bg-[#D6C49D]/15 border border-[#D6C49D]/40 text-[#1B1E1C] flex items-center justify-between text-xs font-medium">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#D6C49D]/30 text-[#193D32] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span class="font-bold text-[#193D32]">Action Required:</span> {{ metrics()?.expiring_soon_agreements }} tenant agreement(s) expiring within 30 days.
          </div>
        </div>
        <a routerLink="/app/tenant-agreements" class="font-semibold text-[#193D32] underline underline-offset-4 hover:opacity-80 transition">
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
      <!-- ARCHITECTURAL BENTO GRID CONTAINER -->
      <div class="space-y-6">
        <!-- 1. PRIMARY BUSINESS HERO BENTO MODULE (Col 12) -->
        <div class="bm-card p-6 lg:p-8 bg-[#FBFAF7] border border-[#E5E0D8] rounded-xl relative overflow-hidden">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-0.5 rounded-full bg-[#193D32]/10 text-[#193D32] text-[10px] font-semibold tracking-wider uppercase">
                  Net Movement Position
                </span>
                <span class="text-xs text-[#1B1E1C]/60 font-medium">{{ activeBranch()?.name || 'Branch' }} Scope</span>
              </div>
              
              <div class="flex items-baseline gap-3 my-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-[#1B1E1C]/50">AED</span>
                <span class="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#193D32] tabular-nums tracking-tight">
                  {{ formatMoney(accountsSnapshot()?.today_net_movement).amount }}
                </span>
              </div>
              <p class="text-xs text-[#1B1E1C]/60 font-medium mt-1">Daily net inward receipts less outward vouchers</p>
            </div>

            <!-- Integrated Portfolio Support Metrics (Unboxed horizontal strip) -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F2EFE9]/60 border border-[#E5E0D8]">
              <div class="p-2">
                <div class="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]/60">Owners</div>
                <div class="text-2xl font-bold text-[#1B1E1C] tabular-nums mt-0.5">{{ metrics()?.total_owners || 0 }}</div>
                <div class="text-[10px] text-[#1B1E1C]/50 font-medium mt-0.5">Registered</div>
              </div>
              <div class="p-2 border-l border-[#E5E0D8]">
                <div class="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]/60">Tenants</div>
                <div class="text-2xl font-bold text-[#1B1E1C] tabular-nums mt-0.5">{{ metrics()?.total_tenants || 0 }}</div>
                <div class="text-[10px] text-[#1B1E1C]/50 font-medium mt-0.5">Active Leasing</div>
              </div>
              <div class="p-2 border-l border-[#E5E0D8]">
                <div class="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]/60">Properties</div>
                <div class="text-2xl font-bold text-[#1B1E1C] tabular-nums mt-0.5">{{ metrics()?.total_properties || 0 }}</div>
                <div class="text-[10px] text-[#1B1E1C]/50 font-medium mt-0.5">Managed</div>
              </div>
              <div class="p-2 border-l border-[#E5E0D8]">
                <div class="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]/60">Leases</div>
                <div class="text-2xl font-bold text-[#193D32] tabular-nums mt-0.5">{{ metrics()?.total_tenant_agreements || 0 }}</div>
                <div class="text-[10px] text-[#193D32] font-medium mt-0.5">Contracts</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. ASYMMETRICAL BENTO MODULES ROW (3 Cards) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Bento Card A: Portfolio Composition -->
          <div class="bm-card p-6 bg-[#FBFAF7] border border-[#E5E0D8] rounded-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
                <h3 class="text-xs font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]">Portfolio Composition</h3>
                <span class="w-2 h-2 rounded-full bg-[#193D32]"></span>
              </div>
              <div class="py-5 space-y-4">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-[#1B1E1C]/70 font-medium">Rentable Properties</span>
                  <span class="font-bold text-[#1B1E1C] tabular-nums">{{ metrics()?.total_properties || 0 }}</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-[#E5E0D8] overflow-hidden">
                  <div class="h-full bg-[#193D32] rounded-full" style="width: 85%"></div>
                </div>
                <div class="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div class="p-3 bg-[#F2EFE9]/50 rounded-lg border border-[#E5E0D8]">
                    <div class="text-[10px] text-[#1B1E1C]/60 uppercase font-semibold tracking-[0.08em]">Owner Agreements</div>
                    <div class="font-bold text-[#1B1E1C] text-lg tabular-nums mt-0.5">{{ metrics()?.total_owner_agreements || 0 }}</div>
                  </div>
                  <div class="p-3 bg-[#F2EFE9]/50 rounded-lg border border-[#E5E0D8]">
                    <div class="text-[10px] text-[#1B1E1C]/60 uppercase font-semibold tracking-[0.08em]">Tenant Leases</div>
                    <div class="font-bold text-[#193D32] text-lg tabular-nums mt-0.5">{{ metrics()?.total_tenant_agreements || 0 }}</div>
                  </div>
                </div>
              </div>
            </div>
            <a routerLink="/app/properties" class="text-xs font-semibold text-[#193D32] hover:underline inline-flex items-center gap-1 pt-2">
              View Property Asset Directory →
            </a>
          </div>

          <!-- Bento Card B: Accounts Cash Flow Snapshot -->
          <div class="bm-card p-6 bg-[#FBFAF7] border border-[#E5E0D8] rounded-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
                <h3 class="text-xs font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]">Accounts & Cash Flow</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#9CAF9F]/20 text-[#193D32]">REAL-TIME</span>
              </div>
              @if (isAccountsLoading()) {
                <div class="py-8 text-center text-xs text-[#1B1E1C]/50">Loading accounts snapshot...</div>
              } @else if (accountsSnapshot()) {
                <div class="py-4 space-y-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-[#1B1E1C]/70 font-medium">Today's Inward</span>
                    <span class="font-bold text-[#193D32] tabular-nums">AED {{ formatMoney(accountsSnapshot()?.today_inward).amount }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-[#1B1E1C]/70 font-medium">Today's Outward</span>
                    <span class="font-bold text-[#1B1E1C] tabular-nums">AED {{ formatMoney(accountsSnapshot()?.today_outward).amount }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs pt-2 border-t border-[#E5E0D8]">
                    <span class="text-[#1B1E1C]/70 font-medium">Petty Cash Balance</span>
                    <span class="font-bold text-[#1B1E1C] tabular-nums">AED {{ formatMoney(accountsSnapshot()?.petty_cash_balance).amount }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-[#1B1E1C]/70 font-medium">Tenant Receivable</span>
                    <span class="font-bold text-[#C98E72] tabular-nums">AED {{ formatMoney(accountsSnapshot()?.tenant_outstanding_receivable).amount }}</span>
                  </div>
                </div>
              }
            </div>
            <a routerLink="/app/accounts/dashboard" class="text-xs font-semibold text-[#193D32] hover:underline inline-flex items-center gap-1 pt-2">
              View Financial Ledger →
            </a>
          </div>

          <!-- Bento Card C: Quick Actions Module -->
          <div class="bm-card p-6 bg-[#FBFAF7] border border-[#E5E0D8] rounded-xl flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
                <h3 class="text-xs font-semibold uppercase tracking-[0.08em] text-[#1B1E1C]">Quick Action Hub</h3>
                <span class="text-[10px] font-semibold text-[#1B1E1C]/60 uppercase tracking-[0.08em]">Operations</span>
              </div>
              <div class="py-4 grid grid-cols-1 gap-2.5">
                <a
                  routerLink="/app/customers/owners/new"
                  class="flex items-center justify-between p-2.5 rounded-lg bg-[#F2EFE9]/60 hover:bg-[#F2EFE9] text-xs font-medium text-[#1B1E1C] transition border border-[#E5E0D8]"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="w-5 h-5 rounded bg-[#193D32]/10 text-[#193D32] flex items-center justify-center font-bold text-xs">+</span>
                    <span>Register Owner</span>
                  </div>
                  <span class="text-[#1B1E1C]/40">→</span>
                </a>

                <a
                  routerLink="/app/customers/tenants/new"
                  class="flex items-center justify-between p-2.5 rounded-lg bg-[#F2EFE9]/60 hover:bg-[#F2EFE9] text-xs font-medium text-[#1B1E1C] transition border border-[#E5E0D8]"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="w-5 h-5 rounded bg-[#193D32]/10 text-[#193D32] flex items-center justify-center font-bold text-xs">+</span>
                    <span>Register Tenant</span>
                  </div>
                  <span class="text-[#1B1E1C]/40">→</span>
                </a>

                <a
                  routerLink="/app/properties/new"
                  class="flex items-center justify-between p-2.5 rounded-lg bg-[#F2EFE9]/60 hover:bg-[#F2EFE9] text-xs font-medium text-[#1B1E1C] transition border border-[#E5E0D8]"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="w-5 h-5 rounded bg-[#193D32]/10 text-[#193D32] flex items-center justify-center font-bold text-xs">+</span>
                    <span>Add Property</span>
                  </div>
                  <span class="text-[#1B1E1C]/40">→</span>
                </a>

                <a
                  routerLink="/app/tenant-agreements/new"
                  class="flex items-center justify-between p-2.5 rounded-lg bg-[#F2EFE9]/60 hover:bg-[#F2EFE9] text-xs font-medium text-[#1B1E1C] transition border border-[#E5E0D8]"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="w-5 h-5 rounded bg-[#193D32]/10 text-[#193D32] flex items-center justify-center font-bold text-xs">+</span>
                    <span>New Tenant Lease</span>
                  </div>
                  <span class="text-[#1B1E1C]/40">→</span>
                </a>
              </div>
            </div>
            <div class="text-[10px] text-[#1B1E1C]/50 font-medium pt-1">Permission-guarded ERP workflows</div>
          </div>
        </div>
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
