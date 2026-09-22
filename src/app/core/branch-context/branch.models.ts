export interface Branch {
  id: number;
  code: string;
  name: string;
  timezone: string;
  currency_code: string;
  status: 'active' | 'inactive';
}
