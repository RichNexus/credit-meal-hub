import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Filter, CheckCircle2, XCircle, ChevronDown, User, ShieldAlert } from 'lucide-react';
import { Client, Order } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { toast } from 'sonner';

interface OrdersProps {
  clients: Client[];
  orders: Order[];
  onAddOrder: (order: Order) => void;
  isAdmin: boolean;
}

export const Orders = ({ clients, orders, onAddOrder, isAdmin }: OrdersProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [items, setItems] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchTerm]);

  // Validation Logic
  const validation = useMemo(() => {
    if (!selectedClient || !amount) return null;
    const orderAmount = parseFloat(amount);
    if (isNaN(orderAmount)) return null;

    const today = new Date().toISOString().split('T')[0];
    const clientTodayOrders = orders.filter(o => o.clientId === selectedClient.id && o.createdAt.startsWith(today) && o.status === 'APPROVED');
    const todayTotal = clientTodayOrders.reduce((acc, curr) => acc + curr.amount, 0);

    const clientMonthlyOrders = orders.filter(o => o.clientId === selectedClient.id && o.status === 'APPROVED');
    const monthlyTotal = clientMonthlyOrders.reduce((acc, curr) => acc + curr.amount, 0);

    const remainingDaily = selectedClient.dailyLimit - todayTotal;
    const remainingMonthly = selectedClient.monthlyLimit - monthlyTotal;

    const dailyViolation = orderAmount > remainingDaily;
    const monthlyViolation = orderAmount > remainingMonthly;

    return {
      remainingDaily,
      remainingMonthly,
      isValid: !dailyViolation && !monthlyViolation,
      dailyViolation,
      monthlyViolation
    };
  }, [selectedClient, amount, orders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !validation) return;

    if (!validation.isValid) {
      toast.error(validation.dailyViolation ? 'Daily credit limit exceeded!' : 'Monthly credit limit exceeded!');
      return;
    }

    const newOrder: Order = {
      id: `ord-${Math.random().toString(36).substr(2, 9)}`,
      clientId: selectedClient.id,
      clientName: selectedClient.fullName,
      companyName: selectedClient.companyName,
      department: selectedClient.department,
      amount: parseFloat(amount),
      items: items,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    };

    onAddOrder(newOrder);
    setIsModalOpen(false);
    setSelectedClient(null);
    setAmount('');
    setItems('');
    toast.success('Order processed successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Transactions</h1>
          <p className="text-slate-500">Track and create new meal orders.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            <Plus size={20} />
            Create New Order
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by client or company..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm font-medium uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="table-row-hover group">
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{order.clientName}</p>
                    <p className="text-xs text-slate-500">{order.department}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {order.companyName}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                      order.status === 'APPROVED' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    )}>
                      {order.status === 'APPROVED' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Process New Meal Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Select Client</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white"
                      value={selectedClient?.id || ''}
                      onChange={(e) => {
                        const client = clients.find(c => c.id === e.target.value);
                        setSelectedClient(client || null);
                      }}
                    >
                      <option value="">Choose a staff member...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.fullName} ({c.staffId}) - {c.companyName}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Order Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Food Items (Optional)</label>
                    <input 
                      placeholder="e.g. Lunch Menu A"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={items}
                      onChange={(e) => setItems(e.target.value)}
                    />
                  </div>
                </div>

                {/* Validation Info Box */}
                {selectedClient && (
                  <div className={cn(
                    "p-4 rounded-2xl border-2 transition-colors",
                    validation?.isValid ? "bg-slate-50 border-slate-100" : "bg-rose-50 border-rose-100"
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert size={18} className={validation?.isValid ? "text-slate-400" : "text-rose-500"} />
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Credit Validation</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Remaining Daily</p>
                        <p className={cn("text-lg font-bold", validation?.dailyViolation ? "text-rose-600" : "text-slate-900")}>
                          {formatCurrency(validation?.remainingDaily || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Remaining Monthly</p>
                        <p className={cn("text-lg font-bold", validation?.monthlyViolation ? "text-rose-600" : "text-slate-900")}>
                          {formatCurrency(validation?.remainingMonthly || 0)}
                        </p>
                      </div>
                    </div>
                    {!validation?.isValid && (
                      <div className="mt-3 flex items-center gap-2 text-rose-600 font-bold text-sm">
                        <XCircle size={16} />
                        Order exceeds credit limits
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <button 
                type="submit"
                disabled={!validation?.isValid}
                className={cn(
                  "w-full py-4 rounded-xl font-bold shadow-lg transition-all",
                  validation?.isValid 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                Approve & Save Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};