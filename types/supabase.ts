export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: string;
          store_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          store_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          store_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_store_id_fkey';
            columns: ['store_id'];
            isOneToOne: false;
            referencedRelation: 'stores';
            referencedColumns: ['id'];
          }
        ];
      };
      stores: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          phone: string | null;
          email: string | null;
          gstin: string | null;
          logo_url: string | null;
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          phone?: string | null;
          email?: string | null;
          gstin?: string | null;
          logo_url?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          phone?: string | null;
          email?: string | null;
          gstin?: string | null;
          logo_url?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          sku: string | null;
          barcode: string | null;
          category_id: string | null;
          brand_id: string | null;
          unit_id: string | null;
          description: string | null;
          image_url: string | null;
          cost_price: number;
          selling_price: number;
          mrp: number | null;
          gst_rate: number;
          min_stock_level: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          sku?: string | null;
          barcode?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          unit_id?: string | null;
          description?: string | null;
          image_url?: string | null;
          cost_price?: number;
          selling_price?: number;
          mrp?: number | null;
          gst_rate?: number;
          min_stock_level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          sku?: string | null;
          barcode?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          unit_id?: string | null;
          description?: string | null;
          image_url?: string | null;
          cost_price?: number;
          selling_price?: number;
          mrp?: number | null;
          gst_rate?: number;
          min_stock_level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      units: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          abbreviation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          abbreviation: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          abbreviation?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          store_id: string;
          quantity: number;
          batch_number: string | null;
          expiry_date: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          store_id: string;
          quantity?: number;
          batch_number?: string | null;
          expiry_date?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          store_id?: string;
          quantity?: number;
          batch_number?: string | null;
          expiry_date?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          store_id: string;
          type: string;
          quantity: number;
          reference_id: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          store_id: string;
          type: string;
          quantity: number;
          reference_id?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          store_id?: string;
          type?: string;
          quantity?: number;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          store_id: string;
          invoice_number: string;
          customer_id: string | null;
          user_id: string;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          payment_mode: string;
          payment_status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          invoice_number: string;
          customer_id?: string | null;
          user_id: string;
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          payment_mode?: string;
          payment_status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          invoice_number?: string;
          customer_id?: string | null;
          user_id?: string;
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          payment_mode?: string;
          payment_status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string | null;
          credit_limit: number;
          outstanding_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          credit_limit?: number;
          outstanding_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          credit_limit?: number;
          outstanding_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_ledger: {
        Row: {
          id: string;
          customer_id: string;
          store_id: string;
          sale_id: string | null;
          amount: number;
          type: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          store_id: string;
          sale_id?: string | null;
          amount: number;
          type: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          store_id?: string;
          sale_id?: string | null;
          amount?: number;
          type?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string | null;
          gstin: string | null;
          due_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          gstin?: string | null;
          due_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          gstin?: string | null;
          due_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          store_id: string;
          supplier_id: string | null;
          invoice_number: string | null;
          total_amount: number;
          paid_amount: number;
          due_amount: number;
          purchase_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          supplier_id?: string | null;
          invoice_number?: string | null;
          total_amount?: number;
          paid_amount?: number;
          due_amount?: number;
          purchase_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          supplier_id?: string | null;
          invoice_number?: string | null;
          total_amount?: number;
          paid_amount?: number;
          due_amount?: number;
          purchase_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number;
          total_amount?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      employees: {
        Row: {
          id: string;
          store_id: string;
          user_id: string | null;
          full_name: string;
          phone: string;
          email: string | null;
          role: string;
          salary: number;
          join_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          user_id?: string | null;
          full_name: string;
          phone: string;
          email?: string | null;
          role?: string;
          salary?: number;
          join_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          user_id?: string | null;
          full_name?: string;
          phone?: string;
          email?: string | null;
          role?: string;
          salary?: number;
          join_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          id: string;
          employee_id: string;
          store_id: string;
          check_in: string;
          check_out: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          store_id: string;
          check_in?: string;
          check_out?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          store_id?: string;
          check_in?: string;
          check_out?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          store_id: string;
          category: string;
          amount: number;
          description: string | null;
          expense_date: string;
          receipt_url: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category: string;
          amount: number;
          description?: string | null;
          expense_date?: string;
          receipt_url?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          category?: string;
          amount?: number;
          description?: string | null;
          expense_date?: string;
          receipt_url?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          store_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_id: string;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          store_id: string;
          user_id: string;
          table_name: string;
          record_id: string;
          action: string;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          user_id: string;
          table_name: string;
          record_id: string;
          action: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          user_id?: string;
          table_name?: string;
          record_id?: string;
          action?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      dashboard_metrics: {
        Row: {
          store_id: string;
          today_sales: number | null;
          monthly_sales: number | null;
          total_credit_outstanding: number | null;
          total_supplier_due: number | null;
          low_stock_count: number | null;
          expiring_soon_count: number | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      get_inventory_value: {
        Args: { p_store_id: string };
        Returns: number;
      };
      get_today_profit: {
        Args: { p_store_id: string };
        Returns: number;
      };
      get_monthly_profit: {
        Args: { p_store_id: string };
        Returns: number;
      };
      get_top_products: {
        Args: { p_store_id: string; p_limit?: number };
        Returns: {
          product_id: string;
          product_name: string;
          total_qty: number;
          total_revenue: number;
        }[];
      };
      get_low_stock: {
        Args: { p_store_id: string };
        Returns: {
          product_id: string;
          product_name: string;
          quantity: number;
          min_stock_level: number;
        }[];
      };
      get_sales_by_month: {
        Args: { p_store_id: string };
        Returns: {
          month: string;
          sales: number;
        }[];
      };
      get_expenses_by_category: {
        Args: { p_store_id: string };
        Returns: {
          category: string;
          amount: number;
        }[];
      };
      decrease_inventory: {
        Args: { p_product_id: string; p_store_id: string; p_quantity: number };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
