import React from 'react';
import { LogIn, ShieldCheck, PieChart } from 'lucide-react';
import { useStore } from '../store/useStore';

const Login = () => {
  const { setCurrentUser } = useStore();

  const handleLogin = (role: 'Admin' | 'Finance') => {
    setCurrentUser({
      id: Math.random().toString(),
      username: role === 'Admin' ? 'admin_user' : 'finance_user',
      role: role
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-400 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/20 rotate-6">
            <LogIn size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">FoodDistro</h1>
            <p className="text-slate-500 font-medium">Employee Meal Credit Management</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-sm text-slate-500">Please select your role to continue</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('Admin')}
              className="w-full group flex items-center justify-between p-6 bg-white hover:bg-orange-50 border border-slate-100 hover:border-orange-200 rounded-[28px] transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Admin Portal</p>
                  <p className="text-xs text-slate-500">Full system access & management</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleLogin('Finance')}
              className="w-full group flex items-center justify-between p-6 bg-white hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-[28px] transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <PieChart size={28} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Finance Portal</p>
                  <p className="text-xs text-slate-500">Reports & payroll data export</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;