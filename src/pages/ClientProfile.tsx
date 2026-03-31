import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Client, type Order } from '../lib/supabase';
import { 
  ChevronLeft, 
  Building2, 
  Briefcase, 
  User, 
  CreditCard,
  Calendar,
  ArrowRight,
  TrendingUp,
  History
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { toast } from 'sonner';

export const ClientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState({ daily: 0, monthly: 0 });

  useEffect(() => {
    if (id) fetchClientData(id);
  }, [id]);

  const fetchClientData = async (clientId: string) => {
    setLoading(true);
    const [clientRes, ordersRes, balanceRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', clientId).single(),
      supabase.from('orders').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(10),
      supabase.rpc('get_client_balances', { p_client_id: clientId })
    ]);

    if (clientRes.error) {
      toast.error('Client not found');
      navigate('/clients');
      return;
    }

    setClient(clientRes.data);
    setOrders(ordersRes.data || []);
    if (balanceRes.data && balanceRes.data[0]) {
      setBalances({
        daily: Number(balanceRes.data[0].daily_spent),
        monthly: Number(balanceRes.data[0].monthly_spent)
      });
    }
    setLoading(false);
  };

  if (loading || !client) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/clients')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Directory
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-600 border-4 border-white shadow-lg mx-auto mb-6">
              {client.full_name.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{client.full_name}</h1>
            <p className="text-slate-500 font-medium">ID: {client.staff_id}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">{client.company_name}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">{client.department}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-900/20">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6">Usage Stats</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Monthly Utilization</span>
                  <span className="font-bold">{Math.round((balances.monthly / client.monthly_credit_limit) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, (balances.monthly / client.monthly_credit_limit) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Spent Today</p>
                  <p className="text-lg font-bold">{formatCurrency(balances.daily)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Spent Monthly</p>
                  <p className="text-lg font-bold">{formatCurrency(balances.monthly)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Daily Credit Limit</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(client.daily_credit_limit)}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Monthly Credit Limit</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(client.monthly_credit_limit)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                Recent Transactions
              </h3>
              <button 
                onClick={() => navigate('/orders')}
                className="text-emerald-600 text-sm font-bold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {orders.length > 0 ? orders.map(order => (
                <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{formatCurrency(order.amount)}</p>
                      <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                      {order.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{order.items || 'No description'}</p>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-400">
                  <p>No recent transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};