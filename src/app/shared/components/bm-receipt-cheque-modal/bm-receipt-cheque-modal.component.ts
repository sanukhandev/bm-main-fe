import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountTransaction } from '../../../core/api/accounts-api.service';
import { numberToWords } from '../../utils/uae-formatters';

@Component({
  selector: 'bm-receipt-cheque-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen() && transaction()) {
      <div
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto bm-modal-backdrop print:p-0 print:bg-white print:static print:block"
      >
        <div
          class="max-w-3xl w-full bg-white rounded-2xl lg:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden bm-modal-content print:shadow-none print:border-none print:max-w-none print:w-full"
        >
          <!-- Top Toolbar (Hidden on Print) -->
          <div
            class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden"
          >
            <div
              class="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>
                {{
                  transaction()!.direction === 'inward'
                    ? 'Official Receipt Voucher'
                    : 'Payment Disbursement Voucher'
                }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="printVoucher()"
                class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
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
                <span>Print Voucher</span>
              </button>
              <button
                type="button"
                (click)="closeModal()"
                class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-base font-bold transition"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- BANK CHEQUE / OFFICIAL VOUCHER CARD CONTAINER -->
          <div class="p-6 md:p-8 bg-slate-50/50 print:p-2">
            <div
              class="bg-white rounded-xl border-2 border-dashed p-6 md:p-8 relative shadow-xs overflow-hidden"
              [class.border-emerald-300]="transaction()!.direction === 'inward'"
              [class.border-rose-300]="transaction()!.direction === 'outward'"
            >
              <!-- Background Watermark Accent -->
              <div
                class="absolute -right-8 -bottom-8 opacity-[0.03] text-slate-900 pointer-events-none select-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-64 w-64"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              <!-- DIAGONAL VOID STAMP OVERLAY FOR VOIDED TRANSACTIONS -->
              @if (transaction()!.status === 'void' || transaction()!.status === 'voided') {
                <div
                  class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none overflow-hidden"
                >
                  <div
                    class="transform -rotate-12 border-8 border-rose-600/80 text-rose-600/80 text-6xl sm:text-8xl font-black uppercase tracking-widest px-8 py-3 rounded-2xl shadow-2xl backdrop-blur-[1px]"
                  >
                    VOID
                  </div>
                </div>
              }

              <!-- CHEQUE HEADER BLOCK -->
              <div
                class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-200"
              >
                <!-- Company Info & Logo -->
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#132a13] to-[#31572c] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0"
                  >
                    BM
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-900 uppercase tracking-widest">
                      BAITHUL MADEENA REAL ESTATE
                    </div>
                    <div class="text-[11px] text-slate-500 font-medium">
                      Property Asset Management & Leasing · United Arab Emirates
                    </div>
                  </div>
                </div>

                <!-- Direction Badge & Document Info -->
                <div class="text-left sm:text-right space-y-1.5 w-full sm:w-auto">
                  <div class="flex items-center sm:justify-end gap-2">
                    <!-- PROMINENT DIRECTION BADGES: OUTWARD (RED) vs INWARD (GREEN) -->
                    @if (transaction()!.direction === 'outward') {
                      <span
                        class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wider shadow-2xs"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3.5 w-3.5 text-rose-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                        <span>OUTWARD</span>
                      </span>
                    } @else {
                      <span
                        class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider shadow-2xs"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3.5 w-3.5 text-emerald-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                        <span>INWARD</span>
                      </span>
                    }

                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border"
                      [ngClass]="statusBadgeClasses(transaction()!.status)"
                    >
                      {{ transaction()!.status }}
                    </span>
                  </div>

                  <div class="text-xs font-semibold text-slate-700 tabular-nums">
                    Voucher No:
                    <span class="font-bold text-slate-900">{{ transaction()!.document_no }}</span>
                  </div>
                  <div class="text-xs text-slate-500 tabular-nums">
                    Date:
                    <span class="font-medium text-slate-800">{{
                      transaction()!.transaction_date
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- VOUCHER TITLE BANNER -->
              <div class="py-4 text-center border-b border-slate-100">
                <h2 class="text-base sm:text-lg font-bold uppercase tracking-widest text-slate-900">
                  {{
                    transaction()!.direction === 'inward'
                      ? 'OFFICIAL RECEIPT VOUCHER'
                      : 'PAYMENT DISBURSEMENT VOUCHER'
                  }}
                </h2>
              </div>

              <!-- VOID REASON BANNER FOR VOIDED VOUCHERS -->
              @if (transaction()!.status === 'void' || transaction()!.status === 'voided') {
                <div
                  class="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 text-xs space-y-1 my-4"
                >
                  <div
                    class="font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-rose-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>DOCUMENT STATUS: VOIDED</span>
                  </div>
                  <div class="text-rose-800 font-medium">
                    Void Reason:
                    {{
                      transaction()!.void_reason ||
                        'Transaction voided by authorized administrator.'
                    }}
                  </div>
                  @if (transaction()!.voided_at) {
                    <div class="text-[11px] text-rose-600">
                      Voided Date: {{ transaction()!.voided_at }}
                    </div>
                  }
                </div>
              }

              <!-- CHEQUE BODY FIELDS -->
              <div class="py-6 space-y-6">
                <!-- Row 1: Received From / Pay To Line + Amount Box -->
                <div
                  class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-100"
                >
                  <div class="flex-1 space-y-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {{
                        transaction()!.direction === 'inward'
                          ? 'RECEIVED WITH THANKS FROM'
                          : 'PAY TO THE ORDER OF'
                      }}
                    </div>
                    <div class="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-emerald-700 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span class="underline decoration-slate-300 underline-offset-4">{{
                        partyDisplayName()
                      }}</span>
                    </div>
                    @if (transaction()!.party?.customer_code) {
                      <div class="text-xs text-slate-500 tabular-nums">
                        Customer / Party Code:
                        <strong class="text-slate-700">{{
                          transaction()!.party?.customer_code
                        }}</strong>
                      </div>
                    }
                  </div>

                  <!-- CHEQUE NUMERICAL AMOUNT BOX -->
                  <div
                    class="bg-slate-900 text-white rounded-xl px-5 py-3 border-2 border-slate-700 shadow-md text-right shrink-0"
                  >
                    <div class="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      VOUCHER AMOUNT
                    </div>
                    <div class="text-2xl font-bold font-mono tracking-tight tabular-nums mt-0.5">
                      <span class="text-xs text-slate-400 font-normal mr-1">AED</span>
                      <span>*** {{ formatAmount(transaction()!.amount) }} ***</span>
                    </div>
                  </div>
                </div>

                <!-- Row 2: Amount in Words Line -->
                <div class="pb-4 border-b border-slate-100 space-y-1">
                  <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    THE SUM OF DIRHAMS
                  </div>
                  <div
                    class="text-sm font-semibold text-slate-800 italic bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200/80"
                  >
                    {{ amountInWords() }}
                  </div>
                </div>

                <!-- Row 3: Transaction Particulars & Payment Mode Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <!-- Particulars Box -->
                  <div class="space-y-1.5 p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div
                      class="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Particulars / Remarks</span>
                    </div>
                    <div class="text-slate-900 font-medium leading-relaxed">
                      {{ transaction()!.remarks || 'Financial transaction entry' }}
                    </div>
                  </div>

                  <!-- Payment Mode Details Box -->
                  <div class="space-y-1.5 p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div
                      class="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Payment Instrument & Reference</span>
                    </div>
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900 capitalize">{{
                          (transaction()!.payment_mode || '').replace('_', ' ')
                        }}</span>
                        @if (
                          transaction()!.payment_mode === 'cheque' && transaction()!.cheque_status
                        ) {
                          <span
                            class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-100 text-amber-900"
                          >
                            {{ transaction()!.cheque_status }}
                          </span>
                        }
                      </div>

                      @if (transaction()!.payment_mode === 'cheque') {
                        <div class="text-slate-600 tabular-nums">
                          Cheque #:
                          <strong class="text-slate-900">{{
                            transaction()!.cheque_no || '—'
                          }}</strong>
                          · Date: {{ transaction()!.cheque_date || '—' }}
                        </div>
                        @if (transaction()!.bank_name) {
                          <div class="text-slate-500">Bank: {{ transaction()!.bank_name }}</div>
                        }
                      }

                      @if (transaction()!.payment_mode === 'bank_transfer') {
                        <div class="text-slate-600 tabular-nums">
                          Bank Ref #:
                          <strong class="text-slate-900">{{
                            transaction()!.bank_reference || '—'
                          }}</strong>
                          · Date: {{ transaction()!.transfer_date || '—' }}
                        </div>
                        @if (transaction()!.bank_name) {
                          <div class="text-slate-500">
                            Drawn Bank: {{ transaction()!.bank_name }}
                          </div>
                        }
                      }

                      @if (transaction()!.payment_mode === 'cash') {
                        <div class="text-slate-500">Direct Cash Settlement</div>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- CHEQUE SIGNATURE & AUTHORIZATION FOOTER -->
              <div
                class="pt-8 mt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs"
              >
                <div class="space-y-8">
                  <div class="h-10 border-b border-slate-300 border-dashed"></div>
                  <div class="font-semibold text-slate-700">Prepared By / Accountant</div>
                </div>

                <div class="flex flex-col items-center justify-center space-y-1">
                  <div
                    class="w-16 h-16 rounded-full border-2 border-emerald-700/30 flex items-center justify-center p-1 text-center bg-emerald-50/50"
                  >
                    <div
                      class="text-[9px] font-bold text-emerald-800 uppercase tracking-tighter leading-tight"
                    >
                      BAITHUL MADEENA<br />VERIFIED<br />OFFICIAL SEAL
                    </div>
                  </div>
                  <div class="text-[10px] text-slate-400 font-medium">Digital Audit Trail</div>
                </div>

                <div class="space-y-8">
                  <div class="h-10 border-b border-slate-300 border-dashed"></div>
                  <div class="font-semibold text-slate-700">Authorized Receiver / Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class BmReceiptChequeModalComponent {
  isOpen = input<boolean>(false);
  transaction = input<AccountTransaction | null>(null);
  close = output<void>();

  partyDisplayName = computed(() => {
    const t = this.transaction();
    if (!t) return 'Miscellaneous Party';
    if (t.party && typeof t.party === 'object' && t.party.display_name) {
      return t.party.display_name;
    }
    return (t as any).party || 'Miscellaneous Party';
  });

  amountInWords = computed(() => {
    const t = this.transaction();
    return t ? numberToWords(t.amount) : 'Zero Dirhams Only';
  });

  formatAmount(val: string | number | undefined | null): string {
    if (!val) return '0.00';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  statusBadgeClasses(status: string | undefined): string {
    switch (status) {
      case 'posted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'void':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'draft':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  printVoucher(): void {
    window.print();
  }

  closeModal(): void {
    this.close.emit();
  }
}
