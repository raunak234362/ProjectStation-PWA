import React from "react";
import { Files, Activity, CheckCircle2, PauseCircle } from "lucide-react";

interface ProjectStatsProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
  };
  onCardClick: (status: string) => void;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ stats, onCardClick }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-gray-700 font-semibold mb-4">Projects Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100 min-w-0">
          <div className="p-2 bg-indigo-500 rounded-lg text-white shrink-0">
            <Files size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-700 font-medium truncate">
              Total
            </span>
            <span className="text-lg font-bold text-gray-700">
              {stats.totalProjects}
            </span>
          </div>
        </div>

        <div
          onClick={() => onCardClick("ACTIVE")}
          className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100 cursor-pointer hover:bg-green-100 transition-colors min-w-0"
        >
          <div className="p-2 bg-green-500 rounded-lg text-white shrink-0">
            <Activity size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-700 font-medium truncate">
              Active
            </span>
            <span className="text-lg font-bold text-green-700">
              {stats.activeProjects}
            </span>
          </div>
        </div>

        <div
          onClick={() => onCardClick("COMPLETED")}
          className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors min-w-0"
        >
          <div className="p-2 bg-blue-500 rounded-lg text-white shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-700 font-medium truncate">
              Completed
            </span>
            <span className="text-lg font-bold text-blue-700">
              {stats.completedProjects}
            </span>
          </div>
        </div>

        <div
          onClick={() => onCardClick("ON_HOLD")}
          className="flex items-center gap-3 bg-orange-50 p-3 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors min-w-0"
        >
          <div className="p-2 bg-orange-500 rounded-lg text-white shrink-0">
            <PauseCircle size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-700 font-medium truncate">
              On Hold
            </span>
            <span className="text-lg font-bold text-orange-700">
              {stats.onHoldProjects}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;
