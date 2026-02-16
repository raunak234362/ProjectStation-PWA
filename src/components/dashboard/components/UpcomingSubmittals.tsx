import React, { useMemo, useState } from "react";
import { ClipboardList, AlertCircle, X } from "lucide-react";
import AddInvoice from "../../invoices/AddInvoice";
import AddSubmittal from "../../submittals/AddSubmittals";

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
    <div className="bg-white  dark:bg-slate-900 p-4 rounded-[6px] shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-full transition-colors duration-300">
      {!hideTabs && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 shrink-0">
          <div className="flex gap-2 bg-white/50 dark:bg-slate-800/50 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("submittals")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm md:text-lg font-medium tracking-wider rounded-[6px] transition-all ${
                activeTab === "submittals"
                  ? "bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700"
              }`}
            >
              Upcoming Submittals
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm md:text-lg font-medium tracking-wider rounded-[6px] transition-all ${
                activeTab === "invoices"
                  ? "bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700"
              }`}
            >
              Invoice Need Raise
            </button>
          </div>
          <span className="px-3 py-1 bg-white dark:bg-slate-800 text-green-700 dark:text-green-400 text-2xl rounded-full shadow-sm self-start sm:self-auto">
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
          <span className="px-3 py-1 bg-white dark:bg-slate-800 text-green-700 dark:text-green-400 text-xs  rounded-full shadow-sm">
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
                className="space-y-2 bg-green-500/20 dark:bg-green-950/30 p-2 rounded-[6px] border border-green-200 dark:border-green-800/20"
              >
                <div className="flex items-center gap-2 py-1">
                  <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-2xl text-gray-900 dark:text-white uppercase tracking-tight">
                    {projectName}
                  </h3>
                  <span className="text-sm bg-white dark:bg-slate-800 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-[4px]  shadow-sm border border-green-100 dark:border-slate-700">
                    {items.length}
                  </span>
                  {!hideFabricator && (
                    <span className="text-md md:text-xl  text-green-900 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-[4px] ml-auto uppercase tracking-wider">
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
                        className={`w-full text-left p-3 rounded-[6px] border transition-all group ${
                          overdue
                            ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40 hover:bg-red-100/50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 shadow-sm shadow-red-50 dark:shadow-red-900/20"
                            : "bg-white dark:bg-slate-800 border-white dark:border-slate-700 hover:border-green-100 dark:hover:border-green-800 hover:shadow-md hover:shadow-green-50/50 dark:hover:shadow-green-900/10"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            {overdue && (
                              <AlertCircle size={12} className="text-red-500" />
                            )}
                            <h4
                              className={`text-xl transition-colors ${
                                overdue
                                  ? "text-red-700 dark:text-red-400"
                                  : "text-gray-700 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400"
                              }`}
                            >
                              {submittal.subject || "No Subject"}
                            </h4>
                          </div>
                          <span
                            className={`text-md  uppercase tracking-wider ${
                              overdue
                                ? "text-red-500 dark:text-red-400"
                                : "text-gray-400 dark:text-green-600/60"
                            }`}
                          >
                            {submittal.approvalDate
                              ? new Date(
                                  submittal.approvalDate,
                                ).toLocaleDateString()
                              : "No Date"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {overdue && (
                            <span className="text-[14px]  text-red-500 animate-pulse">
                              OVERDUE
                            </span>
                          )}
                        </div>
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
                className="w-full text-left p-3 rounded-lg border border-white bg-white hover:border-green-100 hover:shadow-md hover:shadow-green-50/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className=" text-lg text-gray-700 group-hover:text-green-700 transition-colors">
                    {invoice.invoiceNumber || "No Number"}
                  </h4>
                  <span className="text-md  text-gray-800 uppercase tracking-wider">
                    {invoice.invoiceDate
                      ? new Date(invoice.invoiceDate).toLocaleDateString()
                      : "No Date"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-md text-gray-400 uppercase font-medium">
                      Customer
                    </span>
                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {invoice.customerName || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 uppercase font-medium">
                      Amount
                    </span>
                    <span className="text-xs  text-green-600">
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
