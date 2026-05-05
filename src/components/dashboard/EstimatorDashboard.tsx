import { useState, useEffect } from "react";

import { 
  FileText, 
  Activity, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Loader2
} from "lucide-react";

import Service from "../../api/Service";
import ActionListModal from "./components/ActionListModal";
import GetRFQByID from "../rfq/GetRFQByID";
import GetInvoiceById from "../invoices/GetInvoiceById";
import DataTable, { type ExtendedColumnDef } from "../ui/table";

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
        // Using getAllRFQFab and getFabricatorAllInvoice
        const [rfqRes, invoiceRes] = await Promise.all([
          Service.getAllRFQFab(),
          Service.getFabricatorAllInvoice() 
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

  const rfqColumns: ExtendedColumnDef<any>[] = [
    {
      accessorKey: "projectNumber",
      header: "Project No.",
      cell: ({ row }) => (
        <span className="font-black text-black group-hover:text-green-700 transition-colors">
          {row.original.projectNumber || row.original.project?.projectNumber || "—"}
        </span>
      ),
    },
    {
      accessorKey: "projectName",
      header: "Project Name",
      cell: ({ row }) => (
        <div className="truncate max-w-[200px] font-bold text-gray-600">
          {row.original.project?.name || row.original.project?.projectName || row.original.projectName || row.original.project || "—"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="font-bold text-gray-500">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : row.original.date || "—"}
        </span>
      ),
    },
  ];

  const invoiceColumns: ExtendedColumnDef<any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice",
      cell: ({ row }) => (
        <span className="font-black text-black group-hover:text-green-700 transition-colors">
          {row.original.invoiceNumber || row.original.id || "—"}
        </span>
      ),
    },
    {
      accessorKey: "projectName",
      header: "Project",
      cell: ({ row }) => (
        <div className="truncate max-w-[200px] font-bold text-gray-600">
          {row.original.jobName || row.original.project?.name || row.original.project?.projectName || row.original.projectName || row.original.customerName || row.original.project || "—"}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-black text-black">
          ${Number(row.original.totalInvoiceValue || row.original.totalAmount || row.original.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const inv = row.original;
        const isPaid = inv.paymentStatus === true || String(inv.paymentStatus).toLowerCase() === 'true' || String(inv.paymentStatus).toLowerCase() === 'paid' || String(inv.status).toLowerCase() === 'paid' || String(inv.status).toLowerCase() === 'completed';
        return (
          <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl border ${
            isPaid ? 'bg-green-50 text-green-700 border-green-200' :
            'bg-orange-50 text-orange-700 border-orange-200'
          }`}>
            {isPaid ? 'PAID' : 'PENDING'}
          </span>
        );
      },
    },
  ];

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
                Pending RFQ<span className="text-[10px]">s</span>
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
                Pending Invoiced
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
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <DataTable 
              columns={rfqColumns}
              data={recentRFQs}
              onRowClick={(row: any) => setSelectedRFQId(row.id || row._id)}
              disablePagination={true}
              noBorder={true}
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-3xl border border-black shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-black bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-tight">Recent Invoices</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Billing and payment status</p>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-2">
            <DataTable 
              columns={invoiceColumns}
              data={recentInvoices}
              onRowClick={(row: any) => setSelectedInvoiceId(row.id || row._id)}
              disablePagination={true}
              noBorder={true}
            />
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
