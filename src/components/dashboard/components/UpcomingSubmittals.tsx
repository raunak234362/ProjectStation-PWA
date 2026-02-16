import React, { useMemo, useState } from "react";
import { ClipboardList, AlertCircle, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import AddInvoice from "../../invoices/AddInvoice";
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
    // Filter invoices that are not paid or need action
    return invoices.filter((inv) => !inv.paymentStatus);
  }, [invoices]);

  return (
    <div className="bg-white p-4 rounded-2xl flex flex-col h-full transition-colors duration-300">
      {!hideTabs && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 shrink-0">
          <div className="flex gap-2 bg-white/50 dark:bg-slate-800/50 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("submittals")}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === "submittals"
                  ? "bg-green-500 text-white shadow-lg shadow-green-200"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              Upcoming Submittals
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === "invoices"
                  ? "bg-green-500 text-white shadow-lg shadow-green-200"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              Invoice Need Raise
            </button>
          </div>
          <span className="px-3 py-1 bg-white text-green-700 text-xs font-bold rounded-full shadow-sm border border-green-500/10">
            {activeTab === "submittals"
              ? `${pendingSubmittals.length} Pending`
              : `${invoiceNeedRaise.length} Need Raise`}
          </span>
        </div>
      )}
      {hideTabs && (
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-lg text-gray-700 dark:text-white">
            {activeTab === "submittals" ? "Upcoming Submittals" : ""}
          </h3>
          <span className="px-3 py-1 bg-white text-gray-500 text-[10px] uppercase font-black rounded-full shadow-sm border border-green-500/5">
            {activeTab === "submittals"
              ? `${pendingSubmittals.length} Pending`
              : `${invoiceNeedRaise.length} Need Raise`}
          </span>
        </div>
      )}

      <div className="flex-1 space-y-4 min-h-0 max-h-[600px] overflow-y-auto">
        {activeTab === "submittals" ? (
          pendingSubmittals.length > 0 ? (
            Object.entries(groupedSubmittals).map(([projectName, items]) => (
              <div
                key={projectName}
                className="space-y-2 bg-green-50/30 p-2 rounded-xl border border-green-500/10"
              >
                <div className="flex items-center gap-2 py-1">
                  <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
                    {projectName}
                  </h3>
                  <span className="text-xs bg-white text-green-700 font-bold px-2 py-0.5 rounded-full shadow-sm border border-green-500/10">
                    {items.length}
                  </span>
                  {!hideFabricator && (
                    <span className="text-xs font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full ml-auto uppercase tracking-wider">
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
                          "hover-card p-3 w-full text-left flex flex-col gap-1",
                          overdue ? "border-red-500/40 bg-red-50/30" : "",
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {overdue && (
                              <AlertCircle size={14} className="text-red-500" />
                            )}
                            <h4
                              className={cn(
                                "text-lg font-semibold transition-colors",
                                overdue ? "text-red-700" : "text-gray-800",
                              )}
                            >
                              {submittal.subject || "No Subject"}
                            </h4>
                          </div>
                          <span
                            className={cn(
                              "text-xs font-bold uppercase tracking-widest",
                              overdue ? "text-red-500" : "text-gray-400",
                            )}
                          >
                            {formatDate(submittal.approvalDate)}
                          </span>
                        </div>
                        {overdue && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-red-600 animate-pulse">
                              OVERDUE
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
              <ClipboardList size={32} className="mb-2 opacity-20" />
              <p className="text-xs">No upcoming submittals found.</p>
            </div>
          )
        ) : invoiceNeedRaise.length > 0 ? (
          <div className="space-y-2">
            {invoiceNeedRaise.map((invoice, index) => (
              <button
                key={invoice.id || index}
                onClick={() => {
                  if (onInvoiceClick) {
                    onInvoiceClick(invoice);
                  } else {
                    setSelectedItem(invoice);
                    setIsModalOpen(true);
                  }
                }}
                className="hover-card p-3 w-full text-left"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                    {invoice.invoiceNumber || "No Number"}
                  </h4>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {formatDate(invoice.invoiceDate)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-black">
                      Customer
                    </span>
                    <span className="text-xs font-bold text-gray-700 truncate">
                      {invoice.customerName || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 uppercase font-black">
                      Amount
                    </span>
                    <span className="text-xs font-black text-green-600">
                      ${invoice.totalInvoiceValue?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
            <ClipboardList size={32} className="mb-2 opacity-20" />
            {userRole === "client" ? (
              <p className="text-xs">No invoices received.</p>
            ) : (
              <p className="text-xs">No invoices need raising.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal for Invoice/Submittal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg  text-gray-700">
                {activeTab === "submittals"
                  ? "Create Submittal"
                  : "Create Invoice"}
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
              {activeTab === "submittals" ? (
                <AddSubmittal
                  project={selectedItem?.project || selectedItem}
                  initialData={{
                    subject: selectedItem?.subject,
                    description: selectedItem?.description,
                  }}
                />
              ) : (
                <AddInvoice
                  initialFabricatorId={
                    selectedItem?.fabricatorId || selectedItem?.fabricator_id
                  }
                  initialProjectId={
                    selectedItem?.projectId || selectedItem?.project_id
                  }
                  onSuccess={() => {
                    setIsModalOpen(false);
                    setSelectedItem(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSubmittals;
