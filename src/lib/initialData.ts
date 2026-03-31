import { mockClients } from './mockData';
import { type Client, type Order } from '../types';

export const initialData = {
  clients: mockClients,
  orders: [
    {
      id: 'o1',
      clientId: '1',
      amount: 15.50,
      items: 'Lunch Deal A, Bottled Water',
      status: 'Approved',
      date: new Date().toISOString()
    },
    {
      id: 'o2',
      clientId: '1',
      amount: 12.00,
      items: 'Breakfast Special',
      status: 'Approved',
      date: new Date().toISOString()
    },
    {
      id: 'o3',
      clientId: '2',
      amount: 22.50,
      items: 'Salmon Salad, Juice, Fruit bowl',
      status: 'Approved',
      date: new Date().toISOString()
    },
    {
      id: 'o4',
      clientId: '3',
      amount: 65.00,
      items: 'Large Catering Tray',
      status: 'Rejected',
      rejectionReason: 'Daily limit exceeded',
      date: new Date().toISOString()
    }
  ] as Order[]
};