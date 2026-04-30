import React, { useState } from "react";
import { 
  FileText, 
  Activity, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Search,
  ArrowRight
} from "lucide-react";

const EstimatorDashboard = () => {
  // Mock Data for the Estimator/Sales Dashboard
  const stats = {
    totalRfqsSent: 124,
    rfqsAwarded: 45,
    pendingEstimates: 12,
    winRate: "36.2%",
    totalInvoiced: "$450,200",
    pendingInvoices: "$42,500"
  };

  const recentRFQs = [
    { id: "RFQ-2026-001", project: "Nexcore West Ashley", date: "Oct 12, 2026", status: "AWARDED" },
    { id: "RFQ-2026-002", project: "Downtown Highrise", date: "Oct 15, 2026", status: "PENDING" },
    { id: "RFQ-2026-003", project: "Medical Center Expansion", date: "Oct 18, 2026", status: "REJECTED" },
    { id: "RFQ-2026-004", project: "Riverfront Condos", date: "Oct 20, 2026", status: "PENDING" },
    { id: "RFQ-2026-005", project: "Tech Park Campus", date: "Oct 21, 2026", status: "AWARDED" },
  ];

  const recentInvoices = [
    { id: "INV-1042", project: "Nexcore West Ashley", amount: "$12,500", date: "Oct 05, 2026", status: "PAID" },
    { id: "INV-1043", project: "Tech Park Campus", amount: "$8,200", date: "Oct 10, 2026", status: "UNPAID" },
    { id: "INV-1044", project: "Downtown Highrise", amount: "$15,000", date: "Oct 18, 2026", status: "PAID" },
    { id: "INV-1045", project: "Riverfront Condos", amount: "$4,500", date: "Oct 22, 2026", status: "UNPAID" },
  ];

  return (
    <div className="flex flex-col w-full p-4 md:p-6 space-y-8 bg-white min-h-full animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">
            Estimator Overview
          </h1>
         
        </div>
      
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        
        {/* Stat Card 1 */}
        <div className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-default bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md">
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-black uppercase tracking-widest">
                RFQs Sent
              </span>
            </div>
          </div>
          <div className="z-10 text-right">
            <span className="text-3xl md:text-4xl font-black text-black tracking-tighter">
              {stats.totalRfqsSent}
            </span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-default bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md">
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-black uppercase tracking-widest">
                RFQs Awarded
              </span>
            </div>
          </div>
          <div className="z-10 text-right">
            <span className="text-3xl md:text-4xl font-black text-black tracking-tighter">
              {stats.rfqsAwarded}
            </span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-default bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md">
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
              <Clock size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-black uppercase tracking-widest">
                Pending Estimates
              </span>
            </div>
          </div>
          <div className="z-10 text-right">
            <span className="text-3xl md:text-4xl font-black text-black tracking-tighter">
              {stats.pendingEstimates}
            </span>
          </div>
        </div>



        {/* Stat Card 5 */}
        <div className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-default bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md">
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-black uppercase tracking-widest">
                Total Invoiced
              </span>
            </div>
          </div>
          <div className="z-10 text-right">
            <span className="text-2xl md:text-3xl font-black text-black tracking-tighter">
              {stats.totalInvoiced}
            </span>
          </div>
        </div>

        {/* Stat Card 6 */}
        <div className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-default bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md">
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
              <DollarSign size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-black uppercase tracking-widest">
                Pending Inv.
              </span>
            </div>
          </div>
          <div className="z-10 text-right">
            <span className="text-2xl md:text-3xl font-black text-black tracking-tighter">
              {stats.pendingInvoices}
            </span>
          </div>
        </div>

      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-8">
        
        {/* RFQs Table */}
        <div className="bg-white rounded-3xl border border-black shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-black bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-tight">Recent RFQs</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Latest estimation requests</p>
            </div>
            <button className="p-2 bg-white border border-black rounded-xl hover:bg-green-50 transition-colors">
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-4 py-3">RFQ ID</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRFQs.map((rfq, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="px-4 py-4 text-xs font-black text-black group-hover:text-green-700">{rfq.id}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600 truncate max-w-[150px]">{rfq.project}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-500">{rfq.date}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-block px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                        rfq.status === 'AWARDED' ? 'bg-green-50 text-green-700 border-green-200' :
                        rfq.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {rfq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-3xl border border-black shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-black bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-tight">Recent Invoices</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Billing and payment status</p>
            </div>
            <button className="p-2 bg-white border border-black rounded-xl hover:bg-green-50 transition-colors">
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="px-4 py-4 text-xs font-black text-black group-hover:text-green-700">{inv.id}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600 truncate max-w-[150px]">{inv.project}</td>
                    <td className="px-4 py-4 text-sm font-black text-black">{inv.amount}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-block px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                        inv.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EstimatorDashboard;
