export interface BillingLine {
  id?: number;
  particulars: string;
  quantity: number | string;
  unit_price: number | string;
  line_total?: number | string;
}
export interface BillingPayment {
  id: number;
  direction: 'inward' | 'outward';
  particulars: string;
  amount: number | string;
  due_date?: string | null;
  payment_mode: 'cash' | 'cheque' | 'bank_transfer';
  cheque_no?: string | null;
  cheque_date?: string | null;
  bank_name?: string | null;
  bank_reference?: string | null;
  transfer_date?: string | null;
  status: string;
  terms?: string | null;
  receipt?: PaymentReceipt | null;
}
export interface Quotation {
  id: number;
  quotation_no: string;
  work_order_id?: number | null;
  work_order?: { id: number; work_order_no: string; title: string } | null;
  vendor?: { id: number; name: string } | null;
  title: string;
  description?: string | null;
  quotation_date: string;
  valid_until?: string | null;
  status: string;
  subtotal: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  lines?: BillingLine[];
  payments?: BillingPayment[];
}
export interface Invoice {
  id: number;
  invoice_no: string;
  quotation_id?: number | null;
  quotation?: Quotation | null;
  work_order_id?: number | null;
  work_order?: { id: number; work_order_no: string; title: string } | null;
  vendor?: { id: number; name: string } | null;
  title: string;
  description?: string | null;
  invoice_date: string;
  due_date?: string | null;
  status: string;
  subtotal: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  lines?: BillingLine[];
  payments?: BillingPayment[];
}
import type { PaymentReceipt } from './payment.models';
