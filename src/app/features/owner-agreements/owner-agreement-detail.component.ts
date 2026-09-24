import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmConfirmDialogComponent } from '../../shared/components/bm-confirm-dialog/bm-confirm-dialog.component';
import { BmReceiptChequeModalComponent } from '../../shared/components/bm-receipt-cheque-modal/bm-receipt-cheque-modal.component';
import { BmAgreementPrintSheetComponent } from '../../shared/components/bm-agreement-print-sheet/bm-agreement-print-sheet.component';
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { AccountTransaction } from '../../core/api/accounts-api.service';
import { OwnerAgreement, AgreementInstallment } from '../../shared/models/agreement.models';

@Component({
  selector: 'bm-owner-agreement-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmConfirmDialogComponent,
    BmReceiptChequeModalComponent,
    BmAgreementPrintSheetComponent,
  ],
  styles: [
    `
      @media print {
        .agreement-screen { display: none !important; }
        :host { display: block !important; color: #000 !important; background: #fff !important; }
      }
    `,
  ],
  template: `
    @if (isLoading()) {
      <bm-loading-state type="detail"></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadAgreement()"></bm-error-state>
    } @else if (agreement()) {
      <div class="agreement-screen max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <!-- Back Breadcrumb & Header -->
        <div class="mb-6">
          <a
            routerLink="/app/owner-agreements"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition mb-3"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Owner Agreements</span>
          </a>

          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                  {{ agreement()!.agreement_no }}
                </h1>
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold border"
                  [ngClass]="statusBadgeClasses(agreement()!.status)"
                >
                  ● {{ formatStatus(agreement()!.status) }}
                </span>
              </div>
              <p class="text-xs lg:text-sm text-slate-500 font-normal mt-1">
                {{ ownerName() }} ·
                {{
                  propertiesList().length > 0
                    ? propertiesList()[0].name || propertiesList()[0].property_code
                    : 'N/A'
                }}
                · {{ formatDate(agreement()!.start_date) }} –
                {{ formatDate(agreement()!.end_date) }}
              </p>
            </div>

            <!-- Action Hierarchy Buttons -->
            <div class="flex items-center gap-2.5 flex-wrap">
              @if (agreement()!.status === 'draft') {
                <button
                  type="button"
                  (click)="transition('pending_approval')"
                  [disabled]="isActioning()"
                  class="bm-btn bm-btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
                >
                  Submit for Approval
                </button>
                <a
                  [routerLink]="['/app/owner-agreements', agreement()!.id, 'edit']"
                  class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200"
                >
                  Edit
                </a>
              }
              @if (agreement()!.status === 'pending_approval') {
                <button
                  type="button"
                  (click)="transition('approved')"
                  [disabled]="isActioning()"
                  class="bm-btn bm-btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
                >
                  Approve Agreement
                </button>
                <a
                  [routerLink]="['/app/owner-agreements', agreement()!.id, 'edit']"
                  class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200"
                  >Edit</a
                >
              }
              @if (agreement()!.status === 'approved') {
                <button
                  type="button"
                  (click)="transition('commenced')"
                  [disabled]="isActioning()"
                  class="bm-btn bm-btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
                >
                  Commence Management
                </button>
              }
              @if (agreement()!.status === 'commenced') {
                <button
                  type="button"
                  (click)="openHoldModal()"
                  [disabled]="isActioning()"
                  class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200"
                >
                  Put On Hold
                </button>
              }
              @if (agreement()!.status === 'on_hold') {
                <button
                  type="button"
                  (click)="transition('commenced')"
                  [disabled]="isActioning()"
                  class="bm-btn bm-btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
                >
                  Resume Agreement
                </button>
              }

              <button
                type="button"
                (click)="printAgreement()"
                class="bm-btn bm-btn-secondary text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200"
              >
                Print Agreement
              </button>

              <!-- More Dropdown Menu -->
              <div class="relative">
                <button
                  type="button"
                  (click)="showMoreMenu.set(!showMoreMenu())"
                  class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>More</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                @if (showMoreMenu()) {
                  <div
                    class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-30 text-xs"
                  >
                    <button
                      type="button"
                      (click)="openDisputeModal(); showMoreMenu.set(false)"
                      class="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-amber-600"
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
                      <span>Raise Dispute</span>
                    </button>

                    <button
                      type="button"
                      (click)="addExtraPayment(); showMoreMenu.set(false)"
                      class="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>Add Payment Line</span>
                    </button>

                    @if (agreement()!.available_actions?.includes('extend')) {
                      <button
                        type="button"
                        (click)="openExtendModal(); showMoreMenu.set(false)"
                        class="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        Extend Agreement
                      </button>
                    }
                    @if (agreement()!.available_actions?.includes('renew')) {
                      <button
                        type="button"
                        (click)="openRenewModal(); showMoreMenu.set(false)"
                        class="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        Renew Agreement
                      </button>
                    }

                    @if (
                      agreement()!.available_actions?.includes('terminate') ||
                      agreement()!.available_actions?.includes('cancel')
                    ) {
                      <div class="border-t border-slate-100 my-1"></div>
                      <button
                        type="button"
                        (click)="confirmTerminateDialog.set(true); showMoreMenu.set(false)"
                        class="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
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
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        <span>{{
                          agreement()!.available_actions?.includes('cancel')
                            ? 'Cancel Agreement'
                            : 'Terminate Agreement'
                        }}</span>
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
          <!-- Card Header -->
          <div class="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <div class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  OWNER MANAGEMENT AGREEMENT
                </div>
                <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
                  {{ agreement()!.agreement_no }}
                </h2>
              </div>
            </div>
            <div class="text-right text-xs text-slate-400">
              <div>Record Created</div>
              <div class="font-medium text-slate-700 mt-0.5">
                {{ formatDate(agreement()!.created_at) }}
              </div>
            </div>
          </div>

          <!-- 3-Column Information (NO NESTED CARDS - Clean text blocks with icons) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-slate-100">
            <!-- Col 1: Property Owner -->
            <div class="space-y-3">
              <div
                class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Property Owner</span>
              </div>
              <div>
                <div class="text-lg font-bold text-slate-900">{{ ownerName() }}</div>
                @if (ownerCustomer()) {
                  <div class="text-xs text-slate-500 mt-1 tabular-nums flex items-center gap-1.5">
                    <span class="text-slate-400">Code:</span>
                    <span class="font-semibold text-slate-700">{{
                      ownerCustomer()?.customer_code
                    }}</span>
                  </div>
                  @if (ownerCustomer()?.phone) {
                    <div
                      class="text-xs text-slate-600 tabular-nums flex items-center gap-1.5 mt-0.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3.5 w-3.5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>{{ ownerCustomer()?.phone }}</span>
                    </div>
                  }
                }
              </div>
              @if (ownerCustomer()) {
                <div class="pt-2">
                  <a
                    [routerLink]="['/app/customers', ownerCustomer()?.id]"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
                  >
                    <span>View Owner Master File</span>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              }
            </div>

            <!-- Col 2: Covered Properties -->
            <div class="space-y-3">
              <div
                class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider"
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>Managed Property Asset</span>
              </div>
              <div>
                @if (propertiesList().length > 0) {
                  <div class="text-lg font-bold text-slate-900 truncate">
                    {{ propertiesList()[0].name }}
                  </div>
                  <div class="text-xs text-slate-500 mt-1 tabular-nums">
                    <span class="text-slate-400">Code:</span>
                    {{ propertiesList()[0].property_code }} · Unit
                    {{ propertiesList()[0].unit_number }}
                  </div>
                  <div class="text-xs text-slate-600 capitalize mt-0.5">
                    Type: {{ propertiesList()[0].property_type }}
                  </div>
                } @else {
                  <div class="text-sm font-medium text-slate-400 italic">
                    No property asset assigned
                  </div>
                }
              </div>
              @if (propertiesList().length > 0) {
                <div class="pt-2 flex items-center justify-between">
                  <a
                    [routerLink]="['/app/properties', propertiesList()[0].id]"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
                  >
                    <span>View Asset Details</span>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                  @if (propertiesList().length > 1) {
                    <span class="text-[11px] font-semibold text-slate-500">
                      +{{ propertiesList().length - 1 }} more assets
                    </span>
                  }
                </div>
              }
            </div>

            <!-- Col 3: Contract Period -->
            <div class="space-y-3">
              <div
                class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider"
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Contract Validity Term</span>
              </div>
              <div>
                <div
                  class="text-base font-semibold text-slate-900 tabular-nums flex items-baseline gap-2"
                >
                  <span>{{ formatDate(agreement()!.start_date) }}</span>
                  <span class="text-emerald-600 font-bold">→</span>
                  <span>{{ formatDate(agreement()!.end_date) }}</span>
                </div>
                <div class="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>Workflow Status:</span>
                  <span class="font-bold text-slate-900 capitalize">{{
                    formatStatus(agreement()!.status)
                  }}</span>
                </div>
              </div>
              <div class="pt-2 text-xs text-slate-500">
                Payment Frequency:
                <span class="font-semibold text-slate-800"
                  >{{ agreement()!.payment_count || 0 }} cycles ({{
                    agreement()!.payment_frequency || 'Monthly'
                  }})</span
                >
              </div>
            </div>
          </div>

          <!-- FINANCIAL POSITION (TEXT WITH COLORS - NO NESTED CARDS) -->
          <div>
            <div
              class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Commercial Terms & Financial Position</span>
              </div>
              <span class="text-slate-400 font-normal"
                >Currency: {{ agreement()!.currency_code || 'AED' }}</span
              >
            </div>

            <div class="grid grid-cols-2 md:grid-cols-6 gap-6 text-xs">
              <div>
                <div class="text-slate-400 font-medium mb-1">Total Contract Value</div>
                <div
                  class="whitespace-nowrap tabular-nums font-bold tracking-tight text-xl text-slate-900"
                >
                  <span class="text-xs text-slate-400 font-semibold mr-1">AED</span>
                  <span>{{ formatAmount(agreement()!.total_amount) }}</span>
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium mb-1">Total Paid / Disbursed</div>
                <div
                  class="whitespace-nowrap tabular-nums font-bold tracking-tight text-xl text-emerald-600"
                >
                  <span class="text-xs text-emerald-600/70 font-semibold mr-1">AED</span>
                  <span>{{ formatAmount(getPaidTotal(agreement()!.installments)) }}</span>
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium mb-1">Outstanding Balance</div>
                <div
                  class="whitespace-nowrap tabular-nums font-bold tracking-tight text-xl text-amber-600"
                >
                  <span class="text-xs text-amber-600/70 font-semibold mr-1">AED</span>
                  <span>{{ formatAmount(getOutstandingTotal(agreement()!.installments)) }}</span>
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium mb-1">Installment Cycles</div>
                <div class="text-base font-bold text-slate-800 tabular-nums mt-1">
                  {{ agreement()!.payment_count }} cycles
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium mb-1">Frequency</div>
                <div class="text-base font-bold text-slate-800 capitalize mt-1">
                  {{ agreement()!.payment_frequency || 'Monthly' }}
                </div>
              </div>

              <div>
                <div class="text-slate-400 font-medium mb-1">Payment Mode</div>
                <div class="text-base font-bold text-slate-800 capitalize mt-1">
                  {{ (agreement()!.payment_mode || '').replace('_', ' ') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PAYMENT SCHEDULE SECTION -->
        <div class="bg-white rounded-[22px] p-6 lg:p-8 border border-slate-200/90 shadow-xs mb-8">
          <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
                    Payment Schedule
                  </h3>
                  @if (isRefreshingPayments()) {
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 animate-pulse"
                    >
                      <svg
                        class="animate-spin h-3 w-3 text-emerald-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating schedule…
                    </span>
                  }
                </div>
                <p class="text-xs text-slate-500 font-normal mt-0.5">
                  {{ agreement()!.installments?.length || 0 }} scheduled installments ·
                  {{ getPaidCount(agreement()!.installments) }} paid,
                  {{
                    (agreement()!.installments?.length || 0) -
                      getPaidCount(agreement()!.installments)
                  }}
                  remaining
                </p>
              </div>
            </div>
          </div>

          <!-- Schedule KPI Strip (TEXT WITH COLORS - NO NESTED CARD BOXES) -->
          <div
            class="flex flex-wrap items-center gap-6 mb-6 pb-4 border-b border-slate-100 text-xs font-medium"
          >
            <div class="flex items-center gap-2">
              <span class="text-slate-400 uppercase tracking-wider text-[11px] font-semibold"
                >Scheduled Total:</span
              >
              <span class="text-base font-bold text-slate-900 tabular-nums"
                >AED {{ formatAmount(getScheduleTotal(agreement()!.installments)) }}</span
              >
            </div>
            <div class="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-700 uppercase tracking-wider text-[11px] font-semibold"
                >Total Paid:</span
              >
              <span class="text-base font-bold text-emerald-600 tabular-nums"
                >AED {{ formatAmount(getPaidTotal(agreement()!.installments)) }}</span
              >
            </div>
            <div class="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div class="flex items-center gap-2">
              <span class="text-amber-700 uppercase tracking-wider text-[11px] font-semibold"
                >Outstanding Balance:</span
              >
              <span class="text-base font-bold text-amber-600 tabular-nums"
                >AED {{ formatAmount(getOutstandingTotal(agreement()!.installments)) }}</span
              >
            </div>
          </div>

          <!-- Desktop & Tablet Table -->
          <div class="hidden md:block overflow-x-auto border border-slate-200/90 rounded-2xl">
            <table class="w-full text-left text-xs border-collapse">
              <thead
                class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]"
              >
                <tr>
                  <th class="py-3.5 px-4 w-16">Payment</th>
                  <th class="py-3.5 px-4 w-32">Due</th>
                  <th class="py-3.5 px-4">Particulars</th>
                  <th class="py-3.5 px-4 w-28">Method</th>
                  <th class="py-3.5 px-4 w-32 text-right">Scheduled</th>
                  <th class="py-3.5 px-4 w-32 text-right">Paid</th>
                  <th class="py-3.5 px-4 w-32 text-right">Balance</th>
                  <th class="py-3.5 px-4 w-28 text-center">Status</th>
                  <th class="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (item of agreement()!.installments || []; track item.id) {
                  <tr
                    class="hover:bg-slate-50/60 transition-colors"
                    [class.bg-rose-50/30]="item.status === 'defaulted'"
                  >
                    <td class="py-3.5 px-4 font-semibold text-slate-700 tabular-nums">
                      <span class="block">#{{ item.installment_no }}</span
                      ><span class="text-[10px] font-normal text-slate-400">{{
                        item.is_extra ? 'Additional' : 'Rent'
                      }}</span>
                    </td>
                    <td
                      class="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800 tabular-nums"
                    >
                      {{ formatDate(item.due_date) }}
                    </td>
                    <td class="py-3.5 px-4 text-slate-700">
                      {{ item.notes || 'Rent installment' }}
                    </td>
                    <td class="py-3.5 px-4">
                      <span
                        class="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 capitalize"
                        >{{ (item.payment_mode || '').replace('_', ' ') }}</span
                      >
                    </td>
                    <td
                      class="py-3.5 px-4 text-right whitespace-nowrap tabular-nums font-medium text-slate-900"
                    >
                      <span class="text-[11px] text-slate-400 mr-1">AED</span
                      >{{ formatAmount(item.amount) }}
                    </td>
                    <td
                      class="py-3.5 px-4 text-right whitespace-nowrap tabular-nums font-medium text-emerald-700"
                    >
                      <span class="text-[11px] text-slate-400 mr-1">AED</span
                      >{{ formatAmount(item.paid_amount) }}
                    </td>
                    <td
                      class="py-3.5 px-4 text-right whitespace-nowrap tabular-nums font-semibold text-slate-900"
                    >
                      <span class="text-[11px] text-slate-400 mr-1">AED</span
                      >{{ formatAmount(item.balance) }}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                        [ngClass]="installmentBadgeClasses(item.status)"
                      >
                        {{ item.status.replace('_', ' ') }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        @if (isPaidOrVoid(item)) {
                          <button
                            type="button"
                            (click)="openVoucherModal(item)"
                            title="View Receipt Voucher"
                            aria-label="View Receipt Voucher"
                            class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 inline-flex items-center gap-1 font-semibold text-xs transition shadow-2xs cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-3.5 w-3.5 text-emerald-700"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>View Voucher</span>
                            @if (item.receipt?.document_no) {
                              <span
                                class="text-[10px] bg-emerald-100/80 px-1.5 py-0.5 rounded text-emerald-800 font-mono"
                              >
                                ({{ item.receipt!.document_no }})
                              </span>
                            }
                          </button>
                        } @else {
                          <button
                            type="button"
                            [disabled]="installmentProcessingId() === item.id"
                            (click)="
                              item.is_extra
                                ? setInstallmentStatus(item.id, 'paid')
                                : openPaymentModal(item.id)
                            "
                            title="Mark as Paid"
                            aria-label="Mark as Paid"
                            class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 inline-flex items-center justify-center transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-50"
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          @if (item.status !== 'defaulted') {
                            <button
                              type="button"
                              [disabled]="installmentProcessingId() === item.id"
                              (click)="setInstallmentStatus(item.id, 'defaulted')"
                              title="Mark as Defaulted"
                              aria-label="Mark as Defaulted"
                              class="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 inline-flex items-center justify-center transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-rose-50"
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
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                            </button>
                          }
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="p-6 text-center text-slate-500">
                      No payment schedule installments found.
                    </td>
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
                  <span class="font-semibold text-slate-900"
                    >Installment #{{ item.installment_no }}</span
                  >
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                    [ngClass]="installmentBadgeClasses(item.status)"
                  >
                    {{ item.status.replace('_', ' ') }}
                  </span>
                </div>
                <div class="text-slate-600">
                  <div class="font-medium text-slate-900 mb-2">
                    {{ item.notes || 'Rent installment' }}
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      Due:
                      <span class="font-medium text-slate-900 tabular-nums">{{
                        formatDate(item.due_date)
                      }}</span>
                    </div>
                    <div>
                      Mode:
                      <span class="font-medium text-slate-900 capitalize">{{
                        (item.payment_mode || '').replace('_', ' ')
                      }}</span>
                    </div>
                    <div>
                      Scheduled:
                      <span class="font-semibold text-slate-900 tabular-nums"
                        >AED {{ formatAmount(item.amount) }}</span
                      >
                    </div>
                    <div>
                      Balance:
                      <span class="font-semibold text-slate-900 tabular-nums"
                        >AED {{ formatAmount(item.balance) }}</span
                      >
                    </div>
                    <div>
                      Paid:
                      <span class="font-semibold text-emerald-700 tabular-nums"
                        >AED {{ formatAmount(item.paid_amount) }}</span
                      >
                    </div>
                  </div>
                </div>
                <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  @if (isPaidOrVoid(item)) {
                    <button
                      type="button"
                      (click)="openVoucherModal(item)"
                      class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3.5 w-3.5 text-emerald-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>View Voucher</span>
                      @if (item.receipt?.document_no) {
                        <span class="text-[10px] opacity-80 font-mono">
                          ({{ item.receipt!.document_no }})
                        </span>
                      }
                    </button>
                  } @else {
                    <button
                      type="button"
                      [disabled]="installmentProcessingId() === item.id"
                      (click)="
                        item.is_extra
                          ? setInstallmentStatus(item.id, 'paid')
                          : openPaymentModal(item.id)
                      "
                      class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs disabled:opacity-40"
                    >
                      Mark Paid
                    </button>
                    @if (item.status !== 'defaulted') {
                      <button
                        type="button"
                        [disabled]="installmentProcessingId() === item.id"
                        (click)="setInstallmentStatus(item.id, 'defaulted')"
                        class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200/60 text-xs disabled:opacity-40"
                      >
                        Mark Defaulted
                      </button>
                    }
                  }
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
                <h3 class="text-sm font-semibold text-slate-900 tracking-tight mb-2">
                  Additional Terms & Notes
                </h3>
                <p class="text-xs text-slate-600 leading-relaxed italic">
                  {{ agreement()!.notes }}
                </p>
              </div>
            }

            @if ((agreement()!.disputes || []).length > 0) {
              <div class="bg-white rounded-[22px] p-6 border border-slate-200/90 shadow-xs">
                <h3 class="text-sm font-semibold text-slate-900 tracking-tight mb-3">
                  Dispute Log & Resolution Updates
                </h3>
                @for (dispute of agreement()!.disputes || []; track dispute.id) {
                  <div
                    class="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs space-y-1.5 mb-3"
                  >
                    <div class="flex items-center justify-between font-semibold text-amber-950">
                      <span>{{ dispute.subject }}</span>
                      <span
                        class="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 capitalize"
                        >{{ dispute.status }}</span
                      >
                    </div>
                    <p class="text-slate-700">{{ dispute.description }}</p>
                    @if ((dispute.comments || []).length > 0) {
                      <div class="mt-3 pt-3 border-t border-amber-200/70 space-y-2">
                        <div
                          class="text-[10px] font-semibold uppercase tracking-wide text-amber-800"
                        >
                          Updates
                        </div>
                        @for (comment of dispute.comments || []; track $index) {
                          <div
                            class="rounded-lg bg-white/70 border border-amber-100 px-3 py-2 text-slate-700"
                          >
                            <div>{{ comment.comment }}</div>
                            <div class="text-[10px] text-slate-500 mt-1">
                              {{ formatDate(comment.created_at) }}
                            </div>
                          </div>
                        }
                      </div>
                    }
                    <button
                      type="button"
                      class="text-xs font-semibold text-emerald-700 hover:underline pt-1"
                      (click)="openCommentModal(dispute.id)"
                    >
                      + Add Comment
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (paymentModalOpen()) {
          <div
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
          >
            <form
              class="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden bm-modal-content"
              (ngSubmit)="submitPayment()"
            >
              <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 tracking-tight">
                  Record Owner Payment
                </h2>
                <button
                  type="button"
                  (click)="paymentModalOpen.set(false)"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold flex items-center justify-center transition cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <label class="font-semibold text-slate-700"
                  >Amount<input
                    [(ngModel)]="paymentAmount"
                    name="paymentAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    class="bm-input mt-1"
                /></label>
                <label class="font-semibold text-slate-700"
                  >Transaction date<input
                    [(ngModel)]="paymentDate"
                    name="paymentDate"
                    type="date"
                    required
                    class="bm-input mt-1"
                /></label>
                <label class="font-semibold text-slate-700"
                  >Payment mode<select
                    [(ngModel)]="paymentMode"
                    name="paymentMode"
                    (ngModelChange)="updatePaymentRemarks()"
                    class="bm-input mt-1"
                  >
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select></label
                >
                @if (paymentMode === 'cheque') {
                  <label class="font-semibold text-slate-700"
                    >Cheque number<input
                      [(ngModel)]="chequeNo"
                      name="chequeNo"
                      (ngModelChange)="updatePaymentRemarks()"
                      required
                      class="bm-input mt-1" /></label
                  ><label class="font-semibold text-slate-700"
                    >Cheque date<input
                      [(ngModel)]="chequeDate"
                      name="chequeDate"
                      type="date"
                      required
                      class="bm-input mt-1" /></label
                  ><label class="font-semibold text-slate-700"
                    >Bank name<input [(ngModel)]="bankName" name="bankName" class="bm-input mt-1"
                  /></label>
                }
                @if (paymentMode === 'bank_transfer') {
                  <label class="font-semibold text-slate-700"
                    >Bank reference<input
                      [(ngModel)]="bankReference"
                      name="bankReference"
                      (ngModelChange)="updatePaymentRemarks()"
                      required
                      class="bm-input mt-1" /></label
                  ><label class="font-semibold text-slate-700"
                    >Transfer date<input
                      [(ngModel)]="transferDate"
                      name="transferDate"
                      type="date"
                      required
                      class="bm-input mt-1" /></label
                  ><label class="font-semibold text-slate-700"
                    >Bank name<input [(ngModel)]="bankName" name="bankName" class="bm-input mt-1"
                  /></label>
                }
                <label class="font-semibold text-slate-700 md:col-span-2"
                  >Remarks<textarea
                    [(ngModel)]="paymentRemarks"
                    name="paymentRemarks"
                    rows="2"
                    class="bm-input mt-1 !h-auto p-2.5"
                  ></textarea>
                </label>
              </div>
              <div
                class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3"
              >
                <button
                  type="button"
                  (click)="paymentModalOpen.set(false)"
                  class="bm-btn bm-btn-secondary text-xs rounded-xl"
                >
                  Cancel</button
                ><button
                  type="submit"
                  [disabled]="
                    paymentPosting ||
                    paymentAmount <= 0 ||
                    !paymentDate ||
                    (paymentMode === 'cheque' && (!chequeNo || !chequeDate)) ||
                    (paymentMode === 'bank_transfer' && (!bankReference || !transferDate))
                  "
                  class="bm-btn bm-btn-primary text-xs rounded-xl shadow-2xs"
                >
                  {{ paymentPosting ? 'Posting…' : 'Post Payment' }}
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Add Extra Payment Line Modal -->
        @if (paymentLineOpen()) {
          <div
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
          >
            <div
              class="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden bm-modal-content"
            >
              <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 tracking-tight">Add Payment Line</h2>
                <button
                  type="button"
                  (click)="paymentLineOpen.set(false)"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold flex items-center justify-center transition cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Direction</label>
                  <select [(ngModel)]="paymentLine.direction" class="bm-input">
                    <option value="outward">Outward</option>
                    <option value="inward">Inward</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    [(ngModel)]="paymentLine.category"
                    class="bm-input"
                    placeholder="Commission / security"
                  />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Particulars</label>
                  <input
                    [(ngModel)]="paymentLine.particulars"
                    class="bm-input"
                    placeholder="Line description"
                  />
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Amount</label>
                  <input
                    [(ngModel)]="paymentLine.amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="bm-input"
                  />
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
                @if (paymentLine.payment_mode === 'cheque') {
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Cheque Number</label
                    ><input [(ngModel)]="paymentLine.cheque_no" class="bm-input" required />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Cheque Date</label
                    ><input
                      [(ngModel)]="paymentLine.cheque_date"
                      type="date"
                      class="bm-input"
                      required
                    />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Bank Name</label
                    ><input [(ngModel)]="paymentLine.bank_name" class="bm-input" />
                  </div>
                }
                @if (paymentLine.payment_mode === 'bank_transfer') {
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Bank Reference</label
                    ><input [(ngModel)]="paymentLine.bank_reference" class="bm-input" required />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Transfer Date</label
                    ><input
                      [(ngModel)]="paymentLine.transfer_date"
                      type="date"
                      class="bm-input"
                      required
                    />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Bank Name</label
                    ><input [(ngModel)]="paymentLine.bank_name" class="bm-input" />
                  </div>
                }
                <div class="md:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">Terms / Notes</label>
                  <textarea
                    [(ngModel)]="paymentLine.terms"
                    rows="3"
                    class="bm-input !h-auto p-2.5"
                  ></textarea>
                </div>
              </div>
              <div
                class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3"
              >
                <button
                  type="button"
                  (click)="paymentLineOpen.set(false)"
                  class="bm-btn bm-btn-secondary text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="saveExtraPayment()"
                  class="bm-btn bm-btn-primary text-xs rounded-xl shadow-2xs"
                >
                  Save Payment Line
                </button>
              </div>
            </div>
          </div>
        }

        @if (holdModalOpen()) {
          <div
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
          >
            <form
              class="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden bm-modal-content"
              (ngSubmit)="submitHold()"
            >
              <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 tracking-tight">
                  Put Agreement On Hold
                </h2>
                <button
                  type="button"
                  (click)="holdModalOpen.set(false)"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold flex items-center justify-center transition cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div class="p-6">
                <label class="block text-xs font-semibold text-slate-700"
                  >Reason for hold<textarea
                    [(ngModel)]="holdReason"
                    name="holdReason"
                    required
                    rows="4"
                    class="bm-input mt-1 !h-auto p-2.5"
                    placeholder="Explain why this agreement is being put on hold"
                  ></textarea>
                </label>
              </div>
              <div
                class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3"
              >
                <button
                  type="button"
                  (click)="holdModalOpen.set(false)"
                  class="bm-btn bm-btn-secondary text-xs rounded-xl"
                >
                  Cancel</button
                ><button
                  type="submit"
                  [disabled]="!holdReason.trim() || isActioning()"
                  class="bm-btn bm-btn-primary text-xs rounded-xl shadow-2xs"
                >
                  {{ isActioning() ? 'Saving…' : 'Put On Hold' }}
                </button>
              </div>
            </form>
          </div>
        }

        @if (extendModalOpen()) {
          <div
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
          >
            <form
              class="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden bm-modal-content"
              (ngSubmit)="submitExtend()"
            >
              <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 tracking-tight">
                  Extend Owner Agreement
                </h2>
                <button
                  type="button"
                  (click)="extendModalOpen.set(false)"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold flex items-center justify-center transition cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div class="p-6 space-y-4">
                <label class="block text-xs font-semibold text-slate-700"
                  >New end date<input
                    [(ngModel)]="newEndDate"
                    name="newEndDate"
                    type="date"
                    required
                    class="bm-input mt-1" /></label
                ><label class="block text-xs font-semibold text-slate-700"
                  >Reason<textarea
                    [(ngModel)]="extensionReason"
                    name="extensionReason"
                    required
                    rows="3"
                    class="bm-input mt-1 !h-auto p-2.5"
                  ></textarea>
                </label>
              </div>
              <div
                class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3"
              >
                <button
                  type="button"
                  (click)="extendModalOpen.set(false)"
                  class="bm-btn bm-btn-secondary text-xs rounded-xl"
                >
                  Cancel</button
                ><button
                  type="submit"
                  [disabled]="!newEndDate || !extensionReason.trim() || isActioning()"
                  class="bm-btn bm-btn-primary text-xs rounded-xl shadow-2xs"
                >
                  Extend
                </button>
              </div>
            </form>
          </div>
        }

        @if (renewModalOpen()) {
          <div
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
          >
            <form
              class="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden bm-modal-content"
              (ngSubmit)="submitRenew()"
            >
              <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 tracking-tight">
                  Renew Owner Agreement
                </h2>
                <button
                  type="button"
                  (click)="renewModalOpen.set(false)"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold flex items-center justify-center transition cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div class="p-6 grid grid-cols-2 gap-4">
                <label class="block text-xs font-semibold text-slate-700"
                  >Start date<input
                    [(ngModel)]="renewStartDate"
                    name="renewStartDate"
                    type="date"
                    required
                    class="bm-input mt-1" /></label
                ><label class="block text-xs font-semibold text-slate-700"
                  >End date<input
                    [(ngModel)]="renewEndDate"
                    name="renewEndDate"
                    type="date"
                    required
                    class="bm-input mt-1"
                /></label>
              </div>
              <div
                class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3"
              >
                <button
                  type="button"
                  (click)="renewModalOpen.set(false)"
                  class="bm-btn bm-btn-secondary text-xs rounded-xl"
                >
                  Cancel</button
                ><button
                  type="submit"
                  [disabled]="!renewStartDate || !renewEndDate || isActioning()"
                  class="bm-btn bm-btn-primary text-xs rounded-xl shadow-2xs"
                >
                  Create Renewal
                </button>
              </div>
            </form>
          </div>
        }

        @if (disputeModalOpen()) {
          <div
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
          >
            <form
              class="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden bm-modal-content"
              (ngSubmit)="submitDispute()"
            >
              <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 tracking-tight">Raise Dispute</h2>
                <button
                  type="button"
                  (click)="disputeModalOpen.set(false)"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold flex items-center justify-center transition cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div class="p-6 space-y-4">
                <label class="block text-xs font-semibold text-slate-700"
                  >Subject<input
                    [(ngModel)]="disputeSubject"
                    name="disputeSubject"
                    required
                    class="bm-input mt-1"
                    placeholder="Dispute subject" /></label
                ><label class="block text-xs font-semibold text-slate-700"
                  >Details<textarea
                    [(ngModel)]="disputeDescription"
                    name="disputeDescription"
                    required
                    rows="4"
                    class="bm-input mt-1 !h-auto p-2.5"
                    placeholder="Describe the dispute"
                  ></textarea>
                </label>
              </div>
              <div
                class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3"
              >
                <button
                  type="button"
                  (click)="disputeModalOpen.set(false)"
                  class="bm-btn bm-btn-secondary text-xs rounded-xl"
                >
                  Cancel</button
                ><button
                  type="submit"
                  [disabled]="!disputeSubject.trim() || !disputeDescription.trim()"
                  class="bm-btn bm-btn-primary text-xs rounded-xl shadow-2xs"
                >
                  Raise Dispute
                </button>
              </div>
            </form>
          </div>
        }

        @if (commentModalOpen()) {
          <div
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 bm-modal-backdrop"
          >
            <form
              class="bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden bm-modal-content"
              (ngSubmit)="submitComment()"
            >
              <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 tracking-tight">
                  Add Dispute Comment
                </h2>
                <button
                  type="button"
                  (click)="commentModalOpen.set(false)"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-lg font-bold flex items-center justify-center transition cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div class="p-6">
                <label class="block text-xs font-semibold text-slate-700"
                  >Update<textarea
                    [(ngModel)]="disputeComment"
                    name="disputeComment"
                    required
                    rows="4"
                    class="bm-input mt-1 !h-auto p-2.5"
                    placeholder="Record the latest update"
                  ></textarea>
                </label>
              </div>
              <div
                class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3"
              >
                <button
                  type="button"
                  (click)="commentModalOpen.set(false)"
                  class="bm-btn bm-btn-secondary text-xs rounded-xl"
                >
                  Cancel</button
                ><button
                  type="submit"
                  [disabled]="!disputeComment.trim()"
                  class="bm-btn bm-btn-primary text-xs rounded-xl shadow-2xs"
                >
                  Add Comment
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Terminate Confirmation Dialog -->
        <bm-confirm-dialog
          [isOpen]="confirmTerminateDialog()"
          title="Terminate Owner Agreement"
          message="Are you sure you want to terminate this owner management agreement? This action cannot be undone."
          confirmLabel="Terminate Agreement"
          [isDanger]="true"
          [isSubmitting]="isActioning()"
          (confirm)="executeTerminate()"
          (cancel)="confirmTerminateDialog.set(false)"
        ></bm-confirm-dialog>

        <!-- Receipt / Cheque Voucher View Modal -->
        <bm-receipt-cheque-modal
          [isOpen]="selectedVoucherTransaction() !== null"
          [transaction]="selectedVoucherTransaction()"
          (close)="selectedVoucherTransaction.set(null)"
        ></bm-receipt-cheque-modal>
      </div>
      <bm-agreement-print-sheet
        [agreement]="agreement()!"
        [isOwnerAgreement]="true"
        [firstPartyName]="ownerName()"
        firstPartyRole="Owner / المالك"
        secondPartyName="Baithul Madeena Real Estate"
        secondPartyRole="Property Management Company / شركة إدارة العقارات"
        [properties]="propertiesList()"
      ></bm-agreement-print-sheet>
    }
  `,
})
export class OwnerAgreementDetailComponent implements OnInit {
  private api = inject(OwnerAgreementsApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  agreement = signal<OwnerAgreement | null>(null);
  selectedVoucherTransaction = signal<AccountTransaction | null>(null);
  isLoading = signal(true);
  isRefreshingPayments = signal(false);
  isActioning = signal(false);
  showMoreMenu = signal(false);
  installmentProcessingId = signal<number | string | null>(null);
  paymentModalOpen = signal(false);
  paymentPosting = false;
  paymentItemId = 0;
  paymentAmount = 0;
  paymentDate = new Date().toLocaleDateString('en-CA');
  paymentMode: 'cash' | 'cheque' | 'bank_transfer' = 'cash';
  paymentRemarks = '';
  chequeNo = '';
  chequeDate = new Date().toLocaleDateString('en-CA');
  bankName = '';
  bankReference = '';
  transferDate = new Date().toLocaleDateString('en-CA');
  paymentLineOpen = signal(false);
  holdModalOpen = signal(false);
  extendModalOpen = signal(false);
  renewModalOpen = signal(false);
  disputeModalOpen = signal(false);
  commentModalOpen = signal(false);
  commentDisputeId: number | null = null;
  holdReason = '';
  newEndDate = '';
  extensionReason = '';
  renewStartDate = '';
  renewEndDate = '';
  disputeSubject = '';
  disputeDescription = '';
  disputeComment = '';
  paymentLine = {
    direction: 'outward' as 'inward' | 'outward',
    category: '',
    particulars: '',
    amount: 0,
    due_date: new Date().toLocaleDateString('en-CA'),
    payment_mode: 'cash' as 'cash' | 'cheque' | 'bank_transfer',
    cheque_no: '',
    cheque_date: new Date().toLocaleDateString('en-CA'),
    bank_name: '',
    bank_reference: '',
    transfer_date: new Date().toLocaleDateString('en-CA'),
    terms: '',
  };
  error = signal<string | null>(null);

  confirmTerminateDialog = signal(false);

  ngOnInit(): void {
    this.loadAgreement();
  }

  printAgreement(): void {
    window.print();
  }

  loadAgreement(silent = false): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    if (!silent && !this.agreement()) {
      this.isLoading.set(true);
    } else {
      this.isRefreshingPayments.set(true);
    }
    this.error.set(null);

    this.api.getAgreement(id).subscribe({
      next: (res) => {
        this.agreement.set(res.data);
        this.isLoading.set(false);
        this.isRefreshingPayments.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Owner agreement record not found.');
        this.isLoading.set(false);
        this.isRefreshingPayments.set(false);
      },
    });
  }

  ownerCustomer(): any {
    const a = this.agreement();
    if (!a || !a.owner) return null;
    if ('data' in a.owner && a.owner.data) return a.owner.data;
    if ('id' in a.owner) return a.owner;
    return null;
  }

  ownerName(): string {
    const oc = this.ownerCustomer();
    return oc ? oc.display_name : '—';
  }

  propertiesList(): any[] {
    const a = this.agreement();
    if (!a || !a.properties) return [];
    if (Array.isArray(a.properties)) return a.properties;
    if ('data' in a.properties && Array.isArray(a.properties.data)) return a.properties.data;
    return [];
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
        this.error.set(err.message || 'Failed to terminate agreement.');
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
    const request = item.is_extra
      ? this.api.updateAdditionalPaymentStatus(agreement.id, paymentId, status)
      : this.api.updateInstallmentStatus(agreement.id, paymentId, status);
    request.subscribe({
      next: () => {
        this.installmentProcessingId.set(null);
        this.loadAgreement(true);
      },
      error: (err) => {
        this.installmentProcessingId.set(null);
        this.error.set(err.message || 'Unable to update installment.');
      },
    });
  }

  openPaymentModal(id: number | string): void {
    const item = this.agreement()?.installments?.find((entry) => entry.id === id);
    if (!item || item.is_extra || item.status === 'paid') return;
    this.paymentItemId = Number(id);
    this.paymentAmount = Number(item.balance);
    this.paymentDate = new Date().toLocaleDateString('en-CA');
    this.chequeDate = this.paymentDate;
    this.transferDate = this.paymentDate;
    this.paymentMode = 'cash';
    this.paymentRemarks = '';
    this.chequeNo = '';
    this.bankName = '';
    this.bankReference = '';
    this.paymentModalOpen.set(true);
    this.updatePaymentRemarks();
  }

  updatePaymentRemarks(): void {
    if (
      this.paymentRemarks &&
      !this.paymentRemarks.startsWith('Cash Payment') &&
      !this.paymentRemarks.startsWith('Cheque ') &&
      !this.paymentRemarks.startsWith('Bank transfer ')
    )
      return;
    this.paymentRemarks =
      this.paymentMode === 'cheque'
        ? `Cheque ${this.chequeNo}`
        : this.paymentMode === 'bank_transfer'
          ? `Bank transfer ${this.bankReference}`
          : 'Cash Payment';
  }

  submitPayment(): void {
    const agreement = this.agreement();
    if (!agreement || this.paymentPosting) return;
    this.paymentPosting = true;
    const key = globalThis.crypto.randomUUID();
    this.api
      .postPayment(
        agreement.id,
        {
          installment_id: this.paymentItemId,
          amount: this.paymentAmount,
          payment_mode: this.paymentMode,
          payment_date: this.paymentDate,
          remarks: this.paymentRemarks,
          cheque_no: this.chequeNo || undefined,
          cheque_date: this.chequeDate || undefined,
          bank_name: this.bankName || undefined,
          bank_reference: this.bankReference || undefined,
          transfer_date: this.transferDate || undefined,
        },
        key,
      )
      .subscribe({
        next: () => {
          this.paymentPosting = false;
          this.paymentModalOpen.set(false);
          this.loadAgreement(true);
        },
        error: (err) => {
          this.paymentPosting = false;
          this.error.set(err.message || 'Unable to post payment.');
        },
      });
  }

  openHoldModal(): void {
    this.holdReason = '';
    this.holdModalOpen.set(true);
  }

  submitHold(): void {
    const reason = this.holdReason.trim();
    if (!reason) return;
    this.holdModalOpen.set(false);
    this.transition('on_hold', reason);
  }

  openExtendModal(): void {
    this.newEndDate = '';
    this.extensionReason = '';
    this.extendModalOpen.set(true);
  }
  submitExtend(): void {
    const id = this.agreement()?.id;
    if (!id || !this.newEndDate || !this.extensionReason.trim()) return;
    this.isActioning.set(true);
    this.api
      .lifecycle(id, 'extend', {
        new_end_date: this.newEndDate,
        reason: this.extensionReason.trim(),
      })
      .subscribe({
        next: (res) => {
          this.agreement.set(res.data);
          this.isActioning.set(false);
          this.extendModalOpen.set(false);
        },
        error: (err) => {
          this.isActioning.set(false);
          this.error.set(err.message || 'Unable to extend agreement.');
        },
      });
  }
  openRenewModal(): void {
    this.renewStartDate = '';
    this.renewEndDate = '';
    this.renewModalOpen.set(true);
  }
  submitRenew(): void {
    const id = this.agreement()?.id;
    if (!id || !this.renewStartDate || !this.renewEndDate) return;
    this.isActioning.set(true);
    this.api
      .lifecycle(id, 'renew', { start_date: this.renewStartDate, end_date: this.renewEndDate })
      .subscribe({
        next: (res) => {
          this.isActioning.set(false);
          this.renewModalOpen.set(false);
          this.router.navigate(['/app/owner-agreements', res.data.id]);
        },
        error: (err) => {
          this.isActioning.set(false);
          this.error.set(err.message || 'Unable to renew agreement.');
        },
      });
  }

  transition(status: 'pending_approval' | 'approved' | 'commenced' | 'on_hold', reason = ''): void {
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
        this.error.set(err.message || 'Unable to transition agreement.');
      },
    });
  }

  openDisputeModal(): void {
    this.disputeSubject = '';
    this.disputeDescription = '';
    this.disputeModalOpen.set(true);
  }

  submitDispute(): void {
    const id = this.agreement()?.id;
    const subject = this.disputeSubject.trim();
    const description = this.disputeDescription.trim();
    if (!id || !subject || !description) return;
    this.api.raiseDispute(id, subject, description).subscribe({
      next: () => {
        this.disputeModalOpen.set(false);
        this.loadAgreement(true);
      },
      error: (err) => this.error.set(err.message || 'Unable to raise dispute.'),
    });
  }

  openCommentModal(id: number): void {
    this.commentDisputeId = id;
    this.disputeComment = '';
    this.commentModalOpen.set(true);
  }

  submitComment(): void {
    const id = this.commentDisputeId;
    const comment = this.disputeComment.trim();
    if (!id || !comment) return;
    this.api.addDisputeComment(id, comment).subscribe({
      next: () => {
        this.commentModalOpen.set(false);
        this.loadAgreement(true);
      },
      error: (err) => this.error.set(err.message || 'Unable to add comment.'),
    });
  }

  addExtraPayment(): void {
    this.paymentLineOpen.set(true);
  }

  saveExtraPayment(): void {
    const id = this.agreement()?.id;
    if (
      !id ||
      !this.paymentLine.category ||
      !this.paymentLine.particulars ||
      this.paymentLine.amount <= 0 ||
      !this.paymentLine.due_date
    )
      return;
    this.api.addAdditionalPayment(id, this.paymentLine).subscribe({
      next: () => {
        this.paymentLineOpen.set(false);
        this.loadAgreement(true);
      },
      error: (err) => this.error.set(err.message || 'Unable to add payment line.'),
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

  getScheduleTotal(installments?: AgreementInstallment[]): number {
    return (installments || []).reduce((total, item) => total + Number(item.amount || 0), 0);
  }

  getOutstandingTotal(installments?: AgreementInstallment[]): number {
    if (!installments || !installments.length) return 0;
    return installments.reduce((sum, item) => sum + Number(item.balance || 0), 0);
  }

  getPaidCount(installments?: AgreementInstallment[]): number {
    if (!installments || !installments.length) return 0;
    return installments.filter((item) => item.status === 'paid').length;
  }

  isPaidOrVoid(item: AgreementInstallment): boolean {
    if (!item) return false;
    const st = String(item.status || '').toLowerCase();
    return (
      st === 'paid' ||
      st === 'void' ||
      st === 'voided' ||
      st === 'completed' ||
      st === 'cleared' ||
      st === 'settled' ||
      item.receipt != null ||
      (Number(item.paid_amount || 0) > 0 && Number(item.balance || 0) === 0)
    );
  }

  receiptRoute(direction: 'inward' | 'outward'): string {
    return direction === 'inward' ? '/app/accounts/inward' : '/app/accounts/outward';
  }

  openVoucherModal(item: AgreementInstallment): void {
    const agr = this.agreement();
    if (!agr || !item) return;
    const partyName = this.ownerName();
    const customerCode = this.ownerCustomer()?.customer_code || '';

    const receiptObj = item.receipt || (item as any).payment_receipt || null;
    const docNo =
      receiptObj?.document_no ||
      (item as any).document_no ||
      `VCH-${agr.agreement_no}-${item.installment_no || 1}`;
    const amountVal =
      item.paid_amount && Number(item.paid_amount) > 0 ? item.paid_amount : item.amount;

    const tx: AccountTransaction = {
      id: typeof item.id === 'number' ? item.id : 1,
      document_no: docNo,
      direction: item.direction || 'outward',
      transaction_date: receiptObj?.created_at
        ? receiptObj.created_at.slice(0, 10)
        : receiptObj?.transaction_date || item.due_date || new Date().toISOString().slice(0, 10),
      payment_mode: item.payment_mode || agr.payment_mode || 'cash',
      amount: String(amountVal || 0),
      remarks:
        item.notes || `Installment #${item.installment_no} for Owner Agreement ${agr.agreement_no}`,
      cheque_no: (receiptObj as any)?.cheque_no || (item as any).cheque_no || null,
      cheque_date: (receiptObj as any)?.cheque_date || (item as any).cheque_date || null,
      bank_name: (receiptObj as any)?.bank_name || (item as any).bank_name || null,
      bank_reference: (receiptObj as any)?.bank_reference || (item as any).bank_reference || null,
      transfer_date: (receiptObj as any)?.transfer_date || (item as any).transfer_date || null,
      status:
        (receiptObj as any)?.status === 'void' ||
        (receiptObj as any)?.status === 'voided' ||
        item.status === 'void' ||
        item.status === 'voided'
          ? 'void'
          : 'posted',
      voided_at: (receiptObj as any)?.voided_at || (item as any).voided_at || null,
      void_reason: (receiptObj as any)?.void_reason || (item as any).void_reason || null,
      party: {
        id: 0,
        display_name: partyName,
        customer_code: customerCode,
      },
    };
    this.selectedVoucherTransaction.set(tx);
  }
}
