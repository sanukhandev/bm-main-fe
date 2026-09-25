export type CustomerType = 'individual' | 'organization';
export type CustomerStatus = 'active' | 'inactive' | 'archived';
export type CustomerRole = 'owner' | 'tenant';

export interface Customer {
  id: number;
  branch_id: number;
  customer_code: string;
  customer_type: CustomerType;
  display_name: string;
  legal_name?: string | null;
  phone?: string | null;
  email?: string | null;
  tax_registration_no?: string | null;
  identity_no?: string | null;
  identity_verified?: boolean;
  company_registration_no?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state_or_emirate?: string | null;
  country_code?: string | null;
  status: CustomerStatus;
  notes?: string | null;
  roles?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CustomerProfile {
  properties: CustomerProperty[];
  agreements: { owner: CustomerAgreement[]; tenant: CustomerAgreement[] };
  transactions: { data: CustomerTransaction[]; total: number; truncated: boolean };
  financial_restricted: boolean;
}

export interface CustomerProperty {
  id: number;
  property_code: string;
  name?: string | null;
  building_name?: string | null;
  unit_number?: string | null;
  property_type?: string | null;
  status?: string | null;
}

export interface CustomerAgreement {
  id: number;
  agreement_no: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: string;
  properties: CustomerProperty[];
}

export interface CustomerTransaction {
  id: number;
  document_no: string;
  transaction_date: string;
  direction: string;
  payment_mode: string;
  amount: string;
  status: string;
  remarks?: string | null;
  agreement_numbers: string[];
}

export interface CreateCustomerDto {
  customer_code?: string;
  customer_type: CustomerType;
  display_name: string;
  legal_name?: string | null;
  phone?: string | null;
  email?: string | null;
  tax_registration_no?: string | null;
  identity_no?: string | null;
  identity_verification_token?: string | null;
  company_registration_no?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state_or_emirate?: string | null;
  country_code?: string | null;
  notes?: string | null;
  roles?: CustomerRole[];
}
