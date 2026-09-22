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

export interface CreateCustomerDto {
  customer_code?: string;
  customer_type: CustomerType;
  display_name: string;
  legal_name?: string | null;
  phone?: string | null;
  email?: string | null;
  tax_registration_no?: string | null;
  identity_no?: string | null;
  company_registration_no?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state_or_emirate?: string | null;
  country_code?: string | null;
  notes?: string | null;
  roles?: CustomerRole[];
}
