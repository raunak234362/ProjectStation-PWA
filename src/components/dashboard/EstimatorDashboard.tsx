import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

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
import InvoiceSummary from "./components/InvoiceSummary";

const EstimatorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [allRFQs, setAllRFQs] = useState<any[]>([]);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [recentRFQs, setRecentRFQs] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<any>("ALL_RFQ");
  const [modalData, setModalData] = useState<any[]>([]);
  const [selectedRFQId, setSelectedRFQId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const userDetail = useSelector((state: any) => state.userInfo.userDetail);
  const userRole = userDetail?.role;

  const [stats, setStats] = useState({
    totalRfqsSent: 0,
    rfqsAwarded: 0,
    pendingEstimates: 0,
    totalInvoiced: "$0",
    pendingInvoices: "$0",
    totalMTO: 0,
    awardedMTO: 0,
    pendingMTO: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Using getAllRFQFab, getFabricatorAllInvoice and GetAllProjects
        const [rfqRes, invoiceRes, projectRes] = await Promise.all([
          Service.getAllRFQFab(),
          Service.getFabricatorAllInvoice(),
          Service.GetAllProjects()
        ]);

        const rfqs = Array.isArray(rfqRes?.data) ? rfqRes.data : Array.isArray(rfqRes) ? rfqRes : [];
        const invoices = Array.isArray(invoiceRes?.data) ? invoiceRes.data : Array.isArray(invoiceRes) ? invoiceRes : [];
        const projects = Array.isArray(projectRes?.data) ? projectRes.data : Array.isArray(projectRes) ? projectRes : [];

        setAllRFQs(rfqs);
        setAllInvoices(invoices);
        setAllProjects(projects);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        setRecentRFQs(rfqs.filter((r: any) => new Date(r.createdAt) >= oneWeekAgo));
        setRecentInvoices(invoices.filter((i: any) => new Date(i.createdAt) >= oneWeekAgo));

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

        const mtoRfqs = rfqs.filter((r: any) => r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel);
        const totalMTO = mtoRfqs.length;
        const awardedMTO = mtoRfqs.filter((r: any) => r.status === "AWARDED" || r.wbtStatus === "AWARDED").length;
        const pendingMTO = mtoRfqs.filter((r: any) => r.status !== "AWARDED" && r.wbtStatus !== "AWARDED").length;

        setStats({
          totalRfqsSent,
          rfqsAwarded,
          pendingEstimates,
          totalInvoiced: `$${totalInvoicedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          pendingInvoices: `$${pendingInvoicesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          totalMTO,
          awardedMTO,
          pendingMTO
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
    } else if (type === "ALL_MTO") {
      setModalData(allRFQs.filter((r) => r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel));
    } else if (type === "PENDING_MTO") {
      setModalData(allRFQs.filter((r) => (r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel) && r.status !== "AWARDED" && r.wbtStatus !== "AWARDED"));
    } else if (type === "COMPLETED_MTO") {
      setModalData(allRFQs.filter((r) => (r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel) && (r.status === "AWARDED" || r.wbtStatus === "AWARDED")));
    }
    setIsModalOpen(true);
  };

  const rfqColumns: ExtendedColumnDef<any>[] = [
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
    ...(userRole === "CLIENT_ESTIMATOR" ? [] : [{
      header: "RFQ Type",
      cell: ({ row }: any) => {
        const r = row.original;
        const isDetailing = r.detailingMain || r.detailingMisc || r.connectionDesign || r.customerDesign || r.miscDesign;
        const isMTO = r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel;
        
        let label = "—";
        if (isDetailing && isMTO) label = "Detailing | MTO";
        else if (isDetailing) label = "Detailing";
        else if (isMTO) label = "MTO";

        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            label !== "—" 
              ? "bg-blue-50 text-blue-700 border-blue-200" 
              : "bg-gray-50 text-gray-400 border-gray-200"
          }`}>
            {label}
          </span>
        );
      },
    }]),
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
          <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl border ${isPaid ? 'bg-green-50 text-green-700 border-green-200' :
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-green-500/20 p-3">
          <span className="text-lg font-black text-black uppercase tracking-widest">
            Material Take-off RFQ OVERVIEW
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">

            {/* Stat Card 1 */}
            <div
              onClick={() => openModal("ALL_MTO")}
              className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-4 z-10">
                <div className="p-1 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
                  <FileText size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-black uppercase tracking-widest">
                    Total MTO
                  </span>
                </div>
              </div>
              <div className="z-10 text-right">
                <span className="text-3xl md:text-4xl font-black text-black tracking-tighter">
                  {stats.totalMTO}
                </span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div
              onClick={() => openModal("PENDING_MTO")}
              className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-4 z-10">
                <div className="p-1 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
                  <Clock size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-black uppercase tracking-widest">
                    Pending
                  </span>
                </div>
              </div>
              <div className="z-10 text-right">
                <span className="text-3xl md:text-4xl font-black text-black tracking-tighter">
                  {stats.pendingMTO}
                </span>
              </div>
            </div>
            {/* Stat Card 3 */}
            <div
              onClick={() => openModal("COMPLETED_MTO")}
              className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-4 z-10">
                <div className="p-1 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-black uppercase tracking-widest">
                    Received 
                  </span>
                </div>
              </div>
              <div className="z-10 text-right">
                <span className="text-3xl font-black text-black tracking-tighter">
                  {stats.awardedMTO}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-green-500/20 p-3">
          <span className="text-lg font-black text-black uppercase tracking-widest">
            DETAILING RFQ OVERVIEW
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">

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
                    Total RFQ<span className="text-[10px]">s</span>
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
                    Awarded
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
                    Pending 
                  </span>
                </div>
              </div>
              <div className="z-10 text-right">
                <span className="text-3xl md:text-4xl font-black text-black tracking-tighter">
                  {stats.pendingEstimates}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
        {userRole === "CLIENT_ESTIMATOR" ? (
          <div>
            <InvoiceSummary 
              invoices={allInvoices} 
              projects={allProjects} 
              rfqs={allRFQs} 
              onInvoiceClick={(id) => setSelectedInvoiceId(id)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
        )}

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-8">

        {/* RFQs Table */}
        <div className="bg-white rounded-3xl border border-black shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-black bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-tight">RFQ<span className="lowercase">s</span></h2>
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
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
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
