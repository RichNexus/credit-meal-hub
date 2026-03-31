import React, { useState, useMemo } from 'react';
import { Search, CreditCard, CheckCircle2, AlertCircle, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'sonner';

const NewOrder = () => {
  const { clients, addOrder, getClientStats } = useStore();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [foodItems, setFoodItems] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchTerm || selectedClientId) return [];
    return clients.filter(c => c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.staffId.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [clients, searchTerm, selectedClientId]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);
  const stats = useMemo(() => selectedClientId ? getClientStats(selectedClientId) : { dailyUsed: 0, monthlyUsed: 0 }, [selectedClientId, getClientStats]);

  const remainingDaily = selectedClient ? selectedClient.dailyCreditLimit - stats.dailyUsed : 0;
  const remainingMonthly = selectedClient ? selectedClient.monthlyCreditLimit - stats.monthlyUsed : 0;
  const currentOrderAmount = Number(orderAmount) || 0;
  const isOverDaily = currentOrderAmount > remainingDaily;
  const isOverMonthly = currentOrderAmount > remainingMonthly;
  const isValid = selectedClient && currentOrderAmount > 0 && !isOverDaily && !isOverMonthly;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const result = addOrder({ clientId: selectedClientId, amount: currentOrderAmount, items: foodItems });
    if (result.success) {
      toast.success(result.message);
      setSelectedClientId(''); setOrderAmount(''); setFoodItems(''); setSearchTerm('');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl space-y-6">
        <h2 className="text-xl font-bold">New Order</h2>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input placeholder="Search client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl" />
            <AnimatePresence>
              {searchTerm && !selectedClientId && filteredClients.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                  {filteredClients.map(client => (
                    <button key={client.id} onClick={() => { setSelectedClientId(client.id); setSearchTerm(client.fullName); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 text-left">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">{client.fullName.charAt(0)}</div>
                      <div><p className="font-bold">{client.fullName}</p><p className="text-xs text-slate-500">{client.staffId}</p></div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input type="number" placeholder="Order Amount ($)" value={orderAmount} onChange={(e) => setOrderAmount(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-2xl font-bold" />
          <textarea placeholder="Items..." value={foodItems} onChange={(e) => setFoodItems(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl resize-none" rows={3} />
          <button onClick={handleSubmit} disabled={!isValid} className={cn("w-full py-5 rounded-2xl font-bold text-lg", isValid ? "bg-orange-500 text-white shadow-xl" : "bg-slate-100 text-slate-400 cursor-not-allowed")}>Process Order</button>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[32px] text-white space-y-8">
        <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard className="text-orange-500" /> Live Validation</h3>
        {selectedClient ? (
          <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center font-bold text-xl">{selectedClient.fullName.charAt(0)}</div>
              <div><p className="font-bold">{selectedClient.fullName}</p><p className="text-xs text-slate-400">{selectedClient.staffId}</p></div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-slate-400">Daily Remaining</span><span className={cn("font-bold", isOverDaily ? "text-red-400" : "text-emerald-400")}>{formatCurrency(remainingDaily)}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-400">Monthly Remaining</span><span className={cn("font-bold", isOverMonthly ? "text-red-400" : "text-orange-400")}>{formatCurrency(remainingMonthly)}</span></div>
            </div>
            {!isValid && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"><AlertCircle className="text-red-400 shrink-0" size={20} /><p className="text-red-400 text-sm">{isOverDaily ? 'Daily limit exceeded' : isOverMonthly ? 'Monthly limit exceeded' : 'Enter a valid amount'}</p></div>}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400"><User className="mx-auto mb-4 opacity-20" size={48} /><p>Select a client to validate credit</p></div>
        )}
      </div>
    </div>
  );
};

export default NewOrder;