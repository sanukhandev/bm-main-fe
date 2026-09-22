import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BmPageHeaderComponent } from '../../shared/components/bm-page-header/bm-page-header.component';
import { BmStatusBadgeComponent } from '../../shared/components/bm-status-badge/bm-status-badge.component';
import { BmLoadingStateComponent } from '../../shared/components/bm-loading-state/bm-loading-state.component';
import { BmErrorStateComponent } from '../../shared/components/bm-error-state/bm-error-state.component';
import { BmConfirmDialogComponent } from '../../shared/components/bm-confirm-dialog/bm-confirm-dialog.component';
import { OwnerAgreementsApiService } from '../../core/api/owner-agreements-api.service';
import { OwnerAgreement } from '../../shared/models/agreement.models';

@Component({
  selector: 'bm-owner-agreement-detail',
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
        [title]="'Owner Agreement ' + agreement()!.agreement_no"
        subtitle="Document & Contract Specifications"
      >
        <a routerLink="/app/owner-agreements" class="bm-btn bm-btn-secondary text-xs">
          Back to List
        </a>

        @if (agreement()!.status === 'draft' || agreement()!.status === 'pending_approval') {
          <a [routerLink]="['/app/owner-agreements', agreement()!.id, 'edit']" class="bm-btn bm-btn-secondary text-xs">
            Edit Agreement
          </a>
        }

        @if (agreement()!.status !== 'terminated') {
          <button type="button" (click)="confirmTerminateDialog.set(true)" class="bm-btn bm-btn-danger text-xs">
            Terminate
          </button>
        }
        @if (agreement()!.status === 'draft') { <button type="button" (click)="transition('approved')" class="bm-btn bm-btn-primary text-xs">Approve</button> }
        @if (agreement()!.status === 'approved') { <button type="button" (click)="transition('commenced')" class="bm-btn bm-btn-primary text-xs">Commence</button> }
        @if (agreement()!.status === 'commenced') { <button type="button" (click)="transition('on_hold')" class="bm-btn bm-btn-secondary text-xs">Put On Hold</button> }
        @if (agreement()!.status === 'on_hold') { <button type="button" (click)="transition('commenced')" class="bm-btn bm-btn-primary text-xs">Resume</button> }
        @if (agreement()!.status !== 'terminated') { <button type="button" (click)="raiseDispute()" class="bm-btn bm-btn-secondary text-xs">Raise Dispute</button><button type="button" (click)="addExtraPayment()" class="bm-btn bm-btn-secondary text-xs">Add Payment Line</button> }
      </bm-page-header>

      <div class="bm-card p-8 md:p-12 max-w-4xl mx-auto space-y-8 bg-white border border-[#DDE3DF]">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Owner Management Agreement</div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight mt-1">{{ agreement()!.agreement_no }}</h2>
            <div class="text-xs text-slate-400 mt-0.5">Created: {{ agreement()!.created_at | date:'mediumDate' }}</div>
          </div>

          <div class="flex items-center gap-3">
            <bm-status-badge [status]="agreement()!.status"></bm-status-badge>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-slate-400 font-semibold uppercase tracking-wider mb-2">Property Owner</div>
            <div class="text-base font-bold text-slate-900">{{ ownerName() }}</div>
            @if (ownerCustomer()) {
              <div class="text-slate-500 mt-1">Code: {{ ownerCustomer()?.customer_code }}</div>
              <div class="text-slate-500">{{ ownerCustomer()?.phone }}</div>
            }
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-slate-400 font-semibold uppercase tracking-wider mb-2">Contract Period</div>
            <div class="text-base font-semibold text-slate-900 tabular-nums">
              {{ agreement()!.start_date }} &rarr; {{ agreement()!.end_date }}
            </div>
            <div class="text-slate-500 mt-1">Status: <span class="capitalize font-medium text-slate-800">{{ agreement()!.status }}</span></div>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Covered Property Assets</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (prop of propertiesList(); track prop.id) {
              <div class="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <div class="font-bold text-slate-900">[{{ prop.property_code }}] {{ prop.name }}</div>
                  <div class="text-slate-500">Unit: {{ prop.unit_number }} | {{ prop.property_type }}</div>
                </div>
                <a [routerLink]="['/app/properties', prop.id]" class="text-emerald-700 font-medium hover:underline">
                  View Asset &rarr;
                </a>
              </div>
            }
          </div>
        </div>

        @if ((agreement()!.disputes || []).length > 0) { <div><h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Dispute Updates</h3>@for (dispute of agreement()!.disputes || []; track dispute.id) { <div class="p-4 rounded-xl border border-amber-200 bg-amber-50 mb-3"><div class="font-semibold">{{ dispute.subject }} <span class="text-xs font-normal capitalize">({{ dispute.status }})</span></div><p class="text-xs mt-1">{{ dispute.description }}</p><button type="button" class="text-xs text-emerald-700 mt-2" (click)="commentDispute(dispute.id)">Add Comment</button></div> }</div> }

        <div>
          <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Commercial Terms & Financials</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs">
            <div>
              <div class="text-slate-500 font-medium">Total Contract Value</div>
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
              <div class="text-slate-500 font-medium">Installment Count</div>
              <div class="text-sm font-semibold text-slate-900 tabular-nums mt-1">
                {{ agreement()!.payment_count }} installments
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
            <div class="text-slate-400 font-semibold mb-1">Notes & Conditions</div>
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
        title="Terminate Agreement"
        message="Are you sure you want to terminate this owner agreement?"
        confirmLabel="Terminate Agreement"
        [isDanger]="true"
        [isSubmitting]="isActioning()"
        (confirm)="executeTerminate()"
        (cancel)="confirmTerminateDialog.set(false)"
      ></bm-confirm-dialog>
    }
  `,
})
export class OwnerAgreementDetailComponent implements OnInit {
  private api = inject(OwnerAgreementsApiService);
  private route = inject(ActivatedRoute);

  agreement = signal<OwnerAgreement | null>(null);
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
        this.error.set(err.message || 'Owner agreement record not found.');
        this.isLoading.set(false);
      },
    });
  }

  ownerCustomer(): any {
    const a = this.agreement();
    if (!a || !a.owner) return null;
    if ('data' in a.owner && a.owner.data) return a.owner.data;
    if ('id' in a.owner) return a.owner;
    return null;
  }

  ownerName(): string {
    const oc = this.ownerCustomer();
    return oc ? oc.display_name : '—';
  }

  propertiesList(): any[] {
    const a = this.agreement();
    if (!a || !a.properties) return [];
    if (Array.isArray(a.properties)) return a.properties;
    if ('data' in a.properties && Array.isArray(a.properties.data)) return a.properties.data;
    return [];
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
        alert(err.message || 'Failed to terminate agreement.');
      },
    });
  }

  setInstallmentStatus(id: number, status: 'paid' | 'defaulted'): void {
    const agreement = this.agreement();
    if (!agreement) return;
    this.installmentProcessingId.set(id);
    this.api.updateInstallmentStatus(agreement.id, id, status).subscribe({ next: () => { this.installmentProcessingId.set(null); this.loadAgreement(); }, error: (err) => { this.installmentProcessingId.set(null); alert(err.message || 'Unable to update installment.'); } });
  }

  transition(status: 'approved' | 'commenced' | 'on_hold'): void { const reason = status === 'on_hold' ? prompt('Reason for hold') || '' : ''; if (status === 'on_hold' && !reason) return; const id = this.agreement()?.id; if (!id) return; this.isActioning.set(true); this.api.transition(id, status, reason).subscribe({ next: (res) => { this.agreement.set(res.data); this.isActioning.set(false); }, error: (err) => { this.isActioning.set(false); alert(err.message || 'Unable to transition agreement.'); } }); }
  raiseDispute(): void { const id = this.agreement()?.id; const subject = prompt('Dispute subject'); const description = subject ? prompt('Dispute details') : null; if (!id || !subject || !description) return; this.api.raiseDispute(id, subject, description).subscribe({ next: () => this.loadAgreement(), error: (err) => alert(err.message || 'Unable to raise dispute.') }); }
  commentDispute(id: number): void { const comment = prompt('Add dispute update'); if (!comment) return; this.api.addDisputeComment(id, comment).subscribe({ next: () => this.loadAgreement(), error: (err) => alert(err.message || 'Unable to add comment.') }); }
  addExtraPayment(): void { const id = this.agreement()?.id; const category = prompt('Payment line category (commission/security)'); const amount = category ? Number(prompt('Amount') || 0) : 0; if (!id || !category || amount <= 0) return; this.api.addAdditionalPayment(id, { direction: 'outward', category, amount }).subscribe({ next: () => this.loadAgreement(), error: (err) => alert(err.message || 'Unable to add payment line.') }); }
}
