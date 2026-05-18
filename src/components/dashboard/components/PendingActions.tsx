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
      count:
        dashboardStats?.pendingRFQ ??
        (dashboardStats as any)?.totalPendingRFQ ??
        (dashboardStats as any)?.pending_rfq ??
        0,
      subcount: dashboardStats?.newRFQ || 0,
      subtitle: "New RFQ",
      icon: Search,
    },
    {
      title: "RFI",
      count:
        dashboardStats?.pendingRFI ??
        (dashboardStats as any)?.totalPendingRFI ??
        (dashboardStats as any)?.pending_rfi ??
        0,
      subtitle: "New RFI",
      subcount: dashboardStats?.newRFI || 0,
      icon: FileText,
    },
    {
      title: "Submittals",
      count:
        dashboardStats?.pendingSubmittals ??
        (dashboardStats as any)?.totalPendingSubmittals ??
        (dashboardStats as any)?.pending_submittals ??
        0,
      subtitle: "Response Pending",
      icon: RefreshCw,
    },
    {
      title: "COR",
      count:
        dashboardStats?.pendingChangeOrders ??
        (dashboardStats as any)?.pendingCOR ??
        (dashboardStats as any)?.totalPendingCO ??
        (dashboardStats as any)?.pending_cor ??
        0,
      subtitle: "Change Orders",
      subcount: dashboardStats?.newChangeOrders || 0,
      icon: Activity,
    },
  ];

  const filteredActions = filter
    ? actions.filter((action) => filter.includes(action.title as any))
    : actions;

console.log(filteredActions,"dashboardStats-----------------------------");

  return (
    <div className="flex flex-col justify-start h-full p-2 transition-all duration-300 relative overflow-hidden">
      <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-3 ml-1">
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
              className="p-4 rounded-xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[6px] border-l-[#6bbd45] shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 z-10 min-w-0 flex-1">
                <div className="p-2 sm:p-2.5 rounded-full bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black shrink-0">
                  <action.icon size={18} className="sm:w-5 sm:h-5" strokeWidth={2} />
                </div>
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="text-sm font-black text-black uppercase tracking-wider leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    {action.title} 
                  </span>
                </div>
              </div>

              <div className="z-10 text-right ml-3 shrink-0">
                <span className="text-SM font-black text-black tracking-tight">
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
