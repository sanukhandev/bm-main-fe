import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZaakiyOrbComponent } from './components/zaakiy-orb.component';

@Component({
  selector: 'bm-about-zaakiy',
  standalone: true,
  imports: [CommonModule, RouterLink, ZaakiyOrbComponent],
  template: `
    <article class="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-20 font-poppins text-slate-800 space-y-12">
      <!-- Editorial Header -->
      <header class="space-y-4">
        <div class="flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-emerald-700">
          <bm-zaakiy-orb size="sm" />
          <span>Baithul Madeena Intelligence Layer</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 leading-tight">
          Zaakiy
        </h1>

        <p class="text-base text-slate-600 leading-relaxed max-w-2xl">
          Permission-scoped ERP copilot connecting natural language to deterministic backend
          analytics and approval-gated operational workflows.
        </p>

        <nav class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm font-medium">
          <a routerLink="/app/zaakiy" class="text-emerald-700 hover:text-emerald-900 transition">
            Open Zaakiy Workspace →
          </a>
          <a routerLink="/app/about" class="text-slate-600 hover:text-slate-950 transition">
            About Baithul Madeena ERP
          </a>
        </nav>
      </header>

      <!-- Operating Model -->
      <section class="pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div class="space-y-2">
          <h2 class="text-sm font-semibold text-slate-950">Autonomous Read & Reporting</h2>
          <p class="text-sm text-slate-600 leading-relaxed">
            Query 360° entity records, collections health, vacancy rates, agreement risk, renewal
            readiness, maintenance backlogs, period comparisons, trends, and ERP tabular reports —
            all computed deterministically on the server.
          </p>
        </div>

        <div class="space-y-2">
          <h2 class="text-sm font-semibold text-slate-950">Human-in-the-Loop Execution</h2>
          <p class="text-sm text-slate-600 leading-relaxed">
            Prepare maintenance work orders, status updates, unverified customer drafts, petty cash
            entries, or safe agreement transitions. Nothing writes to ERP tables until you review
            and explicitly confirm.
          </p>
        </div>
      </section>

      <!-- How It Works -->
      <section class="pt-8 border-t border-slate-200/80 space-y-6">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
          How It Works
        </h2>

        <ol class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
          @for (step of steps; track step.num) {
            <li class="space-y-1">
              <div class="text-xs font-semibold text-emerald-700">{{ step.num }}</div>
              <div class="text-sm font-medium text-slate-950">{{ step.title }}</div>
              <p class="text-sm text-slate-600 leading-relaxed">{{ step.desc }}</p>
            </li>
          }
        </ol>
      </section>

      <!-- Capabilities & Safety Boundaries -->
      <section class="pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div class="space-y-4">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Capabilities
          </h2>
          <ul class="space-y-2.5 text-sm text-slate-600 leading-relaxed">
            @for (item of capabilities; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </div>

        <div class="space-y-4">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Hard Safety Boundaries
          </h2>
          <ul class="space-y-2.5 text-sm text-slate-600 leading-relaxed">
            @for (rule of boundaries; track rule) {
              <li>{{ rule }}</li>
            }
          </ul>
        </div>
      </section>

      <!-- Try Asking -->
      <section class="pt-8 border-t border-slate-200/80 space-y-4">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Try Asking
        </h2>

        <div class="divide-y divide-slate-100">
          @for (question of exampleQuestions; track question) {
            <button
              type="button"
              (click)="launchQuestion(question)"
              class="w-full text-left py-3 text-sm text-slate-700 hover:text-emerald-800 transition flex items-center justify-between gap-4 cursor-pointer group"
            >
              <span>{{ question }}</span>
              <span class="text-slate-300 group-hover:text-emerald-600 transition shrink-0">→</span>
            </button>
          }
        </div>
      </section>
    </article>
  `,
  styles: [],
})
export class AboutZaakiyComponent {
  private router = inject(Router);

  readonly steps = [
    {
      num: '01',
      title: 'Authorize Tools',
      desc: 'Only tools permitted by your active branch role are exposed to the model.',
    },
    {
      num: '02',
      title: 'Compute Server-Side',
      desc: 'Queries and aggregations run through deterministic PHP services — never AI-written SQL.',
    },
    {
      num: '03',
      title: 'Scrub & Ground',
      desc: 'Secrets and identity numbers are stripped before generating the natural-language answer.',
    },
    {
      num: '04',
      title: 'Confirm Before Writing',
      desc: 'Operational requests create a single-use, 15-minute proposal audited upon confirmation.',
    },
  ];

  readonly capabilities = [
    '360° lookups for properties, tenants, owners, and agreements with disambiguation',
    'Executive management briefings, period comparisons, trends, and rule-based anomalies',
    'Natural-language ERP reports with direct links into reporting screens',
    'Persistent, branch-scoped conversation history with multi-turn follow-ups',
    'Editable confirmation cards for work orders, customer drafts, petty cash, and safe lifecycle steps',
    'Full audit trail logging for every proposed, confirmed, and rejected action',
  ];

  readonly boundaries = [
    'Never mutates ERP tables autonomously without explicit human confirmation',
    'Never voids financial transactions, deletes records, or cancels work orders',
    'Never cancels or terminates owner or tenant agreements through chat',
    'Never modifies users, roles, permissions, or branch configurations',
    'Never verifies Emirates IDs (document verification stays on the scan screen)',
    'Never queries across branches or exposes raw SQL and internal credentials',
  ];

  readonly exampleQuestions = [
    'Give me a management briefing for this branch',
    'What is happening with Flat 101 and who owns it?',
    'Show tenant outstanding receivables and petty cash summary',
    'Which agreements are due for renewal and have overdue balances?',
    'Create a high priority work order for Flat 101 for an AC water leak',
    'Record AED 185 outward petty cash today for office stationery',
  ];

  launchQuestion(question: string): void {
    this.router.navigate(['/app/zaakiy'], { queryParams: { q: question } });
  }
}
