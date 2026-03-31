import { Client, Order } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    fullName: 'John Doe',
    staffId: 'EMP001',
    companyName: 'TechCorp',
    department: 'Engineering',
    dailyLimit: 50,
    monthlyLimit: 500,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    staffId: 'EMP002',
    companyName: 'TechCorp',
    department: 'Marketing',
    dailyLimit: 30,
    monthlyLimit: 300,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    fullName: 'Robert Wilson',
    staffId: 'EMP003',
    companyName: 'GlobalLogistics',
    department: 'Operations',
    dailyLimit: 40,
    monthlyLimit: 450,
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    clientId: '1',
    clientName: 'John Doe',
    companyName: 'TechCorp',
    department: 'Engineering',
    amount: 15.5,
    items: 'Chicken Salad, Water',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'o2',
    clientId: '2',
    clientName: 'Jane Smith',
    companyName: 'TechCorp',
    department: 'Marketing',
    amount: 12.0,
    items: 'Pasta, Juice',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
  },
];