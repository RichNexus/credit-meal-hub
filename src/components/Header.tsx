import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useStore } from '../store/useStore';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header = ({ title, onMenuClick }: HeaderProps) => {
  const { currentUser } = useStore();

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-orange-500/20 w-48 lg:w-64 transition-all"
          />
        </div>

        <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-l pl-4 lg:pl-6 border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 capitalize">{currentUser?.username}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentUser?.role}</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
            {currentUser?.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;