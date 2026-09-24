import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';

type FaqCategory = 'Getting Started' | 'Leasing' | 'Finance' | 'Reports & AI' | 'Security';

interface FaqItem {
  category: FaqCategory;
  question: string;
  answer: string;
  link?: { label: string; url: string };
}

@Component({
  selector: 'bm-faq',
  standalone: true,
  imports: [CommonModule, RouterLink, BmPageHeaderComponent],
  template: `
    <div class="max-w-[1140px] w-full mx-auto pb-16">
      <bm-page-header
        title="Frequently Asked Questions"
        subtitle="Practical answers for using Baithul Madeena ERP"
      >
        <div class="flex flex-wrap gap-2">
          <a routerLink="/app/zaakiy" class="bm-btn bm-btn-primary text-xs">Ask Zaakiy</a>
          <a routerLink="/app/dashboard" class="bm-btn bm-btn-secondary text-xs">Dashboard</a>
        </div>
      </bm-page-header>

      <section class="bm-card p-4 sm:p-5 mb-5">
        <label class="sr-only" for="faq-search">Search frequently asked questions</label>
        <input
          id="faq-search"
          class="bm-input w-full"
          type="search"
          [value]="query()"
          (input)="updateQuery($event)"
          placeholder="Search payments, agreements, reports, branches..."
        />
        <div class="flex flex-wrap gap-2 mt-3" aria-label="FAQ categories">
          <button
            type="button"
            (click)="category.set('All')"
            [class.bg-slate-900]="category() === 'All'"
            [class.text-white]="category() === 'All'"
            class="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 cursor-pointer"
          >
            All
          </button>
          @for (item of categories; track item) {
            <button
              type="button"
              (click)="category.set(item)"
              [class.bg-slate-900]="category() === item"
              [class.text-white]="category() === item"
              class="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 cursor-pointer"
            >
              {{ item }}
            </button>
          }
        </div>
      </section>

      <section class="space-y-3" aria-live="polite">
        @for (item of filteredFaqs(); track item.question) {
          <article class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              class="w-full px-5 py-4 flex items-start justify-between gap-4 text-left cursor-pointer hover:bg-slate-50"
              (click)="toggle(item.question)"
              [attr.aria-expanded]="isOpen(item.question)"
            >
              <span>
                <span class="block text-[10px] uppercase tracking-[0.16em] text-emerald-700 font-bold mb-1">
                  {{ item.category }}
                </span>
                <span class="font-semibold text-slate-900">{{ item.question }}</span>
              </span>
              <span class="text-xl leading-none text-slate-400" aria-hidden="true">
                {{ isOpen(item.question) ? '−' : '+' }}
              </span>
            </button>
            @if (isOpen(item.question)) {
              <div class="px-5 pb-5 text-sm text-slate-600 leading-6 border-t border-slate-100 pt-4">
                <p>{{ item.answer }}</p>
                @if (item.link) {
                  <a [routerLink]="item.link.url" class="inline-flex mt-3 text-emerald-700 font-semibold hover:underline">
                    {{ item.link.label }}
                  </a>
                }
              </div>
            }
          </article>
        } @empty {
          <div class="bm-card p-10 text-center text-sm text-slate-500">
            No FAQ entries match your search.
          </div>
        }
      </section>

      <section class="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-sm text-slate-700">
        <p class="font-semibold text-emerald-900">Need a live answer?</p>
        <p class="mt-1">Ask Zaakiy about your authorized branch data, payments, agreements, properties or maintenance.</p>
        <a routerLink="/app/zaakiy" class="inline-flex mt-3 text-emerald-800 font-semibold hover:underline">Open Zaakiy</a>
      </section>
    </div>
  `,
})
export class FaqComponent {
  readonly categories: FaqCategory[] = ['Getting Started', 'Leasing', 'Finance', 'Reports & AI', 'Security'];
  readonly query = signal('');
  readonly category = signal<FaqCategory | 'All'>('All');
  readonly openQuestion = signal<string | null>(null);

  readonly faqs: FaqItem[] = [
    { category: 'Getting Started', question: 'How do I confirm which branch I am working in?', answer: 'Check the branch shown in the application header before creating or reviewing records. Branch changes reload branch-sensitive data.' },
    { category: 'Getting Started', question: 'What does the Dashboard show?', answer: 'The Operational Dashboard shows owners, tenants, properties, current agreements, occupancy, expiring agreements, financial attention metrics when authorized, pending cheques and open work orders.', link: { label: 'Open Dashboard', url: '/app/dashboard' } },
    { category: 'Leasing', question: 'How are owner and tenant codes generated?', answer: 'Codes are generated by the system from the customer and branch context. Do not manually replace a generated code.' },
    { category: 'Leasing', question: 'How is a property code generated?', answer: 'The property code uses branch, emirate, building, unit and property type inputs. Short codes are used where configured, building spaces become hyphens, and the code is generated by the system.' },
    { category: 'Leasing', question: 'Why can I not create a tenant agreement?', answer: 'The property may be outside the owner agreement dates, already occupied for the selected dates, assigned to another branch, or the selected tenant/property/source agreement may be invalid.' },
    { category: 'Leasing', question: 'Why can I not edit an approved agreement?', answer: 'Commercial fields and lifecycle status are protected after approval or commencement. Use the dedicated lifecycle action such as hold, extend, renew or terminate.' },
    { category: 'Finance', question: 'Which payment modes are supported?', answer: 'Cash, Cheque and Bank Transfer are supported. Cheques require cheque details; bank transfers require the bank reference and transfer date.' },
    { category: 'Finance', question: 'What happens after a payment line is fully paid?', answer: 'The line becomes paid and a receipt link is shown where supported. Select the link to open the receipt connected to the original financial transaction.' },
    { category: 'Finance', question: 'Can I pay more than the outstanding amount?', answer: 'No. Overpayments are rejected. Paid and outstanding values are calculated by the backend from the installment and posted allocations.' },
    { category: 'Finance', question: 'What are the cheque statuses?', answer: 'A cheque normally moves from Received to Deposited and then Cleared. Deposited cheques can be Bounced. Received or Deposited cheques can be Cancelled. Invalid transitions are rejected.' },
    { category: 'Finance', question: 'Who can void a transaction?', answer: 'Only an authorized user with accounts.void permission can void a same-branch transaction. A reason is required and the original transaction remains in the history.' },
    { category: 'Finance', question: 'Why should I not click Submit twice?', answer: 'Payment requests use duplicate-submission protection. Wait for the result; repeating the same request must not create a second transaction or receipt.' },
    { category: 'Reports & AI', question: 'Which reports are available?', answer: 'Owner Agreements, Tenant Agreements, Agreement Expiry, Tenant Outstanding, Owner Payable, Inward Receipts, Outward Vouchers, Daily Cash Movement, Petty Cash and Intelligent Report are available.', link: { label: 'Open Reports', url: '/app/reports/owner-agreements' } },
    { category: 'Reports & AI', question: 'What is the Intelligent Report?', answer: 'It combines backend-calculated cash, operational profitability, collections, occupancy, maintenance, trends and deterministic leakage findings for a selected period. It is an operational management report, not a statutory Profit and Loss statement.', link: { label: 'Open Intelligent Report', url: '/app/reports/intelligent' } },
    { category: 'Reports & AI', question: 'Can Zaakiy change ERP records?', answer: 'No. Zaakiy is read-only. It can answer authorized questions, explain verified data and provide safe navigation links, but it cannot post, void, edit or delete records.', link: { label: 'Open Zaakiy', url: '/app/zaakiy' } },
    { category: 'Reports & AI', question: 'What can I ask Zaakiy?', answer: 'Ask about authorized branch data such as collections, outstanding balances, expiring agreements, available properties, occupancy, pending or bounced cheques, open maintenance and recent audit activity.' },
    { category: 'Security', question: 'Why is a financial section hidden?', answer: 'Financial information requires accounts.view permission. Restricted does not mean zero; ask an administrator to review your permission if access is required.' },
    { category: 'Security', question: 'Why cannot I see a record from another branch?', answer: 'Branch isolation is enforced by the backend. Confirm the active branch and contact a Branch Admin or Super Admin if the record should be available to you.' },
    { category: 'Security', question: 'What is the Audit Trail used for?', answer: 'It records important successful actions, including agreement changes, payments, voids, cheque transitions, customer/property changes and work-order actions. It shows who changed what and when.' },
    { category: 'Security', question: 'What should I send when reporting a problem?', answer: 'Send your username, active branch, page, record number, approximate time, action attempted, visible error and request ID if shown. Never send passwords, API keys, cookies or the server .env file.' },
  ];

  readonly filteredFaqs = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();
    return this.faqs.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesQuery = !query || `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  });

  toggle(question: string): void {
    this.openQuestion.update((current) => (current === question ? null : question));
  }

  isOpen(question: string): boolean {
    return this.openQuestion() === question;
  }

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
