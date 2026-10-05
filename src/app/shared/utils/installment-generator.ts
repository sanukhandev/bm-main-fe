import { uaeDateInput } from './uae-formatters';

export interface GeneratedInstallmentInput {
  totalAmount: number;
  startDate: string;
  endDate: string;
  paymentCount: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | string;
  paymentMode: string;
}

export interface GeneratedInstallment {
  installment_no: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  balance: number;
  status: 'pending' | 'partially_paid' | 'paid' | 'defaulted';
  payment_mode: string;
}

/**
 * Generate a precise, rounded payment schedule for owner & tenant agreements.
 */
export function generateInstallmentSchedule(
  input: GeneratedInstallmentInput,
): GeneratedInstallment[] {
  const count = Math.max(1, input.paymentCount || 1);
  const total = Math.max(0, input.totalAmount || 0);

  // Equal division rounded to 2 decimal places
  const baseAmount = Math.floor((total / count) * 100) / 100;
  // Remainder added to last installment to prevent rounding drift
  const remainder = Math.round((total - baseAmount * count) * 100) / 100;

  const start = input.startDate ? new Date(input.startDate) : new Date();
  const monthStepMap: Record<string, number> = {
    monthly: 1,
    quarterly: 3,
    semi_annually: 6,
    annually: 12,
  };
  const stepMonths = monthStepMap[input.paymentFrequency?.toLowerCase()] || 1;

  const schedule: GeneratedInstallment[] = [];

  for (let i = 0; i < count; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(start.getMonth() + i * stepMonths);

    const isLast = i === count - 1;
    const installmentAmount = isLast
      ? Math.round((baseAmount + remainder) * 100) / 100
      : baseAmount;

    schedule.push({
      installment_no: i + 1,
      due_date: uaeDateInput(dueDate),
      amount: installmentAmount,
      paid_amount: 0,
      balance: installmentAmount,
      status: 'pending',
      payment_mode: input.paymentMode || 'cheque',
    });
  }

  return schedule;
}
