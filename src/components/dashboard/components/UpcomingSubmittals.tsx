import React, { useMemo, useState } from "react";
import { ClipboardList, AlertCircle, X, FileText } from "lucide-react";
import { cn } from "../../../lib/utils";

import AddSubmittal from "../../submittals/AddSubmittals";
import { formatDate } from "../../../utils/dateUtils";

interface UpcomingSubmittalsProps {
  pendingSubmittals: any[];
  invoices?: any[];
  initialTab?: "submittals" | "invoices";
  hideTabs?: boolean;
  hideFabricator?: boolean;
  onSubmittalClick?: (submittal: any) => void;
  onInvoiceClick?: (invoice: any) => void;
}

const UpcomingSubmittals: React.FC<UpcomingSubmittalsProps> = ({
  pendingSubmittals,
  invoices = [],
  initialTab = "submittals",
  hideTabs = false,
  hideFabricator = false,
  onSubmittalClick,
  onInvoiceClick,
}) => {
  const [activeTab, setActiveTab] = useState<"submittals" | "invoices">(
    initialTab,
  );
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const approvalDate = new Date(dateString);
    return approvalDate < today;
  };

  const groupedSubmittals = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    pendingSubmittals.forEach((submittal) => {
      const projectName =
        submittal.project?.name || submittal.name || "Other Projects";
      if (!groups[projectName]) {
        groups[projectName] = [];
      }
      groups[projectName].push(submittal);
    });
    return groups;
  }, [pendingSubmittals]);

  const invoiceNeedRaise = useMemo(() => {
    return invoices.filter((inv) => !inv.paymentStatus);
  }, [invoices]);


  return (
    <div className="flex flex-col h-full p-2 transition-all duration-300">
      {!hideTabs && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 shrink-0">
          <div className="flex gap-2 p-1 rounded-xl self-start sm:self-auto bg-gray-100/50">
            <button
              onClick={() => setActiveTab("submittals")}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                activeTab === "submittals"
                  ? "bg-white text-black shadow-sm border border-black"
                  : "text-black hover:bg-gray-200/50"
              )}
            >
              Upcoming Submittals
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                activeTab === "invoices"
                  ? "bg-white text-black shadow-sm border border-black"
                  : "text-black hover:bg-gray-200/50"
              )}
            >
              Invoices
            </button>
          </div>
          <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] uppercase font-black rounded-full border border-green-100">
            {activeTab === "submittals"
              ? `${pendingSubmittals.length} PENDING`
              : `${invoiceNeedRaise.length} ACTION REQ`}
          </span>
        </div>
      )}
      {hideTabs && (
        <div className="flex items-center justify-between mb-6 shrink-0 ml-1">
          <h3 className="text-xl md:text-2xl font-bold text-black flex items-center gap-3 tracking-tight">
            {activeTab === "submittals" ? (
              <>
                <ClipboardList size={24} strokeWidth={2.5} className="text-[#6bbd45]" />
                UPCOMING SUBMITTALS
              </>
            ) : (
              <>
                <FileText size={24} strokeWidth={2.5} className="text-[#6bbd45]" />
                INVOICES RECEIVED
              </>
            )}
          </h3>
          <span className="px-3 py-1 bg-gray-50 text-black text-[10px] uppercase font-black rounded-full border border-gray-100">
            {activeTab === "submittals"
              ? `${pendingSubmittals.length} PENDING`
              : `${invoiceNeedRaise.length} ACTION REQ`}
          </span>
        </div>
      )}

      <div className="flex-1 space-y-4 min-h-0 overflow-y-auto custom-scrollbar pr-2">
        {activeTab === "submittals" ? (
          pendingSubmittals.length > 0 ? (
            Object.entries(groupedSubmittals).map(([projectName, items]) => (
              <div
                key={projectName}
                className="space-y-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-2 py-1 mb-1">
                  <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-black uppercase tracking-tight truncate">
                    {projectName}
                  </h3>
                  <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.5 rounded border border-gray-200 ml-auto">
                    {items.length}
                  </span>
                  {!hideFabricator && (
                    <span className="text-[10px] font-bold text-black bg-white border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {items[0]?.fabricator?.fabName ||
                        items[0]?.fabName ||
                        "N/A"}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {items.map((submittal, index) => {
                    const overdue = isOverdue(submittal.approvalDate);
                    return (
                      <button
                        key={submittal.id || index}
                        onClick={() => {
                          if (onSubmittalClick) {
                            onSubmittalClick(submittal);
                          } else {
                            setSelectedItem(submittal);
                            setIsModalOpen(true);
                          }
                        }}
                        className={cn(
                          "w-full text-left flex flex-col gap-1 p-3 rounded-lg border transition-all bg-white hover:shadow-md group",
                          overdue ? "border-red-500 border-l-[6px] border-l-red-500" : "border-black border-l-[6px] border-l-[#6bbd45]",
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 min-w-0">
                            {overdue && (
                              <AlertCircle size={14} className="text-red-500 shrink-0" />
                            )}
                            <h4
                              className={cn(
                                "text-sm font-semibold truncate transition-colors",
                                overdue ? "text-red-700" : "text-black group-hover:text-black",
                              )}
                            >
                              {submittal.subject || "No Subject"}
                            </h4>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest shrink-0 ml-2",
                              overdue ? "text-red-500" : "text-black bg-gray-50 px-1.5 py-0.5 rounded",
                            )}
                          >
                            {formatDate(submittal.approvalDate)}
                          </span>
                        </div>
                        {overdue && (
                          <p className="text-[10px] font-black text-red-600 tracking-wider">OVERDUE</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              <ClipboardList size={24} className="mb-2 opacity-20" />
              <p className="text-xs font-medium">No upcoming submittals</p>
            </div>
          )
        ) : invoiceNeedRaise.length > 0 ? (
          <div className="space-y-3">
            {invoiceNeedRaise.map((invoice, index) => (
              <div
                key={invoice.id || index}
                onClick={() => {
                  if (onInvoiceClick) {
                    onInvoiceClick(invoice);
                  } else {
                    setSelectedItem(invoice);
                    setIsModalOpen(true);
                  }
                }}
                className="w-full text-left p-4 rounded-xl border border-black border-l-[6px] border-l-[#6bbd45] bg-white hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              >

                <div className="flex justify-between items-start mb-2 pl-2">
                  <h4 className="text-sm font-bold text-black group-hover:text-black transition-colors">
                    {invoice.invoiceNumber || "No Number"}
                  </h4>
                  <span className="text-[10px] font-bold text-black uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded">
                    {formatDate(invoice.invoiceDate)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-black uppercase font-black tracking-wider">
                      Customer
                    </span>
                    <span className="text-xs font-semibold text-black truncate">
                      {invoice.customerName || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-black uppercase font-black tracking-wider">
                      Amount
                    </span>
                    <span className="text-sm font-black text-black">
                      ${invoice.totalInvoiceValue?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            <ClipboardList size={24} className="mb-2 opacity-20" />
            <p className="text-xs font-medium">{userRole === "client" ? "No invoices received" : "No active invoices"}</p>
          </div>
        )}
      </div>

      {/* Modal for Invoice/Submittal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {activeTab === "submittals" ? "Submittal Details" : "Invoice Details"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedItem(null);
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <AddSubmittal
                project={selectedItem?.project || selectedItem}
                initialData={{
                  subject: selectedItem?.subject,
                  description: selectedItem?.description,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSubmittals;
