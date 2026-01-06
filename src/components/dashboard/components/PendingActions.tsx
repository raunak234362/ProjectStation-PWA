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
}

const PendingActions: React.FC<PendingActionsProps> = ({ dashboardStats }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <ClipboardList className="text-teal-600" size={20} />
        Pending Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group text-center">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-100 transition-colors mb-2">
            <FileText size={20} />
          </div>
          <span className="text-xs font-bold text-gray-800">Pending RFI</span>
          <span className="text-lg font-bold text-amber-600">
            {dashboardStats?.pendingRFI || 0}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
            Response Pending
          </span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group text-center">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors mb-2">
            <RefreshCw size={20} />
          </div>
          <span className="text-xs font-bold text-gray-800">
            Pending Submittals
          </span>
          <span className="text-lg font-bold text-purple-600">
            {dashboardStats?.pendingSubmittals || 0}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
            Response Pending
          </span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group text-center">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600 group-hover:bg-rose-100 transition-colors mb-2">
            <Activity size={20} />
          </div>
          <span className="text-xs font-bold text-gray-800">Change Orders</span>
          <span className="text-lg font-bold text-rose-600">
            {dashboardStats?.pendingChangeOrders || 0}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
            Response Pending
          </span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group text-center">
          <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600 group-hover:bg-cyan-100 transition-colors mb-2">
            <Search size={20} />
          </div>
          <span className="text-xs font-bold text-gray-800">Pending RFQ</span>
          <span className="text-lg font-bold text-cyan-600">
            {dashboardStats?.pendingRFQ || 0}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
            New RFQ
          </span>
        </div>
      </div>
    </div>
  );
};

export default PendingActions;
