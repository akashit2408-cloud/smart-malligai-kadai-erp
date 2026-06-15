export type Role = 'super_admin' | 'store_owner' | 'manager' | 'cashier' | 'staff';

export interface Store {
  id: string;
  name: string;
  owner_id: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: Role;
  store_id?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Brand {
  id: string;
  store_id: string;
  name: string;
  created_at: string;
}

export interface Unit {
  id: string;
  store_id: string;
  name: string;
  abbreviation: string;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  sku?: string;
  barcode?: string;
  category_id?: string;
  brand_id?: string;
  unit_id?: string;
  description?: string;
  image_url?: string;
  cost_price: number;
  selling_price: number;
  mrp?: number;
  gst_rate: number;
  min_stock_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  store_id: string;
  quantity: number;
  batch_number?: string;
  expiry_date?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  credit_limit: number;
  outstanding_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerLedger {
  id: string;
  customer_id: string;
  store_id: string;
  sale_id?: string;
  amount: number;
  type: 'credit' | 'payment' | 'adjustment';
  description?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  due_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  store_id: string;
  invoice_number: string;
  customer_id?: string;
  user_id: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_mode: string;
  payment_status: 'paid' | 'pending' | 'partial';
  notes?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  store_id: string;
  supplier_id?: string;
  invoice_number?: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  purchase_date: string;
  created_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_amount: number;
  created_at: string;
}

export interface Employee {
  id: string;
  store_id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  role: string;
  salary: number;
  join_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  store_id: string;
  check_in: string;
  check_out?: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  store_id: string;
  category: string;
  amount: number;
  description?: string;
  expense_date: string;
  receipt_url?: string;
  created_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  store_id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'new_sale' | 'new_purchase' | 'credit_payment' | 'expiry' | 'info';
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  store_id: string;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'damage' | 'return';
  quantity: number;
  reference_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export type Permission =
  | 'view_dashboard'
  | 'manage_inventory'
  | 'manage_billing'
  | 'manage_customers'
  | 'manage_suppliers'
  | 'manage_employees'
  | 'manage_expenses'
  | 'view_reports'
  | 'manage_settings'
  | 'manage_users'
  | 'delete_records'
  | 'view_analytics';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ['manage_users', 'manage_settings', 'view_analytics'],
  store_owner: ['*'] as unknown as Permission[],
  manager: [
    'view_dashboard',
    'manage_inventory',
    'manage_billing',
    'manage_customers',
    'manage_suppliers',
    'manage_employees',
    'manage_expenses',
    'view_reports',
    'view_analytics',
  ],
  cashier: ['view_dashboard', 'manage_billing', 'manage_customers'],
  staff: ['view_dashboard', 'manage_inventory'],
};
