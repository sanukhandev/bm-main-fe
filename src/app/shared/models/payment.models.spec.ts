import { describe, expect, it } from 'vitest';
import {
  chequeActions,
  clearIrrelevantPaymentFields,
  InFlightGuard,
  PaymentModeDetails,
} from './payment.models';

describe('financial payment mode details', () => {
  const base = (): PaymentModeDetails => ({
    payment_mode: 'cheque',
    transaction_date: '2026-09-23',
    remarks: '',
    cheque_no: '123',
    cheque_date: '2026-09-23',
    bank_name: 'Bank',
    bank_reference: 'REF',
    transfer_date: '2026-09-23',
  });

  it('clears cheque and bank metadata when switching to cash', () => {
    const result = clearIrrelevantPaymentFields({ ...base(), payment_mode: 'cash' });
    expect(result.cheque_no).toBeUndefined();
    expect(result.bank_reference).toBeUndefined();
    expect(result.bank_name).toBeUndefined();
  });

  it('keeps only bank-transfer metadata for bank transfer', () => {
    const result = clearIrrelevantPaymentFields({ ...base(), payment_mode: 'bank_transfer' });
    expect(result.cheque_no).toBeUndefined();
    expect(result.bank_reference).toBe('REF');
    expect(result.transfer_date).toBe('2026-09-23');
  });

  it('exposes only valid cheque actions and intersects them with posting permission', () => {
    expect(chequeActions('received', true)).toEqual(['deposit', 'cancel']);
    expect(chequeActions('deposited', true)).toEqual(['clear', 'bounce', 'cancel']);
    expect(chequeActions('cleared', true)).toEqual([]);
    expect(chequeActions('bounced', true)).toEqual([]);
    expect(chequeActions('cancelled', true)).toEqual([]);
    expect(chequeActions('received', false)).toEqual([]);
  });

  it('blocks a second in-flight financial action', () => {
    const guard = new InFlightGuard();
    expect(guard.begin()).toBe(true);
    expect(guard.begin()).toBe(false);
    guard.end();
    expect(guard.begin()).toBe(true);
  });
});
