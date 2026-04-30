import React from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { formatDate } from "../../../utils/dateUtils";

interface RFQOverviewProps {
  rfqs: any[];
  title: string;
  type: "PENDING" | "AWARDED";
  onRfqClick?: (rfq: any) => void;
}

const RFQOverview: React.FC<RFQOverviewProps> = ({
  rfqs = [],
  title,
  type,
  onRfqClick,
}) => {
  return (
    <div className="flex flex-col h-full p-2 transition-all duration-300">
      <div className="flex items-center justify-between mb-6 shrink-0 ml-1">
        <h3 className="text-xl md:text-2xl font-bold text-black flex items-center gap-3 tracking-tight">
          {type === "PENDING" ? (
            <>
              <Search
                size={24}
                strokeWidth={2.5}
                className="text-[#6bbd45]"
              />
              {title}
            </>
          ) : (
            <>
              <CheckCircle2
                size={24}
                strokeWidth={2.5}
                className="text-[#6bbd45]"
              />
              {title}
            </>
          )}
        </h3>
        <span className="px-3 py-1 bg-gray-50 text-black text-[10px] uppercase font-black rounded-full border border-gray-100">
          {rfqs.length} {type === "PENDING" ? "PENDING" : "AWARDED"}
        </span>
      </div>

      <div className="flex-1 space-y-4 min-h-0 overflow-y-auto custom-scrollbar pr-2">
        {rfqs.length > 0 ? (
          <div className="space-y-2">
            {rfqs.map((rfq, index) => (
              <button
                key={rfq.id || index}
                onClick={() => onRfqClick?.(rfq)}
                className={cn(
                  "w-full text-left flex flex-col gap-1 p-3 rounded-lg border transition-all bg-white hover:shadow-md group cursor-pointer",
                  "border-black border-l-[6px]",
                  type === "AWARDED" ? "border-l-blue-500" : "border-l-[#6bbd45]"
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
                <div className="flex justify-between items-center mt-1">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-medium">Due: {formatDate(rfq.estimationDate || rfq.dueDate)}</span>
                   </div>
                   {rfq.status && (
                     <span className={cn(
                       "text-[10px] font-bold uppercase tracking-widest shrink-0 px-1.5 py-0.5 rounded border",
                       rfq.status === "AWARDED" || rfq.status === "COMPLETED" 
                        ? "bg-green-50 text-green-700 border-green-100" 
                        : "bg-gray-50 text-black border-gray-200"
                     )}>
                       {rfq.status.replace("_", " ")}
                     </span>
                   )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            {type === "PENDING" ? (
              <Search size={24} className="mb-2 opacity-20" />
            ) : (
              <CheckCircle2 size={24} className="mb-2 opacity-20" />
            )}
            <p className="text-xs font-medium">No {title.toLowerCase()} found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFQOverview;
