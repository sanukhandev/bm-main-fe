import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { ZaakiyOrbComponent } from './components/zaakiy-orb.component';

@Component({
  selector: 'bm-about-zaakiy',
  standalone: true,
  imports: [CommonModule, RouterLink, BmPageHeaderComponent, ZaakiyOrbComponent],
  template: `
    <div class="max-w-[1240px] w-full mx-auto pb-12 space-y-8">
      <!-- Page Header -->
      <bm-page-header
        title="About ZaakiyV3RSE"
        subtitle="Intelligent read-only copilot & verified ERP business intelligence architecture"
      >
        <div class="flex items-center gap-2">
          <a
            routerLink="/app/zaakiy"
            class="text-xs font-poppins font-semibold px-4 py-2 rounded-xl bg-zaakiy-gradient text-white hover:opacity-90 transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <bm-zaakiy-orb size="sm" />
            <span>Open Zaakiy Workspace</span>
          </a>
        </div>
      </bm-page-header>

      <!-- HERO SECTION -->
      <section class="relative overflow-hidden rounded-3xl bg-zaakiy-gradient text-white p-6 sm:p-10 shadow-lg border border-brand-800/40">
        <!-- Ambient Radial Glows -->
        <div class="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-brand-400/20 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#DFFF62]/10 blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl space-y-4">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-100">
            <bm-zaakiy-orb size="sm" />
            <span>Baithul Madeena Intelligence Layer</span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-poppins font-bold tracking-tight text-white leading-tight">
            ZaakiyV3RSE
          </h1>

          <p class="text-lg font-poppins font-medium text-[#DFFF62]">
            Verified intelligence for your real-estate operations.
          </p>

          <p class="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            Ask questions naturally. Zaakiy turns verified ERP data into clear answers, comparisons, trends, explanations, alerts, and management briefings — while respecting branch access and user permissions.
          </p>

          <!-- Supporting Badges -->
          <div class="flex flex-wrap gap-2.5 pt-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-sm border border-white/15 text-xs font-semibold text-white">
              <span class="w-2 h-2 rounded-full bg-brand-400"></span>
              Verified ERP Data
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-sm border border-white/15 text-xs font-semibold text-white">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Branch-Aware
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-sm border border-white/15 text-xs font-semibold text-white">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              Permission-Aware
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-sm border border-white/15 text-xs font-semibold text-[#DFFF62]">
              <span class="w-2 h-2 rounded-full bg-[#DFFF62]"></span>
              Read-Only by Design
            </span>
          </div>
        </div>
      </section>

      <!-- MAIN BENTO GRID (12 FEATURES) -->
      <section class="space-y-4">
        <h2 class="text-lg font-poppins font-bold text-ink tracking-tight">
          System Intelligence Capabilities
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Bento 1 — 360° Intelligence (Large Featured) -->
          <div class="md:col-span-2 lg:col-span-2 rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                Bento 01 · Comprehensive Context
              </span>
              <bm-zaakiy-orb size="sm" />
            </div>

            <h3 class="text-xl font-poppins font-bold text-ink">
              360° Business Intelligence
            </h3>

            <p class="text-xs text-ink-soft leading-relaxed">
              Move from a question to the complete authorized context around a property, tenant, owner, or agreement without leaving the conversation.
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div class="p-3 rounded-2xl bg-surface-50 border border-surface-100 text-xs font-semibold text-ink">
                Property 360
              </div>
              <div class="p-3 rounded-2xl bg-surface-50 border border-surface-100 text-xs font-semibold text-ink">
                Tenant 360
              </div>
              <div class="p-3 rounded-2xl bg-surface-50 border border-surface-100 text-xs font-semibold text-ink">
                Owner 360
              </div>
              <div class="p-3 rounded-2xl bg-surface-50 border border-surface-100 text-xs font-semibold text-ink">
                Agreement 360
              </div>
            </div>
          </div>

          <!-- Bento 2 — Collections Health -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 02 · Financials
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Collections Health
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              Collected amount, outstanding balances, overdue balances, aging, payments, cheque status, tenant ranking.
            </p>
            <div class="pt-2 text-[11px] text-brand-800 font-semibold bg-brand-50 p-2.5 rounded-xl border border-brand-100">
              Respects <code class="bg-white px-1 py-0.5 rounded text-brand-900 font-mono">accounts.view</code> authorization scope.
            </div>
          </div>

          <!-- Bento 3 — Agreement Intelligence -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 03 · Contracts
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Agreement Intelligence
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              Agreement 360, agreement attention conditions, expiry monitoring, owner coverage mismatch, renewal signals, bounced cheque signals.
            </p>
            <div class="pt-2 text-[11px] text-slate-600 font-medium">
              Deterministic attention conditions — no opaque risk score.
            </div>
          </div>

          <!-- Bento 4 — Occupancy & Vacancy -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 04 · Portfolio
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Occupancy & Vacancy
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              Current occupancy, vacancy rate, vacancy duration, upcoming vacancy, future occupancy, available-for-leasing state, owner coverage, vacant-property maintenance.
            </p>
          </div>

          <!-- Bento 5 — Maintenance Intelligence -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 05 · Work Orders
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Maintenance Intelligence
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              Open backlog, work-order aging, priority, completion counts, property workload, old work orders, vacant-property maintenance.
            </p>
            <div class="pt-2 text-[11px] text-slate-500 italic">
              Zaakiy never fabricates overdue status when authoritative SLA data does not exist.
            </div>
          </div>

          <!-- Bento 6 — Compare -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 06 · Comparative
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Compare Across Periods
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              Compare supported metrics across periods with backend-calculated absolute and percentage changes.
            </p>
            <div class="flex flex-wrap gap-1.5 text-[10px] text-slate-600">
              <span class="bg-surface-100 px-2 py-0.5 rounded-md font-medium">This vs last month</span>
              <span class="bg-surface-100 px-2 py-0.5 rounded-md font-medium">September vs August</span>
              <span class="bg-surface-100 px-2 py-0.5 rounded-md font-medium">Same period last year</span>
            </div>
          </div>

          <!-- Bento 7 — Trends -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 07 · Series
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Bounded Trends
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              View bounded day, week, month, and quarter trends using the same verified metric definitions as the rest of the ERP.
            </p>
            <div class="text-[11px] text-slate-500">
              Collections · Occupancy · Vacancy · Maintenance completions · Renewals · Agreement expiries
            </div>
          </div>

          <!-- Bento 8 — Explain Why -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 08 · Attribution
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Explain What Changed
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              Zaakiy can explain supported metric changes using verified backend contributors instead of speculative AI reasoning.
            </p>
            <div class="text-[11px] text-brand-800 bg-brand-50 p-2 rounded-xl border border-brand-100 font-medium">
              Deterministic driver math — no hallucinations.
            </div>
          </div>

          <!-- Bento 9 — Deterministic Anomalies -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 09 · Rule-Based
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Attention Without Black Boxes
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              Transparent rule-based anomaly detection surfaces significant collection drops, long vacancies, old work orders, urgent maintenance, coverage mismatches, bounced cheques, and other verified conditions.
            </p>
            <div class="text-[11px] text-slate-600 font-medium">
              No machine-learning anomaly score. No hidden probability. Every alert has an explicit rule.
            </div>
          </div>

          <!-- Bento 10 — Management Briefing (Highlighted Gradient Card) -->
          <div class="md:col-span-2 lg:col-span-2 rounded-3xl bg-zaakiy-gradient text-white p-6 space-y-3 shadow-md border border-brand-700/50">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider bg-[#DFFF62] text-brand-950 px-2.5 py-1 rounded-full">
                Bento 10 · Flagship Board
              </span>
              <bm-zaakiy-orb size="sm" />
            </div>

            <h3 class="text-xl font-poppins font-bold text-white">
              Management Briefing
            </h3>

            <p class="text-xs text-emerald-100/90 leading-relaxed font-normal">
              A concise branch-level summary combining attention items, collections, occupancy, agreements, renewals, and maintenance from existing verified Zaakiy capabilities.
            </p>
          </div>

          <!-- Bento 11 — Natural Follow-Ups -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 11 · Context
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Contextual Follow-Ups
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              Ask: "Show renewals next month." → "Only tenant agreements." → "Only those with overdue balances." → "Tell me about the first one."
            </p>
            <div class="text-[11px] text-slate-500">
              Context remains structured, bounded, and reauthorized per turn.
            </div>
          </div>

          <!-- Bento 12 — Compound Queries -->
          <div class="rounded-3xl bg-white border border-surface-200 p-6 space-y-3 shadow-xs hover:border-brand-500/40 transition">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bento 12 · Cross-Domain
            </span>
            <h3 class="text-lg font-poppins font-bold text-ink">
              Ask Across Domains
            </h3>
            <p class="text-xs text-ink-soft leading-relaxed">
              "Show overdue collections and vacant properties." Correlation uses verified semantic references rather than AI-generated joins.
            </p>
          </div>
        </div>
      </section>

      <!-- HOW ZAAKIY WORKS (PROCESS PIPELINE) -->
      <section class="rounded-3xl bg-white border border-surface-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 class="text-lg font-poppins font-bold text-ink tracking-tight">
          How Zaakiy Works
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          @for (step of pipelineSteps; track step.num) {
            <div class="p-3.5 rounded-2xl bg-surface-50 border border-surface-100 flex flex-col justify-between space-y-2">
              <div class="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-[11px] font-bold font-poppins flex items-center justify-center">
                {{ step.num }}
              </div>
              <div class="font-poppins font-semibold text-xs text-ink">
                {{ step.title }}
              </div>
              <p class="text-[10px] text-slate-500 leading-normal">
                {{ step.desc }}
              </p>
            </div>
          }
        </div>
      </section>

      <!-- TRUST ARCHITECTURE & READ-ONLY BOUNDARY -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Trust Card -->
        <div class="rounded-3xl bg-white border border-brand-500/30 p-6 sm:p-8 space-y-4 shadow-xs">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 class="text-base font-poppins font-bold text-ink">
              Designed Around ERP Trust
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            @for (trustItem of trustList; track trustItem) {
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-surface-50 border border-surface-100 font-medium text-slate-700">
                <span class="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span>
                <span>{{ trustItem }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Read-Only Card -->
        <div class="rounded-3xl bg-white border border-surface-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 class="text-base font-poppins font-bold text-ink">
              Read-Only Safety Boundary
            </h2>
          </div>

          <p class="text-xs text-slate-600">
            Zaakiy is an operational intelligence engine and never executes state-mutating actions.
          </p>

          <div class="grid grid-cols-2 gap-2 text-xs text-slate-600">
            @for (action of prohibitedActions; track action) {
              <div class="flex items-center gap-2 p-2 rounded-xl bg-surface-50">
                <span class="text-slate-400 font-bold">✕</span>
                <span class="truncate">{{ action }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CAPABILITY MATRIX -->
      <section class="rounded-3xl bg-white border border-surface-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 class="text-base font-poppins font-bold text-ink">
          Capability Matrix
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse" aria-label="Zaakiy capability matrix">
            <thead>
              <tr class="border-b border-surface-200 text-[11px] font-poppins font-semibold text-slate-400 uppercase tracking-wider">
                <th class="py-2.5 pr-4 font-semibold">Capability</th>
                <th class="py-2.5 px-3 text-center font-semibold">Verified</th>
                <th class="py-2.5 px-3 text-center font-semibold">Branch-Aware</th>
                <th class="py-2.5 px-3 text-center font-semibold">Permission-Aware</th>
                <th class="py-2.5 px-3 text-center font-semibold">Read-Only</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100">
              @for (cap of capabilityMatrix; track cap.name) {
                <tr class="hover:bg-surface-50 transition-colors">
                  <td class="py-2.5 pr-4 font-medium text-slate-800">{{ cap.name }}</td>
                  <td class="py-2.5 px-3 text-center text-brand-600 font-bold">✓</td>
                  <td class="py-2.5 px-3 text-center text-brand-600 font-bold">✓</td>
                  <td class="py-2.5 px-3 text-center text-brand-600 font-bold">✓</td>
                  <td class="py-2.5 px-3 text-center text-brand-600 font-bold">✓</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- EXAMPLE QUESTIONS PROMPT GALLERY -->
      <section class="space-y-4">
        <h2 class="text-lg font-poppins font-bold text-ink tracking-tight">
          Example Operations Gallery
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (q of exampleQuestions; track q) {
            <button
              type="button"
              (click)="launchQuestion(q)"
              class="group text-left p-4 rounded-2xl bg-white border border-surface-200 hover:border-brand-500/40 hover:shadow-md transition-all duration-200 flex items-center justify-between cursor-pointer"
            >
              <span class="font-poppins font-medium text-xs text-slate-800 group-hover:text-brand-900 transition-colors">
                "{{ q }}"
              </span>
              <span class="text-brand-700 font-bold text-xs shrink-0 ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          }
        </div>
      </section>

      <!-- VERSION IDENTITY FOOTER -->
      <footer class="pt-6 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
        <div class="flex items-center gap-2">
          <bm-zaakiy-orb size="sm" />
          <span class="font-poppins font-bold text-ink">ZaakiyV3RSE</span>
          <span>· Baithul Madeena Intelligence Layer</span>
        </div>
        <div>
          <span>Read-only active branch ERP engine</span>
        </div>
      </footer>
    </div>
  `,
  styles: [],
})
export class AboutZaakiyComponent {
  private router = inject(Router);

  readonly pipelineSteps = [
    { num: '1', title: 'Ask naturally', desc: 'User submits query in natural language' },
    { num: '2', title: 'Understand intent', desc: 'AI identifies metric, entity, or briefing intent' },
    { num: '3', title: 'Validate capability', desc: 'Verifies intent matches backend engine semantics' },
    { num: '4', title: 'Apply context', desc: 'Enforces active branch and user role permissions' },
    { num: '5', title: 'Query ERP data', desc: 'Executes deterministic database queries' },
    { num: '6', title: 'Calculate server-side', desc: 'All metrics and deltas computed on backend' },
    { num: '7', title: 'Present intelligence', desc: 'Streams text answer + structured bento blocks' },
  ];

  readonly trustList = [
    'Verified active branch context',
    'Permission-aware data access',
    'Sensitive-data filtering',
    'Server-calculated metrics',
    'Authorized entity resolution',
    'Read-only AI boundary',
    'No arbitrary SQL generation',
    'No AI-selected database access',
    'No opaque financial calculations',
  ];

  readonly prohibitedActions = [
    'Create records',
    'Edit agreements',
    'Approve transactions',
    'Post payments',
    'Void transactions',
    'Delete records',
    'Change permissions',
    'Bypass branch isolation',
    'Execute renewals',
    'Assign maintenance',
  ];

  readonly capabilityMatrix = [
    { name: '360 Intelligence' },
    { name: 'Collections' },
    { name: 'Agreement Risk' },
    { name: 'Renewals' },
    { name: 'Vacancy' },
    { name: 'Maintenance' },
    { name: 'Comparisons' },
    { name: 'Trends' },
    { name: 'Explanations' },
    { name: 'Anomalies' },
    { name: 'Management Briefing' },
    { name: 'Compound Queries' },
    { name: 'Structured Chat' },
  ];

  readonly exampleQuestions = [
    'Give me a management briefing.',
    'How much did we collect this month?',
    'Compare collections with last month.',
    'Why did collections change?',
    'Show occupancy month by month.',
    'Which properties have been vacant longest?',
    'Which agreements need renewal?',
    'Anything unusual?',
    'Which tenants owe money and have agreements expiring soon?',
    'Show vacant properties with open maintenance.',
  ];

  launchQuestion(question: string): void {
    this.router.navigate(['/app/zaakiy'], { queryParams: { q: question } });
  }
}
