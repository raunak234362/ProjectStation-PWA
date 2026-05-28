import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";

import Service from "../../api/Service";
import GetInvoiceById from "../invoices/GetInvoiceById";
import DataTable, { type ExtendedColumnDef } from "../ui/table";
import { formatDate } from "../../utils/dateUtils";

interface StatCardProps {
  label: string | React.ReactNode;
  value: string | number;
  icon: React.ElementType;
  onClick: () => void;
  iconPadding?: string;
  valueSize?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  onClick,
  iconPadding = "p-3",
  valueSize = "text-2xl",
}) => (
  <div
    onClick={onClick}
    className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md hover:bg-gray-50"
  >
    <div className="flex items-center gap-4 z-10">
      <div className={`${iconPadding} rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-black uppercase tracking-widest text-xs md:text-sm">
          {label}
        </span>
      </div>
    </div>
    <div className="z-10 text-right">
      <span className={`${valueSize} font-semibold text-black tracking-tighter`}>
        {value}
      </span>
    </div>
  </div>
);

const AccountantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  // Modal active stats category filter
  const [activeModalType, setActiveModalType] = useState<string | null>(null);

  const [stats, setStats] = useState({
    detailingTotal: 0,
    detailingPending: 0,
    detailingCompleted: 0,
    mtoTotal: 0,
    mtoPending: 0,
    mtoCompleted: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [invoiceRes, projectRes, rfqRes] = await Promise.all([
          Service.getFabricatorAllInvoice(),
          Service.GetAllProjects().catch(() => ({ data: [] })),
          Service.RfqSent().catch(() => ({ data: [] }))
        ]);

        const fetchedInvoices = Array.isArray(invoiceRes?.data) ? invoiceRes.data : Array.isArray(invoiceRes) ? invoiceRes : [];
        const fetchedProjects = Array.isArray(projectRes?.data) ? projectRes.data : Array.isArray(projectRes) ? projectRes : [];
        const fetchedRfqs = Array.isArray(rfqRes?.data) ? rfqRes.data : Array.isArray(rfqRes) ? rfqRes : [];

        setProjects(fetchedProjects);
        setRfqs(fetchedRfqs);

        // Helper to determine invoice type (MTO or Detailing)
        const processInvoices = fetchedInvoices.map((inv: any) => {
          const job = inv.jobName || "";
          const normalizeString = (s: string) => {
            if (!s) return "";
            return s.toLowerCase().replace(/[^a-z0-9]/g, "");
          };
          const jobNorm = normalizeString(job);

          const project = fetchedProjects.find(
            (p: { name: string; projectNumber: string; }) =>
              normalizeString(p.name) === jobNorm ||
              normalizeString(p.projectNumber) === jobNorm
          );

          let matchedRfq = null;
          if (project && project.rfqId) {
            matchedRfq = fetchedRfqs.find((r: { id: any; _id: any; }) => r.id === project.rfqId || r._id === project.rfqId);
          }
          if (!matchedRfq) {
            matchedRfq = fetchedRfqs.find((r: { projectName: string; projectNumber: string; }) => {
              const rProjName = normalizeString(r.projectName);
              const rProjNum = normalizeString(r.projectNumber);
              return (
                (rProjName && (rProjName === jobNorm || rProjName.includes(jobNorm) || jobNorm.includes(rProjName))) ||
                (rProjNum && (rProjNum === jobNorm || rProjNum.includes(jobNorm) || jobNorm.includes(rProjNum))) ||
                (project && r.projectNumber === project.projectNumber)
              );
            });
          }

          let type: "MTO" | "Detailing" = "Detailing";
          
          const isMtoValue = (val: any) => val === true || val === "true" || val === "1" || val === 1 || val === "MTO" || val === "mto";

          if (inv.type && isMtoValue(inv.type)) {
            type = "MTO";
          } else if (inv.type && (String(inv.type).toLowerCase() === "detailing" || String(inv.type).toLowerCase() === "detail")) {
            type = "Detailing";
          } else if (matchedRfq) {
            const isMto = isMtoValue(matchedRfq.MTOManual) ||
                          isMtoValue(matchedRfq.mtoStickModelEnabled) ||
                          isMtoValue(matchedRfq.MTOStickModel) ||
                          isMtoValue(matchedRfq.MTOValue) ||
                          isMtoValue(matchedRfq.MTOManualModel);
            type = isMto ? "MTO" : "Detailing";
          } else if (project) {
            const hasDetailing = !!(
              project.connectionDesign ||
              project.miscDesign ||
              project.customerDesign ||
              project.detailingMain ||
              project.detailingMisc
            );
            type = hasDetailing ? "Detailing" : "MTO";
          } else if (job.toLowerCase().includes("mto") || job.toLowerCase().includes("takeoff") || job.toLowerCase().includes("take-off")) {
            type = "MTO";
          }

          const rawStatus = inv.paymentStatus || inv.status || "Pending";
          const statusStr = String(rawStatus).toLowerCase();
          const isPaid = inv.paymentStatus === true || statusStr === "paid" || statusStr === "completed" || statusStr === "true";

          return {
            ...inv,
            type,
            isPaid,
            projectName: project ? (project.name || project.projectName || project.projectNumber) : job,
          };
        });

        setInvoices(processInvoices);

        // Compute Stats
        const detailing = processInvoices.filter((i: { type: string; }) => i.type === "Detailing");
        const mto = processInvoices.filter((i: { type: string; }) => i.type === "MTO");

        setStats({
          detailingTotal: detailing.length,
          detailingCompleted: detailing.filter((i: { isPaid: boolean; }) => i.isPaid).length,
          detailingPending: detailing.filter((i: { isPaid: boolean; }) => !i.isPaid).length,
          mtoTotal: mto.length,
          mtoCompleted: mto.filter((i: { isPaid: boolean; }) => i.isPaid).length,
          mtoPending: mto.filter((i: { isPaid: boolean; }) => !i.isPaid).length,
        });

      } catch (error) {
        console.error("Failed to fetch Accountant Dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const columns: ExtendedColumnDef<any>[] = [
    {
      accessorKey: "projectName",
      header: "Project Name",
      cell: ({ row }) => (
        <span className="font-bold text-gray-500 uppercase">
          {row.original.projectName || "—"}
        </span>
      ),
    },
    {
      accessorKey: "invoiceNumber",
      header: "Invoicename",
      cell: ({ row }) => (
        <span className="font-black text-black uppercase">
          {row.original.invoiceNumber || row.original.jobName || "—"}
        </span>
      ),
    },
    {
      id: "type",
      header: "Type(MTO/Detailing)",
      cell: ({ row }) => {
        const type = row.original.type;
        const bg = type === "MTO" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200";
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${bg}`}>
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: "invoiceDate",
      header: "Invoice Date",
      cell: ({ row }) => (
        <span className="font-bold text-gray-500 uppercase">
          {formatDate(row.original.invoiceDate)}
        </span>
      ),
    },
    {
      id: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        let date = row.original.dueDate;
        const terms = row.original.paymenTDueDate ?? row.original.fabricator?.paymenTDueDate;
        if (!date && row.original.invoiceDate && terms !== undefined && terms !== null) {
          const invDate = new Date(row.original.invoiceDate);
          const days = parseInt(terms);
          if (!isNaN(days)) {
            invDate.setDate(invDate.getDate() + days);
            date = invDate;
          } else {
            date = row.original.invoiceDate;
          }
        } else if (!date) {
          date = row.original.invoiceDate;
        }

        const isOverdue = !!(date && new Date(date).getTime() < Date.now() && !row.original.isPaid);

        return (
          <span className={`font-bold ${isOverdue ? "text-red-500" : "text-gray-500"} uppercase`}>
            {formatDate(date)}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "status",
      cell: ({ row }) => {
        if (row.original.isPaid) {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200">
              Paid
            </span>
          );
        }

        let date = row.original.dueDate;
        const terms = row.original.paymenTDueDate ?? row.original.fabricator?.paymenTDueDate;
        if (!date && row.original.invoiceDate && terms !== undefined && terms !== null) {
          const invDate = new Date(row.original.invoiceDate);
          const days = parseInt(terms);
          if (!isNaN(days)) {
            invDate.setDate(invDate.getDate() + days);
            date = invDate;
          } else {
            date = row.original.invoiceDate;
          }
        } else if (!date) {
          date = row.original.invoiceDate;
        }
        const isOverdue = !!(date && new Date(date).getTime() < Date.now());

        if (isOverdue) {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200">
              Overdue
            </span>
          );
        }

        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-700 border border-yellow-200">
            Pending
          </span>
        );
      },
    },
  ];

  const getModalTitle = () => {
    if (!activeModalType) return "";
    switch (activeModalType) {
      case "DETAILING_ALL":
        return "Detailing Project invoice summary";
      case "DETAILING_PENDING":
        return "Pending Detailing Project Invoices";
      case "DETAILING_COMPLETED":
        return "Completed Detailing Project Invoices";
      case "MTO_ALL":
        return "Material Takeoff Invoice summary";
      case "MTO_PENDING":
        return "Pending Material Takeoff Invoices";
      case "MTO_COMPLETED":
        return "Completed Material Takeoff Invoices";
      default:
        return "Invoice Details";
    }
  };

  // Group and format invoices inside the selected stats modal
  const modalJobSummaries = useMemo(() => {
    if (!activeModalType) return [];

    const filtered = invoices.filter((inv) => {
      if (activeModalType.startsWith("DETAILING")) {
        if (inv.type !== "Detailing") return false;
      } else if (activeModalType.startsWith("MTO")) {
        if (inv.type !== "MTO") return false;
      }

      if (activeModalType.endsWith("PENDING")) {
        return !inv.isPaid;
      }
      if (activeModalType.endsWith("COMPLETED")) {
        return inv.isPaid;
      }

      return true;
    });

    const jobMap: Record<string, any> = {};

    filtered.forEach((inv) => {
      const job = inv.jobName || "Unknown Job";
      const normalizeString = (s: string) => {
        if (!s) return "";
        return s.toLowerCase().replace(/[^a-z0-9]/g, "");
      };
      const jobNorm = normalizeString(job);

      if (!jobMap[job]) {
        const project = projects.find(
          (p) =>
            normalizeString(p.name) === jobNorm ||
            normalizeString(p.projectNumber) === jobNorm
        );
        let bidPrice = 0;
        let rfqSerial = "";

        let matchedRfq = null;
        if (project && project.rfqId) {
          matchedRfq = rfqs.find((r) => r.id === project.rfqId);
        }
        if (!matchedRfq) {
          matchedRfq = rfqs.find((r) => {
            const rProjName = normalizeString(r.projectName);
            const rProjNum = normalizeString(r.projectNumber);
            return (
              (rProjName && (rProjName === jobNorm || rProjName.includes(jobNorm) || jobNorm.includes(rProjName))) ||
              (rProjNum && (rProjNum === jobNorm || rProjNum.includes(jobNorm) || jobNorm.includes(rProjNum))) ||
              (project && r.projectNumber === project.projectNumber)
            );
          });
        }

        let isMto = false;
        if (matchedRfq) {
          if (matchedRfq.bidPrice) {
            bidPrice =
              parseFloat(matchedRfq.bidPrice.toString().replace(/[^0-9.-]+/g, "")) || 0;
          }
          if (matchedRfq.serialNo) {
            rfqSerial = matchedRfq.serialNo;
          }
          isMto = !!(
            matchedRfq.MTOManual ||
            matchedRfq.mtoStickModelEnabled ||
            matchedRfq.MTOStickModel ||
            matchedRfq.MTOValue ||
            matchedRfq.MTOManualModel
          );
        }

        jobMap[job] = {
          jobName: job,
          projectIds: project ? `${project.projectNumber || ""}` : "",
          rfqSerial: rfqSerial,
          totalRaised: 0,
          paid: 0,
          pending: 0,
          bidPrice: bidPrice,
          invoices: [],
          invoiceNumbers: [],
          isMto: isMto,
        };
      }

      const amount = parseFloat(inv.totalInvoiceValue) || 0;
      jobMap[job].totalRaised += amount;
      if (inv.isPaid) {
        jobMap[job].paid += amount;
      } else {
        jobMap[job].pending += amount;
      }
      jobMap[job].invoices.push(inv);
      if (inv.invoiceNumber && !jobMap[job].invoiceNumbers.includes(inv.invoiceNumber)) {
        jobMap[job].invoiceNumbers.push(inv.invoiceNumber);
      }
    });

    return Object.values(jobMap).map((job: any) => {
      const formatStr = (s: string) => (s.startsWith("#") ? s : `#${s}`);
      const parts = [...job.invoiceNumbers.map(formatStr)];
      job.invoiceNumber = parts.join(", ") || "No Invoices";
      return job;
    });
  }, [invoices, projects, rfqs, activeModalType]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
        <p className="text-sm font-black text-black uppercase tracking-widest">Loading Invoices...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 md:p-6 space-y-8 bg-white min-h-full animate-in fade-in duration-500">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Detailing Project Invoice Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-500/20 p-3">
          <span className="text-lg font-semibold text-black uppercase tracking-widest">
            Detailing Project invoice summary
          </span>
          <div className="flex flex-col gap-6 w-full mt-4">
            <StatCard
              onClick={() => setActiveModalType("DETAILING_ALL")}
              icon={FileText}
              label="Total Invoices"
              value={stats.detailingTotal}
              iconPadding="p-1"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                onClick={() => setActiveModalType("DETAILING_PENDING")}
                icon={Clock}
                label="pending"
                value={stats.detailingPending}
                iconPadding="p-1"
              />
              <StatCard
                onClick={() => setActiveModalType("DETAILING_COMPLETED")}
                icon={CheckCircle2}
                label="completed"
                value={stats.detailingCompleted}
                iconPadding="p-1"
              />
            </div>
          </div>
        </div>

        {/* Material Takeoff Invoice Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-500/20 p-3">
          <span className="text-lg font-semibold text-black uppercase tracking-widest">
            Material Takeoff(MTO) Invoice summary
          </span>
          <div className="flex flex-col gap-6 w-full mt-4">
            <StatCard
              onClick={() => setActiveModalType("MTO_ALL")}
              icon={FileText}
              label="Total Invoices"
              value={stats.mtoTotal}
              iconPadding="p-1"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                onClick={() => setActiveModalType("MTO_PENDING")}
                icon={Clock}
                label="pending"
                value={stats.mtoPending}
                iconPadding="p-1"
              />
              <StatCard
                onClick={() => setActiveModalType("MTO_COMPLETED")}
                icon={CheckCircle2}
                label="completed"
                value={stats.mtoCompleted}
                iconPadding="p-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-3xl border border-green-500/20 shadow-sm overflow-hidden flex flex-col h-auto min-h-[110px]">
        <div className="p-4 px-6 border-b border-green-500/20 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-black uppercase tracking-widest">
              upcoming invoices
            </h2>
          </div>
        </div>
        <div className="flex-1 p-4">
          <DataTable
            columns={columns}
            data={invoices}
            onRowClick={(row: any) => setSelectedInvoiceId(row._id || row.id)}
            disablePagination={false}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      </div>

      {/* Detail Modals */}
      {selectedInvoiceId && (
        <GetInvoiceById id={selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} />
      )}

      {/* Stats Detail Modal (Grouped job summary cards format) */}
      {activeModalType && createPortal(
        <div className="project-component-container fixed inset-0 z-1000 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white bg-slate-50/50">
              <div className="flex items-center gap-6">
                <h3 className="text-xl font-black text-black flex items-center gap-2 tracking-tight">
                  <FileText size={24} className="text-[#6bbd45]" />
                  {getModalTitle()}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalType(null)}
                className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {modalJobSummaries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modalJobSummaries.map((job) => {
                    const blockTotal = Math.max(job.totalRaised, job.bidPrice || 0);
                    const paidPercent = blockTotal > 0 ? (job.paid / blockTotal) * 100 : 0;
                    const pendingPercent = blockTotal > 0 ? (job.pending / blockTotal) * 100 : 0;

                    return (
                      <div
                        key={job.jobName}
                        className="bg-white p-6 rounded-2xl border border-black flex flex-col gap-4 hover:shadow-md transition-shadow justify-between"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="text-base font-black text-gray-800 uppercase tracking-tight leading-snug">
                              {job.jobName}
                            </h4>
                            <div className="text-xs font-semibold text-gray-600 mt-3 uppercase tracking-wide flex flex-col gap-2">
                              {job.invoices && job.invoices.length > 0 ? (
                                job.invoices.map((inv: any, i: number) => {
                                  const invNum = inv.invoiceNumber
                                    ? (inv.invoiceNumber.startsWith("#") ? inv.invoiceNumber : `#${inv.invoiceNumber}`)
                                    : `#UNNAMED`;

                                  const invoiceDate = inv.invoiceDate || inv.createdAt;
                                  let createdDateStr = "";
                                  if (invoiceDate) {
                                    createdDateStr = `INVOICE DATE ${formatDate(new Date(inv.createdAt || invoiceDate))}`;
                                  }

                                  return (
                                    <div
                                      key={inv.id || inv._id || i}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedInvoiceId(inv._id || inv.id);
                                      }}
                                      className="cursor-pointer flex flex-row gap-5 items-center hover:text-[#6bbd45] transition-colors w-full border-b border-gray-100 pb-1"
                                    >
                                      <span className="font-bold">{invNum}</span>
                                      <span className="text-gray-400">({createdDateStr})</span>
                                    </div>
                                  );
                                })
                              ) : (
                                "No Invoices"
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end whitespace-nowrap text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {job.isMto ? "TOTAL RAISED" : "TOTAL RAISED / BID PRICE"}
                            </span>
                            <span className="text-sm font-bold text-gray-900 mt-1">
                              ${job.totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {!job.isMto && (
                                <>
                                  {" "}
                                  / $
                                  {(job.bidPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto pt-2">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-black text-[#5da63c] uppercase tracking-wide">
                              PAID: ${job.paid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-xs font-black text-red-500 uppercase tracking-wide">
                              PENDING: ${job.pending.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                          </div>

                          <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden flex shadow-inner">
                            <div
                              className="h-full bg-[#5da63c] transition-all duration-500 ease-out"
                              style={{ width: `${paidPercent}%` }}
                            />
                            <div
                              className="h-full bg-red-500 transition-all duration-500 ease-out"
                              style={{ width: `${pendingPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-sm">No invoices found for this selection.</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AccountantDashboard;
