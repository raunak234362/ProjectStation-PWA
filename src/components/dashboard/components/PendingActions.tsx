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
}

const PendingActions: React.FC<PendingActionsProps> = ({
  dashboardStats,
  onActionClick,
}) => {
  const actions = [
    {
      title: "Pending RFI",
      count: dashboardStats?.pendingRFI || 0,
      subtitle: "New RFI",
      subcount: dashboardStats?.newRFI || 0,
      icon: FileText,
      color: "amber",
    },
    {
      title: "Pending Submittals",
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
      title: "Pending RFQ",
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
    <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center h-full">
      <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
        <ClipboardList className="text-green-600" size={20} />
        Pending Actions
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
              className="flex flex-row items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer group bg-white border border-transparent hover:border-gray-100"
            >
              <div
                className={`p-2 rounded-lg ${colors.bg} ${colors.text} group-hover:${colors.hoverBg} transition-colors`}
              >
                <action.icon size={25} />
              </div>

              <div className="flex flex-col">
                <span className="font-semibold text-md text-gray-700 truncate">
                  {action.title}
                </span>
                <span
                  className="text-lg lg:text-xl font-bold mt-0.5"
                  style={{ color: colors.text.replace("text-", "#") }}
                >
                  {action.count}
                </span>
                <span className="text-sm text-gray-400 uppercase tracking-wider mt-1 truncate">
                  {action.subtitle} - {action.subcount || 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingActions;
