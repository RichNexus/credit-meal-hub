import React, { useState } from 'react';
import { Plus, Search, Filter, UserPlus, Building2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'sonner';

const Clients = () => {
  const { clients, addClient } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('All');

  const [newClient, setNewClient] = useState({
    fullName: '',
    staffId: '',
    companyName: '',
    department: '',
    dailyCreditLimit: 50,
    monthlyCreditLimit: 500,
  });

  const companies = ['All', ...new Set(clients.map(c => c.companyName))];

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.staffId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = filterCompany === 'All' || c.companyName === filterCompany;
    return matchesSearch && matchesCompany;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      ...newClient,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    });
    toast.success('Client added successfully');
    setIsAddModalOpen(false);
    setNewClient({ fullName: '', staffId: '', companyName: '', department: '', dailyCreditLimit: 50, monthlyCreditLimit: 500 });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Client Directory</h2>
          <p className="text-sm text-slate-500">Manage your clients and credit limits</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
        >
          <UserPlus size={20} />
          <span>Add New Client</span>
        </button>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm"
          />
        </div>
        <select 
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="bg-slate-50 border-none rounded-2xl text-sm font-medium px-6 py-3 outline-none"
        >
          {companies.map(company => <option key={company} value={company}>{company}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Client Info</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Company & Dept</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Daily Limit</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Monthly Limit</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-slate-900">{client.fullName}</p>
                    <p className="text-xs text-slate-500">ID: {client.staffId}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Building2 size={14} className="text-slate-400" />
                    {client.companyName}
                  </div>
                  <p className="text-xs text-slate-500 ml-5">{client.department}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                    {formatCurrency(client.dailyCreditLimit)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                    {formatCurrency(client.monthlyCreditLimit)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-orange-500"><ChevronRight size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Client</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <input required placeholder="Full Name" value={newClient.fullName} onChange={(e) => setNewClient({...newClient, fullName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
              <input required placeholder="Staff ID" value={newClient.staffId} onChange={(e) => setNewClient({...newClient, staffId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
              <input required placeholder="Company" value={newClient.companyName} onChange={(e) => setNewClient({...newClient, companyName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
              <input required placeholder="Department" value={newClient.department} onChange={(e) => setNewClient({...newClient, department: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required placeholder="Daily Limit" value={newClient.dailyCreditLimit} onChange={(e) => setNewClient({...newClient, dailyCreditLimit: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
                <input type="number" required placeholder="Monthly Limit" value={newClient.monthlyCreditLimit} onChange={(e) => setNewClient({...newClient, monthlyCreditLimit: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 rounded-xl" />
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl">Create Client</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Clients;