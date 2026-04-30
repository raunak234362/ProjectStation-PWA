import React, { useState, useMemo } from "react";
import { Search, CheckCircle2 } from "lucide-react";

import { cn } from "../../../lib/utils";
import { formatDate } from "../../../utils/dateUtils";

interface RFQTabbedOverviewProps {
  rfqs: any[];
  onRfqClick?: (rfq: any) => void;
}

const RFQTabbedOverview: React.FC<RFQTabbedOverviewProps> = ({
  rfqs = [],
  onRfqClick,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "awarded">("all");

  const awardedRFQs = useMemo(() => {
    return rfqs.filter(
      (rfq) =>
        rfq.wbtStatus === "AWARDED" ||
        rfq.status === "AWARDED" ||
        rfq.status === "COMPLETED"
    );
  }, [rfqs]);

  const displayRFQs = activeTab === "all" ? rfqs : awardedRFQs;

  return (
    <div className="flex flex-col h-full p-2 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 shrink-0">
        <div className="flex gap-2 p-1 rounded-xl self-start sm:self-auto bg-gray-100/50">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer",
              activeTab === "all"
                ? "bg-white text-black shadow-sm border border-black"
                : "text-black hover:bg-gray-200/50"
            )}
          >
            All RFQs
          </button>
          <button
            onClick={() => setActiveTab("awarded")}
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer",
              activeTab === "awarded"
                ? "bg-white text-black shadow-sm border border-black"
                : "text-black hover:bg-gray-200/50"
            )}
          >
            Awarded
          </button>
        </div>
        <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] uppercase font-black rounded-full border border-green-100">
          {activeTab === "all" ? `${rfqs.length} TOTAL` : `${awardedRFQs.length} AWARDED`}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4 shrink-0 ml-1">
        <h3 className="text-xl md:text-2xl font-bold text-black flex items-center gap-3 tracking-tight">
          {activeTab === "all" ? (
            <>
              <Search size={24} strokeWidth={2.5} className="text-[#6bbd45]" />
              RFQ OVERVIEW
            </>
          ) : (
            <>
              <CheckCircle2 size={24} strokeWidth={2.5} className="text-[#6bbd45]" />
              AWARDED RFQs
            </>
          )}
        </h3>
      </div>

      <div className="flex-1 space-y-4 min-h-0 overflow-y-auto custom-scrollbar pr-2">
        {displayRFQs.length > 0 ? (
          <div className="space-y-3">
            {displayRFQs.map((rfq, index) => (
              <button
                key={rfq.id || index}
                onClick={() => onRfqClick?.(rfq)}
                className={cn(
                  "w-full text-left flex flex-col gap-1 p-4 rounded-xl border transition-all bg-white hover:shadow-lg group cursor-pointer",
                  "border-black border-l-[6px]",
                  activeTab === "awarded" || rfq.status === "AWARDED"
                    ? "border-l-blue-500"
                    : "border-l-[#6bbd45]"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="text-sm font-semibold truncate transition-colors text-black group-hover:text-black">
                      {rfq.projectName || "No Project Name"}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest shrink-0 text-black bg-gray-50 px-1.5 py-0.5 rounded">
                      {rfq.projectNumber || rfq.rfqNumber || "No #"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Due Date</span>
                    <span className="text-xs font-medium text-gray-700">
                      {formatDate(rfq.estimationDate || rfq.dueDate)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded mt-0.5",
                      rfq.status === "AWARDED" || rfq.status === "COMPLETED" || rfq.wbtStatus === "AWARDED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {rfq.wbtStatus === "AWARDED" ? "AWARDED" : (rfq.status?.replace("_", " ") || "PENDING")}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
            {activeTab === "all" ? (
              <Search size={32} className="mb-3 opacity-20" />
            ) : (
              <CheckCircle2 size={32} className="mb-3 opacity-20" />
            )}
            <p className="text-sm font-medium">No {activeTab === "all" ? "RFQs" : "awarded RFQs"} found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFQTabbedOverview;
