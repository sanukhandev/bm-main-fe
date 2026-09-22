import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountsApiService, AccountTransaction, PettyCashDaybookResponse } from '../../core/api/accounts-api.service';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';

@Component({ selector: 'bm-petty-cash', standalone: true, imports: [CommonModule, RouterLink, BmPageHeaderComponent, BmLoadingStateComponent, BmErrorStateComponent], template: `
  <bm-page-header title="Petty Cash Daybook" subtitle="Backend-calculated cash movements"><a routerLink="/app/accounts/dashboard" class="bm-btn bm-btn-secondary text-xs">Accounts Dashboard</a></bm-page-header>
  @if (loading()) { <bm-loading-state type="table"></bm-loading-state> } @else if (error()) { <bm-error-state [message]="error()!" (retry)="load()"></bm-error-state> } @else {
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5"><div class="bm-card p-4"><div class="text-xs text-slate-500">Opening</div><div class="font-semibold">AED {{ book()?.meta?.opening_balance }}</div></div><div class="bm-card p-4"><div class="text-xs text-slate-500">Cash In</div><div class="font-semibold text-emerald-700">AED {{ book()?.meta?.total_in }}</div></div><div class="bm-card p-4"><div class="text-xs text-slate-500">Cash Out</div><div class="font-semibold text-rose-700">AED {{ book()?.meta?.total_out }}</div></div><div class="bm-card p-4"><div class="text-xs text-slate-500">Closing</div><div class="font-semibold">AED {{ book()?.meta?.closing_balance }}</div></div></div>
    <div class="bm-card overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="bg-slate-50 text-slate-500 uppercase"><th class="p-4">Date</th><th class="p-4">Voucher</th><th class="p-4">Particulars</th><th class="p-4">Cash In</th><th class="p-4">Cash Out</th><th class="p-4">Balance</th></tr></thead><tbody class="divide-y divide-slate-100">@for (row of rows(); track row.id) { <tr><td class="p-4">{{ row.transaction_date }}</td><td class="p-4 font-semibold">{{ row.document_no }}</td><td class="p-4">{{ row.remarks || '—' }}</td><td class="p-4 text-emerald-700">{{ row.direction === 'inward' ? row.amount : '0.00' }}</td><td class="p-4 text-rose-700">{{ row.direction === 'outward' ? row.amount : '0.00' }}</td><td class="p-4">—</td></tr> }</tbody></table></div>
  }
` })
export class PettyCashComponent implements OnInit {
  private api = inject(AccountsApiService); book = signal<PettyCashDaybookResponse | null>(null); rows = signal<AccountTransaction[]>([]); loading = signal(true); error = signal<string | null>(null);
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.api.getPettyCash().subscribe({ next: (res) => { this.book.set(res); this.rows.set(res.data); this.loading.set(false); }, error: (err) => { this.error.set(err.message || 'Unable to load petty cash.'); this.loading.set(false); } }); }
}
