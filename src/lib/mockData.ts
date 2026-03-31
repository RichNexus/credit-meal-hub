import { Client } from '../types';

export const mockClients: Client[] = [
  {
    id: '1',
    fullName: 'Alexander Pierce',
    staffId: 'STF-001',
    companyName: 'Global Tech Solutions',
    department: 'Software Development',
    dailyCreditLimit: 45.00,
    monthlyCreditLimit: 600.00,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    fullName: 'Sarah Jenkins',
    staffId: 'STF-042',
    companyName: 'Global Tech Solutions',
    department: 'Product Design',
    dailyCreditLimit: 30.00,
    monthlyCreditLimit: 400.00,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    fullName: 'Michael Chen',
    staffId: 'FIN-203',
    companyName: 'Apex Financial',
    department: 'Investment Banking',
    dailyCreditLimit: 60.00,
    monthlyCreditLimit: 1200.00,
    createdAt: new Date().toISOString()
  }
];