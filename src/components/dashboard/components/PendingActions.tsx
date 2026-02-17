import React from "react";
import {
  ClipboardList,
  FileText,
  RefreshCw,
  Activity,
  Search,
} from "lucide-react";
import type { DashboardStats } from "../WBTDashboard";


interface PendingActionsProps {
  dashboardStats: DashboardStats | null;
  onActionClick?: (actionType: string) => void;
  filter?: ("RFQ" | "RFI" | "Submittals" | "COR")[];
}

const PendingActions: React.FC<PendingActionsProps> = ({
  dashboardStats,
  onActionClick,
  filter,
}) => {
  const actions = [
    {
      title: "RFQ",
      count: dashboardStats?.pendingRFQ || 0,
      subcount: dashboardStats?.newRFQ || 0,
      subtitle: "New RFQ",
      icon: Search,
      // No fills, using standard icon color transition
    },
    {
      title: "RFI",
      count: dashboardStats?.pendingRFI || 0,
      subtitle: "New RFI",
      subcount: dashboardStats?.newRFI || 0,
      icon: FileText,
    },
    {
      title: "Submittals",
      count: dashboardStats?.pendingSubmittals,
      subtitle: "Response Pending",
      icon: RefreshCw,
    },
    {
      title: "COR",
      count: dashboardStats?.pendingChangeOrders || 0,
      subtitle: "Change Orders",
      subcount: dashboardStats?.newChangeOrders || 0,
      icon: Activity,
    },
  ];

  const filteredActions = filter
    ? actions.filter((action) => filter.includes(action.title as any))
    : actions;


  return (
    <div className="flex flex-col justify-start h-full p-2 transition-all duration-300 relative overflow-hidden">
      <h3 className="text-xl md:text-2xl font-bold text-black mb-6 flex items-center gap-3 tracking-tight ml-1">
        <ClipboardList size={24} strokeWidth={2.5} className="text-[#6bbd45]" />
        PENDING ACTIONS
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActions.map((action) => {
          return (
            <div
              key={action.title}
              onClick={() => {
                if (onActionClick) {
                  const actionMap: Record<string, string> = {
                    Submittals: "PENDING_SUBMITTALS",
                    RFQ: "PENDING_RFQ",
                    RFI: "PENDING_RFI",
                    COR: "PENDING_COR",
                  };
                  onActionClick(actionMap[action.title] || action.title);
                }
              }}
              className="p-5 h-[110px] rounded-xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[6px] border-l-[#6bbd45] shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 z-10">
                <div className="p-3 rounded-full bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
                  <action.icon size={24} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-bold text-black uppercase tracking-widest">
                    {action.title}
                  </span>
                </div>
              </div>

              <div className="z-10 text-right">
                <span className="text-4xl font-black text-black tracking-tighter">
                  {action.count}
                </span>
              </div>

              {/* Subtle background interaction */}
              <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingActions;
