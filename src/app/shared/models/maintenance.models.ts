export interface Vendor {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  status: string;
}
export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  unit_of_measure: string;
  reorder_level: string | number;
  stock_on_hand: string | number;
  status: string;
}
export interface WorkOrderLine {
  id: number;
  line_type: 'service' | 'inventory';
  inventory_item_id?: number | null;
  inventory_item?: InventoryItem;
  description: string;
  quantity: string | number;
  unit_cost: string | number;
}
export interface WorkOrder {
  id: number;
  work_order_no: string;
  property?: { id: number; name: string; property_code: string };
  vendor?: Vendor | null;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  service_charge: string | number;
  lines?: WorkOrderLine[];
  payments?: WorkOrderPayment[];
  opened_at?: string | null;
  completed_at?: string | null;
}
export interface WorkOrderPayment {
  id: number;
  direction: 'inward' | 'outward';
  category: string;
  particulars: string;
  amount: string | number;
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
import type { PaymentReceipt } from './payment.models';
