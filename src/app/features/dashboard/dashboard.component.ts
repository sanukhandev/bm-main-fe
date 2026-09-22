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
      subtitle="Operational metrics and active portfolio scope"
    >
      <a routerLink="/app/properties/new" class="bm-btn bm-btn-secondary text-xs">
        + Add Property
      </a>
      <a routerLink="/app/tenant-agreements/new" class="bm-btn bm-btn-primary text-xs">
        + New Tenant Agreement
      </a>
    </bm-page-header>

    @if (isLoading()) {
      <bm-loading-state type="kpi"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state
        title="Failed to load dashboard metrics"
        [message]="error()!"
        (retry)="loadData()"
      ></bm-error-state>
    } @else {
      <!-- Metric Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <bm-kpi-card
          label="Total Owners"
          [value]="metrics()?.total_owners || 0"
          subtext="Registered property owners"
        ></bm-kpi-card>

        <bm-kpi-card
          label="Total Tenants"
          [value]="metrics()?.total_tenants || 0"
          subtext="Active leasing tenants"
        ></bm-kpi-card>

        <bm-kpi-card
          label="Properties"
          [value]="metrics()?.total_properties || 0"
          subtext="Total rentable assets"
        ></bm-kpi-card>

        <bm-kpi-card
          label="Owner Agreements"
          [value]="metrics()?.total_owner_agreements || 0"
          subtext="Owner contracts"
        ></bm-kpi-card>

        <bm-kpi-card
          label="Tenant Agreements"
          [value]="metrics()?.total_tenant_agreements || 0"
          badgeText="Active"
          variant="featured"
          subtext="Leased customer contracts"
        ></bm-kpi-card>
      </div>

      <!-- Main Operational Focus Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Featured Portfolio Scope Card -->
        <div class="lg:col-span-2">
          <bm-card variant="gradient">
            <div class="p-2">
              <div class="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">
                Active Branch Portfolio
              </div>
              <h3 class="text-2xl font-semibold text-white tracking-tight mb-2">
                {{ activeBranch()?.name || 'Default Branch' }} Scope
              </h3>
              <p class="text-sm text-emerald-100 font-light max-w-xl mb-6 leading-relaxed">
                All property leasing, owner agreements, tenant collection schedules, and maintenance operations reflect strict verified branch-level isolation.
              </p>

              <div class="grid grid-cols-3 gap-4 border-t border-emerald-700/60 pt-4 text-xs">
                <div>
                  <div class="text-emerald-200 font-medium">Branch Code</div>
                  <div class="text-white font-semibold text-base mt-0.5">{{ activeBranch()?.code || 'N/A' }}</div>
                </div>
                <div>
                  <div class="text-emerald-200 font-medium">Currency</div>
                  <div class="text-white font-semibold text-base mt-0.5">{{ activeBranch()?.currency_code || 'AED' }}</div>
                </div>
                <div>
                  <div class="text-emerald-200 font-medium">Timezone</div>
                  <div class="text-white font-semibold text-base mt-0.5 truncate">{{ activeBranch()?.timezone || 'Asia/Dubai' }}</div>
                </div>
              </div>
            </div>
          </bm-card>
        </div>

        <!-- Quick Access Panel -->
        <div>
          <bm-card title="Quick Actions">
            <div class="space-y-3">
              <a
                routerLink="/app/customers/new"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-xs font-medium text-slate-800 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">+</span>
                  <span>Register New Customer</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                routerLink="/app/properties/new"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-xs font-medium text-slate-800 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">+</span>
                  <span>Add Property Asset</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                routerLink="/app/owner-agreements/new"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-xs font-medium text-slate-800 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">+</span>
                  <span>Draft Owner Agreement</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </bm-card>
        </div>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardApi = inject(DashboardApiService);
  private branchContext = inject(BranchContextService);

  activeBranch = this.branchContext.activeBranch;
  metrics = signal<DashboardMetrics | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  private branchSub?: Subscription;

  ngOnInit(): void {
    this.loadData();
    this.branchSub = this.branchContext.branchChanged$.subscribe(() => {
      this.loadData();
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
        this.error.set(err.message || 'Unable to load dashboard data.');
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }
}
