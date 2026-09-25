import { Component, OnInit, inject, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { CustomersApiService } from '../../core/api/customers-api.service';
import { Customer, CustomerProfile } from '../../shared/models/customer.models';

@Component({
  selector: 'bm-customer-detail',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterLink,
    BmStatusBadgeComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
  ],
  template: `
    <div class="max-w-[1740px] mx-auto space-y-6 font-sans text-[#0F172A]">
      @if (isLoading()) {
        <bm-loading-state type="detail"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="loadCustomer()"></bm-error-state>
      } @else if (customer()) {
        <!-- TOP BREADCRUMB & HEADER ACTIONS -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <a
              [routerLink]="backRoute()"
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition mb-1"
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
              Back to {{ isOwner() ? 'Owners' : isTenant() ? 'Tenants' : 'Customers' }}
            </a>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                {{ customer()!.display_name }}
              </h1>
              <bm-status-badge [status]="customer()!.status || 'active'"></bm-status-badge>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <a [routerLink]="backRoute()" class="bm-btn bm-btn-secondary text-xs"> Back to List </a>
            <a
              [routerLink]="['/app/customers', customer()!.id, 'edit']"
              class="bm-btn bm-btn-primary text-xs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profile
            </a>
          </div>
        </div>

        <!-- EDITORIAL BENTO HERO PROFILE CARD -->
        <div
          class="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/70 p-6 sm:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] relative overflow-hidden"
        >
          <!-- Background Decorative Ambient Glow -->
          <div
            class="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none bg-gradient-to-l from-emerald-500/5 to-transparent"
          ></div>

          <div
            class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10"
          >
            <!-- Avatar & Basic Identity -->
            <div class="flex items-center gap-5">
              <div
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border border-emerald-500/30 shrink-0 select-none"
              >
                {{ getInitials(customer()!.display_name) }}
              </div>

              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md uppercase tracking-wider"
                  >
                    {{
                      customer()!.customer_type === 'organization'
                        ? 'Corporate Account'
                        : 'Individual Account'
                    }}
                  </span>
                  <span
                    class="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-md font-mono"
                  >
                    Code: {{ customer()!.customer_code }}
                  </span>
                </div>
                <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {{ customer()!.legal_name || customer()!.display_name }}
                </h2>
                <div class="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                  @for (role of customer()!.roles || []; track role) {
                    <span
                      class="inline-flex items-center gap-1 font-semibold text-slate-700 capitalize"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {{
                        role === 'owner'
                          ? 'Property Owner'
                          : role === 'tenant'
                            ? 'Leasing Tenant'
                            : role
                      }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Primary Quick Contact Pills -->
            <div
              class="flex flex-wrap items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/80"
            >
              @if (customer()!.phone) {
                <a
                  [href]="'tel:' + customer()!.phone"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition"
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>{{ customer()!.phone }}</span>
                </a>
              }
              @if (customer()!.email) {
                <a
                  [href]="'mailto:' + customer()!.email"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{{ customer()!.email }}</span>
                </a>
              }
              <div
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span
                  >{{ customer()!.city || 'Dubai' }}, {{ customer()!.country_code || 'AE' }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- QUICK METRICS BENTO STRIP -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >Active Contracts</span
            >
            <div
              class="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1 flex items-baseline gap-2"
            >
              <span>{{ allAgreements().length }}</span>
              <span class="text-xs font-semibold text-emerald-700">Agreements</span>
            </div>
          </div>

          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >Linked Properties</span
            >
            <div
              class="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1 flex items-baseline gap-2"
            >
              <span>{{ profile()?.properties?.length || 0 }}</span>
              <span class="text-xs font-semibold text-blue-700">Units</span>
            </div>
          </div>

          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >Total Transactions</span
            >
            <div
              class="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1 flex items-baseline gap-2"
            >
              <span>{{ profile()?.transactions?.data?.length || 0 }}</span>
              <span class="text-xs font-semibold text-amber-700">Records</span>
            </div>
          </div>

          <div
            class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition"
          >
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >Account Status</span
            >
            <div
              class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2"
            >
              <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="capitalize">{{ customer()!.status || 'Active' }}</span>
            </div>
          </div>
        </div>

        <!-- MAIN BENTO GRID CONTENT (2 Columns) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- LEFT COLUMN (Col 8): Linked Properties, Agreements & Financial Ledger -->
          <div class="lg:col-span-8 space-y-6">
            <!-- BENTO CARD 1: LINKED PROPERTIES -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m-5 0V11m0 0V9a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-slate-900">
                      {{ isOwner() ? 'Owned Properties' : 'Leased Properties' }}
                    </h3>
                    <p class="text-xs text-slate-500">
                      Real estate assets associated with this profile
                    </p>
                  </div>
                </div>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700"
                >
                  {{ profile()?.properties?.length || 0 }} Units
                </span>
              </div>

              @if (profile()?.properties?.length) {
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr
                        class="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold"
                      >
                        <th class="py-2.5 px-3">Property Code</th>
                        <th class="py-2.5 px-3">Name / Building</th>
                        <th class="py-2.5 px-3">Unit Number</th>
                        <th class="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      @for (property of profile()!.properties; track property.id) {
                        <tr class="hover:bg-slate-50/80 transition-colors">
                          <td class="py-3 px-3 font-semibold text-emerald-800">
                            <a
                              [routerLink]="['/app/properties', property.id]"
                              class="hover:underline flex items-center gap-1"
                            >
                              <span>{{ property.property_code }}</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-3.5 w-3.5 opacity-60"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </td>
                          <td class="py-3 px-3 text-slate-900 font-medium">
                            {{ property.name || property.building_name || '—' }}
                          </td>
                          <td class="py-3 px-3 text-slate-700 tabular-nums">
                            {{ property.unit_number || '—' }}
                          </td>
                          <td class="py-3 px-3">
                            <bm-status-badge
                              [status]="property.status || 'active'"
                            ></bm-status-badge>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div
                  class="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200"
                >
                  <p class="text-xs text-slate-500 font-medium">
                    No properties linked to this profile yet.
                  </p>
                </div>
              }
            </div>

            <!-- BENTO CARD 2: CONTRACTS & AGREEMENTS -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-3">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Agreements & Contracts</h3>
                    <p class="text-xs text-slate-500">Legal lease and management contracts</p>
                  </div>
                </div>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60"
                >
                  {{ allAgreements().length }} Active
                </span>
              </div>

              @if (allAgreements().length) {
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr
                        class="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold"
                      >
                        <th class="py-2.5 px-3">Type</th>
                        <th class="py-2.5 px-3">Agreement No</th>
                        <th class="py-2.5 px-3">Period Range</th>
                        <th class="py-2.5 px-3">Status</th>
                        <th class="py-2.5 px-3 text-right">Contract Amount</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      @for (agreement of allAgreements(); track agreement.type + agreement.id) {
                        <tr class="hover:bg-slate-50/80 transition-colors">
                          <td class="py-3 px-3">
                            <span
                              class="capitalize text-xs font-semibold px-2 py-0.5 rounded"
                              [class.bg-emerald-50]="agreement.type === 'owner'"
                              [class.text-emerald-700]="agreement.type === 'owner'"
                              [class.bg-blue-50]="agreement.type === 'tenant'"
                              [class.text-blue-700]="agreement.type === 'tenant'"
                            >
                              {{ agreement.type }}
                            </span>
                          </td>
                          <td class="py-3 px-3 font-semibold text-emerald-800">
                            <a
                              [routerLink]="
                                agreement.type === 'owner'
                                  ? ['/app/owner-agreements', agreement.id]
                                  : ['/app/tenant-agreements', agreement.id]
                              "
                              class="hover:underline flex items-center gap-1"
                            >
                              <span>{{ agreement.agreement_no }}</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-3.5 w-3.5 opacity-60"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </td>
                          <td class="py-3 px-3 text-slate-700 tabular-nums">
                            {{ agreement.start_date }} – {{ agreement.end_date }}
                          </td>
                          <td class="py-3 px-3">
                            <bm-status-badge [status]="agreement.status"></bm-status-badge>
                          </td>
                          <td class="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                            <dirham-symbol
                              size="0.85em"
                              weight="bold"
                              class="mr-1 text-slate-500 select-none"
                            ></dirham-symbol>
                            <span>{{ formatMoney(agreement.total_amount) }}</span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div
                  class="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200"
                >
                  <p class="text-xs text-slate-500 font-medium">
                    No contracts or agreements found.
                  </p>
                </div>
              }
            </div>

            <!-- BENTO CARD 3: FINANCIAL TRANSACTIONS LEDGER -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0"
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-slate-900">Transaction History</h3>
                    <p class="text-xs text-slate-500">Financial receipts and payment audit log</p>
                  </div>
                </div>
              </div>

              @if (profile()?.financial_restricted) {
                <div class="p-6 text-center bg-amber-50/60 rounded-xl border border-amber-200/60">
                  <p class="text-xs text-amber-800 font-medium">
                    Financial transaction history requires Accounts permission.
                  </p>
                </div>
              } @else if (profile()?.transactions?.data?.length) {
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr
                        class="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold"
                      >
                        <th class="py-2.5 px-3">Date</th>
                        <th class="py-2.5 px-3">Document No</th>
                        <th class="py-2.5 px-3">Payment Mode</th>
                        <th class="py-2.5 px-3">Agreement</th>
                        <th class="py-2.5 px-3 text-right">Amount</th>
                        <th class="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      @for (transaction of profile()!.transactions.data; track transaction.id) {
                        <tr class="hover:bg-slate-50/80 transition-colors">
                          <td class="py-3 px-3 text-slate-700 tabular-nums">
                            {{ transaction.transaction_date }}
                          </td>
                          <td class="py-3 px-3 font-semibold text-slate-900">
                            {{ transaction.document_no }}
                          </td>
                          <td class="py-3 px-3 capitalize text-slate-700">
                            {{ transaction.payment_mode.replace('_', ' ') }}
                          </td>
                          <td class="py-3 px-3 text-slate-600">
                            {{ transaction.agreement_numbers.join(', ') || '—' }}
                          </td>
                          <td class="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                            <dirham-symbol
                              size="0.85em"
                              weight="bold"
                              class="mr-1 text-slate-500 select-none"
                            ></dirham-symbol>
                            <span>{{ formatMoney(transaction.amount) }}</span>
                          </td>
                          <td class="py-3 px-3">
                            <bm-status-badge [status]="transaction.status"></bm-status-badge>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                @if (profile()!.transactions.truncated) {
                  <p class="text-[11px] text-slate-400 mt-2 font-medium">
                    Showing the latest 100 transactions.
                  </p>
                }
              } @else {
                <div
                  class="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200"
                >
                  <p class="text-xs text-slate-500 font-medium">
                    No recorded transactions for this profile.
                  </p>
                </div>
              }
            </div>
          </div>

          <!-- RIGHT COLUMN (Col 4): Master Identity & Contact Information -->
          <div class="lg:col-span-4 space-y-6">
            <!-- MASTER IDENTITY CARD -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <h3
                class="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Master Record Info</span>
                <span class="text-xs text-slate-400 font-mono font-normal"
                  >ID: #{{ customer()!.id }}</span
                >
              </h3>

              <div class="space-y-3.5 text-xs">
                <div>
                  <span class="text-slate-400 font-medium block">Customer Type</span>
                  <div class="mt-1">
                    <bm-status-badge [status]="customer()!.customer_type"></bm-status-badge>
                  </div>
                </div>

                <div>
                  <span class="text-slate-400 font-medium block">Official Legal Name</span>
                  <span class="font-semibold text-slate-900 mt-1 block">
                    {{ customer()!.legal_name || customer()!.display_name }}
                  </span>
                </div>

                <div>
                  <span class="text-slate-400 font-medium block">Identity / Registration No</span>
                  <span class="font-bold text-slate-900 mt-1 block font-mono">
                    {{ customer()!.identity_no || customer()!.company_registration_no || '—' }}
                  </span>
                </div>

                <div>
                  <span class="text-slate-400 font-medium block">TRN Tax Registration</span>
                  <span class="font-semibold text-slate-900 mt-1 block font-mono">
                    {{ customer()!.tax_registration_no || '—' }}
                  </span>
                </div>

                <div class="pt-2 border-t border-slate-100">
                  <span class="text-slate-400 font-medium block mb-1.5">Assigned Roles</span>
                  <div class="flex gap-1.5 flex-wrap">
                    @for (r of customer()!.roles || []; track r) {
                      <bm-status-badge [status]="r"></bm-status-badge>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- ADDRESS & LOCATION CARD -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <h3 class="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Address & Location
              </h3>

              <div class="text-xs space-y-2 text-slate-700 font-medium leading-relaxed">
                <div class="text-slate-900 font-semibold">
                  {{ customer()!.address_line_1 || 'No street address provided.' }}
                </div>
                @if (customer()!.address_line_2) {
                  <div>{{ customer()!.address_line_2 }}</div>
                }
                <div
                  class="pt-2 border-t border-slate-100 flex items-center gap-2 text-slate-600 font-semibold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-emerald-600 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  <span>
                    {{ customer()!.city || '' }}
                    {{ customer()!.state_or_emirate ? ', ' + customer()!.state_or_emirate : '' }}
                    {{ customer()!.country_code ? ' (' + customer()!.country_code + ')' : '' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- NOTES CARD -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
              <h3 class="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Internal Notes
              </h3>
              <p
                class="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3.5 rounded-xl border border-slate-100"
              >
                {{ customer()!.notes || 'No additional notes recorded.' }}
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CustomerDetailComponent implements OnInit {
  private api = inject(CustomersApiService);
  private route = inject(ActivatedRoute);

  customer = signal<Customer | null>(null);
  profile = signal<CustomerProfile | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  isOwner = computed(() => this.customer()?.roles?.includes('owner') ?? false);
  isTenant = computed(() => this.customer()?.roles?.includes('tenant') ?? false);

  backRoute = computed(() => {
    if (this.isOwner()) return '/app/customers/owners';
    if (this.isTenant()) return '/app/customers/tenants';
    return '/app/customers';
  });

  allAgreements = computed(() => [
    ...(this.profile()?.agreements?.owner || []).map((agreement) => ({
      ...agreement,
      type: 'owner' as const,
    })),
    ...(this.profile()?.agreements?.tenant || []).map((agreement) => ({
      ...agreement,
      type: 'tenant' as const,
    })),
  ]);

  ngOnInit(): void {
    this.loadCustomer();
  }

  loadCustomer(silent = false): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    if (!silent && !this.customer()) {
      this.isLoading.set(true);
    }
    this.error.set(null);

    this.api.getCustomerProfile(id).subscribe({
      next: (res) => {
        this.customer.set(res.data.customer);
        this.profile.set(res.data.profile);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Customer not found.');
        this.isLoading.set(false);
      },
    });
  }

  getInitials(name?: string | null): string {
    if (!name || name.trim() === '') return 'CU';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  formatMoney(val: string | number | undefined | null): string {
    const num = Number(val || 0);
    return num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
