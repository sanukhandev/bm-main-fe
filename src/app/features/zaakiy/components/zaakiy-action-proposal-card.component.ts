import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZaakiyActionProposal } from '../../../core/api/zaakiy-api.service';

@Component({
  selector: 'bm-zaakiy-action-proposal-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-2xl border p-4 space-y-3.5 transition-all font-poppins"
      [ngClass]="{
        'bg-white border-slate-200/90': effectiveStatus === 'pending',
        'bg-emerald-50/50 border-emerald-200/80': effectiveStatus === 'executed',
        'bg-slate-50/80 border-slate-200/70': effectiveStatus === 'rejected' || effectiveStatus === 'expired'
      }"
    >
      <!-- Clean Header (No Stacked Badge Pills) -->
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-0.5 min-w-0">
          <div class="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <span
              class="w-2 h-2 rounded-full shrink-0"
              [ngClass]="{
                'bg-amber-500': proposal.risk_level === 'high' && effectiveStatus === 'pending',
                'bg-emerald-500': (proposal.risk_level !== 'high' && effectiveStatus === 'pending') || effectiveStatus === 'executed',
                'bg-slate-400': effectiveStatus === 'rejected' || effectiveStatus === 'expired'
              }"
            ></span>
            <span>
              @if (effectiveStatus === 'executed') {
                Executed
              } @else if (effectiveStatus === 'rejected') {
                Cancelled
              } @else if (effectiveStatus === 'expired') {
                Expired
              } @else {
                Review before executing
              }
            </span>
            @if (proposal.branch_name) {
              <span class="text-slate-300">·</span>
              <span>{{ proposal.branch_name }}</span>
            }
          </div>
          <h4 class="text-sm font-semibold text-slate-900">
            {{ proposal.title || 'Proposed ERP Action' }}
          </h4>
          @if (proposal.summary) {
            <p class="text-xs text-slate-500 leading-relaxed">{{ proposal.summary }}</p>
          }
        </div>
      </div>

      <!-- Key/Value Context Summary -->
      @if (proposal.fields?.length) {
        <div class="grid grid-cols-2 gap-x-6 gap-y-2 py-2.5 border-y border-slate-100 text-xs">
          @for (field of proposal.fields; track field.key) {
            <div class="min-w-0">
              <div class="text-[11px] text-slate-400">{{ field.label }}</div>
              <div class="font-medium text-slate-800 truncate">{{ field.value }}</div>
            </div>
          }
        </div>
      }

      <!-- Editable Fields -->
      @if (effectiveStatus === 'pending' && proposal.editable_fields?.length) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          @for (field of proposal.editable_fields; track field.key) {
            <label class="block space-y-1" [class.sm:col-span-2]="field.type === 'textarea'">
              <span class="text-[11px] font-medium text-slate-500">{{ field.label }}</span>
              @if (field.type === 'select') {
                <select
                  [value]="fieldValue(field.key)"
                  [disabled]="submitting"
                  (change)="onFieldChange(field.key, $any($event.target).value)"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none transition"
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
                  class="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none transition"
                ></textarea>
              } @else {
                <input
                  [type]="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
                  [step]="field.type === 'number' ? '0.01' : null"
                  [value]="fieldValue(field.key)"
                  [disabled]="submitting"
                  (input)="onFieldChange(field.key, $any($event.target).value)"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none transition"
                />
              }
            </label>
          }
        </div>
      }

      <!-- Inline Error -->
      @if (errorMessage) {
        <div class="rounded-xl bg-rose-50 text-rose-700 px-3 py-2 text-xs font-medium">
          {{ errorMessage }}
        </div>
      }

      <!-- Footer -->
      @if (effectiveStatus === 'pending') {
        <div class="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            [disabled]="submitting"
            (click)="onReject.emit(proposal.proposal_id)"
            class="px-3.5 py-2 rounded-full text-slate-600 hover:bg-slate-100 text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            [disabled]="submitting"
            (click)="emitConfirm()"
            class="px-4 py-2 rounded-full bg-slate-900 hover:bg-emerald-700 text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {{ submitting ? 'Executing...' : 'Confirm & Execute' }}
          </button>
        </div>
      } @else if (effectiveStatus === 'executed') {
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span class="text-xs font-medium text-emerald-800">
            {{ proposal.result_label || 'Action executed successfully' }}
          </span>
          @if (proposal.result_route) {
            <button
              type="button"
              (click)="onNavigate.emit(proposal.result_route)"
              class="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <span>Open Record</span>
              <span>→</span>
            </button>
          }
        </div>
      } @else if (effectiveStatus === 'rejected') {
        <div class="text-xs text-slate-500">
          Cancelled. No ERP records were changed.
        </div>
      } @else {
        <div class="text-xs text-slate-500">
          Expired before confirmation. Ask Zaakiy to prepare a fresh proposal.
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
