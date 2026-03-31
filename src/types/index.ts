export interface Client {
  id: string;
  fullName: string;
  staffId: string;
  companyName: string;
  department: string;
  dailyCreditLimit: number;
  monthlyCreditLimit: number;
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  amount: number;
  items?: string;
  status: 'Approved' | 'Rejected';
  date: string;
  rejectionReason?: string;
}

export type UserRole = 'Admin' | 'Finance';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}