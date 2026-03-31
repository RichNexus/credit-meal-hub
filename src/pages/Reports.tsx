import React, { useMemo } from 'react';
import { FileSpreadsheet, FileText, Building2, Briefcase } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';
import { isSameMonth } from 'date-fns';
import { toast } from 'sonner';

const Reports = () => {
  const { clients, orders } = useStore();

  const reportData = useMemo(() => {
    const currentMonth = new Date();
    return clients.reduce((acc: any, client) => {
      const clientOrders = orders.filter(o => o.clientId === client.id && o.status === 'Approved' && isSameMonth(new Date(o.date), currentMonth));
      const totalAmount = clientOrders.reduce((sum, o) => sum + o.amount, 0);
      if (!acc[client.companyName]) acc[client.companyName] = { departments: {} };
      if (!acc[client.companyName].departments[client.department]) acc[client.companyName].departments[client.department] = [];
      acc[client.companyName].departments[client.department].push({ ...client, totalAmount, orderCount: clientOrders.length });
      return acc;
    }, {});
  }, [clients, orders]);

  const handleExport = (type: string) => {
    toast.success(`Exporting ${type} report...`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payroll Reports</h2>
        <div className="flex gap-3">
          <button onClick={() => handleExport('Excel')} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold"><FileSpreadsheet size={20} /> Excel</button>
          <button onClick={() => handleExport('PDF')} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-semibold"><FileText size={20} /> PDF</button>
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries(reportData).map(([company, data]: [string, any]) => (
          <div key={company} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><Building2 className="text-orange-500" /> {company}</h3>
            {Object.entries(data.departments).map(([dept, staff]: [string, any]) => (
              <div key={dept} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden ml-8">
                <div className="bg-slate-50 px-6 py-4 font-bold text-slate-700 flex items-center gap-2"><Briefcase size={16} /> {dept}</div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b"><th className="px-6 py-4 text-xs text-slate-400">Employee</th><th className="px-6 py-4 text-xs text-slate-400 text-center">ID</th><th className="px-6 py-4 text-xs text-slate-400 text-right">Deduction</th></tr>
                  </thead>
                  <tbody>
                    {staff.map((person: any) => (
                      <tr key={person.id} className="border-b last:border-0">
                        <td className="px-6 py-4 font-bold">{person.fullName}</td>
                        <td className="px-6 py-4 text-center font-mono text-sm">{person.staffId}</td>
                        <td className="px-6 py-4 text-right font-bold">{formatCurrency(person.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;