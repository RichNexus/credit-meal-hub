import React, { useState, useMemo } from 'react';
import { Download, FileText, Table as TableIcon, Filter, Search } from 'lucide-react';
import { Client, Order } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

interface ReportsProps {
  clients: Client[];
  orders: Order[];
}

export const Reports = ({ clients, orders }: ReportsProps) => {
  const [filterCompany, setFilterCompany] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const companies = Array.from(new Set(clients.map(c => c.companyName)));
  const departments = Array.from(new Set(clients.map(c => c.department)));

  const reportData = useMemo(() => {
    return clients
      .filter(c => (filterCompany === '' || c.companyName === filterCompany) && 
                   (filterDept === '' || c.department === filterDept))
      .map(client => {
        const clientOrders = orders.filter(o => o.clientId === client.id && o.status === 'APPROVED');
        const totalAmount = clientOrders.reduce((acc, curr) => acc + curr.amount, 0);
        return {
          ...client,
          totalAmount,
          orderCount: clientOrders.length,
          orders: clientOrders
        };
      })
      .filter(c => c.orderCount > 0);
  }, [clients, orders, filterCompany, filterDept]);

  const exportExcel = () => {
    const data = reportData.map(r => ({
      'Staff ID': r.staffId,
      'Client Name': r.fullName,
      'Company': r.companyName,
      'Department': r.department,
      'Total Orders': r.orderCount,
      'Total Amount': r.totalAmount,
    }));
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Payroll Deductions');
    writeFile(wb, `Payroll_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel report exported');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Monthly Payroll Deduction Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = reportData.map(r => [
      r.staffId,
      r.fullName,
      r.companyName,
      r.department,
      r.orderCount,
      formatCurrency(r.totalAmount)
    ]);

    (doc as any).autoTable({
      startY: 30,
      head: [['Staff ID', 'Name', 'Company', 'Dept', 'Orders', 'Amount']],
      body: tableData,
    });

    doc.save(`Payroll_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF report exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-slate-500">Generate and export payroll deduction data.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
          >
            <TableIcon size={18} />
            Excel
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
              className="px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <select 
            className="px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm font-medium uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Staff Details</th>
                <th className="px-6 py-4">Org Info</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4 text-right">Deduction Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row) => (
                <tr key={row.id} className="table-row-hover group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{row.fullName}</p>
                    <p className="text-sm text-slate-500">ID: {row.staffId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700 font-medium">{row.companyName}</p>
                    <p className="text-sm text-slate-500">{row.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-600 font-medium text-sm">
                      {row.orderCount} meals
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-lg font-bold text-emerald-700">
                      {formatCurrency(row.totalAmount)}
                    </p>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No data found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
            {reportData.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-slate-600">Total Deduction Summary</td>
                  <td className="px-6 py-4 text-right text-emerald-800 text-xl">
                    {formatCurrency(reportData.reduce((acc, curr) => acc + curr.totalAmount, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};