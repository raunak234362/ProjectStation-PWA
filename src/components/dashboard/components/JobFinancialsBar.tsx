import React from "react";

interface JobFinancialsBarProps {
  jobName: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  currencySymbol?: string;
}

const JobFinancialsBar: React.FC<JobFinancialsBarProps> = ({
  jobName,
  totalAmount,
  paidAmount,
  dueAmount,
  currencySymbol = "$",
}) => {
  const paidPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  const duePercentage = totalAmount > 0 ? (dueAmount / totalAmount) * 100 : 0;

  return (
    <div className="group flex flex-col space-y-2 p-3 hover:bg-gray-50/50 rounded-xl transition-all duration-200">
      <div className="flex justify-between items-end">
        <h4 className="text-sm font-bold text-black uppercase tracking-tight truncate max-w-[60%]">
          {jobName}
        </h4>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Total Value
          </p>
          <p className="text-sm font-bold text-black">
            {currencySymbol}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="relative w-full h-4 bg-[#6bbd45]/10 rounded-full overflow-hidden shadow-inner border border-gray-100/50">
        {/* Paid Progress */}
        <div
          className="absolute left-0 top-0 h-full bg-[#5da63c] transition-all duration-500 ease-out"
          style={{ width: `${paidPercentage}%` }}
        />
        {/* Due Progress - rendered after paid */}
        <div
          className="absolute h-full bg-red-600 transition-all duration-500 ease-out"
          style={{ 
            width: `${duePercentage}%`,
            left: `${paidPercentage}%`
          }}
        />
        
        {/* Hover Tooltip Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
           <div className="bg-black/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl flex gap-3 -translate-y-10 group-hover:-translate-y-8 transition-transform">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#5da63c]" />
                Paid: {currencySymbol}{paidAmount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-600" />
                Due: {currencySymbol}{dueAmount.toLocaleString()}
              </span>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
        <span className="text-[#5da63c]">
          {paidPercentage.toFixed(0)}% PAID
        </span>
        <span className="text-red-600">
          {duePercentage.toFixed(0)}% PENDING
        </span>
      </div>
    </div>
  );
};

export default JobFinancialsBar;
