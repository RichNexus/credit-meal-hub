import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, Order, User } from '../types';
import { isSameDay, isSameMonth } from 'date-fns';
import { initialData } from '../lib/initialData';

interface State {
  clients: Client[];
  orders: Order[];
  currentUser: User | null;
  addClient: (client: Client) => void;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => { success: boolean; message: string };
  setCurrentUser: (user: User | null) => void;
  getClientStats: (clientId: string) => { dailyUsed: number; monthlyUsed: number };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      clients: initialData.clients,
      orders: initialData.orders,
      currentUser: null,

      addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),

      getClientStats: (clientId) => {
        const { orders } = get();
        const clientOrders = orders.filter((o) => o.clientId === clientId && o.status === 'Approved');
        
        const today = new Date();
        const thisMonth = new Date();

        const dailyUsed = clientOrders
          .filter((o) => isSameDay(new Date(o.date), today))
          .reduce((sum, o) => sum + o.amount, 0);

        const monthlyUsed = clientOrders
          .filter((o) => isSameMonth(new Date(o.date), thisMonth))
          .reduce((sum, o) => sum + o.amount, 0);

        return { dailyUsed, monthlyUsed };
      },

      addOrder: (orderData) => {
        const { clients, getClientStats } = get();
        const client = clients.find((c) => c.id === orderData.clientId);

        if (!client) return { success: false, message: 'Client not found' };

        const { dailyUsed, monthlyUsed } = getClientStats(client.id);

        if (dailyUsed + orderData.amount > client.dailyCreditLimit) {
          const order: Order = {
            ...orderData,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            status: 'Rejected',
            rejectionReason: `Daily limit ($${client.dailyCreditLimit}) exceeded.`,
          };
          set((state) => ({ orders: [order, ...state.orders] }));
          return { success: false, message: `Rejected: Daily limit exceeded.` };
        }

        if (monthlyUsed + orderData.amount > client.monthlyCreditLimit) {
          const order: Order = {
            ...orderData,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            status: 'Rejected',
            rejectionReason: `Monthly limit ($${client.monthlyCreditLimit}) exceeded.`,
          };
          set((state) => ({ orders: [order, ...state.orders] }));
          return { success: false, message: `Rejected: Monthly limit exceeded.` };
        }

        const newOrder: Order = {
          ...orderData,
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          status: 'Approved',
        };

        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return { success: true, message: 'Order approved and recorded.' };
      },

      setCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: 'food-distribution-storage',
    }
  )
);