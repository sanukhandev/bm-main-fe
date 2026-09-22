import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmConfirmDialogComponent } from '../../shared/components/bm-confirm-dialog/bm-confirm-dialog.component';
import { TenantAgreementsApiService } from '../../core/api/tenant-agreements-api.service';
import { TenantAgreement, AgreementInstallment } from '../../shared/models/agreement.models';

@Component({
  selector: 'bm-tenant-agreement-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmConfirmDialogComponent,
  ],
  template: `
    @if (isLoading()) {
      <bm-loading-state></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadAgreement()"></bm-error-state>
    } @else if (agreement()) {
      <div class="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <!-- Back Breadcrumb & Header -->
        <div class="mb-6">
          <a routerLink="/app/tenant-agreements" class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Tenant Agreements</span>
          </a>

          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{{ agreement()!.agreement_no }}</h1>
                <span class="px-3 py-1 rounded-full text-xs font-semibold border" [ngClass]="statusBadgeClasses(agreement()!.status)">
                  ● {{ formatStatus(agreement()!.status) }}
                </span>
              </div>
              <p class="text-xs lg:text-sm text-slate-500 font-normal mt-1">
                {{ tenantName() }} · {{ primaryPropertyName() }} · {{ formatDate(agreement()!.start_date) }} – {{ formatDate(agreement()!.end_date) }}
              </p>
            </div>

            <!-- Action Hierarchy Buttons -->
            <div class="flex items-center gap-2.5 flex-wrap">
              @if (agreement()!.status === 'draft') {
                <button type="button" (click)="transition('approved')" [disabled]="isActioning()" class="bm-btn bm-btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs">
                  Approve Lease
                </button>
                <a [routerLink]="['/app/tenant-agreements', agreement()!.id, 'edit']" class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200">
                  Edit
                </a>
              }
              @if (agreement()!.status === 'approved') {
                <button type="button" (click)="transition('commenced')" [disabled]="isActioning()" class="bm-btn bm-btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs">
                  Commence Lease
                </button>
              }
              @if (agreement()!.status === 'commenced') {
                <button type="button" (click)="transition('on_hold')" [disabled]="isActioning()" class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200">
                  Put On Hold
                </button>
              }
              @if (agreement()!.status === 'on_hold') {
                <button type="button" (click)="transition('commenced')" [disabled]="isActioning()" class="bm-btn bm-btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs">
                  Resume Agreement
                </button>
              }

              <!-- More Dropdown Menu -->
              <div class="relative">
                <button
                  type="button"
                  (click)="showMoreMenu.set(!showMoreMenu())"
                  class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>More</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                @if (showMoreMenu()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-30 text-xs">
                    <button
                      type="button"
                      (click)="raiseDispute(); showMoreMenu.set(false)"
                      class="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Raise Dispute</span>
                    </button>

                    <button
                      type="button"
                      (click)="addExtraPayment(); showMoreMenu.set(false)"
                      class="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Payment Line</span>
                    </button>

                    @if (agreement()!.status !== 'terminated') {
                      <div class="border-t border-slate-100 my-1"></div>
                      <button
                        type="button"
                        (click)="confirmTerminateDialog.set(true); showMoreMenu.set(false)"
                        class="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span>Terminate Agreement</span>
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- MAIN AGREEMENT SUMMARY CARD -->
        <div class="bg-white rounded-[22px] p-6 lg:p-8 border border-slate-200/90 shadow-xs mb-8">
          <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <div class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                TENANT LEASE CONTRACT
              </div>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">{{ agreement()!.agreement_no }}</h2>
            </div>
            <div class="text-right text-xs text-slate-400">
              <div>Record Created</div>
              <div class="font-medium text-slate-700 mt-0.5">{{ formatDate(agreement()!.created_at) }}</div>
            </div>
          </div>

          <!-- 3-Column Party / Property / Lease Period -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- 1. Leasing Tenant -->
            <div class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between">
              <div>
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Leasing Tenant
                </div>
                <div class="text-base font-bold text-slate-900">{{ tenantName() }}</div>
                @if (tenantCustomer()) {
                  <div class="text-xs text-slate-500 mt-1 tabular-nums">Code: {{ tenantCustomer()?.customer_code }}</div>
                  <div class="text-xs text-slate-500 tabular-nums">{{ tenantCustomer()?.phone || '—' }}</div>
                }
              </div>
              @if (tenantCustomer()) {
                <div class="pt-4 mt-2 border-t border-slate-200/60">
                  <a [routerLink]="['/app/customers', tenantCustomer()?.id]" class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1">
                    <span>View Tenant Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              }
            </div>

            <!-- 2. Leased Property -->
            <div class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between">
              <div>
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Leased Property Asset
                </div>
                @if (primaryProperty()) {
                  <div class="text-base font-bold text-slate-900 truncate">
                    {{ primaryProperty()!.name }}
                  </div>
                  <div class="text-xs text-slate-500 mt-1 tabular-nums">
                    Code: {{ primaryProperty()!.property_code }} · Unit {{ primaryProperty()!.unit_number }}
                  </div>
                  <div class="text-xs text-slate-500 capitalize">
                    Type: {{ primaryProperty()!.property_type }}
                  </div>
                } @else {
                  <div class="text-sm font-medium text-slate-500 italic">No property assigned</div>
                }
              </div>
              @if (primaryProperty()) {
                <div class="pt-4 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <a [routerLink]="['/app/properties', primaryProperty()!.id]" class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1">
                    <span>View Property Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  @if (propertiesList().length > 1) {
                    <span class="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                      +{{ propertiesList().length - 1 }} more
                    </span>
                  }
                </div>
              }
            </div>

            <!-- 3. Lease Period -->
            <div class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between">
              <div>
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Lease Validity Period
                </div>
                <div class="text-base font-semibold text-slate-900 tabular-nums flex items-baseline gap-2">
                  <span>{{ formatDate(agreement()!.start_date) }}</span>
                  <span class="text-slate-400 font-normal">→</span>
                  <span>{{ formatDate(agreement()!.end_date) }}</span>
                </div>
                <div class="text-xs text-slate-500 mt-1">
                  Status: <span class="capitalize font-semibold text-slate-800">{{ agreement()!.status }}</span>
                </div>
              </div>
              <div class="pt-4 mt-2 border-t border-slate-200/60 text-xs text-slate-500">
                Duration: <span class="font-semibold text-slate-800">{{ agreement()!.payment_count || 0 }} cycles</span>
              </div>
            </div>
          </div>

          <!-- FINANCIAL SUMMARY PANEL -->
          <div class="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
            <div class="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Lease Terms & Financial Position</span>
              <span class="text-emerald-700 font-medium">Currency: {{ agreement()!.currency_code || 'AED' }}</span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-6 gap-6 text-xs">
              <div>
                <div class="text-slate-500 font-medium mb-1">Total Rent Amount</div>
                <div class="whitespace-nowrap tabular-nums font-semibold tracking-tight text-xl text-emerald-950">
                  <span class="text-xs text-emerald-700 uppercase font-medium mr-1">AED</span>
                  <span>{{ formatAmount(agreement()!.total_amount) }}</span>
                </div>
              </div>

              <div>
                <div class="text-slate-500 font-medium mb-1">Total Paid</div>
                <div class="whitespace-nowrap tabular-nums font-semibold tracking-tight text-xl text-emerald-700">
                  <span class="text-xs text-emerald-600 uppercase font-medium mr-1">AED</span>
                  <span>{{ formatAmount(getPaidTotal(agreement()!.installments)) }}</span>
                </div>
              </div>

              <div>
                <div class="text-slate-500 font-medium mb-1">Outstanding Balance</div>
                <div class="whitespace-nowrap tabular-nums font-semibold tracking-tight text-xl text-slate-900">
                  <span class="text-xs text-slate-400 uppercase font-medium mr-1">AED</span>
                  <span>{{ formatAmount(getOutstandingTotal(agreement()!.installments)) }}</span>
                </div>
              </div>

              <div>
                <div class="text-slate-500 font-medium mb-1">Installment Count</div>
                <div class="text-base font-semibold text-slate-900 tabular-nums mt-1">
                  {{ agreement()!.payment_count }} cycles
                </div>
              </div>

              <div>
                <div class="text-slate-500 font-medium mb-1">Payment Frequency</div>
                <div class="text-base font-semibold text-slate-900 capitalize mt-1">
                  {{ agreement()!.payment_frequency || 'Monthly' }}
                </div>
              </div>

              <div>
                <div class="text-slate-500 font-medium mb-1">Payment Mode</div>
                <div class="text-base font-semibold text-slate-900 capitalize mt-1">
                  {{ (agreement()!.payment_mode || '').replace('_', ' ') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PAYMENT SCHEDULE SECTION -->
        <div class="bg-white rounded-[22px] p-6 lg:p-8 border border-slate-200/90 shadow-xs mb-8">
          <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 tracking-tight">Payment Schedule</h3>
              <p class="text-xs text-slate-500 font-normal">
                {{ agreement()!.installments?.length || 0 }} scheduled installments · {{ getPaidCount(agreement()!.installments) }} paid, {{ (agreement()!.installments?.length || 0) - getPaidCount(agreement()!.installments) }} remaining
              </p>
            </div>
          </div>

          <!-- Desktop & Tablet Table -->
          <div class="hidden md:block overflow-x-auto border border-slate-200/90 rounded-2xl">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-3.5 px-4 w-12">#</th>
                  <th class="py-3.5 px-4 w-32">Due Date</th>
                  <th class="py-3.5 px-4">Particulars</th>
                  <th class="py-3.5 px-4 w-28">Mode</th>
                  <th class="py-3.5 px-4 w-32 text-right">Scheduled</th>
                  <th class="py-3.5 px-4 w-32 text-right">Paid</th>
                  <th class="py-3.5 px-4 w-32 text-right">Balance</th>
                  <th class="py-3.5 px-4 w-28 text-center">Status</th>
                  <th class="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (item of agreement()!.installments || []; track item.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors" [class.bg-rose-50/30]="item.status === 'defaulted'">
                    <td class="py-3.5 px-4 font-semibold text-slate-700 tabular-nums">
                      {{ item.installment_no }}
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800 tabular-nums">
                      {{ formatDate(item.due_date) }}
                    </td>
                    <td class="py-3.5 px-4 text-slate-700">
                      {{ item.notes || 'Rent installment' }}
                    </td>
                    <td class="py-3.5 px-4 capitalize text-slate-600">
                      {{ (item.payment_mode || '').replace('_', ' ') }}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap tabular-nums font-medium text-slate-900">
                      <span class="text-[11px] text-slate-400 mr-1">AED</span>{{ formatAmount(item.amount) }}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap tabular-nums font-medium text-emerald-700">
                      <span class="text-[11px] text-slate-400 mr-1">AED</span>{{ formatAmount(item.paid_amount) }}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap tabular-nums font-semibold text-slate-900">
                      <span class="text-[11px] text-slate-400 mr-1">AED</span>{{ formatAmount(item.balance) }}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                            [ngClass]="installmentBadgeClasses(item.status)">
                        {{ item.status.replace('_', ' ') }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          [disabled]="installmentProcessingId() === item.id || item.status === 'paid'"
                          (click)="setInstallmentStatus(item.id, 'paid')"
                          title="Mark as Paid"
                          aria-label="Mark as Paid"
                          class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 inline-flex items-center justify-center transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          [disabled]="installmentProcessingId() === item.id || item.status === 'paid' || item.status === 'defaulted'"
                          (click)="setInstallmentStatus(item.id, 'defaulted')"
                          title="Mark as Defaulted"
                          aria-label="Mark as Defaulted"
                          class="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 inline-flex items-center justify-center transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-rose-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="p-6 text-center text-slate-500">No payment schedule installments found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards for Schedule -->
          <div class="block md:hidden space-y-3">
            @for (item of agreement()!.installments || []; track item.id) {
              <div class="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span class="font-semibold text-slate-900">Installment #{{ item.installment_no }}</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize" [ngClass]="installmentBadgeClasses(item.status)">
                    {{ item.status.replace('_', ' ') }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Due: <span class="font-medium text-slate-900 tabular-nums">{{ formatDate(item.due_date) }}</span></div>
                  <div>Mode: <span class="font-medium text-slate-900 capitalize">{{ (item.payment_mode || '').replace('_', ' ') }}</span></div>
                  <div>Scheduled: <span class="font-semibold text-slate-900 tabular-nums">AED {{ formatAmount(item.amount) }}</span></div>
                  <div>Balance: <span class="font-semibold text-slate-900 tabular-nums">AED {{ formatAmount(item.balance) }}</span></div>
                </div>
                <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    [disabled]="installmentProcessingId() === item.id || item.status === 'paid'"
                    (click)="setInstallmentStatus(item.id, 'paid')"
                    class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs disabled:opacity-40"
                  >
                    Mark Paid
                  </button>
                  <button
                    type="button"
                    [disabled]="installmentProcessingId() === item.id || item.status === 'paid' || item.status === 'defaulted'"
                    (click)="setInstallmentStatus(item.id, 'defaulted')"
                    class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200/60 text-xs disabled:opacity-40"
                  >
                    Mark Defaulted
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- NOTES & DISPUTES LOWER SECTION -->
        @if (agreement()!.notes || (agreement()!.disputes || []).length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            @if (agreement()!.notes) {
              <div class="bg-white rounded-[22px] p-6 border border-slate-200/90 shadow-xs">
                <h3 class="text-sm font-semibold text-slate-900 tracking-tight mb-2">Lease Notes & Special Conditions</h3>
                <p class="text-xs text-slate-600 leading-relaxed italic">{{ agreement()!.notes }}</p>
              </div>
            }

            @if ((agreement()!.disputes || []).length > 0) {
              <div class="bg-white rounded-[22px] p-6 border border-slate-200/90 shadow-xs">
                <h3 class="text-sm font-semibold text-slate-900 tracking-tight mb-3">Dispute Log & Resolution Updates</h3>
                @for (dispute of agreement()!.disputes || []; track dispute.id) {
                  <div class="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs space-y-1.5 mb-3">
                    <div class="flex items-center justify-between font-semibold text-amber-950">
                      <span>{{ dispute.subject }}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 capitalize">{{ dispute.status }}</span>
                    </div>
                    <p class="text-slate-700">{{ dispute.description }}</p>
                    <button type="button" class="text-xs font-semibold text-emerald-700 hover:underline pt-1" (click)="commentDispute(dispute.id)">
                      + Add Comment
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Add Extra Payment Line Modal -->
        @if (paymentLineOpen()) {
          <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 border border-slate-200">
              <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h2 class="text-lg font-semibold text-slate-900">Add Payment Line</h2>
                <button type="button" (click)="paymentLineOpen.set(false)" class="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Direction</label>
                  <select [(ngModel)]="paymentLine.direction" class="bm-input">
                    <option value="inward">Inward</option>
                    <option value="outward">Outward</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Category</label>
                  <input [(ngModel)]="paymentLine.category" class="bm-input" placeholder="Commission / security" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Particulars</label>
                  <input [(ngModel)]="paymentLine.particulars" class="bm-input" placeholder="Line description" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Amount</label>
                  <input [(ngModel)]="paymentLine.amount" type="number" min="0.01" step="0.01" class="bm-input" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input [(ngModel)]="paymentLine.due_date" type="date" class="bm-input" />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select [(ngModel)]="paymentLine.payment_mode" class="bm-input">
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">Terms / Notes</label>
                  <textarea [(ngModel)]="paymentLine.terms" rows="3" class="bm-input !h-auto p-2.5"></textarea>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="paymentLineOpen.set(false)" class="bm-btn bm-btn-secondary text-xs">Cancel</button>
                <button type="button" (click)="saveExtraPayment()" class="bm-btn bm-btn-primary text-xs">Save Payment Line</button>
              </div>
            </div>
          </div>
        }

        <!-- Terminate Confirmation Dialog -->
        <bm-confirm-dialog
          [isOpen]="confirmTerminateDialog()"
          title="Terminate Lease Agreement"
          message="Are you sure you want to terminate this tenant lease agreement? This action cannot be undone."
          confirmLabel="Terminate Agreement"
          [isDanger]="true"
          [isSubmitting]="isActioning()"
          (confirm)="executeTerminate()"
          (cancel)="confirmTerminateDialog.set(false)"
        ></bm-confirm-dialog>
      </div>
    }
  `,
})
export class TenantAgreementDetailComponent implements OnInit {
  private api = inject(TenantAgreementsApiService);
  private route = inject(ActivatedRoute);

  agreement = signal<TenantAgreement | null>(null);
  isLoading = signal(true);
  isActioning = signal(false);
  showMoreMenu = signal(false);
  installmentProcessingId = signal<number | string | null>(null);
  paymentLineOpen = signal(false);
  paymentLine = {
    direction: 'inward' as 'inward' | 'outward',
    category: '',
    particulars: '',
    amount: 0,
    due_date: new Date().toLocaleDateString('en-CA'),
    payment_mode: 'cash' as 'cash' | 'cheque' | 'bank_transfer',
    terms: '',
  };
  error = signal<string | null>(null);

  confirmTerminateDialog = signal(false);

  ngOnInit(): void {
    this.loadAgreement();
  }

  loadAgreement(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.api.getAgreement(id).subscribe({
      next: (res) => {
        this.agreement.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Tenant agreement record not found.');
        this.isLoading.set(false);
      },
    });
  }

  tenantCustomer(): any {
    const a = this.agreement();
    if (!a || !a.tenant) return null;
    if ('data' in a.tenant && a.tenant.data) return a.tenant.data;
    if ('id' in a.tenant) return a.tenant;
    return null;
  }

  tenantName(): string {
    const tc = this.tenantCustomer();
    return tc ? tc.display_name : '—';
  }

  propertiesList(): any[] {
    const a = this.agreement();
    return a && a.properties ? a.properties : [];
  }

  primaryProperty(): any {
    const list = this.propertiesList();
    if (!list.length) return null;
    const first = list[0];
    return first.property ? first.property : first;
  }

  primaryPropertyName(): string {
    const p = this.primaryProperty();
    return p ? (p.name || p.property_code) : 'N/A';
  }

  executeTerminate(): void {
    const a = this.agreement();
    if (!a) return;

    this.isActioning.set(true);
    this.api.terminateAgreement(a.id).subscribe({
      next: (res) => {
        this.agreement.set(res.data);
        this.isActioning.set(false);
        this.confirmTerminateDialog.set(false);
      },
      error: (err) => {
        this.isActioning.set(false);
        alert(err.message || 'Failed to terminate tenant agreement.');
      },
    });
  }

  setInstallmentStatus(id: number | string, status: 'paid' | 'defaulted'): void {
    const agreement = this.agreement();
    if (!agreement) return;
    const item = agreement.installments?.find((entry) => entry.id === id);
    if (!item) return;
    this.installmentProcessingId.set(id);
    const paymentId = typeof id === 'string' ? Number(id.replace('extra-', '')) : id;
    const request = item.is_extra ? this.api.updateAdditionalPaymentStatus(agreement.id, paymentId, status) : this.api.updateInstallmentStatus(agreement.id, paymentId, status);
    request.subscribe({
      next: () => {
        this.installmentProcessingId.set(null);
        this.loadAgreement();
      },
      error: (err) => {
        this.installmentProcessingId.set(null);
        alert(err.message || 'Unable to update installment.');
      },
    });
  }

  transition(status: 'approved' | 'commenced' | 'on_hold'): void {
    const reason = status === 'on_hold' ? prompt('Reason for hold') || '' : '';
    if (status === 'on_hold' && !reason) return;
    const id = this.agreement()?.id;
    if (!id) return;
    this.isActioning.set(true);
    this.api.transition(id, status, reason).subscribe({
      next: (res) => {
        this.agreement.set(res.data);
        this.isActioning.set(false);
      },
      error: (err) => {
        this.isActioning.set(false);
        alert(err.message || 'Unable to transition agreement.');
      },
    });
  }

  raiseDispute(): void {
    const id = this.agreement()?.id;
    const subject = prompt('Dispute subject');
    const description = subject ? prompt('Dispute details') : null;
    if (!id || !subject || !description) return;
    this.api.raiseDispute(id, subject, description).subscribe({
      next: () => this.loadAgreement(),
      error: (err) => alert(err.message || 'Unable to raise dispute.'),
    });
  }

  commentDispute(id: number): void {
    const comment = prompt('Add dispute update');
    if (!comment) return;
    this.api.addDisputeComment(id, comment).subscribe({
      next: () => this.loadAgreement(),
      error: (err) => alert(err.message || 'Unable to add comment.'),
    });
  }

  addExtraPayment(): void {
    this.paymentLineOpen.set(true);
  }

  saveExtraPayment(): void {
    const id = this.agreement()?.id;
    if (!id || !this.paymentLine.category || !this.paymentLine.particulars || this.paymentLine.amount <= 0 || !this.paymentLine.due_date) return;
    this.api.addAdditionalPayment(id, this.paymentLine).subscribe({
      next: () => {
        this.paymentLineOpen.set(false);
        this.loadAgreement();
      },
      error: (err) => alert(err.message || 'Unable to add payment line.'),
    });
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  formatAmount(val: string | number | undefined | null): string {
    const num = Number(val || 0);
    return num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatStatus(status: string): string {
    if (!status) return '—';
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  statusBadgeClasses(status: string): string {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'pending_approval':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'commenced':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'on_hold':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'expired':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'terminated':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  installmentBadgeClasses(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'due':
        return 'bg-blue-100 text-blue-800';
      case 'partial':
        return 'bg-amber-100 text-amber-800';
      case 'overdue':
      case 'defaulted':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getPaidTotal(installments?: AgreementInstallment[]): number {
    if (!installments || !installments.length) return 0;
    return installments.reduce((sum, item) => sum + Number(item.paid_amount || 0), 0);
  }

  getOutstandingTotal(installments?: AgreementInstallment[]): number {
    if (!installments || !installments.length) return 0;
    return installments.reduce((sum, item) => sum + Number(item.balance || 0), 0);
  }

  getPaidCount(installments?: AgreementInstallment[]): number {
    if (!installments || !installments.length) return 0;
    return installments.filter((item) => item.status === 'paid').length;
  }
}
