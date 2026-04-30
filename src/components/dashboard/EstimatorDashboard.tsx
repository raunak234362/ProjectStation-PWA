import { useState, useEffect } from "react";

import { 
  FileText, 
  Activity, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ArrowRight,
  Loader2
} from "lucide-react";

import Service from "../../api/Service";
import ActionListModal from "./components/ActionListModal";
import GetRFQByID from "../rfq/GetRFQByID";
import GetInvoiceById from "../invoices/GetInvoiceById";

const EstimatorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [allRFQs, setAllRFQs] = useState<any[]>([]);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [recentRFQs, setRecentRFQs] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<any>("ALL_RFQ");
  const [modalData, setModalData] = useState<any[]>([]);
  const [selectedRFQId, setSelectedRFQId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    totalRfqsSent: 0,
    rfqsAwarded: 0,
    pendingEstimates: 0,
    totalInvoiced: "$0",
    pendingInvoices: "$0"
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Using GetAllRFQFab and GetAllInvoice as requested
        const [rfqRes, invoiceRes] = await Promise.all([
          Service.getAllRFQFab(),
          Service.GetAllInvoice() 
        ]);

        const rfqs = Array.isArray(rfqRes?.data) ? rfqRes.data : Array.isArray(rfqRes) ? rfqRes : [];
        const invoices = Array.isArray(invoiceRes?.data) ? invoiceRes.data : Array.isArray(invoiceRes) ? invoiceRes : [];

        setAllRFQs(rfqs);
        setAllInvoices(invoices);

        setRecentRFQs(rfqs.slice(0, 10)); // Take top 10 recent
        setRecentInvoices(invoices.slice(0, 10));

        // Calculate Stats
        const totalRfqsSent = rfqs.length;
        const rfqsAwarded = rfqs.filter((r: { status: string; wbtStatus: string; }) => r.status === "AWARDED" || r.wbtStatus === "AWARDED").length;
        const pendingEstimates = rfqs.filter((r: { status: string; wbtStatus: string; }) => r.status !== "AWARDED" && r.wbtStatus !== "AWARDED").length;
        
        let totalInvoicedAmount = 0;
        let pendingInvoicesAmount = 0;

        invoices.forEach((inv: any) => {
          const amt = Number(inv.totalInvoiceValue || inv.totalAmount || inv.amount || 0);
          totalInvoicedAmount += amt;
          
          let statusStr = "pending";
          if (inv.paymentStatus === true || String(inv.paymentStatus).toLowerCase() === "true" || String(inv.paymentStatus).toLowerCase() === "paid" || String(inv.status).toLowerCase() === "paid" || String(inv.status).toLowerCase() === "completed") {
            statusStr = "paid";
          }
          
          if (statusStr !== "paid") {
            pendingInvoicesAmount += amt;
          }
        });

        setStats({
          totalRfqsSent,
          rfqsAwarded,
          pendingEstimates,
          totalInvoiced: `$${totalInvoicedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          pendingInvoices: `$${pendingInvoicesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        });

      } catch (error) {
        console.error("Failed to fetch Estimator Dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openModal = (type: string) => {
    setModalType(type);
    if (type === "ALL_RFQ") {
      setModalData(allRFQs);
    } else if (type === "AWARDED_RFQ") {
      setModalData(allRFQs.filter((r) => r.status === "AWARDED" || r.wbtStatus === "AWARDED"));
    } else if (type === "PENDING_RFQ") {
      setModalData(allRFQs.filter((r) => r.status !== "AWARDED" && r.wbtStatus !== "AWARDED"));
    } else if (type === "ALL_INVOICES") {
      setModalData(allInvoices);
    } else if (type === "PENDING_INVOICES") {
      setModalData(allInvoices.filter((i) => {
        const isPaid = i.paymentStatus === true || String(i.paymentStatus).toLowerCase() === "true" || String(i.paymentStatus).toLowerCase() === "paid" || String(i.status).toLowerCase() === "paid" || String(i.status).toLowerCase() === "completed";
        return !isPaid;
      }));
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
        <p className="text-sm font-black text-black uppercase tracking-widest">Loading Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 md:p-6 space-y-8 bg-white min-h-full animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">
            Estimator Dashboard
          </h1>

        </div>

      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        
        {/* Stat Card 1 */}
        <div 
          onClick={() => openModal("ALL_RFQ")}
          className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md hover:bg-gray-50"
        >
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
        <div 
          onClick={() => openModal("AWARDED_RFQ")}
          className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md hover:bg-gray-50"
        >
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
        <div 
          onClick={() => openModal("PENDING_RFQ")}
          className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md hover:bg-gray-50"
        >
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
        <div 
          onClick={() => openModal("ALL_INVOICES")}
          className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md hover:bg-gray-50"
        >
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
        <div 
          onClick={() => openModal("PENDING_INVOICES")}
          className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md hover:bg-gray-50"
        >
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
                  <th className="px-4 py-3">Project No.</th>
                  <th className="px-4 py-3">Project Title</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRFQs.map((rfq, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedRFQId(rfq.id || rfq._id)}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-4 text-xs font-black text-black group-hover:text-green-700">{rfq.projectNumber || rfq.project?.projectNumber || "—"}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600 truncate max-w-[150px]">{rfq.project?.name || rfq.project?.projectName || rfq.projectName || rfq.project || "—"}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-500">
                      {rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : rfq.date || "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-block px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                        (rfq.status || rfq.wbtStatus) === 'AWARDED' ? 'bg-green-50 text-green-700 border-green-200' :
                        (rfq.status || rfq.wbtStatus) === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {rfq.status || rfq.wbtStatus || "PENDING"}
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
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedInvoiceId(inv.id || inv._id)}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-4 text-xs font-black text-black group-hover:text-green-700">{inv.invoiceNumber || inv.id || "—"}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600 truncate max-w-[150px]">{inv.project?.name || inv.project?.projectName || inv.projectName || inv.customerName || inv.project || "—"}</td>
                    <td className="px-4 py-4 text-sm font-black text-black">
                      ${Number(inv.totalInvoiceValue || inv.totalAmount || inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-block px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                        (inv.paymentStatus === true || String(inv.paymentStatus).toLowerCase() === 'true' || String(inv.paymentStatus).toLowerCase() === 'paid' || String(inv.status).toLowerCase() === 'paid' || String(inv.status).toLowerCase() === 'completed') ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {(inv.paymentStatus === true || String(inv.paymentStatus).toLowerCase() === 'true' || String(inv.paymentStatus).toLowerCase() === 'paid' || String(inv.status).toLowerCase() === 'paid' || String(inv.status).toLowerCase() === 'completed') ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <ActionListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        data={modalData}
      />

      {selectedRFQId && (
        <GetRFQByID id={selectedRFQId} onClose={() => setSelectedRFQId(null)} />
      )}

      {selectedInvoiceId && (
        <GetInvoiceById id={selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} />
      )}
    </div>
  );
};

export default EstimatorDashboard;
