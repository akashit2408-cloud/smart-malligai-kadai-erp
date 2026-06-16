-- Smart Malligai Kadai ERP - Initial Schema
-- PostgreSQL 15+ with Row Level Security

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

------------------------------------------------------------
-- Profiles & Roles
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'store_owner', 'manager', 'cashier', 'staff')),
  store_id UUID,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Store owners can manage their store profiles" ON public.profiles
  FOR ALL USING (
    store_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id = auth.uid())
  );

------------------------------------------------------------
-- Stores
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  gstin TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stores" ON public.stores
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE POLICY "Store owners can manage their stores" ON public.stores
  FOR ALL USING (owner_id = auth.uid());

------------------------------------------------------------
-- Security Definer Function for RLS
------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_store_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM public.stores WHERE owner_id = auth.uid()
  UNION
  SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL;
$$;

------------------------------------------------------------
-- Categories
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped categories" ON public.categories
  FOR ALL USING (store_id IN (SELECT public.user_store_ids()));

------------------------------------------------------------
-- Brands
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped brands" ON public.brands
  FOR ALL USING (store_id IN (SELECT public.user_store_ids()));

------------------------------------------------------------
-- Units
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped units" ON public.units
  FOR ALL USING (store_id IN (SELECT public.user_store_ids()));

------------------------------------------------------------
-- Products
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  description TEXT,
  image_url TEXT,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  mrp NUMERIC(12,2),
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  min_stock_level NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped products" ON public.products
  FOR ALL USING (store_id IN (SELECT public.user_store_ids()));

CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(store_id, is_active);

------------------------------------------------------------
-- Inventory (Stock by batch/expiry)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  batch_number TEXT,
  expiry_date DATE,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped inventory" ON public.inventory
  FOR ALL USING (store_id IN (SELECT public.user_store_ids()));

CREATE INDEX idx_inventory_product ON public.inventory(product_id);
CREATE INDEX idx_inventory_expiry ON public.inventory(expiry_date);
CREATE INDEX idx_inventory_store ON public.inventory(store_id);

------------------------------------------------------------
-- Inventory Movements (Audit trail)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'adjustment', 'damage', 'return', 'purchase')),
  quantity NUMERIC(10,2) NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped inventory movements" ON public.inventory_movements
  FOR ALL USING (store_id IN (SELECT public.user_store_ids()));

CREATE INDEX idx_inv_movements_product ON public.inventory_movements(product_id);
CREATE INDEX idx_inv_movements_store ON public.inventory_movements(store_id);

------------------------------------------------------------
-- Customers (Khata)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  outstanding_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped customers" ON public.customers
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE INDEX idx_customers_store_phone ON public.customers(store_id, phone);

------------------------------------------------------------
-- Customer Ledger
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  sale_id UUID,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'payment', 'adjustment')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped customer ledger" ON public.customer_ledger
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE INDEX idx_customer_ledger_customer ON public.customer_ledger(customer_id);
CREATE INDEX idx_customer_ledger_created ON public.customer_ledger(created_at);

------------------------------------------------------------
-- Suppliers
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  gstin TEXT,
  due_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped suppliers" ON public.suppliers
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE INDEX idx_suppliers_store ON public.suppliers(store_id);

------------------------------------------------------------
-- Purchases
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  invoice_number TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped purchases" ON public.purchases
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE INDEX idx_purchases_store ON public.purchases(store_id);
CREATE INDEX idx_purchases_supplier ON public.purchases(supplier_id);
CREATE INDEX idx_purchases_date ON public.purchases(purchase_date);

------------------------------------------------------------
-- Purchase Items
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped purchase items" ON public.purchase_items
  FOR ALL USING (
    purchase_id IN (SELECT id FROM public.purchases WHERE store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
      UNION
      SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL
    ))
  );

------------------------------------------------------------
-- Sales
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_mode TEXT NOT NULL DEFAULT 'cash',
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped sales" ON public.sales
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE INDEX idx_sales_store ON public.sales(store_id);
CREATE INDEX idx_sales_created ON public.sales(created_at);
CREATE INDEX idx_sales_invoice ON public.sales(invoice_number);
CREATE INDEX idx_sales_customer ON public.sales(customer_id);

------------------------------------------------------------
-- Sale Items
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped sale items" ON public.sale_items
  FOR ALL USING (
    sale_id IN (SELECT id FROM public.sales WHERE store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
      UNION
      SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL
    ))
  );

CREATE INDEX idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON public.sale_items(product_id);

------------------------------------------------------------
-- Employees
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'staff',
  salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped employees" ON public.employees
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE INDEX idx_employees_store ON public.employees(store_id);

------------------------------------------------------------
-- Attendance
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'leave')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped attendance" ON public.attendance
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE INDEX idx_attendance_employee ON public.attendance(employee_id);
CREATE INDEX idx_attendance_date ON public.attendance(check_in);

------------------------------------------------------------
-- Expenses
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped expenses" ON public.expenses
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE INDEX idx_expenses_store_date ON public.expenses(store_id, expense_date);
CREATE INDEX idx_expenses_category ON public.expenses(category);

------------------------------------------------------------
-- Notifications
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'new_sale', 'new_purchase', 'credit_payment', 'expiry', 'info')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_store ON public.notifications(store_id);

------------------------------------------------------------
-- Audit Logs
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Store scoped audit logs" ON public.audit_logs
  FOR SELECT USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND store_id IS NOT NULL)
  );

CREATE INDEX idx_audit_logs_store ON public.audit_logs(store_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);

------------------------------------------------------------
-- Functions & Triggers
------------------------------------------------------------

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER inventory_updated_at BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sync customer outstanding amount from ledger
CREATE OR REPLACE FUNCTION public.sync_customer_outstanding()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.customers
  SET outstanding_amount = COALESCE((
    SELECT SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END)
    FROM public.customer_ledger
    WHERE customer_id = NEW.customer_id
  ), 0)
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_ledger_change AFTER INSERT OR UPDATE OR DELETE ON public.customer_ledger
  FOR EACH ROW EXECUTE FUNCTION public.sync_customer_outstanding();

-- Sync supplier due amount from purchases
CREATE OR REPLACE FUNCTION public.sync_supplier_due()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.supplier_id IS NOT NULL THEN
    UPDATE public.suppliers
    SET due_amount = COALESCE((
      SELECT SUM(due_amount) FROM public.purchases WHERE supplier_id = NEW.supplier_id
    ), 0)
    WHERE id = NEW.supplier_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_change AFTER INSERT OR UPDATE OR DELETE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.sync_supplier_due();

-- Low stock notification trigger
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= (
    SELECT min_stock_level FROM public.products WHERE id = NEW.product_id
  ) THEN
    INSERT INTO public.notifications (user_id, store_id, title, message, type, metadata)
    SELECT
      owner_id,
      NEW.store_id,
      'Low Stock Alert',
      'Product ' || (SELECT name FROM public.products WHERE id = NEW.product_id) || ' is running low.',
      'low_stock',
      jsonb_build_object('product_id', NEW.product_id, 'quantity', NEW.quantity)
    FROM public.stores WHERE id = NEW.store_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_low_stock AFTER UPDATE OF quantity ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.check_low_stock();

-- Generic audit log trigger
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  store_id_value UUID;
BEGIN
  -- Try to extract store_id from the record
  IF TG_OP = 'DELETE' THEN
    store_id_value := OLD.store_id;
  ELSE
    store_id_value := NEW.store_id;
  END IF;

  INSERT INTO public.audit_logs (store_id, user_id, table_name, record_id, action, old_data, new_data)
  VALUES (
    store_id_value,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER products_audit AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER sales_audit AFTER INSERT OR UPDATE OR DELETE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER purchases_audit AFTER INSERT OR UPDATE OR DELETE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER customers_audit AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER suppliers_audit AFTER INSERT OR UPDATE OR DELETE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
CREATE TRIGGER inventory_audit AFTER INSERT OR UPDATE OR DELETE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

------------------------------------------------------------
-- Helper functions for dashboard
------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_inventory_value(p_store_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(i.quantity * p.cost_price), 0)
  INTO total
  FROM public.inventory i
  JOIN public.products p ON i.product_id = p.id
  WHERE i.store_id = p_store_id;
  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_today_profit(p_store_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  profit NUMERIC;
BEGIN
  SELECT COALESCE(SUM(
    (si.quantity * (si.unit_price - p.cost_price)) - si.discount_amount
  ), 0)
  INTO profit
  FROM public.sale_items si
  JOIN public.sales s ON si.sale_id = s.id
  JOIN public.products p ON si.product_id = p.id
  WHERE s.store_id = p_store_id
    AND DATE(s.created_at) = CURRENT_DATE;
  RETURN profit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_top_products(p_store_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(product_id UUID, product_name TEXT, total_qty NUMERIC, total_revenue NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.product_id,
    p.name AS product_name,
    COALESCE(SUM(si.quantity), 0)::NUMERIC AS total_qty,
    COALESCE(SUM(si.total_amount), 0)::NUMERIC AS total_revenue
  FROM public.sale_items si
  JOIN public.sales s ON si.sale_id = s.id
  JOIN public.products p ON si.product_id = p.id
  WHERE s.store_id = p_store_id
  GROUP BY si.product_id, p.name
  ORDER BY total_qty DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_low_stock(p_store_id UUID)
RETURNS TABLE(product_id UUID, product_name TEXT, quantity NUMERIC, min_stock_level NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    COALESCE(SUM(i.quantity), 0)::NUMERIC AS quantity,
    p.min_stock_level
  FROM public.products p
  LEFT JOIN public.inventory i ON p.id = i.product_id
  WHERE p.store_id = p_store_id AND p.is_active = TRUE
  GROUP BY p.id, p.name, p.min_stock_level
  HAVING COALESCE(SUM(i.quantity), 0) <= p.min_stock_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_sales_by_month(p_store_id UUID)
RETURNS TABLE(month TEXT, sales NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('month', s.created_at), 'Mon YYYY') AS month,
    COALESCE(SUM(s.total_amount), 0)::NUMERIC AS sales
  FROM public.sales s
  WHERE s.store_id = p_store_id
    AND s.created_at >= DATE_TRUNC('year', CURRENT_DATE)
  GROUP BY DATE_TRUNC('month', s.created_at)
  ORDER BY DATE_TRUNC('month', s.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_expenses_by_category(p_store_id UUID)
RETURNS TABLE(category TEXT, amount NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.category,
    COALESCE(SUM(e.amount), 0)::NUMERIC AS amount
  FROM public.expenses e
  WHERE e.store_id = p_store_id
    AND e.expense_date >= DATE_TRUNC('year', CURRENT_DATE)
  GROUP BY e.category
  ORDER BY amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrease_inventory(p_product_id UUID, p_store_id UUID, p_quantity NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.inventory
  SET quantity = GREATEST(quantity - p_quantity, 0)
  WHERE product_id = p_product_id AND store_id = p_store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_monthly_profit(p_store_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  profit NUMERIC;
BEGIN
  SELECT COALESCE(SUM(
    (si.quantity * (si.unit_price - p.cost_price)) - si.discount_amount
  ), 0)
  INTO profit
  FROM public.sale_items si
  JOIN public.sales s ON si.sale_id = s.id
  JOIN public.products p ON si.product_id = p.id
  WHERE s.store_id = p_store_id
    AND s.created_at >= DATE_TRUNC('month', CURRENT_DATE);
  RETURN profit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

------------------------------------------------------------
-- Helper views
------------------------------------------------------------
CREATE OR REPLACE VIEW public.dashboard_metrics AS
SELECT
  s.id AS store_id,
  COALESCE((
    SELECT SUM(total_amount) FROM public.sales WHERE store_id = s.id AND DATE(created_at) = CURRENT_DATE
  ), 0) AS today_sales,
  COALESCE((
    SELECT SUM(total_amount) FROM public.sales WHERE store_id = s.id AND DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE)
  ), 0) AS monthly_sales,
  COALESCE((
    SELECT SUM(outstanding_amount) FROM public.customers WHERE store_id = s.id
  ), 0) AS total_credit_outstanding,
  COALESCE((
    SELECT SUM(due_amount) FROM public.suppliers WHERE store_id = s.id
  ), 0) AS total_supplier_due,
  COALESCE((
    SELECT COUNT(*) FROM public.inventory i JOIN public.products p ON i.product_id = p.id
    WHERE i.store_id = s.id AND i.quantity <= p.min_stock_level
  ), 0) AS low_stock_count,
  COALESCE((
    SELECT COUNT(*) FROM public.inventory WHERE store_id = s.id AND expiry_date <= CURRENT_DATE + INTERVAL '7 days' AND expiry_date >= CURRENT_DATE
  ), 0) AS expiring_soon_count
FROM public.stores s;

------------------------------------------------------------
-- Seed roles helper (used by app logic, not stored)
------------------------------------------------------------
-- This migration creates the complete foundation. Application seed data is managed via the app setup flow or Supabase seed.sql.
