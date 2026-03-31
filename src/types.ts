export type UserRole = 'ADMIN' | 'FINANCE';

export interface Client {
  id: string;
  fullName: string;
  staffId: string;
  companyName: string;
  department: string;
  dailyLimit: number;
  monthlyLimit: number;
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  department: string;
  amount: number;
  items?: string;
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalOrdersToday: number;
  totalRevenueToday: number;
  outstandingMonthlyCredit: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  clientId: string;
  clientName: string;
  message: string;
  type: 'WARNING' | 'CRITICAL';
}