import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, cn } from '../lib/utils';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { isSameDay, isSameMonth, subDays, format } from 'date-fns';

const Dashboard = () => {
  const { clients, orders } = useStore();

  const stats = useMemo(() => {
    const today = new Date();
    const approvedOrders = orders.filter(o => o.status === 'Approved');
    
    const todayOrders = approvedOrders.filter(o => isSameDay(new Date(o.date), today));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.amount, 0);
    
    const monthlyOrders = approvedOrders.filter(o => isSameMonth(new Date(o.date), today));
    const monthlyOutstanding = monthlyOrders.reduce((sum, o) => sum + o.amount, 0);

    return {
      todayCount: todayOrders.length,
      todayRevenue,
      monthlyOutstanding,
      totalClients: clients.length
    };
  }, [orders, clients]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayOrders = orders.filter(o => 
        o.status === 'Approved' && isSameDay(new Date(o.date), date)
      );
      return {
        name: format(date, 'EEE'),
        amount: dayOrders.reduce((sum, o) => sum + o.amount, 0),
      };
    });
  }, [orders]);

  const limitAlerts = useMemo(() => {
    return clients.map(client => {
      const clientOrders = orders.filter(o => o.clientId === client.id && o.status === 'Approved' && isSameMonth(new Date(o.date), new Date()));
      const used = clientOrders.reduce((sum, o) => sum + o.amount, 0);
      const percentage = (used / client.monthlyCreditLimit) * 100;
      
      return {
        ...client,
        used,
        percentage
      };
    })
    .filter(c => c.percentage >= 80)
    .sort((a, b) => b.percentage - a.percentage);
  }, [clients, orders]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Orders Today', value: stats.todayCount, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Revenue Today', value: formatCurrency(stats.todayRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Monthly Outstanding', value: formatCurrency(stats.monthlyOutstanding), icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Active Clients', value: stats.totalClients, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={14} />
                <span>12%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
              <p className="text-sm text-slate-500">Daily breakdown for the last 7 days</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-orange-500" size={20} />
            <h3 className="text-lg font-bold text-slate-900">Limit Alerts</h3>
          </div>
          <div className="space-y-6">
            {limitAlerts.length > 0 ? limitAlerts.map((alert) => (
              <div key={alert.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{alert.fullName}</p>
                    <p className="text-xs text-slate-500">{alert.companyName}</p>
                  </div>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-full", alert.percentage >= 100 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600")}>
                    {Math.round(alert.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", alert.percentage >= 100 ? "bg-red-500" : "bg-orange-500")} style={{ width: `${Math.min(alert.percentage, 100)}%` }} />
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm text-center py-12">No alerts found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;