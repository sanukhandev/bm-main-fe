export type PaymentMode = 'cash' | 'cheque' | 'bank_transfer';

export interface PaymentModeDetails {
  payment_mode: PaymentMode;
  transaction_date: string;
  remarks: string;
  cheque_no?: string;
  cheque_date?: string;
  bank_name?: string;
  bank_reference?: string;
  transfer_date?: string;
}

export function clearIrrelevantPaymentFields(value: PaymentModeDetails): PaymentModeDetails {
  const next = { ...value };
  if (next.payment_mode !== 'cheque') {
    next.cheque_no = undefined;
    next.cheque_date = undefined;
  }
  if (next.payment_mode !== 'bank_transfer') {
    next.bank_reference = undefined;
    next.transfer_date = undefined;
  }
  if (next.payment_mode === 'cash') next.bank_name = undefined;
  return next;
}
