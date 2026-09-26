export interface Branch {
  id: number;
  code: string;
  name: string;
  legal_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state_or_emirate?: string | null;
  timezone: string;
  currency_code: string;
  status: 'active' | 'inactive';
}
