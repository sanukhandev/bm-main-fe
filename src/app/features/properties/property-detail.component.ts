import { Component, OnInit, inject, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { Property, PropertyProfile } from '../../shared/models/property.models';
import { formatUaeDate } from '../../shared/utils/uae-formatters';

@Component({
  selector: 'bm-property-detail',
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
    <div class="max-w-[1740px] mx-auto space-y-4 font-sans text-slate-900 pb-10 px-4 sm:px-6">
      @if (isLoading()) {
        <bm-loading-state type="detail"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="loadProperty()"></bm-error-state>
      } @else if (property()) {
        <!-- TOP BREADCRUMB & HEADER ACTIONS -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3"
        >
          <div class="flex items-center gap-3 flex-wrap">
            <a
              routerLink="/app/properties"
              class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
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
              <span>Portfolio</span>
            </a>
            <span class="text-slate-300">/</span>
            <h1
              class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2"
            >
              <span>{{ property()!.name }}</span>
            </h1>
            <span
              class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200"
            >
              {{ property()!.property_code }}
            </span>
            <bm-status-badge [status]="property()!.property_type"></bm-status-badge>
            <bm-status-badge [status]="property()!.status"></bm-status-badge>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <a routerLink="/app/properties" class="bm-btn bm-btn-secondary text-xs py-1.5 px-3">
              Back
            </a>

            <a
              [routerLink]="['/app/properties', property()!.id, 'edit']"
              class="bm-btn bm-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit Asset</span>
            </a>

            @if (profile()?.actions?.can_create_owner_agreement) {
              <a
                [routerLink]="['/app/owner-agreements/new']"
                [queryParams]="{
                  property_id: property()!.id,
                  owner_customer_id: property()!.owner_customer_id,
                }"
                class="bm-btn bm-btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Owner Contract</span>
              </a>
            }

            @if (canCreateTenantAgreement()) {
              <a
                [routerLink]="['/app/tenant-agreements/new']"
                [queryParams]="{
                  source_owner_agreement_id: profile()?.actions?.default_owner_agreement_id,
                }"
                class="bm-btn bm-btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Tenant Lease</span>
              </a>
            }
          </div>
        </div>

        <!-- FEATURED HIGHLIGHTS & OVERVIEW: BENTO STYLE 3 GRID ASYMMETRIC LAYOUT -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          <!-- BENTO TILE 1: FEATURED ASSET OVERVIEW (Asymmetric 5 Cols) -->
          <div
            class="lg:col-span-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[200px]"
          >
            <!-- Background Accent Glow -->
            <div
              class="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"
            ></div>
            <div class="absolute right-4 top-4 text-emerald-400/15 pointer-events-none select-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-32 h-32"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m-5 0V11m0 0V9a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6"
                />
              </svg>
            </div>

            <div class="relative z-10 space-y-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                >
                  Featured Asset
                </span>
                <span class="text-[11px] text-slate-300 capitalize font-medium">
                  {{ formatType(property()!.property_type) }}
                </span>
              </div>

              <div>
                <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Unit {{ property()!.unit_number }}
                </h2>
                <p class="text-xs text-slate-300 font-medium mt-0.5">
                  {{ property()!.building_name || 'Individual Property / Complex' }} ·
                  {{ property()!.city || 'Dubai' }}, {{ property()!.state_or_emirate || 'UAE' }}
                </p>
              </div>
            </div>

            <div
              class="relative z-10 pt-3 border-t border-slate-700/60 mt-3 flex items-center justify-between flex-wrap gap-2"
            >
              <div class="flex items-center gap-2.5">
                <div
                  class="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-[10px] uppercase font-bold text-slate-400">Owner</div>
                  <div class="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>{{ ownerName() }}</span>
                    @if (ownerCustomer()) {
                      <a
                        [routerLink]="['/app/customers', ownerCustomer()?.id]"
                        class="text-emerald-400 hover:text-emerald-300 underline text-[10px]"
                      >
                        Profile &rarr;
                      </a>
                    }
                  </div>
                </div>
              </div>
              <span
                class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded"
              >
                {{ property()!.property_code }}
              </span>
            </div>
          </div>

          <!-- BENTO TILE 2: KEY METRICS DASHBOARD (Asymmetric 4 Cols) -->
          <div class="lg:col-span-4 grid grid-cols-2 gap-2.5">
            <!-- Metric 1: Area -->
            <div
              class="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400"
                  >Gross Area</span
                >
                <div
                  class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]"
                >
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
                      d="M4 8V4m0 0h4M4 4l5 5m11-2V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <div class="text-xl font-black text-slate-900 tabular-nums">
                  {{ property()!.area || '—' }}
                  <span class="text-xs font-semibold text-slate-500">sq ft</span>
                </div>
                <div class="text-[10px] text-slate-500 font-medium">Floor Area</div>
              </div>
            </div>

            <!-- Metric 2: Owner Agreements -->
            <div
              class="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700"
                  >Owner Coverage</span
                >
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div>
                <div class="text-xl font-black text-emerald-700 tabular-nums">
                  {{ profile()?.owner_agreements?.length || 0 }}
                </div>
                <div class="text-[10px] text-slate-500 font-medium">Agreements</div>
              </div>
            </div>

            <!-- Metric 3: Tenant Leases -->
            <div
              class="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-blue-700"
                  >Tenant Leases</span
                >
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div>
                <div class="text-xl font-black text-blue-700 tabular-nums">
                  {{ profile()?.tenant_agreements?.length || 0 }}
                </div>
                <div class="text-[10px] text-slate-500 font-medium">Active Leases</div>
              </div>
            </div>

            <!-- Metric 4: Work Orders -->
            <div
              class="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-700"
                  >Work Orders</span
                >
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div>
                <div class="text-xl font-black text-amber-700 tabular-nums">
                  {{ profile()?.work_orders?.length || 0 }}
                </div>
                <div class="text-[10px] text-slate-500 font-medium">Maintenance</div>
              </div>
            </div>
          </div>

          <!-- BENTO TILE 3: ACTIONS & UTILITIES SNAPSHOT (Asymmetric 3 Cols) -->
          <div
            class="lg:col-span-3 rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-700"
                  >Quick Operations</span
                >
                <span class="text-[10px] font-bold text-slate-400">Actions</span>
              </div>

              <div class="space-y-1.5">
                @if (profile()?.actions?.can_create_owner_agreement) {
                  <a
                    [routerLink]="['/app/owner-agreements/new']"
                    [queryParams]="{
                      property_id: property()!.id,
                      owner_customer_id: property()!.owner_customer_id,
                    }"
                    class="w-full bm-btn bm-btn-primary text-xs py-1.5 justify-center flex items-center gap-1.5 font-bold"
                  >
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>+ Owner Agreement</span>
                  </a>
                }

                @if (canCreateTenantAgreement()) {
                  <a
                    [routerLink]="['/app/tenant-agreements/new']"
                    [queryParams]="{
                      source_owner_agreement_id: profile()?.actions?.default_owner_agreement_id,
                    }"
                    class="w-full bm-btn bm-btn-secondary text-xs py-1.5 justify-center flex items-center gap-1.5 font-bold"
                  >
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>+ Tenant Lease</span>
                  </a>
                } @else if (
                  profile()?.actions?.can_create_tenant_agreement &&
                  !hasApprovedOrCommencedOwnerAgreement()
                ) {
                  <div
                    class="p-2 rounded-lg bg-amber-50 border border-amber-200/70 text-[10px] text-amber-900 leading-tight"
                  >
                    ⚠️ Tenant Lease requires an Approved/Commenced Owner Agreement.
                  </div>
                }
              </div>
            </div>

            <!-- Utilities Quick Pills -->
            <div class="pt-2 border-t border-slate-100">
              <div class="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                Utility Accounts Connected
              </div>
              <div class="flex items-center gap-1.5 flex-wrap text-[11px]">
                @for (utility of utilityDetails(); track $index) {
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span class="capitalize">{{ utility.type }}</span>
                  </span>
                } @empty {
                  <span class="text-[11px] text-slate-400 italic">No utility details logged.</span>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- MAIN CONTENT: 3-COLUMN ASYMMETRIC BENTO GRID LAYOUT -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          <!-- ==================== COLUMN 1 (4 COLS): SPECS, ADDRESS & UTILITIES ==================== -->
          <div class="lg:col-span-4 space-y-3 sm:space-y-4">
            <!-- CARD 1.1: ASSET SPECIFICATIONS -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div
                  class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m-5 0V11m0 0V9a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6"
                    />
                  </svg>
                </div>
                <h3 class="text-sm font-extrabold text-slate-900">Asset Specifications</h3>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">Property Code</div>
                  <div class="font-extrabold text-slate-900 mt-0.5 font-mono text-xs">
                    {{ property()!.property_code }}
                  </div>
                </div>

                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">Unit Number</div>
                  <div class="font-extrabold text-slate-900 mt-0.5 text-xs tabular-nums">
                    {{ property()!.unit_number }}
                  </div>
                </div>

                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                    Classification
                  </div>
                  <bm-status-badge [status]="property()!.property_type"></bm-status-badge>
                </div>

                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                    Asset Status
                  </div>
                  <bm-status-badge [status]="property()!.status"></bm-status-badge>
                </div>

                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">
                    Building / Complex
                  </div>
                  <div class="font-bold text-slate-900 mt-0.5 text-xs">
                    {{ property()!.building_name || 'Individual Structure' }}
                  </div>
                </div>

                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">Gross Area Size</div>
                  <div class="font-bold text-slate-900 mt-0.5 text-xs tabular-nums">
                    {{ property()!.area || '—' }} sq ft
                  </div>
                </div>
              </div>

              @if (property()!.notes) {
                <div class="pt-2 border-t border-slate-100">
                  <span class="text-[10px] font-bold text-slate-400 uppercase block mb-1"
                    >Asset Notes</span
                  >
                  <p
                    class="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]"
                  >
                    {{ property()!.notes }}
                  </p>
                </div>
              }
            </div>

            <!-- CARD 1.2: ADDRESS & LOCATION -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div
                  class="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0"
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 class="text-sm font-extrabold text-slate-900">Address & Location</h3>
              </div>

              <div class="space-y-2 text-xs">
                <div>
                  <span class="text-[10px] font-bold text-slate-400 uppercase block"
                    >Street Address</span
                  >
                  <div class="text-slate-900 font-semibold mt-0.5">
                    {{ property()!.address_line_1 || 'No street address provided.' }}
                    @if (property()!.address_line_2) {
                      <div class="text-slate-600 font-normal">{{ property()!.address_line_2 }}</div>
                    }
                  </div>
                </div>

                <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase block"
                      >Emirate / City</span
                    >
                    <div class="text-slate-900 font-semibold">
                      {{ property()!.city || 'Dubai'
                      }}{{
                        property()!.state_or_emirate ? ', ' + property()!.state_or_emirate : ''
                      }}
                    </div>
                  </div>
                  <span
                    class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200"
                  >
                    {{ property()!.country_code || 'AE' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- CARD 1.3: UTILITY CONNECTIONS -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div
                  class="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0"
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 class="text-sm font-extrabold text-slate-900">Utility Accounts</h3>
              </div>

              <div class="space-y-2 text-xs">
                @for (utility of utilityDetails(); track $index) {
                  <div
                    class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span
                        class="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block"
                        >{{ formatType(utility.type) }}</span
                      >
                      @if (utility.type === 'furniture') {
                        <div
                          class="text-slate-900 font-medium text-[11px] mt-0.5 whitespace-pre-line"
                        >
                          {{ utility.details || '—' }}
                        </div>
                      } @else {
                        <div class="text-slate-900 font-bold text-[11px] mt-0.5">
                          {{ formatType(utility.provider || '') || 'Provider Unspecified' }}
                        </div>
                        @if (utility.type === 'gas') {
                          <div class="text-slate-500 text-[10px]">
                            {{ formatType(utility.connection_type || '') }}
                          </div>
                          <div class="text-slate-600 font-mono text-[10px] font-semibold">
                            {{ utility.connection_number || 'No conn #' }}
                          </div>
                        } @else {
                          <div class="text-slate-600 font-mono text-[10px] font-semibold">
                            {{ utility.account_number || 'No acct #' }}
                          </div>
                        }
                      }
                    </div>
                    <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                  </div>
                } @empty {
                  <div
                    class="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-[11px] text-center"
                  >
                    No utility details recorded.
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- ==================== COLUMN 2 (4 COLS): OWNER & MANAGEMENT AGREEMENTS ==================== -->
          <div class="lg:col-span-4 space-y-3 sm:space-y-4">
            <!-- CARD 2.1: PROPERTY OWNER PROFILE -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div
                  class="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 class="text-sm font-extrabold text-slate-900">Property Owner Profile</h3>
              </div>

              <div class="space-y-2.5 text-xs">
                <div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase">Owner Name</div>
                  <div class="font-extrabold text-slate-900 text-sm mt-0.5">{{ ownerName() }}</div>
                </div>

                @if (ownerCustomer()) {
                  <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <div class="text-[10px] font-bold text-slate-400 uppercase">
                        Customer Code
                      </div>
                      <div class="font-bold text-slate-800 font-mono text-xs">
                        {{ ownerCustomer()?.customer_code }}
                      </div>
                    </div>
                    <a
                      [routerLink]="['/app/customers', ownerCustomer()?.id]"
                      class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition"
                    >
                      <span>Profile</span>
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>
                }
              </div>
            </div>

            <!-- CARD 2.2: OWNER MANAGEMENT AGREEMENTS -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
                  >
                    01
                  </div>
                  <h3 class="text-sm font-extrabold text-slate-900">Owner Agreements</h3>
                </div>
                <span
                  class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {{ profile()?.owner_agreements?.length || 0 }}
                </span>
              </div>

              @if (!profile()?.owner_agreements?.length) {
                <div
                  class="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-xl border border-slate-100"
                >
                  No owner management contracts linked.
                </div>
              } @else {
                <div class="space-y-3">
                  @for (agreement of profile()?.owner_agreements || []; track agreement.id) {
                    <div class="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
                      <div class="flex items-center justify-between gap-1 flex-wrap">
                        <a
                          [routerLink]="['/app/owner-agreements', agreement.id]"
                          class="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline text-xs"
                        >
                          {{ agreement.agreement_no }}
                        </a>
                        <bm-status-badge [status]="agreement.status"></bm-status-badge>
                      </div>

                      <div class="text-[11px] text-slate-500 font-mono">
                        {{ formatDate(agreement.start_date) }} to
                        {{ formatDate(agreement.end_date) }}
                      </div>

                      <div class="text-[11px] text-slate-700 font-medium">
                        Owner:
                        <strong class="text-slate-900">{{
                          agreement.customer?.display_name || '—'
                        }}</strong>
                      </div>

                      @if (!profile()?.financial_restricted) {
                        <ng-container
                          *ngTemplateOutlet="
                            paymentLines;
                            context: { lines: agreement.payment_lines }
                          "
                        ></ng-container>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- ==================== COLUMN 3 (4 COLS): TENANT LEASES & MAINTENANCE ORDERS ==================== -->
          <div class="lg:col-span-4 space-y-3 sm:space-y-4">
            <!-- CARD 3.1: TENANT LEASE AGREEMENTS -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0"
                  >
                    02
                  </div>
                  <h3 class="text-sm font-extrabold text-slate-900">Tenant Leases</h3>
                </div>
                <span
                  class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200"
                >
                  {{ profile()?.tenant_agreements?.length || 0 }}
                </span>
              </div>

              @if (!profile()?.tenant_agreements?.length) {
                <div
                  class="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-xl border border-slate-100"
                >
                  No active tenant occupancy contracts linked.
                </div>
              } @else {
                <div class="space-y-3">
                  @for (agreement of profile()?.tenant_agreements || []; track agreement.id) {
                    <div class="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
                      <div class="flex items-center justify-between gap-1 flex-wrap">
                        <a
                          [routerLink]="['/app/tenant-agreements', agreement.id]"
                          class="font-extrabold text-blue-700 hover:text-blue-800 hover:underline text-xs"
                        >
                          {{ agreement.agreement_no }}
                        </a>
                        <bm-status-badge [status]="agreement.status"></bm-status-badge>
                      </div>

                      <div class="text-[11px] text-slate-500 font-mono">
                        {{ formatDate(agreement.start_date) }} to
                        {{ formatDate(agreement.end_date) }}
                      </div>

                      <div class="text-[11px] text-slate-700 font-medium">
                        Tenant:
                        <strong class="text-slate-900">{{
                          agreement.customer?.display_name || '—'
                        }}</strong>
                      </div>

                      @if (!profile()?.financial_restricted) {
                        <ng-container
                          *ngTemplateOutlet="
                            paymentLines;
                            context: { lines: agreement.payment_lines }
                          "
                        ></ng-container>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <!-- CARD 3.2: MAINTENANCE & WORK ORDERS -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0"
                  >
                    03
                  </div>
                  <h3 class="text-sm font-extrabold text-slate-900">Maintenance Orders</h3>
                </div>
                <span
                  class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                >
                  {{ profile()?.work_orders?.length || 0 }}
                </span>
              </div>

              @if (!profile()?.work_orders?.length) {
                <div
                  class="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-xl border border-slate-100"
                >
                  No maintenance work orders logged.
                </div>
              } @else {
                <div class="space-y-3">
                  @for (workOrder of profile()?.work_orders || []; track workOrder.id) {
                    <div class="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
                      <div class="flex items-center justify-between gap-1 flex-wrap">
                        <a
                          [routerLink]="['/app/maintenance/work-orders', workOrder.id]"
                          class="font-extrabold text-amber-800 hover:text-amber-900 hover:underline text-xs"
                        >
                          {{ workOrder.work_order_no }}
                        </a>
                        <div class="flex items-center gap-1">
                          <span
                            class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-800"
                          >
                            {{ workOrder.priority }}
                          </span>
                          <bm-status-badge [status]="workOrder.status"></bm-status-badge>
                        </div>
                      </div>

                      <div class="text-[11px] font-bold text-slate-900">
                        {{ workOrder.title }}
                      </div>

                      <div class="text-[10px] text-slate-600">
                        Vendor:
                        <strong class="text-slate-800">{{
                          workOrder.vendor?.display_name || 'No vendor'
                        }}</strong>
                      </div>

                      @if (!profile()?.financial_restricted && workOrder.payments.length) {
                        <ng-container
                          *ngTemplateOutlet="paymentLines; context: { lines: workOrder.payments }"
                        ></ng-container>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- REUSABLE PAYMENT LINES TABLE TEMPLATE (Compact) -->
        <ng-template #paymentLines let-lines="lines">
          @if (lines?.length) {
            <div class="mt-2 overflow-x-auto rounded-lg border border-slate-200/60 bg-white">
              <table class="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr
                    class="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200/80"
                  >
                    <th class="py-1 px-2">Line</th>
                    <th class="py-1 px-2">Due Date</th>
                    <th class="py-1 px-2">Amount</th>
                    <th class="py-1 px-2">Balance</th>
                    <th class="py-1 px-2 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  @for (line of lines; track line.id) {
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-1 px-2 font-bold text-slate-800">#{{ line.line_no }}</td>
                      <td class="py-1 px-2 text-slate-600 font-mono">
                        {{ formatDate(line.due_date) }}
                      </td>
                      <td class="py-1 px-2 font-bold text-slate-900">
                        <div class="flex items-center">
                          <dirham-symbol
                            size="0.8em"
                            weight="bold"
                            class="mr-0.5 text-slate-400 select-none"
                          ></dirham-symbol>
                          <span>{{ money(line.amount) }}</span>
                        </div>
                      </td>
                      <td class="py-1 px-2 font-bold text-slate-900">
                        <div class="flex items-center">
                          <dirham-symbol
                            size="0.8em"
                            weight="bold"
                            class="mr-0.5 text-slate-400 select-none"
                          ></dirham-symbol>
                          <span>{{ money(line.balance) }}</span>
                        </div>
                      </td>
                      <td class="py-1 px-2 text-right">
                        @if (line.receipt) {
                          <a
                            [routerLink]="receiptRoute(line.receipt.direction)"
                            class="inline-flex items-center gap-0.5 text-emerald-700 hover:text-emerald-800 font-bold underline text-[10px]"
                          >
                            <span>{{ line.receipt.document_no }}</span>
                          </a>
                        } @else {
                          <span class="text-slate-300">—</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </ng-template>
      }
    </div>
  `,
})
export class PropertyDetailComponent implements OnInit {
  formatDate = formatUaeDate;
  private api = inject(PropertiesApiService);
  private route = inject(ActivatedRoute);

  property = signal<Property | null>(null);
  profile = signal<PropertyProfile | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  hasApprovedOrCommencedOwnerAgreement = computed(() => {
    const agreements = this.profile()?.owner_agreements || [];
    return agreements.some((ag) => ag.status === 'approved' || ag.status === 'commenced');
  });

  canCreateTenantAgreement = computed(() => {
    return (
      !!this.profile()?.actions?.can_create_tenant_agreement &&
      this.hasApprovedOrCommencedOwnerAgreement()
    );
  });

  ngOnInit(): void {
    this.loadProperty();
  }

  loadProperty(silent = false): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    if (!silent && !this.property()) {
      this.isLoading.set(true);
    }
    this.error.set(null);

    this.api.getPropertyProfile(id).subscribe({
      next: (res) => {
        this.property.set(res.data.property);
        this.profile.set(res.data.profile);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Property record not found.');
        this.isLoading.set(false);
      },
    });
  }

  formatType(val: string): string {
    return (val || '').replace(/_/g, ' ');
  }

  utilityDetails(): Property['utility_details'] {
    const property = this.property();
    if (!property) return [];
    if (property.utility_details?.length) return property.utility_details;

    const utilities: NonNullable<Property['utility_details']> = [];
    if (property.electricity_provider || property.electricity_account_number)
      utilities.push({
        type: 'electricity',
        provider: property.electricity_provider,
        account_number: property.electricity_account_number,
      });
    if (property.cooling_provider || property.cooling_account_number)
      utilities.push({
        type: 'cooling',
        provider: property.cooling_provider,
        account_number: property.cooling_account_number,
      });
    if (property.gas_provider || property.gas_connection_type || property.gas_connection_number)
      utilities.push({
        type: 'gas',
        provider: property.gas_provider,
        connection_type: property.gas_connection_type,
        connection_number: property.gas_connection_number,
      });
    return utilities;
  }

  money(value: number | string | undefined): string {
    return Number(value || 0).toLocaleString('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  ownerCustomer(): any {
    const p = this.property();
    if (!p || !p.owner) return null;
    if ('data' in p.owner && p.owner.data) return p.owner.data;
    if ('id' in p.owner) return p.owner;
    return null;
  }

  ownerName(): string {
    const oc = this.ownerCustomer();
    return oc ? oc.display_name : '—';
  }

  receiptRoute(direction: 'inward' | 'outward'): string {
    return direction === 'inward' ? '/app/accounts/inward' : '/app/accounts/outward';
  }
}
