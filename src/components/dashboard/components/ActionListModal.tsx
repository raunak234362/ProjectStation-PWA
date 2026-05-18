import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Files,
  Search,
  FileText,
  Activity,
  Calendar,
  X,
  Download
} from "lucide-react";
import DataTable, { type ExtendedColumnDef } from "../../ui/table";
import GetRFQByID from "../../rfq/GetRFQByID";
import GetRFIByID from "../../rfi/GetRFIByID";
import GetCOByID from "../../co/GetCOByID";
import GetInvoiceById from "../../invoices/GetInvoiceById";
import { formatDate } from "../../../utils/dateUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementModalCount,
  decrementModalCount,
} from "../../../store/uiSlice";

interface ActionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  type: "PENDING_RFQ" | "PENDING_RFI" | "PENDING_COR" | "ALL_RFQ" | "AWARDED_RFQ" | "ALL_INVOICES" | "PENDING_INVOICES" | "ALL_MTO" | "PENDING_MTO" | "COMPLETED_MTO";

}

const ActionListModal: React.FC<ActionListModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
}) => {
  const dispatch = useDispatch();
  const userDetail = useSelector((state: any) => state.userInfo?.userDetail);
  const userRole = userDetail?.role;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  useEffect(() => {
    if (isOpen) {
      dispatch(incrementModalCount());
      return () => {
        dispatch(decrementModalCount());
      };
    }
  }, [isOpen, dispatch]);

  console.log("ActionListModal Rendered:", {
    isOpen,
    type,
    dataLength: data?.length,
    data,
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = [...data];

    // Global Search
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const project = item.projectName || item.project?.name || item.project?.projectName || "";
        const id = item.projectNumber || item.id || item._id || "";
        const subject = item.subject || item.remarks || "";
        const invoice = item.invoiceNumber || item.jobName || "";

        return (
          project.toLowerCase().includes(query) ||
          id.toString().toLowerCase().includes(query) ||
          subject.toLowerCase().includes(query) ||
          invoice.toLowerCase().includes(query)
        );
      });
    }

    // Date Filter
    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter((item) => {
        const itemDate = new Date(item.createdAt || item.invoiceDate || item.date);
        if (isNaN(itemDate.getTime())) return true;

        if (dateFilter === "today") {
          return itemDate.toDateString() === now.toDateString();
        }
        if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= weekAgo;
        }
        if (dateFilter === "month") {
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return itemDate >= monthAgo;
        }
        if (dateFilter === "custom") {
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          if (end) end.setHours(23, 59, 59, 999);
          
          if (start && end) return itemDate >= start && itemDate <= end;
          if (start) return itemDate >= start;
          if (end) return itemDate <= end;
          return true;
        }
        if (dateFilter === "month_range") {
          const start = startMonth ? new Date(startMonth) : null;
          const end = endMonth ? new Date(endMonth) : null;
          if (end) {
            end.setMonth(end.getMonth() + 1);
            end.setDate(0);
            end.setHours(23, 59, 59, 999);
          }
          
          if (start && end) return itemDate >= start && itemDate <= end;
          if (start) return itemDate >= start;
          if (end) return itemDate <= end;
          return true;
        }
        return true;
      });
    }

    return result;
  }, [data, searchTerm, dateFilter]);



  const handleDownloadCSV = () => {
    const columns = getColumns();
    const headers = columns.map(col => col.header as string).join(",");
    
    const rows = filteredData.map(item => {
      return columns.map(col => {
        const key = 'accessorKey' in col ? (col as any).accessorKey : undefined;
        let val = "";
        
        if (col.header === "Project Name") {
          val = item.jobName || item.projectName || item.project?.name || item.project?.projectName || item.customerName || "—";
        } else if (col.header === "Status") {
          const status = item.status;
          const wbtStatus = item.wbtStatus;
          if (wbtStatus === "AWARDED") {
            const isMTO = !!(item.MTOManual || item.MTOStickModel || item.MTOValue || item.mtoStickModelEnabled);
            val = isMTO ? "Submitted" : "Awarded";
          } else if (status === "IN_REVIEW") {
            val = "Estimation In Progress";
          } else {
            val = (wbtStatus && wbtStatus !== "RECEIVED" ? wbtStatus : status)?.replace("_", " ") || "—";
          }
        } else if (col.header === "Sender" && type === "PENDING_RFI") {
          const s = item.sender;
          if (!s) val = "—";
          else {
            const fullName = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
            val = fullName || s.username || s.email || "—";
          }
        } else if (col.header === "CO Number" && type === "PENDING_COR") {
          val = `COR - ${item.changeOrderNumber?.slice(-3)}`;
        } else if (col.header === "Received On") {
          const responses = item.responses || [];
          if (responses.length === 0) val = "—";
          else {
            const latest = [...responses].sort((a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
            val = latest.createdAt ? `="${formatDate(latest.createdAt)}"` : "—";
          }
        } else if (col.header === "Amount") {
          val = `$${Number(item.totalInvoiceValue || item.totalAmount || item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (key) {
          const rawVal = item[key];
          if (key === "createdAt" || key === "estimationDate" || key === "date") {
            val = rawVal ? `="${formatDate(rawVal)}"` : "—";
          } else {
            val = rawVal || "—";
          }
        } else {
          val = "—";
        }
        
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
    }).join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${getTitle().replace(/\s+/g, "_")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTitle = () => {
    switch (type) {
      case "PENDING_RFQ":
        return "PENDING ATTENTION ON RFQs";
      case "PENDING_RFI":
        return "PENDING ATTENTION ON RFIs";
      case "PENDING_COR":
        return "PENDING ATTENTION ON CHANGE ORDERS";
      case "ALL_RFQ":
        return "ALL RFQs OVERVIEW";
      case "AWARDED_RFQ":
        return "AWARDED RFQs LIST";
      case "ALL_INVOICES":
        return "ALL INVOICES OVERVIEW";
      case "PENDING_INVOICES":
        return "PENDING INVOICES LIST";
      case "ALL_MTO":
        return "ALL MTO RFQ OVERVIEW";
      case "PENDING_MTO":
        return "PENDING MTO RFQ LIST";
      case "COMPLETED_MTO":
        return "COMPLETED MTO RFQ LIST";
      default:
        return "PENDING ACTIONS";

    }
  };

  const getIcon = () => {
    switch (type) {
      case "PENDING_RFQ":
        return <Search size={24} />;
      case "PENDING_RFI":
        return <FileText size={24} />;
      case "PENDING_COR":
        return <Activity size={24} />;
      case "ALL_RFQ":
        return <Search size={24} />;
      case "AWARDED_RFQ":
        return <Activity size={24} />;
      case "ALL_INVOICES":
      case "PENDING_INVOICES":
        return <FileText size={24} />;
      case "ALL_MTO":
      case "PENDING_MTO":
      case "COMPLETED_MTO":
        return <Search size={24} />;
      default:
        return <Files size={24} />;

    }
  };

  const getColumns = (): ExtendedColumnDef<any>[] => {
    switch (type) {
      case "PENDING_RFQ":
        const pendingCols: ExtendedColumnDef<any>[] = [
          {
            accessorKey: "projectName",
            header: "Project Name",
            size: 400,
          },
        ];


        pendingCols.push(
          {
            accessorKey: "projectNumber",
            header: "RFQ #",
            size: 150,
          },
          {
            accessorKey: "status",
            header: "Status",
            meta: { align: "center" },
            size: 150,
            cell: ({ row }) => {
              const status = row.original.status;
              const wbtStatus = row.original.wbtStatus;
              let label = "";

              if (wbtStatus === "AWARDED") {
                const isMTO = !!(row.original.MTOManual || row.original.MTOStickModel || row.original.MTOValue || row.original.mtoStickModelEnabled);
                label = isMTO ? "Submitted" : "Awarded";
              } else if (status === "IN_REVIEW") {
                label = "Estimation In Progress";
              } else {
                label = (wbtStatus && wbtStatus !== "RECEIVED" ? wbtStatus : status)?.replace("_", " ") || "—";
              }

              return (
                <span
                  className="px-3 py-1 text-xs uppercase tracking-widest rounded-lg bg-gray-50 text-black border border-black/10 font-black"
                >
                  {label}
                </span>
              );
            },
          },
          {
            accessorKey: "estimationDate",
            header: "Due Date",
            meta: { align: "center" },
            size: 150,
            cell: ({ row }) =>
              row.original.estimationDate
                ? formatDate(row.original.estimationDate)
                : "—",
          }
        );
        return pendingCols;
      case "PENDING_RFI":
        return [
          { accessorKey: "subject", header: "Subject" },
          {
            accessorKey: "sender",
            header: "Sender",
            cell: ({ row }) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const s = (row.original as any).sender;
              if (!s) return "—";

              const fullName = [s.firstName, s.middleName, s.lastName]
                .filter(Boolean)
                .join(" ");

              return fullName || s.username || s.email || "—";
            },
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
              <span
                className="px-3 py-1 text-xs md:text-sm lg:text-base xl:text-lg uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200"
              >
                {row.original.status ? "PENDING" : "RESPONDED"}
              </span>
            ),
          },
        ];
      case "PENDING_COR":
        return [
          {
            accessorKey: "changeOrderNumber",
            header: "CO Number",
            cell: ({ row }) => (
              <span className="font-bold">
                COR - {row.original.changeOrderNumber?.slice(-3)}
              </span>
            ),
          },
          {
            accessorKey: "remarks",
            header: "Remarks",
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
              <span
                className="px-3 py-1 text-xs md:text-sm lg:text-base xl:text-lg uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200"
              >
                {row.original.status ?? "—"}
              </span>
            ),
          },
        ];
      case "ALL_RFQ":
      case "AWARDED_RFQ":
      case "ALL_MTO":
      case "PENDING_MTO":
      case "COMPLETED_MTO":
        const allCols: ExtendedColumnDef<any>[] = [
          {
            accessorKey: "projectName",
            header: "Project Name",
            size: 400,
          },
        ];

        if (userRole !== "CLIENT_ESTIMATOR") {
          allCols.push(
            {
              accessorKey: "subject",
              header: "Subject",
              size: 250,
              cell: ({ row }) => (
                <div className="truncate max-w-[300px]" title={row.original.subject}>
                  {row.original.subject || "—"}
                </div>
              ),
            }
          );
        }

        allCols.push(
          {
            accessorKey: "createdAt",
            header: "Sent On",
            meta: { align: "center" },
            size: 150,
            cell: ({ row }) => row.original.createdAt ? formatDate(row.original.createdAt) : "—",
          },

          {
            accessorKey: "estimationDate",
            header: "Due Date",
            meta: { align: "center" },
            size: 150,
            cell: ({ row }) =>
              row.original.estimationDate
                ? formatDate(row.original.estimationDate)
                : "—",
          },
          {
            accessorKey: "latestResponseDate",
            header: "Received On",
            meta: { align: "center" },
            size: 150,
            cell: ({ row }) => {
              const responses = row.original.responses || [];
              if (responses.length === 0) return "—";
              const latest = [...responses].sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0];
              return latest.createdAt ? formatDate(latest.createdAt) : "—";
            },
          },

          {
            accessorKey: "status",
            header: "Status",
            meta: { align: "center" },
            size: 150,
            cell: ({ row }) => {
              const status = row.original.status;
              const wbtStatus = row.original.wbtStatus;
              let label = "";

              if (wbtStatus === "AWARDED") {
                const isMTO = !!(row.original.MTOManual || row.original.MTOStickModel || row.original.MTOValue || row.original.mtoStickModelEnabled);
                label = isMTO ? "Submitted" : "Awarded";
              } else if (status === "IN_REVIEW") {
                label = "Estimation In Progress";
              } else {
                label = (wbtStatus && wbtStatus !== "RECEIVED" ? wbtStatus : status)?.replace("_", " ") || "—";
              }

              return (
                <span
                  className="px-3 py-1 text-[10px] md:text-xs uppercase tracking-widest rounded-lg bg-gray-50 text-black border border-black/10 font-black"
                >
                  {label}
                </span>
              );
            },
          }
        );
        return allCols;
      case "ALL_INVOICES":
      case "PENDING_INVOICES":
        return [
          {
            accessorKey: "projectName",
            header: "Project Name",
            cell: ({ row }) => row.original.jobName || row.original.projectName || row.original.project?.name || row.original.project?.projectName || row.original.customerName || "—",
          },
          {
            accessorKey: "invoiceNumber",
            header: "Invoice #",
            cell: ({ row }) => row.original.invoiceNumber || row.original.id || "—",
          },
          {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => `$${Number(row.original.totalInvoiceValue || row.original.totalAmount || row.original.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
              const isPaid = row.original.paymentStatus === true || String(row.original.paymentStatus).toLowerCase() === 'true' || String(row.original.paymentStatus).toLowerCase() === 'paid' || String(row.original.status).toLowerCase() === 'paid' || String(row.original.status).toLowerCase() === 'completed';
              return (
                <span
                  className="px-3 py-1 text-xs uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200"
                >
                  {isPaid ? "PAID" : "PENDING"}
                </span>
              );
            },
          },
          {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) =>
              row.original.createdAt
                ? new Date(row.original.createdAt).toLocaleDateString()
                : "—",
          },
        ];
      default:
        return [];

    }
  };



  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-6">
            <h3 className="text-xl font-black text-black flex items-center gap-2 tracking-tight">
              {getIcon()}
              {getTitle()}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 uppercase bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-green-600/30 focus:ring-4 focus:ring-green-600/5 transition-all outline-none w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-green-600/30 transition-all outline-none appearance-none cursor-pointer text-gray-700 min-w-[140px]"
              >
                <option value="all">ALL TIME</option>
                <option value="today">TODAY</option>
                <option value="week">THIS WEEK</option>
                <option value="month">THIS MONTH</option>
                <option value="custom">DATE RANGE</option>
                <option value="month_range">MONTH RANGE</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {dateFilter === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-green-600/30 transition-all outline-none"
                />
                <span className="text-gray-500 font-bold">TO</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-green-600/30 transition-all outline-none"
                />
              </div>
            )}
            
            {dateFilter === "month_range" && (
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-green-600/30 transition-all outline-none"
                />
                <span className="text-gray-500 font-bold">TO</span>
                <input
                  type="month"
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-green-600/30 transition-all outline-none"
                />
              </div>
            )}

            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Download size={14} />
              Download CSV
            </button>

            {(searchTerm || dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("all");
                  setStartDate("");
                  setEndDate("");
                  setStartMonth("");
                  setEndMonth("");
                }}
                className="px-3 py-2 text-xs font-black text-red-600 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
              >
                Reset
              </button>
            )}

            <div className="w-px h-8 bg-gray-100 mx-2" />

            <button
              onClick={onClose}
              className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredData.length > 0 ? (
            <>
              <DataTable
                columns={getColumns()}
                data={filteredData}
                pageSizeOptions={[25]}
                onRowClick={(row) => setSelectedId(row.id || row._id)}

              />
              {selectedId && (type === "PENDING_RFQ" || type === "ALL_RFQ" || type === "AWARDED_RFQ" || type === "ALL_MTO" || type === "PENDING_MTO" || type === "COMPLETED_MTO") && (
                <GetRFQByID id={selectedId} onClose={() => setSelectedId(null)} />
              )}

              {selectedId && type === "PENDING_RFI" && (
                <GetRFIByID id={selectedId} onClose={() => setSelectedId(null)} />
              )}
              {selectedId && type === "PENDING_COR" && (
                <GetCOByID
                  id={selectedId}
                  projectId={data.find((d) => d.id === selectedId)?.project}
                  onClose={() => setSelectedId(null)}
                />
              )}
              {selectedId && (type === "ALL_INVOICES" || type === "PENDING_INVOICES") && (
                <GetInvoiceById id={selectedId} onClose={() => setSelectedId(null)} />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-500">
              <Files size={48} className="mb-4 opacity-20" />
              <p>{type.includes("MTO") ? "No MTO available" : "No pending items found."}</p>
            </div>
          )}
        </div>


      </div>
    </div>,
    document.body,
  );
};

export default ActionListModal;
