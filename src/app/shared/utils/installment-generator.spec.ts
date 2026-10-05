import { describe, it, expect } from 'vitest';
import { generateInstallmentSchedule } from './installment-generator';

describe('installment-generator utility', () => {
  it('generates equal monthly installments and handles rounding remainder on last cycle', () => {
    const schedule = generateInstallmentSchedule({
      totalAmount: 10000,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      paymentCount: 3,
      paymentFrequency: 'monthly',
      paymentMode: 'cheque',
    });

    expect(schedule.length).toBe(3);
    expect(schedule[0].amount).toBe(3333.33);
    expect(schedule[1].amount).toBe(3333.33);
    expect(schedule[2].amount).toBe(3333.34);

    const sum = schedule.reduce((acc, curr) => acc + curr.amount, 0);
    expect(Math.round(sum * 100) / 100).toBe(10000);
  });

  it('handles single installment gracefully', () => {
    const schedule = generateInstallmentSchedule({
      totalAmount: 5000,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      paymentCount: 1,
      paymentFrequency: 'annually',
      paymentMode: 'bank_transfer',
    });

    expect(schedule.length).toBe(1);
    expect(schedule[0].amount).toBe(5000);
    expect(schedule[0].payment_mode).toBe('bank_transfer');
  });
});
