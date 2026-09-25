import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { PropertiesApiService } from '../../core/api/properties-api.service';
import { Property, PropertyProfile } from '../../shared/models/property.models';

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
    <div class="max-w-[1740px] mx-auto space-y-6 font-sans text-slate-900">
      @if (isLoading()) {
        <bm-loading-state type="detail"></bm-loading-state>
      } @else if (error()) {
        <bm-error-state [message]="error()!" (retry)="loadProperty()"></bm-error-state>
      } @else if (property()) {
        <!-- TOP BREADCRUMB & HEADER ACTIONS -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <a
              routerLink="/app/properties"
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
              <span>Back to Properties Portfolio</span>
            </a>
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {{ property()!.name }}
              </h1>
              <span
                class="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200"
              >
                {{ property()!.property_code }}
              </span>
              <bm-status-badge [status]="property()!.property_type"></bm-status-badge>
              <bm-status-badge [status]="property()!.status"></bm-status-badge>
            </div>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <a routerLink="/app/properties" class="bm-btn bm-btn-secondary text-xs">
              Back to List
            </a>

            <a
              [routerLink]="['/app/properties', property()!.id, 'edit']"
              class="bm-btn bm-btn-secondary text-xs flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-slate-500"
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
                class="bm-btn bm-btn-primary text-xs flex items-center gap-1.5"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Create Owner Agreement</span>
              </a>
            }

            @if (profile()?.actions?.can_create_tenant_agreement) {
              <a
                [routerLink]="['/app/tenant-agreements/new']"
                [queryParams]="{ property_id: property()!.id }"
                class="bm-btn bm-btn-primary text-xs flex items-center gap-1.5"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Create Tenant Lease</span>
              </a>
            }
          </div>
        </div>

        <!-- EDITORIAL BENTO HERO PROPERTY PORTFOLIO CARD -->
        <div
          class="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/70 p-6 sm:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] relative overflow-hidden"
        >
          <!-- Static Top Light Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-amber-400/8 via-amber-300/2 to-transparent pointer-events-none z-0"
          ></div>

          <!-- Background Decorative Building Silhouette -->
          <div
            class="absolute -right-6 -bottom-10 text-slate-800 opacity-[0.035] pointer-events-none select-none z-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-[360px] h-[360px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m-5 0V11m0 0V9a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6"
              />
            </svg>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <!-- Left Info Block (6 cols) -->
            <div class="lg:col-span-6 space-y-4">
              <div class="flex items-center gap-2">
                <span
                  class="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md"
                >
                  Real Estate Asset Profile
                </span>
                <span class="text-xs text-slate-400 font-medium">•</span>
                <span class="text-xs font-semibold text-slate-600 capitalize">
                  {{ formatType(property()!.property_type) }}
                </span>
              </div>

              <div>
                <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Unit {{ property()!.unit_number }}
                </h2>
                <p class="text-sm text-slate-600 font-medium mt-1">
                  {{ property()!.building_name || 'Individual Building / Complex' }} ·
                  {{ property()!.city || 'Dubai' }},
                  {{ property()!.state_or_emirate || 'United Arab Emirates' }}
                </p>
              </div>

              <!-- Owner Link Badge -->
              <div
                class="inline-flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs"
              >
                <div
                  class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Property Owner
                  </div>
                  <div class="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <span>{{ ownerName() }}</span>
                    @if (ownerCustomer()) {
                      <a
                        [routerLink]="['/app/customers', ownerCustomer()?.id]"
                        class="text-emerald-700 hover:text-emerald-800 underline font-semibold text-[11px]"
                      >
                        View Master Profile &rarr;
                      </a>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Right 4-Card Quick Metrics Grid (6 cols) -->
            <div class="lg:col-span-6 grid grid-cols-2 gap-4">
              <!-- Metric 1: Total Area -->
              <div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
                  >Gross Area</span
                >
                <div class="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                  {{ property()!.area || '—' }}
                  <span class="text-xs text-slate-500 font-semibold">sq ft</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">Floor layout area size</p>
              </div>

              <!-- Metric 2: Owner Agreements -->
              <div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span class="text-xs font-bold text-emerald-800 uppercase tracking-wider block"
                  >Owner Coverage</span
                >
                <div class="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
                  {{ profile()?.owner_agreements?.length || 0 }}
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">Management agreements</p>
              </div>

              <!-- Metric 3: Tenant Leases -->
              <div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span class="text-xs font-bold text-blue-800 uppercase tracking-wider block"
                  >Tenant Leases</span
                >
                <div class="text-2xl font-extrabold text-blue-700 tabular-nums mt-1">
                  {{ profile()?.tenant_agreements?.length || 0 }}
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">Occupancy agreement records</p>
              </div>

              <!-- Metric 4: Work Orders -->
              <div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <span class="text-xs font-bold text-amber-800 uppercase tracking-wider block"
                  >Work Orders</span
                >
                <div class="text-2xl font-extrabold text-amber-700 tabular-nums mt-1">
                  {{ profile()?.work_orders?.length || 0 }}
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">Maintenance requests</p>
              </div>
            </div>
          </div>
        </div>

        <!-- BENTO DETAILS GRID (2 COLUMNS) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- LEFT COLUMN (7 COLS): Specifications & Address -->
          <div class="lg:col-span-7 space-y-6">
            <!-- ASSET SPECIFICATIONS BENTO CARD -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"
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
                  <h2 class="text-base font-extrabold text-slate-900">
                    Property Asset Specifications
                  </h2>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Property Code
                  </div>
                  <div class="font-extrabold text-slate-900 mt-1 font-mono text-sm">
                    {{ property()!.property_code }}
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Unit Number
                  </div>
                  <div class="font-extrabold text-slate-900 mt-1 text-sm tabular-nums">
                    {{ property()!.unit_number }}
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Classification
                  </div>
                  <div class="mt-1.5">
                    <bm-status-badge [status]="property()!.property_type"></bm-status-badge>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Building / Complex
                  </div>
                  <div class="font-bold text-slate-900 mt-1">
                    {{ property()!.building_name || '—' }}
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Area Size
                  </div>
                  <div class="font-bold text-slate-900 mt-1 tabular-nums">
                    {{ property()!.area || '—' }} sq ft
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Asset Status
                  </div>
                  <div class="mt-1.5">
                    <bm-status-badge [status]="property()!.status"></bm-status-badge>
                  </div>
                </div>
              </div>

              @if (property()!.notes) {
                <div class="pt-3 border-t border-slate-100">
                  <span
                    class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
                    >Asset Notes</span
                  >
                  <p
                    class="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100"
                  >
                    {{ property()!.notes }}
                  </p>
                </div>
              }
            </div>

            <!-- LOCATION & ADDRESS BENTO CARD -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div
                  class="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center"
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
                <h2 class="text-base font-extrabold text-slate-900">
                  Address & Location Coordinates
                </h2>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span
                    class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
                    >Street Address</span
                  >
                  <div class="text-slate-900 font-semibold">
                    {{ property()!.address_line_1 || 'No street address provided.' }}
                    @if (property()!.address_line_2) {
                      <div class="text-slate-600 font-normal mt-0.5">
                        {{ property()!.address_line_2 }}
                      </div>
                    }
                  </div>
                </div>

                <div>
                  <span
                    class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
                    >City / Emirate / Country</span
                  >
                  <div class="text-slate-900 font-semibold">
                    {{ property()!.city || 'Dubai' }}
                    {{ property()!.state_or_emirate ? ', ' + property()!.state_or_emirate : '' }}
                    <span
                      class="inline-block ml-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[11px] border border-emerald-200"
                    >
                      {{ property()!.country_code || 'AE' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (5 COLS): Owner Profile & Agreement Actions -->
          <div class="lg:col-span-5 space-y-6">
            <!-- PROPERTY OWNER MASTER CARD -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center"
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
                  <h2 class="text-base font-extrabold text-slate-900">Property Owner</h2>
                </div>
              </div>

              <div class="space-y-3 text-xs">
                <div>
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Owner Display Name
                  </div>
                  <div class="font-extrabold text-slate-900 mt-1 text-sm">{{ ownerName() }}</div>
                </div>

                @if (ownerCustomer()) {
                  <div>
                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Customer Code
                    </div>
                    <div class="font-bold text-slate-800 mt-1 font-mono">
                      {{ ownerCustomer()?.customer_code }}
                    </div>
                  </div>

                  <div class="pt-3 border-t border-slate-100">
                    <a
                      [routerLink]="['/app/customers', ownerCustomer()?.id]"
                      class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/60 transition w-full justify-center"
                    >
                      <span>View Owner Master Profile</span>
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
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>
                }
              </div>
            </div>

            <!-- AGREEMENT COVERAGE & ACTIONS CARD -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 class="text-base font-extrabold text-slate-900">Agreement Actions</h2>
              </div>

              <div class="space-y-3">
                @if (profile()?.actions?.can_create_owner_agreement) {
                  <a
                    [routerLink]="['/app/owner-agreements/new']"
                    [queryParams]="{
                      property_id: property()!.id,
                      owner_customer_id: property()!.owner_customer_id,
                    }"
                    class="bm-btn bm-btn-primary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Create Owner Agreement</span>
                  </a>
                }

                @if (profile()?.actions?.can_create_tenant_agreement) {
                  <a
                    [routerLink]="['/app/tenant-agreements/new']"
                    [queryParams]="{ property_id: property()!.id }"
                    class="bm-btn bm-btn-secondary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Create Tenant Lease</span>
                  </a>
                }

                @if (
                  !profile()?.actions?.can_create_owner_agreement &&
                  !profile()?.actions?.can_create_tenant_agreement
                ) {
                  <div
                    class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium"
                  >
                    ✓ Active owner and tenant agreements are currently linked to this property.
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- FULL-WIDTH BENTO SECTIONS: OWNER AGREEMENTS, TENANT AGREEMENTS, MAINTENANCE WORK ORDERS -->
        <div class="space-y-6 pt-2">
          <!-- 1. OWNER MANAGEMENT AGREEMENTS BENTO CARD -->
          <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs"
                >
                  01
                </div>
                <div>
                  <h2 class="text-base font-extrabold text-slate-900">
                    Owner Management Agreements
                  </h2>
                  <p class="text-xs text-slate-500">
                    Property management contracts between owner and company
                  </p>
                </div>
              </div>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                {{ profile()?.owner_agreements?.length || 0 }} Records
              </span>
            </div>

            @if (!profile()?.owner_agreements?.length) {
              <div class="p-8 text-center text-slate-500 text-xs font-medium">
                No owner management agreements currently linked to this property.
              </div>
            } @else {
              <div class="space-y-4">
                @for (agreement of profile()?.owner_agreements || []; track agreement.id) {
                  <div class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div class="flex items-center gap-3">
                        <a
                          [routerLink]="['/app/owner-agreements', agreement.id]"
                          class="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline text-sm"
                        >
                          {{ agreement.agreement_no }}
                        </a>
                        <bm-status-badge [status]="agreement.status"></bm-status-badge>
                      </div>
                      <div class="text-xs text-slate-500 font-semibold tabular-nums">
                        {{ agreement.start_date }} to {{ agreement.end_date }}
                      </div>
                    </div>

                    <div class="text-xs text-slate-700 font-medium">
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

          <!-- 2. TENANT LEASE AGREEMENTS BENTO CARD -->
          <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs"
                >
                  02
                </div>
                <div>
                  <h2 class="text-base font-extrabold text-slate-900">Tenant Lease Agreements</h2>
                  <p class="text-xs text-slate-500">Active tenant occupancy and lease contracts</p>
                </div>
              </div>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200"
              >
                {{ profile()?.tenant_agreements?.length || 0 }} Records
              </span>
            </div>

            @if (!profile()?.tenant_agreements?.length) {
              <div class="p-8 text-center text-slate-500 text-xs font-medium">
                No tenant lease agreements currently linked to this property.
              </div>
            } @else {
              <div class="space-y-4">
                @for (agreement of profile()?.tenant_agreements || []; track agreement.id) {
                  <div class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div class="flex items-center gap-3">
                        <a
                          [routerLink]="['/app/tenant-agreements', agreement.id]"
                          class="font-extrabold text-blue-700 hover:text-blue-800 hover:underline text-sm"
                        >
                          {{ agreement.agreement_no }}
                        </a>
                        <bm-status-badge [status]="agreement.status"></bm-status-badge>
                      </div>
                      <div class="text-xs text-slate-500 font-semibold tabular-nums">
                        {{ agreement.start_date }} to {{ agreement.end_date }}
                      </div>
                    </div>

                    <div class="text-xs text-slate-700 font-medium">
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

          <!-- 3. MAINTENANCE & WORK ORDERS BENTO CARD -->
          <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs"
                >
                  03
                </div>
                <div>
                  <h2 class="text-base font-extrabold text-slate-900">Maintenance & Work Orders</h2>
                  <p class="text-xs text-slate-500">
                    Service requests, repairs, and maintenance activities
                  </p>
                </div>
              </div>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
              >
                {{ profile()?.work_orders?.length || 0 }} Records
              </span>
            </div>

            @if (!profile()?.work_orders?.length) {
              <div class="p-8 text-center text-slate-500 text-xs font-medium">
                No maintenance work orders logged for this property.
              </div>
            } @else {
              <div class="space-y-4">
                @for (workOrder of profile()?.work_orders || []; track workOrder.id) {
                  <div class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div class="flex items-center gap-3">
                        <a
                          [routerLink]="['/app/maintenance/work-orders', workOrder.id]"
                          class="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline text-sm"
                        >
                          {{ workOrder.work_order_no }}
                        </a>
                        <span
                          class="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase bg-slate-200 text-slate-800"
                        >
                          {{ workOrder.priority }}
                        </span>
                        <bm-status-badge [status]="workOrder.status"></bm-status-badge>
                      </div>
                      <div class="text-xs text-slate-600 font-semibold">
                        Vendor:
                        <strong class="text-slate-900">{{
                          workOrder.vendor?.display_name || 'No vendor assigned'
                        }}</strong>
                      </div>
                    </div>

                    <div class="text-xs font-bold text-slate-900">
                      {{ workOrder.title }}
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

        <!-- REUSABLE PAYMENT LINES TABLE TEMPLATE -->
        <ng-template #paymentLines let-lines="lines">
          <div class="mt-2 overflow-x-auto rounded-xl border border-slate-200/60 bg-white">
            <table class="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr
                  class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80"
                >
                  <th class="py-2 px-3">Line #</th>
                  <th class="py-2 px-3">Due Date</th>
                  <th class="py-2 px-3">Amount</th>
                  <th class="py-2 px-3">Balance</th>
                  <th class="py-2 px-3 text-right">Receipt Reference</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                @for (line of lines; track line.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-2 px-3 font-bold text-slate-800">#{{ line.line_no }}</td>
                    <td class="py-2 px-3 text-slate-600 tabular-nums">
                      {{ line.due_date || '—' }}
                    </td>
                    <td class="py-2 px-3 font-bold text-slate-900 tabular-nums">
                      <div class="flex items-center">
                        <dirham-symbol
                          size="0.85em"
                          weight="bold"
                          class="mr-1 text-slate-400 select-none"
                        ></dirham-symbol>
                        <span>{{ money(line.amount) }}</span>
                      </div>
                    </td>
                    <td class="py-2 px-3 font-bold text-slate-900 tabular-nums">
                      <div class="flex items-center">
                        <dirham-symbol
                          size="0.85em"
                          weight="bold"
                          class="mr-1 text-slate-400 select-none"
                        ></dirham-symbol>
                        <span>{{ money(line.balance) }}</span>
                      </div>
                    </td>
                    <td class="py-2 px-3 text-right">
                      @if (line.receipt) {
                        <a
                          [routerLink]="receiptRoute(line.receipt.direction)"
                          class="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                        >
                          <span>{{ line.receipt.document_no }}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-3 w-3"
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
                      } @else {
                        <span class="text-slate-400">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </ng-template>
      }
    </div>
  `,
})
export class PropertyDetailComponent implements OnInit {
  private api = inject(PropertiesApiService);
  private route = inject(ActivatedRoute);

  property = signal<Property | null>(null);
  profile = signal<PropertyProfile | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

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
