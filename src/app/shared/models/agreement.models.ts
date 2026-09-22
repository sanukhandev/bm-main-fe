import { Customer } from './customer.models';
import { Property } from './property.models';

export type AgreementStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'commenced'
  | 'on_hold'
  | 'expired'
  | 'terminated';

export type PaymentMode = 'cash' | 'cheque' | 'bank_transfer';

export interface OwnerAgreement {
  id: number;
  branch_id: number;
  agreement_no: string;
  owner_customer_id: number;
  owner?: { data: Customer } | Customer;
  properties?: Property[] | { data: Property[] };
  property_ids?: number[];
  start_date: string;
  end_date: string;
  total_amount: string | number;
  currency_code: string;
  payment_count: number;
  payment_frequency: string;
  payment_mode: PaymentMode;
  terms_text?: string | null;
  notes?: string | null;
  status: AgreementStatus;
  lock_version?: number;
  terminated_at?: string | null;
  termination_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  installments?: AgreementInstallment[];
  disputes?: Array<{ id: number; subject: string; description: string; status: string; comments?: Array<{ comment: string }> }>;
  additional_payments?: Array<{ category: string; particulars: string; direction: string; amount: string | number; due_date: string; payment_mode: string; terms?: string }>;
}

export interface TenantAgreementPropertyItem {
  property_id: number;
  source_owner_agreement_id?: number | null;
  property?: Property;
}

export interface TenantAgreement {
  id: number;
  branch_id: number;
  agreement_no: string;
  tenant_customer_id: number;
  tenant?: { data: Customer } | Customer;
  properties?: TenantAgreementPropertyItem[];
  start_date: string;
  end_date: string;
  total_amount: string | number;
  currency_code: string;
  payment_count: number;
  payment_frequency: string;
  payment_mode: PaymentMode;
  terms_text?: string | null;
  notes?: string | null;
  status: AgreementStatus;
  lock_version?: number;
  terminated_at?: string | null;
  termination_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  installments?: AgreementInstallment[];
  disputes?: Array<{ id: number; subject: string; description: string; status: string; comments?: Array<{ comment: string }> }>;
  additional_payments?: Array<{ category: string; particulars: string; direction: string; amount: string | number; due_date: string; payment_mode: string; terms?: string }>;
}

export interface InstallmentItem {
  installment_number: number;
  due_date: string;
  amount: number;
  status: string;
}

export interface AgreementInstallment {
  id: number | string;
  installment_no: number | string;
  due_date: string;
  amount: string | number;
  paid_amount: string | number;
  balance: string | number;
  payment_mode: PaymentMode;
  direction: 'inward' | 'outward';
  status: string;
  notes?: string | null;
  is_extra?: boolean;
}
