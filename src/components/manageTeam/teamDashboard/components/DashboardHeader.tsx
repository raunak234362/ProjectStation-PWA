import React from "react";
import { Search, Plus, FileText, Calendar, Filter } from "lucide-react";
import Button from "../../../fields/Button";

interface DashboardHeaderProps {
  onAddTeam: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFilter: any;
  onDateFilterChange: (filter: any) => void;
  onGenerateReport: () => void;
  onDailyReport: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onAddTeam,
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  onGenerateReport,
  onDailyReport,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
  

      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-6 py-3 bg-white border border-black/10 rounded-2xl text-sm font-bold text-black focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all w-full md:w-72 placeholder:text-black/30 placeholder:font-normal"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-3 bg-white border border-black/10 rounded-2xl px-5 py-3 shadow-soft group hover:border-black/20 transition-all">
          <Filter size={18} className="text-black/40 group-hover:text-black transition-colors" />
          <select
            value={dateFilter.type}
            onChange={(e) =>
              onDateFilterChange({ ...dateFilter, type: e.target.value })
            }
            className="text-sm font-bold text-black bg-transparent focus:outline-none cursor-pointer pr-2"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Action Buttons */}
        <Button
          onClick={onAddTeam}
          className="flex items-center gap-2 px-6 py-3 bg-green-200 text-black border border-black/10 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-green-300 transition-all shadow-medium active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Add Team</span>
        </Button>

        <Button
          onClick={onDailyReport}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-black/10 rounded-2xl text-black font-black text-sm uppercase tracking-wider hover:bg-gray-50 transition-all shadow-medium active:scale-95"
        >
          <Calendar size={20} />
          <span>Daily Report</span>
        </Button>

        <Button
          onClick={onGenerateReport}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-black/10 rounded-2xl text-black font-black text-sm uppercase tracking-wider hover:bg-gray-50 transition-all shadow-medium active:scale-95"
        >
          <FileText size={20} />
          <span>Report</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
