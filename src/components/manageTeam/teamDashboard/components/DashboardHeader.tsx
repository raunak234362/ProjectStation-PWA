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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-700">
          Team Performance Dashboard
        </h1>
        <p className="text-gray-700 text-sm">
          Monitor and analyze team efficiency and task distribution
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all w-full md:w-64"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={dateFilter.type}
            onChange={(e) =>
              onDateFilterChange({ ...dateFilter, type: e.target.value })
            }
            className="text-sm text-gray-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <Button
          onClick={onAddTeam}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add Team</span>
        </Button>

        <Button
          onClick={onGenerateReport}
          className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2"
        >
          <FileText size={18} />
          <span>Report</span>
        </Button>

        <Button
          onClick={onDailyReport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <Calendar size={18} />
          <span>Daily Report</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
