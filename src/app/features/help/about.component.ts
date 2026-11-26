import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bm-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-20 font-poppins text-slate-800 space-y-12">
      <!-- Editorial Header -->
      <header class="space-y-4">
        <p class="text-xs font-medium tracking-wide uppercase text-emerald-700">
          Baithul Madeena Real Estate Group · Enterprise Edition v2.5
        </p>

        <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 leading-tight">
          Baithul Madeena ERP
        </h1>

        <p class="text-base text-slate-600 leading-relaxed max-w-2xl">
          Multi-branch property management, financial accounting, and verified AI operations built
          for real estate portfolios across the United Arab Emirates.
        </p>

        <nav class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm font-medium">
          <a routerLink="/app/zaakiy" class="text-emerald-700 hover:text-emerald-900 transition">
            Open Zaakiy →
          </a>
          <a routerLink="/app/about-zaakiy" class="text-slate-600 hover:text-slate-950 transition">
            About Zaakiy
          </a>
          <a routerLink="/app/faq" class="text-slate-600 hover:text-slate-950 transition">
            FAQ & Guide
          </a>
          <a routerLink="/app/privacy-terms" class="text-slate-600 hover:text-slate-950 transition">
            Legal & Terms
          </a>
        </nav>
      </header>

      <!-- Regional Footprint & Specifications -->
      <section class="pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-8">
        <div>
          <div class="text-xs text-slate-400">Head Office</div>
          <div class="text-sm font-medium text-slate-900 mt-1">Fujairah, UAE</div>
        </div>
        <div>
          <div class="text-xs text-slate-400">Regional Branch</div>
          <div class="text-sm font-medium text-slate-900 mt-1">Ajman, UAE</div>
        </div>
        <div>
          <div class="text-xs text-slate-400">Data Isolation</div>
          <div class="text-sm font-medium text-slate-900 mt-1">Strict per-branch</div>
        </div>
        <div>
          <div class="text-xs text-slate-400">Governance</div>
          <div class="text-sm font-medium text-slate-900 mt-1">Full audit trail</div>
        </div>
      </section>

      <!-- Core Modules -->
      <section class="pt-8 border-t border-slate-200/80 space-y-6">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Core Modules
        </h2>

        <dl class="divide-y divide-slate-100">
          @for (module of modules; track module.title) {
            <div class="py-4 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-6">
              <dt class="text-sm font-medium text-slate-900">
                {{ module.title }}
              </dt>
              <dd class="sm:col-span-2 text-sm text-slate-600 leading-relaxed">
                {{ module.description }}
              </dd>
            </div>
          }
        </dl>
      </section>

      <!-- Engineering & Partners -->
      <section class="pt-8 border-t border-slate-200/80 space-y-6">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Engineering & Technology
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
          @for (credit of credits; track credit.name) {
            <div class="space-y-1.5">
              <div class="text-xs text-slate-400">{{ credit.role }}</div>
              <div class="text-sm font-semibold text-slate-900">{{ credit.name }}</div>
              <p class="text-xs text-slate-500 leading-relaxed">{{ credit.summary }}</p>
              <div class="pt-1">
                <a
                  [href]="credit.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs font-medium text-emerald-700 hover:text-emerald-900 transition"
                >
                  {{ credit.linkLabel }} ↗
                </a>
              </div>
            </div>
          }
        </div>
      </section>
    </article>
  `,
})
export class AboutComponent {
  readonly modules = [
    {
      title: 'Property Portfolio',
      description:
        'Branch-scoped property directory, unit specifications, owner assignments, utility details, and occupancy history.',
    },
    {
      title: 'Agreements & Renewals',
      description:
        'Owner and tenant contract lifecycle management, installment schedules, coverage validation, and renewal monitoring.',
    },
    {
      title: 'Financial Ledgers',
      description:
        'Inward rent receipts, outward owner payouts, cheque status workflows, petty cash daybooks, and idempotent posting.',
    },
    {
      title: 'Maintenance & Inventory',
      description:
        'Work order dispatch, vendor directory, priority and aging tracking, service charges, and stock movement control.',
    },
    {
      title: 'Intelligent Reporting',
      description:
        'Deterministic financial reporting, tenant arrears, owner payables, revenue leakage analysis, and PDF exports.',
    },
    {
      title: 'Zaakiy AI Copilot',
      description:
        'Permission-scoped conversational intelligence for branch data queries, briefings, and approval-gated operational tasks.',
    },
  ];

  readonly credits = [
    {
      role: 'Engineering Partner',
      name: 'Desertwhales Technology',
      summary: 'Enterprise cloud software engineering and applied AI systems.',
      url: 'https://www.desertwhales.tech/',
      linkLabel: 'desertwhales.tech',
    },
    {
      role: 'Lead Architect',
      name: 'Sanu Khan',
      summary: 'Lead full-stack systems architect and principal engineer.',
      url: 'https://www.sanukhan.dev/',
      linkLabel: 'sanukhan.dev',
    },
    {
      role: 'Intelligence Layer',
      name: 'Zaakiy',
      summary: 'Verified conversational ERP analytics and HITL workflow assistant.',
      url: 'https://www.zaakiy.io/',
      linkLabel: 'zaakiy.io',
    },
  ];
}
