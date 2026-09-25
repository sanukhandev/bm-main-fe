import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { uaeDateInput } from '../../shared/utils/uae-formatters';

type LegalTab = 'all' | 'privacy' | 'terms';

@Component({
  selector: 'bm-privacy-terms',
  standalone: true,
  imports: [CommonModule, BmPageHeaderComponent],
  template: `
    <div class="max-w-[1140px] w-full mx-auto pb-16">
      <!-- Screen Header (Hidden on Print) -->
      <div class="print:hidden">
        <bm-page-header
          title="Privacy Policy & Terms of Use"
          subtitle="Legal governance, data protection protocols, and enterprise software terms for Baithul Madeena Real Estate Group"
        >
          <div class="flex flex-wrap items-center gap-2">
            <!-- Filter Tabs -->
            <div
              class="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80"
            >
              <button
                type="button"
                (click)="activeTab.set('all')"
                [class.bg-white]="activeTab() === 'all'"
                [class.text-slate-900]="activeTab() === 'all'"
                [class.shadow-2xs]="activeTab() === 'all'"
                [class.text-slate-600]="activeTab() !== 'all'"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                All Documents
              </button>
              <button
                type="button"
                (click)="activeTab.set('privacy')"
                [class.bg-white]="activeTab() === 'privacy'"
                [class.text-slate-900]="activeTab() === 'privacy'"
                [class.shadow-2xs]="activeTab() === 'privacy'"
                [class.text-slate-600]="activeTab() !== 'privacy'"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                (click)="activeTab.set('terms')"
                [class.bg-white]="activeTab() === 'terms'"
                [class.text-slate-900]="activeTab() === 'terms'"
                [class.shadow-2xs]="activeTab() === 'terms'"
                [class.text-slate-600]="activeTab() !== 'terms'"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Terms of Use
              </button>
            </div>

            <!-- Print Action Button -->
            <button
              type="button"
              (click)="printDocument()"
              class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>Print / Export PDF</span>
            </button>
          </div>
        </bm-page-header>
      </div>

      <!-- Printable Legal Document Wrapper -->
      <article
        class="bg-white border border-slate-200/90 rounded-[24px] p-6 sm:p-10 md:p-12 shadow-xs print:shadow-none print:border-none print:p-0 print:m-0"
      >
        <!-- Official Document Letterhead Header -->
        <header
          class="border-b border-slate-200 pb-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div class="flex items-center gap-2.5 mb-1.5">
              <div
                class="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs tracking-tight shadow-xs"
              >
                BM
              </div>
              <span class="text-xl font-bold text-slate-900 tracking-tight">
                Baithul Madeena Real Estate Group
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium">
              Enterprise Property & Financial Management System (ERP)
            </p>
          </div>

          <div class="text-left sm:text-right text-xs text-slate-500 font-medium">
            <div class="font-semibold text-slate-900">Official Policy Document</div>
            <div>Effective Date: January 1, 2026</div>
            <div>Version: 2.4 | UAE Compliance Edition</div>
          </div>
        </header>

        <!-- PRIVACY POLICY SECTION -->
        @if (activeTab() === 'all' || activeTab() === 'privacy') {
          <section class="mb-12 print:mb-10 print:break-inside-avoid-page">
            <div class="flex items-center gap-3 pb-3 mb-6 border-b border-slate-100">
              <span
                class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider"
              >
                Section 1
              </span>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Privacy Policy</h2>
            </div>

            <div class="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  1. Overview & Data Controller
                </h3>
                <p>
                  Baithul Madeena Real Estate Group ("the Group", "Company", "We", "Us") respects
                  the privacy and data security of all property owners, tenants, vendors, employees,
                  and authorized operators interacting with our Enterprise Resource Planning ("ERP")
                  platform. This Privacy Policy outlines how personal data and financial metadata
                  are collected, stored, processed, and safeguarded within the Baithul Madeena ERP
                  system across all active branch operations in the United Arab Emirates (UAE).
                </p>
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  2. Information Collected & Scoping
                </h3>
                <p class="mb-3">
                  In performance of real estate lease management, property maintenance, and
                  accounting, the ERP collects and processes the following data categories:
                </p>
                <ul class="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
                  <li>
                    <strong class="text-slate-900">Customer Profiles:</strong> Full Legal Names, UAE
                    Emirates ID numbers (formatted in 784-XXXX-XXXXXXX-X standard), contact phone
                    numbers (+971 format), email addresses, and official identification
                    documentation.
                  </li>
                  <li>
                    <strong class="text-slate-900">Property & Contract Records:</strong> Property
                    specifications, unit numbers, owner agreement contracts, tenant lease
                    agreements, security deposit terms, and renewal terms.
                  </li>
                  <li>
                    <strong class="text-slate-900">Financial & Payment Ledger Data:</strong> Inward
                    rent collection receipts, outward payment vouchers, bank transaction references,
                    cheque details, petty cash daybook logs, and branch revenue balances.
                  </li>
                  <li>
                    <strong class="text-slate-900">System Telemetry & Audit Logs:</strong> User
                    session identifiers, active branch context tokens, system audit logs (<code
                      class="px-1 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-800"
                      >audit.view</code
                    >), and read-only query interaction logs processed by the ZaakiyV3RSE AI
                    assistant.
                  </li>
                </ul>
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  3. Legal Basis & Purpose of Processing
                </h3>
                <p class="mb-3">
                  Personal data is processed in accordance with UAE Federal Decree-Law No. 45/2021
                  on Personal Data Protection (PDPL), Dubai Land Department (DLD) directives, and
                  Real Estate Regulatory Agency (RERA) compliance rules. Primary processing purposes
                  include:
                </p>
                <ul class="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
                  <li>
                    Executing legally binding owner management contracts and tenant lease
                    agreements.
                  </li>
                  <li>
                    Issuing verified financial vouchers, collection receipts, and automated account
                    ledgers.
                  </li>
                  <li>
                    Facilitating maintenance work orders, vendor dispatches, and inventory tracking.
                  </li>
                  <li>
                    Enforcing multi-branch isolation and strict role-based access control (RBAC).
                  </li>
                </ul>
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  4. Data Isolation & Security Architecture
                </h3>
                <p>
                  The Baithul Madeena ERP implements multi-layer enterprise security. Active branch
                  context (<code
                    class="px-1 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-800"
                    >X-Branch-Id</code
                  >) is enforced at database and API boundary levels, preventing unauthorized
                  cross-branch data exposure. All transmitted data is encrypted in transit using TLS
                  1.3 standards, and sensitive database columns are encrypted at rest. Client-side
                  authorization does not serve as a security boundary; all mutations are strictly
                  validated by backend access guards.
                </p>
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  5. Data Retention & Third-Party Disclosure
                </h3>
                <p>
                  Financial ledgers and tenancy agreements are retained for the minimum statutory
                  period mandated by UAE commercial and real estate regulations (at least 5 to 7
                  years). We do not sell, trade, or transfer personal records to third-party
                  advertisers. Data is shared exclusively with authorized banking institutions,
                  statutory audit authorities, and government portals (such as Ejari/DLD) when
                  required by law.
                </p>
              </div>
            </div>
          </section>
        }

        <!-- TERMS OF USE SECTION -->
        @if (activeTab() === 'all' || activeTab() === 'terms') {
          <section class="print:break-inside-avoid-page">
            <div class="flex items-center gap-3 pb-3 mb-6 border-b border-slate-100">
              <span
                class="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
              >
                Section 2
              </span>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Terms of Use</h2>
            </div>

            <div class="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  1. Acceptable Enterprise Use
                </h3>
                <p>
                  Access to the Baithul Madeena ERP system is strictly limited to authorized
                  personnel, property managers, accountants, and branch administrators employed by
                  or contracted with Baithul Madeena Real Estate Group. Credentials are
                  non-transferable. Sharing credentials or attempting to bypass branch isolation
                  controls constitutes a breach of employment and security policy.
                </p>
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  2. Data Integrity & Validation Obligations
                </h3>
                <p class="mb-3">
                  Operators and users of the system are required to maintain strict data precision:
                </p>
                <ul class="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
                  <li>
                    <strong class="text-slate-900">Emirates ID Formatting:</strong> All individual
                    profiles must record verified Emirates ID numbers using standard 15-digit
                    formatting (<code
                      class="px-1 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-800"
                      >784-XXXX-XXXXXXX-X</code
                    >).
                  </li>
                  <li>
                    <strong class="text-slate-900">UAE Phone Formatting:</strong> Phone numbers must
                    include international UAE prefix (+971) by default.
                  </li>
                  <li>
                    <strong class="text-slate-900">Financial Submission Prevention:</strong> Users
                    must verify payment vouchers before submission to prevent duplicate financial
                    entry or unauthorized voiding.
                  </li>
                </ul>
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  3. Authoritative Financial Data Disclaimer
                </h3>
                <p>
                  Client-side views, partial search lists, and UI summary cards are
                  non-authoritative. Official financial totals, owner payout balances, and tenant
                  arrears are calculated strictly from backend database transactions. In the event
                  of a discrepancy between transient UI state and committed ledger tables, the
                  central database record governs.
                </p>
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  4. AI Assistant (ZaakiyV3RSE) Engine
                </h3>
                <p>
                  The ZaakiyV3RSE conversational assistant provides read-only analytical insights
                  based on verified branch records. Zaakiy cannot post, modify, or delete database
                  transactions. AI-generated responses are intended for administrative decision
                  support and should be verified against official ledger receipts before executing
                  contract payouts.
                </p>
              </div>

              <div>
                <h3 class="text-base font-bold text-slate-900 mb-2">
                  5. Intellectual Property & Governing Law
                </h3>
                <p>
                  The ERP software, UI components, Zaakiy AI trademarks, system architecture, and
                  proprietary algorithms are owned exclusively by Baithul Madeena Real Estate Group
                  / Desertwhales. These Terms of Use are governed by the laws of the United Arab
                  Emirates. Any disputes arising shall be subject to the exclusive jurisdiction of
                  the competent courts of the UAE.
                </p>
              </div>
            </div>
          </section>
        }

        <!-- Document Sign-off Footer -->
        <footer
          class="mt-12 pt-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:mt-8 print:pt-4"
        >
          <div>
            <div class="font-bold text-slate-900">Baithul Madeena Real Estate Group</div>
            <div>Corporate Legal & Compliance Department</div>
            <div>Dubai, United Arab Emirates</div>
          </div>
          <div class="text-left sm:text-right">
            <div>Document Ref: ERP-LEG-2026-V2.4</div>
            <div class="text-slate-400">
              Printed: {{ currentDate | date: 'dd MMMM yyyy, HH:mm' }}
            </div>
          </div>
        </footer>
      </article>
    </div>
  `,
  styles: [
    `
      @media print {
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        @page {
          margin: 1.5cm;
          size: A4 portrait;
        }
      }
    `,
  ],
})
export class PrivacyTermsComponent {
  activeTab = signal<LegalTab>('all');
  currentDate = new Date(`${uaeDateInput()}T12:00:00Z`);

  printDocument(): void {
    window.print();
  }
}
