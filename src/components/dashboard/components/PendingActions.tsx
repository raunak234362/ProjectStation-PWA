import React from "react";
import {
  ClipboardList,
  FileText,
  RefreshCw,
  Activity,
  Search,
} from "lucide-react";
import type { DashboardStats } from "../WBTDashboard";
import { cn } from "../../../lib/utils";

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
      color: "cyan",
    },
    {
      title: "RFI",
      count: dashboardStats?.pendingRFI || 0,
      subtitle: "New RFI",
      subcount: dashboardStats?.newRFI || 0,
      icon: FileText,
      color: "amber",
    },
    {
      title: "Submittals",
      count: dashboardStats?.pendingSubmittals,
      subtitle: "Response Pending",
      icon: RefreshCw,
      color: "purple",
    },
    {
      title: "COR",
      count: dashboardStats?.pendingChangeOrders || 0,
      subtitle: "New Change Orders",
      subcount: dashboardStats?.newChangeOrders || 0,
      icon: Activity,
      color: "rose",
    },
  ];

  console.log(dashboardStats, "============");

  const filteredActions = filter
    ? actions.filter((action) => filter.includes(action.title as any))
    : actions;

  const colorClasses = {
    amber: {
      bg: "bg-amber-50",
      hoverBg: "bg-amber-100",
      text: "text-amber-600",
    },
    purple: {
      bg: "bg-purple-50",
      hoverBg: "bg-purple-100",
      text: "text-purple-600",
    },
    rose: {
      bg: "bg-rose-50",
      hoverBg: "bg-rose-100",
      text: "text-rose-600",
    },
    cyan: {
      bg: "bg-cyan-50",
      hoverBg: "bg-cyan-100",
      text: "text-cyan-600",
    },
  };

  return (
    <div className="flex flex-col justify-center h-full bg-white rounded-2xl p-6 transition-all duration-300">
      <h3 className="text-xl md:text-2xl text-gray-800 mb-6 flex items-center gap-3 px-2 tracking-tight">
        <ClipboardList className="text-[#6bbd45]" size={24} strokeWidth={2.5} />
        PENDING ACTIONS
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActions.map((action) => {
          const colors =
            colorClasses[action.color as keyof typeof colorClasses];

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
              className="flex flex-row gap-5 hover-card p-5 group"
            >
              <div
                className={cn(
                  "p-3.5 rounded-xl shadow-sm transition-all group-hover:scale-110",
                  colors.bg,
                  colors.text,
                )}
              >
                <action.icon size={25} strokeWidth={2.5} />
              </div>

              <div className="flex flex-row items-center justify-between w-full min-w-0">
                <div className="text-sm md:text-lg font-semibold text-gray-600 uppercase tracking-widest truncate pr-2">
                  {action.title}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-[#6bbd45] tracking-tighter">
                  {action.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingActions;
