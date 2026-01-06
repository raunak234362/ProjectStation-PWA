import React, { useMemo } from "react";
import { ClipboardList, AlertCircle } from "lucide-react";

interface UpcomingSubmittalsProps {
  pendingSubmittals: any[];
}

const UpcomingSubmittals: React.FC<UpcomingSubmittalsProps> = ({
  pendingSubmittals,
}) => {
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Upcoming Submittals
        </h2>
        <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full">
          {pendingSubmittals.length} Pending
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 max-h-[380px] no-scrollbar">
        {pendingSubmittals.length > 0 ? (
          Object.entries(groupedSubmittals).map(([projectName, items]) => (
            <div key={projectName} className="space-y-3">
              <div className="flex items-center gap-2 sticky top-0 bg-white py-1 z-10">
                <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {projectName}
                </h3>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-bold">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((submittal, index) => {
                  const overdue = isOverdue(submittal.approvalDate);
                  return (
                    <div
                      key={submittal.id || index}
                      className={`p-4 rounded-xl border transition-all group ${
                        overdue
                          ? "bg-red-50 border-red-100 hover:bg-red-100/50 hover:border-red-200 shadow-sm shadow-red-50"
                          : "bg-gray-50/50 border-gray-50 hover:bg-white hover:border-teal-100 hover:shadow-md hover:shadow-teal-50/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {overdue && (
                            <AlertCircle size={14} className="text-red-500" />
                          )}
                          <h4
                            className={`font-bold text-sm transition-colors ${
                              overdue
                                ? "text-red-700"
                                : "text-gray-800 group-hover:text-teal-700"
                            }`}
                          >
                            {submittal.subject || "No Subject"}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            overdue ? "text-red-500" : "text-gray-400"
                          }`}
                        >
                          {submittal.approvalDate
                            ? new Date(
                                submittal.approvalDate
                              ).toLocaleDateString()
                            : "No Date"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex flex-col">
                          <span
                            className={`text-[10px] uppercase font-medium ${
                              overdue ? "text-red-400" : "text-gray-400"
                            }`}
                          >
                            Fabricator
                          </span>
                          <span
                            className={`text-xs font-semibold truncate ${
                              overdue ? "text-red-600" : "text-gray-600"
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
          <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
            <ClipboardList size={48} className="mb-4 opacity-20" />
            <p className="text-sm">No upcoming submittals found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingSubmittals;
