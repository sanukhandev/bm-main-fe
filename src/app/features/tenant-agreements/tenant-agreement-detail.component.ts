import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmConfirmDialogComponent } from '../../shared/components/bm-confirm-dialog/bm-confirm-dialog.component';
import { TenantAgreementsApiService } from '../../core/api/tenant-agreements-api.service';
import { TenantAgreement } from '../../shared/models/agreement.models';

@Component({
  selector: 'bm-tenant-agreement-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BmPageHeaderComponent,
    BmStatusBadgeComponent,
    BmLoadingStateComponent,
    BmErrorStateComponent,
    BmConfirmDialogComponent,
  ],
  template: `
    @if (isLoading()) {
      <bm-loading-state></bm-loading-state>
    } @else if (error()) {
      <bm-error-state [message]="error()!" (retry)="loadAgreement()"></bm-error-state>
    } @else if (agreement()) {
      <bm-page-header
        [title]="'Tenant Agreement ' + agreement()!.agreement_no"
        subtitle="Lease Document & Operational Terms"
      >
        <a routerLink="/app/tenant-agreements" class="bm-btn bm-btn-secondary text-xs">
          Back to List
        </a>

        @if (agreement()!.status === 'draft' || agreement()!.status === 'pending_approval') {
          <a [routerLink]="['/app/tenant-agreements', agreement()!.id, 'edit']" class="bm-btn bm-btn-secondary text-xs">
            Edit Agreement
          </a>
        }

        @if (agreement()!.status !== 'terminated') {
          <button type="button" (click)="confirmTerminateDialog.set(true)" class="bm-btn bm-btn-danger text-xs">
            Terminate
          </button>
        }
      </bm-page-header>

      <div class="bm-card p-8 md:p-12 max-w-4xl mx-auto space-y-8 bg-white border border-[#DDE3DF]">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Tenant Lease Contract</div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight mt-1">{{ agreement()!.agreement_no }}</h2>
            <div class="text-xs text-slate-400 mt-0.5">Created: {{ agreement()!.created_at | date:'mediumDate' }}</div>
          </div>

          <div class="flex items-center gap-3">
            <bm-status-badge [status]="agreement()!.status"></bm-status-badge>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-slate-400 font-semibold uppercase tracking-wider mb-2">Leasing Tenant</div>
            <div class="text-base font-bold text-slate-900">{{ tenantName() }}</div>
            @if (tenantCustomer()) {
              <div class="text-slate-500 mt-1">Code: {{ tenantCustomer()?.customer_code }}</div>
              <div class="text-slate-500">{{ tenantCustomer()?.phone }}</div>
            }
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-slate-400 font-semibold uppercase tracking-wider mb-2">Lease Period</div>
            <div class="text-base font-semibold text-slate-900 tabular-nums">
              {{ agreement()!.start_date }} &rarr; {{ agreement()!.end_date }}
            </div>
            <div class="text-slate-500 mt-1">Status: <span class="capitalize font-medium text-slate-800">{{ agreement()!.status }}</span></div>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Leased Property Asset</h3>
          @for (item of propertiesList(); track item.property_id) {
            <div class="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
              <div>
                <div class="font-bold text-slate-900">
                  {{ item.property ? item.property.name : 'Property #' + item.property_id }}
                </div>
                @if (item.property) {
                  <div class="text-slate-500">Code: {{ item.property.property_code }} | Unit: {{ item.property.unit_number }} | Type: {{ item.property.property_type }}</div>
                }
              </div>
              @if (item.property) {
                <a [routerLink]="['/app/properties', item.property.id]" class="text-emerald-700 font-medium hover:underline">
                  View Property &rarr;
                </a>
              }
            </div>
          }
        </div>

        <div>
          <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Lease Financial Terms</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs">
            <div>
              <div class="text-slate-500 font-medium">Total Rent Amount</div>
              <div class="text-lg font-bold text-emerald-900 tabular-nums mt-1">
                {{ agreement()!.currency_code }} {{ agreement()!.total_amount | number:'1.2-2' }}
              </div>
            </div>

            <div>
              <div class="text-slate-500 font-medium">Payment Mode</div>
              <div class="text-sm font-semibold text-slate-900 capitalize mt-1">
                {{ (agreement()!.payment_mode || '').replace('_', ' ') }}
              </div>
            </div>

            <div>
              <div class="text-slate-500 font-medium">Installments</div>
              <div class="text-sm font-semibold text-slate-900 tabular-nums mt-1">
                {{ agreement()!.payment_count }} payments
              </div>
            </div>

            <div>
              <div class="text-slate-500 font-medium">Frequency</div>
              <div class="text-sm font-semibold text-slate-900 capitalize mt-1">
                {{ agreement()!.payment_frequency || 'Monthly' }}
              </div>
            </div>
          </div>
        </div>

        @if (agreement()!.notes) {
          <div class="border-t border-slate-200 pt-4 text-xs">
            <div class="text-slate-400 font-semibold mb-1">Lease Notes & Special Conditions</div>
            <p class="text-slate-700 italic">{{ agreement()!.notes }}</p>
          </div>
        }

        <div>
          <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Schedule</h3>
          <div class="overflow-x-auto border border-slate-200 rounded-xl"><table class="w-full text-left text-xs"><thead class="bg-slate-50 text-slate-500 uppercase"><tr><th class="p-3">#</th><th class="p-3">Due Date</th><th class="p-3">Scheduled</th><th class="p-3">Paid</th><th class="p-3">Balance</th><th class="p-3">Status</th><th class="p-3">Action</th></tr></thead><tbody class="divide-y divide-slate-100">@for (item of agreement()!.installments || []; track item.id) { <tr><td class="p-3">{{ item.installment_no }}</td><td class="p-3">{{ item.due_date }}</td><td class="p-3">AED {{ item.amount }}</td><td class="p-3">AED {{ item.paid_amount }}</td><td class="p-3 font-semibold">AED {{ item.balance }}</td><td class="p-3 capitalize">{{ item.status.replace('_', ' ') }}</td><td class="p-3 whitespace-nowrap"><button type="button" class="text-emerald-700 mr-3 disabled:opacity-40" [disabled]="installmentProcessingId() === item.id || item.status === 'paid'" (click)="setInstallmentStatus(item.id, 'paid')">Mark Paid</button><button type="button" class="text-rose-700 disabled:opacity-40" [disabled]="installmentProcessingId() === item.id || item.status === 'paid' || item.status === 'defaulted'" (click)="setInstallmentStatus(item.id, 'defaulted')">Mark Defaulted</button></td></tr> } @empty { <tr><td colspan="7" class="p-5 text-center text-slate-500">No payment schedule found.</td></tr> }</tbody></table></div>
        </div>
      </div>

      <bm-confirm-dialog
        [isOpen]="confirmTerminateDialog()"
        title="Terminate Lease Agreement"
        message="Are you sure you want to terminate this tenant lease agreement?"
        confirmLabel="Terminate Agreement"
        [isDanger]="true"
        [isSubmitting]="isActioning()"
        (confirm)="executeTerminate()"
        (cancel)="confirmTerminateDialog.set(false)"
      ></bm-confirm-dialog>
    }
  `,
})
export class TenantAgreementDetailComponent implements OnInit {
  private api = inject(TenantAgreementsApiService);
  private route = inject(ActivatedRoute);

  agreement = signal<TenantAgreement | null>(null);
  isLoading = signal(true);
  isActioning = signal(false);
  installmentProcessingId = signal<number | null>(null);
  error = signal<string | null>(null);

  confirmTerminateDialog = signal(false);

  ngOnInit(): void {
    this.loadAgreement();
  }

  loadAgreement(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.api.getAgreement(id).subscribe({
      next: (res) => {
        this.agreement.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Tenant agreement record not found.');
        this.isLoading.set(false);
      },
    });
  }

  tenantCustomer(): any {
    const a = this.agreement();
    if (!a || !a.tenant) return null;
    if ('data' in a.tenant && a.tenant.data) return a.tenant.data;
    if ('id' in a.tenant) return a.tenant;
    return null;
  }

  tenantName(): string {
    const tc = this.tenantCustomer();
    return tc ? tc.display_name : '—';
  }

  propertiesList(): any[] {
    const a = this.agreement();
    return a && a.properties ? a.properties : [];
  }

  executeTerminate(): void {
    const a = this.agreement();
    if (!a) return;

    this.isActioning.set(true);
    this.api.terminateAgreement(a.id).subscribe({
      next: (res) => {
        this.agreement.set(res.data);
        this.isActioning.set(false);
        this.confirmTerminateDialog.set(false);
      },
      error: (err) => {
        this.isActioning.set(false);
        alert(err.message || 'Failed to terminate tenant agreement.');
      },
    });
  }

  setInstallmentStatus(id: number, status: 'paid' | 'defaulted'): void {
    const agreement = this.agreement();
    if (!agreement) return;
    this.installmentProcessingId.set(id);
    this.api.updateInstallmentStatus(agreement.id, id, status).subscribe({ next: () => { this.installmentProcessingId.set(null); this.loadAgreement(); }, error: (err) => { this.installmentProcessingId.set(null); alert(err.message || 'Unable to update installment.'); } });
  }
}
