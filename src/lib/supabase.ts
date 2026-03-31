import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Role = 'admin' | 'finance';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
}

export interface Client {
  id: string;
  full_name: string;
  staff_id: string;
  company_name: string;
  department: string;
  daily_credit_limit: number;
  monthly_credit_limit: number;
  created_at: string;
}

export interface Order {
  id: string;
  client_id: string;
  amount: number;
  items?: string;
  status: 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  clients?: Client;
}