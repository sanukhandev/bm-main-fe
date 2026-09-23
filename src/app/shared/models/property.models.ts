import { Customer } from './customer.models';

export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'shop'
  | 'office'
  | 'space'
  | 'labor_camp'
  | 'warehouse'
  | 'land';

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
