import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Orders } from './components/Orders';
import { Reports } from './components/Reports';
import { MOCK_CLIENTS, MOCK_ORDERS } from './mockData';
import { UserRole, Client, Order } from './types';
import { Toaster } from 'sonner';
import { LogIn, ShieldCheck } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState<{ role: UserRole } | null>(null);
  const [currentView, setView] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  // Auth Simulation
  const handleLogin = (role: UserRole) => {
    setUser({ role });
    setView('dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-8 bg-emerald-600 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold">MealFlow Portal</h1>
            <p className="opacity-80">Please select your access level</p>
          </div>
          <div className="p-8 space-y-4">
            <button 
              onClick={() => handleLogin('ADMIN')}
              className="w-full group flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
            >
              <div>
                <p className="font-bold text-slate-900 group-hover:text-emerald-700">Administrator</p>
                <p className="text-sm text-slate-500">Manage clients, orders, and system settings</p>
              </div>
              <LogIn className="text-slate-300 group-hover:text-emerald-600" size={20} />
            </button>
            <button 
              onClick={() => handleLogin('FINANCE')}
              className="w-full group flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div>
                <p className="font-bold text-slate-900 group-hover:text-blue-700">Finance / HR</p>
                <p className="text-sm text-slate-500">View reports and export payroll data</p>
              </div>
              <LogIn className="text-slate-300 group-hover:text-blue-600" size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard clients={clients} orders={orders} />;
      case 'clients':
        return user.role === 'ADMIN' ? (
          <Clients 
            clients={clients} 
            onAddClient={(c) => setClients([...clients, c])} 
          />
        ) : null;
      case 'orders':
        return (
          <Orders 
            clients={clients} 
            orders={orders} 
            onAddOrder={(o) => setOrders([...orders, o])}
            isAdmin={user.role === 'ADMIN'}
          />
        );
      case 'reports':
        return <Reports clients={clients} orders={orders} />;
      default:
        return <Dashboard clients={clients} orders={orders} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Toaster position="top-right" />
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        role={user.role}
        onLogout={() => setUser(null)}
      />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;