import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyActionProposal } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-action-proposal-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-2xl border p-4 space-y-3.5 shadow-2xs transition-all font-poppins"
      [ngClass]="{
        'bg-white border-brand-200': effectiveStatus === 'pending',
        'bg-emerald-50/70 border-emerald-200': effectiveStatus === 'executed',
        'bg-slate-50 border-slate-200': effectiveStatus === 'rejected' || effectiveStatus === 'expired'
      }"
    >
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="space-y-1 min-w-0">
          <div class="flex flex-wrap items-center gap-1.5">
            <span
              class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              [ngClass]="{
                'bg-amber-100 text-amber-800': proposal.risk_level === 'high' && effectiveStatus === 'pending',
                'bg-brand-50 text-brand-700': proposal.risk_level !== 'high' && effectiveStatus === 'pending',
                'bg-emerald-100 text-emerald-800': effectiveStatus === 'executed',
                'bg-slate-200 text-slate-600': effectiveStatus === 'rejected' || effectiveStatus === 'expired'
              }"
            >
              @if (effectiveStatus === 'executed') {
                Executed
              } @else if (effectiveStatus === 'rejected') {
                Rejected
              } @else if (effectiveStatus === 'expired') {
                Expired
              } @else {
                Approval Required
              }
            </span>
            @if (proposal.branch_name) {
              <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {{ proposal.branch_name }}
              </span>
            }
          </div>
          <h4 class="text-sm font-semibold text-slate-900">
            {{ proposal.title || 'Proposed ERP Action' }}
          </h4>
          @if (proposal.summary) {
            <p class="text-xs text-slate-600 leading-relaxed">{{ proposal.summary }}</p>
          }
        </div>
      </div>

      <!-- Read-only verified summary fields -->
      @if (proposal.fields?.length) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          @for (field of proposal.fields; track field.key) {
            <div class="rounded-xl bg-slate-50/90 border border-slate-200/70 px-3 py-2">
              <div class="text-[10px] font-medium text-slate-400">{{ field.label }}</div>
              <div class="font-medium text-slate-800 truncate">{{ field.value }}</div>
            </div>
          }
        </div>
      }

      <!-- Editable override controls while pending -->
      @if (effectiveStatus === 'pending' && proposal.editable_fields?.length) {
        <div class="pt-1 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          @for (field of proposal.editable_fields; track field.key) {
            <label class="block space-y-1" [class.sm:col-span-2]="field.type === 'textarea'">
              <span class="text-[11px] font-medium text-slate-600">{{ field.label }}</span>
              @if (field.type === 'select') {
                <select
                  [value]="fieldValue(field.key)"
                  [disabled]="submitting"
                  (change)="onFieldChange(field.key, $any($event.target).value)"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                >
                  @for (opt of field.options || []; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
              } @else if (field.type === 'textarea') {
                <textarea
                  rows="2"
                  [value]="fieldValue(field.key)"
                  [disabled]="submitting"
                  (input)="onFieldChange(field.key, $any($event.target).value)"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                ></textarea>
              } @else {
                <input
                  [type]="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
                  [step]="field.type === 'number' ? '0.01' : null"
                  [value]="fieldValue(field.key)"
                  [disabled]="submitting"
                  (input)="onFieldChange(field.key, $any($event.target).value)"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                />
              }
            </label>
          }
        </div>
      }

      <!-- Inline error banner -->
      @if (errorMessage) {
        <div class="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 text-xs font-medium">
          {{ errorMessage }}
        </div>
      }

      <!-- Action Footer -->
      @if (effectiveStatus === 'pending') {
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <span class="text-[11px] text-slate-400">
            No ERP changes occur until you confirm.
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              [disabled]="submitting"
              (click)="onReject.emit(proposal.proposal_id)"
              class="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              [disabled]="submitting"
              (click)="emitConfirm()"
              class="px-4 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {{ submitting ? 'Executing...' : 'Confirm & Execute' }}
            </button>
          </div>
        </div>
      } @else if (effectiveStatus === 'executed') {
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/70">
          <span class="text-xs font-semibold text-emerald-800">
            Completed: {{ proposal.result_label || 'Action executed successfully' }}
          </span>
          @if (proposal.result_route) {
            <button
              type="button"
              (click)="onNavigate.emit(proposal.result_route)"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              <span>Open Record</span>
              <span>→</span>
            </button>
          }
        </div>
      } @else if (effectiveStatus === 'rejected') {
        <div class="text-xs text-slate-500 pt-1 border-t border-slate-200/70">
          Proposal cancelled. No ERP records were modified.
        </div>
      } @else {
        <div class="text-xs text-amber-700 pt-1 border-t border-slate-200/70">
          This proposal expired before confirmation. Ask Zaakiy to prepare a fresh proposal.
        </div>
      }
    </div>
  `,
  styles: [],
})
export class ZaakiyActionProposalCardComponent implements OnInit, OnChanges {
  @Input({ required: true }) proposal!: ZaakiyActionProposal;
  @Input() submitting = false;
  @Input() errorMessage: string | null = null;

  @Output() onConfirm = new EventEmitter<{ proposalId: string; overrides: Record<string, unknown> }>();
  @Output() onReject = new EventEmitter<string>();
  @Output() onNavigate = new EventEmitter<string>();

  draftValues: Record<string, string> = {};
  private initialValues: Record<string, string> = {};
  private initializedProposalId: string | null = null;

  ngOnInit(): void {
    this.syncInitialValues();
  }

  ngOnChanges(): void {
    this.syncInitialValues();
  }

  get effectiveStatus(): 'pending' | 'executed' | 'rejected' | 'expired' {
    const status = this.proposal?.status ?? 'pending';
    if (status !== 'pending') return status;
    if (this.proposal?.expires_at) {
      const expiresMs = Date.parse(this.proposal.expires_at);
      if (!Number.isNaN(expiresMs) && expiresMs <= Date.now()) {
        return 'expired';
      }
    }
    return 'pending';
  }

  fieldValue(key: string): string {
    return this.draftValues[key] ?? '';
  }

  onFieldChange(key: string, value: string): void {
    this.draftValues[key] = value;
  }

  emitConfirm(): void {
    if (this.submitting || this.effectiveStatus !== 'pending') return;
    const overrides: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.draftValues)) {
      if (value !== this.initialValues[key]) {
        overrides[key] = value;
      }
    }
    this.onConfirm.emit({
      proposalId: this.proposal.proposal_id,
      overrides,
    });
  }

  private syncInitialValues(): void {
    if (!this.proposal || this.initializedProposalId === this.proposal.proposal_id) {
      return;
    }
    this.initializedProposalId = this.proposal.proposal_id;
    const initial: Record<string, string> = {};
    for (const field of this.proposal.editable_fields || []) {
      initial[field.key] = field.value === null || field.value === undefined ? '' : String(field.value);
    }
    this.initialValues = initial;
    this.draftValues = { ...initial };
  }
}
