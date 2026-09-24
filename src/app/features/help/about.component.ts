import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';

@Component({
  selector: 'bm-about',
  standalone: true,
  imports: [CommonModule, RouterLink, BmPageHeaderComponent],
  template: `
    <div class="max-w-[1140px] w-full mx-auto pb-16">
      <!-- Page Header -->
      <bm-page-header
        title="About Baithul Madeena ERP"
        subtitle="Enterprise property management, multi-branch financial accounting & AI intelligence platform"
      >
        <div class="flex flex-wrap items-center gap-2">
          <a
            routerLink="/app/zaakiy"
            class="bm-btn bm-btn-primary text-xs flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 text-emerald-400"
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
            <span>Ask Zaakiy AI</span>
          </a>
          <a routerLink="/app/faq" class="bm-btn bm-btn-secondary text-xs">FAQ & Guide</a>
          <a routerLink="/app/privacy-terms" class="bm-btn bm-btn-secondary text-xs"
            >Legal & Terms</a
          >
        </div>
      </bm-page-header>

      <!-- HERO OVERVIEW CARD -->
      <section
        class="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-[24px] p-6 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden"
      >
        <!-- Background Decorative Accent -->
        <div
          class="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div class="relative z-10 max-w-3xl">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span
              class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold tracking-wide uppercase"
            >
              Baithul Madeena Real Estate Group
            </span>
            <span
              class="px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10 text-[11px] font-semibold"
            >
              v2.4 Enterprise Edition
            </span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 leading-tight">
            Integrated Real Estate Operations, Financial Ledgers & AI Assistant
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Baithul Madeena ERP is a purpose-built real estate management and accounting suite
            designed to orchestrate property portfolios, commercial & residential lease agreements,
            inward rent collection receipts, outward payouts, maintenance work orders, and revenue
            leakage intelligence across regional branches in the United Arab Emirates.
          </p>

          <!-- Regional Branch Footprint Badges -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/10 text-xs"
          >
            <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div
                class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0"
              >
                FJ
              </div>
              <div>
                <div class="font-bold text-white">Fujairah Head Office</div>
                <div class="text-[11px] text-slate-400">Fujairah, United Arab Emirates (UAE)</div>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div
                class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0"
              >
                AJ
              </div>
              <div>
                <div class="font-bold text-white">Ajman Regional Branch</div>
                <div class="text-[11px] text-slate-400">Ajman, United Arab Emirates (UAE)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SYSTEM CAPABILITIES GRID -->
      <section class="mb-10">
        <div class="mb-4">
          <h3 class="text-lg font-bold text-slate-900 tracking-tight">
            High-Level Core Capabilities
          </h3>
          <p class="text-xs text-slate-500">
            Key modules powering property, financial, and operational workflows
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Module 1 -->
          <div
            class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition"
          >
            <div
              class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3"
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h4 class="text-sm font-bold text-slate-900 mb-1">Multi-Branch Property Portfolio</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              Master property directory, unit specs, owner assignments, and occupant histories with
              real-time branch context isolation ('X-Branch-Id').
            </p>
          </div>

          <!-- Module 2 -->
          <div
            class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition"
          >
            <div
              class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3"
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
            <h4 class="text-sm font-bold text-slate-900 mb-1">Lease & Agreement Lifecycle</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              Owner management contracts, tenant agreements, payment frequency calculations,
              Ejari/RERA alignment, and renewal/hold/termination lifecycle.
            </p>
          </div>

          <!-- Module 3 -->
          <div
            class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition"
          >
            <div
              class="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3"
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
            <h4 class="text-sm font-bold text-slate-900 mb-1">Financial Accounting & Ledgers</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              Inward collection receipts, outward payment vouchers, bank transfer verification,
              petty cash daybooks, duplicate submission prevention, and single-click cheque modals.
            </p>
          </div>

          <!-- Module 4 -->
          <div
            class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition"
          >
            <div
              class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h4 class="text-sm font-bold text-slate-900 mb-1">Maintenance & Work Orders</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              Property repair requests, contractor/vendor dispatch directories, work order cost
              approvals, and maintenance stock inventory tracking.
            </p>
          </div>

          <!-- Module 5 -->
          <div
            class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition"
          >
            <div
              class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3"
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h4 class="text-sm font-bold text-slate-900 mb-1">Intelligent Leakage Reports</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              Deterministic revenue leakage calculation, operational profitability analysis, tenant
              arrears reporting, and PDF report export.
            </p>
          </div>

          <!-- Module 6 -->
          <div
            class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition"
          >
            <div
              class="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 font-zaakiy font-bold text-xs flex items-center justify-center mb-3 shadow-xs"
            >
              Zv3
            </div>
            <h4 class="text-sm font-bold text-slate-900 mb-1">ZaakiyV3RSE AI Assistant</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              Read-only AI engine providing conversational ERP query resolution, agreement expiry
              lookup, and instant navigation shortcuts.
            </p>
          </div>
        </div>
      </section>

      <!-- DEVELOPER & CREDITS SECTION -->
      <section class="bg-white border border-slate-200/90 rounded-[24px] p-6 sm:p-8 shadow-xs mb-8">
        <div
          class="mb-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <h3 class="text-lg font-bold text-slate-900 tracking-tight">
              Development & Technology Partners
            </h3>
            <p class="text-xs text-slate-500">
              Official engineering, architecture, and AI platform providers
            </p>
          </div>
          <span
            class="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold w-fit"
          >
            Verified Software Credits
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Card 1: Company -->
          <div
            class="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >Engineering Firm</span
                >
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <h4 class="text-base font-bold text-slate-900">Desertwhales Technology</h4>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Enterprise cloud software engineering & AI solution development house.
              </p>
            </div>
            <div class="mt-5 pt-3 border-t border-slate-200/60">
              <a
                href="https://dwtech.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <span>Visit dwtech.vercel.app</span>
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- Card 2: Developer -->
          <div
            class="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >Lead Architect</span
                >
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <h4 class="text-base font-bold text-slate-900">Sanu Khan</h4>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Lead Full-Stack Systems Architect & Principal Software Engineer.
              </p>
            </div>
            <div class="mt-5 pt-3 border-t border-slate-200/60">
              <a
                href="https://www.sanukhan.dev/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>Visit sanukhan.dev</span>
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- Card 3: Zaakiy AI -->
          <div
            class="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >AI Intelligence Engine</span
                >
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
              </div>
              <h4 class="text-base font-bold text-slate-900 font-zaakiy">ZaakiyV3RSE Engine</h4>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                Official conversational AI telemetry engine & read-only ERP query platform.
              </p>
            </div>
            <div class="mt-5 pt-3 border-t border-slate-200/60">
              <a
                href="https://www.zaakiy.io/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline"
              >
                <span>Visit zaakiy.io</span>
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- SYSTEM METRICS & SPECIFICATIONS -->
      <section class="bg-slate-900 text-white rounded-[24px] p-6 sm:p-8 shadow-xs">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-x divide-white/10">
          <div>
            <div class="text-2xl font-bold text-emerald-400">v2.4.0</div>
            <div class="text-[11px] text-slate-400 mt-1 font-medium">ERP Build Version</div>
          </div>
          <div class="pl-6">
            <div class="text-2xl font-bold text-white">2 Branches</div>
            <div class="text-[11px] text-slate-400 mt-1 font-medium">Fujairah & Ajman (UAE)</div>
          </div>
          <div class="pl-6">
            <div class="text-2xl font-bold text-emerald-400">100%</div>
            <div class="text-[11px] text-slate-400 mt-1 font-medium">Branch Scoping Enforced</div>
          </div>
          <div class="pl-6">
            <div class="text-2xl font-bold text-white">ZaakiyV3RSE</div>
            <div class="text-[11px] text-slate-400 mt-1 font-medium">Integrated AI Engine</div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class AboutComponent {}
