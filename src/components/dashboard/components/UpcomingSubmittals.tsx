import React, { useMemo } from "react";
import { ClipboardList, AlertCircle } from "lucide-react";

interface UpcomingSubmittalsProps {
  pendingSubmittals: any[];
  invoices?: any[];
}

const UpcomingSubmittals: React.FC<UpcomingSubmittalsProps> = ({
  pendingSubmittals,
  invoices = [],
}) => {
  const [activeTab, setActiveTab] = React.useState<"submittals" | "invoices">(
    "submittals"
  );

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
    <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 shrink-0">
        <div className="flex gap-2 bg-white/50 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("submittals")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${activeTab === "submittals"
              ? "bg-green-500 text-white shadow-md shadow-green-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-white"
              }`}
          >
            Upcoming Submittals
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${activeTab === "invoices"
              ? "bg-green-500 text-white shadow-md shadow-green-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-white"
              }`}
          >
            Invoice Need Raise
          </button>
        </div>
        <span className="px-3 py-1 bg-white text-green-700 text-xs font-bold rounded-full shadow-sm self-start sm:self-auto">
          {activeTab === "submittals"
            ? `${pendingSubmittals.length} Pending`
            : `${invoiceNeedRaise.length} Need Raise`}
        </span>
      </div>

      <div className="flex-1 space-y-4 min-h-0">
        {activeTab === "submittals" ? (
          pendingSubmittals.length > 0 ? (
            Object.entries(groupedSubmittals).map(([projectName, items]) => (
              <div key={projectName} className="space-y-2">
                <div className="flex items-center gap-2 sticky top-0 bg-green-50 py-1 z-10">
                  <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {projectName}
                  </h3>
                  <span className="text-[9px] bg-white text-gray-700 px-1.5 py-0.5 rounded-md font-bold shadow-sm">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((submittal, index) => {
                    const overdue = isOverdue(submittal.approvalDate);
                    return (
                      <div
                        key={submittal.id || index}
                        className={`p-3 rounded-lg border transition-all group ${overdue
                          ? "bg-red-50 border-red-100 hover:bg-red-100/50 hover:border-red-200 shadow-sm shadow-red-50"
                          : "bg-white border-white hover:border-green-100 hover:shadow-md hover:shadow-green-50/50"
                          }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            {overdue && (
                              <AlertCircle size={12} className="text-red-500" />
                            )}
                            <h4
                              className={`font-bold text-xs transition-colors ${overdue
                                ? "text-red-700"
                                : "text-gray-700 group-hover:text-green-700"
                                }`}
                            >
                              {submittal.subject || "No Subject"}
                            </h4>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider ${overdue ? "text-red-500" : "text-gray-400"
                              }`}
                          >
                            {submittal.approvalDate
                              ? new Date(
                                submittal.approvalDate
                              ).toLocaleDateString()
                              : "No Date"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex flex-col">
                            <span
                              className={`text-[9px] uppercase font-medium ${overdue ? "text-red-400" : "text-gray-400"
                                }`}
                            >
                              Fabricator
                            </span>
                            <span
                              className={`text-[10px] font-semibold truncate ${overdue ? "text-red-600" : "text-gray-700"
                                }`}
                            >
                              {submittal.fabricator?.fabName ||
                                submittal.fabName ||
                                "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
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
              <div
                key={invoice.id || index}
                className="p-3 rounded-lg border border-white bg-white hover:border-green-100 hover:shadow-md hover:shadow-green-50/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-xs text-gray-700 group-hover:text-green-700 transition-colors">
                    {invoice.invoiceNumber || "No Number"}
                  </h4>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    {invoice.invoiceDate
                      ? new Date(invoice.invoiceDate).toLocaleDateString()
                      : "No Date"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 uppercase font-medium">
                      Customer
                    </span>
                    <span className="text-[10px] font-semibold text-gray-700 truncate">
                      {invoice.customerName || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-400 uppercase font-medium">
                      Amount
                    </span>
                    <span className="text-xs font-bold text-green-600">
                      ${invoice.totalInvoiceValue?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
            <ClipboardList size={32} className="mb-2 opacity-20" />
            <p className="text-xs">No invoices need raising.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingSubmittals;
