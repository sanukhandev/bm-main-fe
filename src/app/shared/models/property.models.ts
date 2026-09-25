import { Customer } from './customer.models';

export type PropertyType =
  'apartment' | 'villa' | 'shop' | 'office' | 'space' | 'labor_camp' | 'warehouse' | 'land';

export type PropertyStatus = 'active' | 'inactive' | 'archived';

export interface Property {
  id: number;
  branch_id: number;
  owner_customer_id: number;
  owner?: { data: Customer } | Customer;
  property_code: string;
  unit_number: string;
  property_type: PropertyType;
  name: string;
  building_name?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state_or_emirate?: string | null;
  country_code?: string | null;
  area?: string | number | null;
  status: PropertyStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePropertyDto {
  owner_customer_id: number;
  property_code?: string;
  unit_number: string;
  property_type: PropertyType;
  name: string;
  building_name?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state_or_emirate?: string | null;
  country_code?: string | null;
  area?: string | number | null;
  notes?: string | null;
}

export interface PropertyReceipt {
  id: number;
  document_no: string;
  direction: 'inward' | 'outward';
}

export interface PropertyPaymentLine {
  id: number;
  line_type: 'scheduled' | 'additional';
  line_no: number | string;
  particulars?: string | null;
  due_date?: string | null;
  amount: string;
  paid_amount: string;
  balance: string;
  direction: 'inward' | 'outward';
  payment_mode?: string | null;
  status: string;
  receipt?: PropertyReceipt | null;
}

export interface PropertyAgreementSummary {
  id: number;
  agreement_no: string;
  customer: { id: number; customer_code: string; display_name: string } | null;
  start_date: string;
  end_date: string;
  status: string;
  total_amount?: string | null;
  payment_lines: PropertyPaymentLine[];
}

export interface PropertyWorkOrderSummary {
  id: number;
  work_order_no: string;
  title: string;
  priority: string;
  status: string;
  vendor: { id: number; customer_code: string; display_name: string } | null;
  service_charge?: string | null;
  opened_at?: string | null;
  completed_at?: string | null;
  payments: PropertyPaymentLine[];
}

export interface PropertyProfile {
  owner_agreements: PropertyAgreementSummary[];
  tenant_agreements: PropertyAgreementSummary[];
  work_orders: PropertyWorkOrderSummary[];
  actions: {
    can_create_owner_agreement: boolean;
    can_create_tenant_agreement: boolean;
    default_owner_agreement_id?: number | null;
  };
  financial_restricted: boolean;
}
