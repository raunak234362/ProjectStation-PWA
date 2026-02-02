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
}

const PendingActions: React.FC<PendingActionsProps> = ({
  dashboardStats,
  onActionClick,
}) => {
  const actions = [
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
      count: dashboardStats?.pendingSubmittals || 0,
      subtitle: "Response Pending",
      icon: RefreshCw,
      color: "purple",
    },
    {
      title: "Change Orders",
      count: dashboardStats?.pendingChangeOrders || 0,
      subtitle: "New Change Orders",
      subcount: dashboardStats?.newChangeOrders || 0,
      icon: Activity,
      color: "rose",
    },
    {
      title: "RFQ",
      count: dashboardStats?.pendingRFQ || 0,
      subcount: dashboardStats?.newRFQ || 0,
      subtitle: "New RFQ",
      icon: Search,
      color: "cyan",
    },
  ];

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
    <div className="flex flex-col justify-center h-full bg-white shadow-sm rounded-2xl p-4">
      <h3 className="font-bold text-xl text-slate-800 mb-4 flex items-center gap-2 px-2">
        <ClipboardList className="text-[#6bbd45]" size={22} strokeWidth={2.5} />
        Pending Actions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => {
          const colors =
            colorClasses[action.color as keyof typeof colorClasses];

          return (
            <div
              key={action.title}
              onClick={() => {
                if (action.title === "Pending Submittals" && onActionClick) {
                  onActionClick("PENDING_SUBMITTALS");
                }
              }}
              className="flex flex-row items-center gap-4 p-4 rounded-2xl bg-[#f9fdf7] shadow-soft transition-all duration-300 cursor-pointer hover:shadow-medium hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div
                className={cn(
                  "p-3 rounded-xl shadow-sm transition-colors",
                  colors.bg,
                  colors.text
                )}
              >
                <action.icon size={22} strokeWidth={2.5} />
              </div>

              <div className="flex flex-row gap-5 items-center min-w-0">
                <div className="font-bold text-md text-slate-800 uppercase tracking-tight truncate">
                  {action.title}
                </div>
                <div
                  className="text-2xl font-extrabold tracking-tight"
                  style={{ color: colors.text.replace("text-", "#") }}
                >
                  {action.count}
                </div>
                {/* <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest truncate">
                    {action.subtitle}
                  </span>
                </div> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingActions;
