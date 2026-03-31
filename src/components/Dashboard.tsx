import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Users as UsersIcon, 
  DollarSign, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Client, Order } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', total: 400 },
  { name: 'Tue', total: 300 },
  { name: 'Wed', total: 550 },
  { name: 'Thu', total: 450 },
  { name: 'Fri', total: 600 },
  { name: 'Sat', total: 200 },
  { name: 'Sun', total: 150 },
];

interface DashboardProps {
  clients: Client[];
  orders: Order[];
}

export const Dashboard = ({ clients, orders }: DashboardProps) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today) && o.status === 'APPROVED');
    
    const totalOrdersToday = todayOrders.length;
    const totalRevenueToday = todayOrders.reduce((acc, curr) => acc + curr.amount, 0);
    const outstandingMonthlyCredit = orders
      .filter(o => o.status === 'APPROVED')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate alerts
    const alerts: any[] = [];
    clients.forEach(client => {
      const clientMonthlyOrders = orders.filter(o => o.clientId === client.id && o.status === 'APPROVED');
      const monthlyTotal = clientMonthlyOrders.reduce((acc, curr) => acc + curr.amount, 0);
      
      if (monthlyTotal >= client.monthlyLimit) {
        alerts.push({
          id: `limit-${client.id}`,
          clientName: client.fullName,
          message: 'Monthly limit reached!',
          type: 'CRITICAL'
        });
      } else if (monthlyTotal >= client.monthlyLimit * 0.8) {
        alerts.push({
          id: `warn-${client.id}`,
          clientName: client.fullName,
          message: 'Closing in on monthly limit (80%+)',
          type: 'WARNING'
        });
      }
    });

    return { totalOrdersToday, totalRevenueToday, outstandingMonthlyCredit, alerts };
  }, [clients, orders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: 'Orders Today', 
            value: stats.totalOrdersToday, 
            icon: TrendingUp, 
            color: 'bg-emerald-500',
            trend: '+12% from yesterday',
            isTrendUp: true
          },
          { 
            label: 'Revenue Today', 
            value: formatCurrency(stats.totalRevenueToday), 
            icon: DollarSign, 
            color: 'bg-blue-500',
            trend: '+5% from yesterday',
            isTrendUp: true
          },
          { 
            label: 'Monthly Credit Outstanding', 
            value: formatCurrency(stats.outstandingMonthlyCredit), 
            icon: UsersIcon, 
            color: 'bg-amber-500',
            trend: '-2% from last month',
            isTrendUp: false
          },
        ].map((card, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={card.label} 
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-xl text-white", card.color)}>
                <card.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                card.isTrendUp ? "text-emerald-600" : "text-rose-600"
              )}>
                {card.isTrendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-slate-500 font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Weekly Revenue Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} />
            Important Alerts
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
            {stats.alerts.length > 0 ? (
              stats.alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-xl border flex gap-4 items-start",
                    alert.type === 'CRITICAL' 
                      ? "bg-rose-50 border-rose-100 text-rose-900" 
                      : "bg-amber-50 border-amber-100 text-amber-900"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    alert.type === 'CRITICAL' ? "bg-rose-200" : "bg-amber-200"
                  )}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="font-bold">{alert.clientName}</p>
                    <p className="text-sm opacity-90">{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                <p>No active alerts. Everything looks good!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};