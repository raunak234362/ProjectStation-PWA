import React, { useMemo } from "react";
import { CheckCircle2, Circle, Layers, PenTool, HardHat, FileSearch } from "lucide-react";

interface TaskDistributionProps {
  teamStats: any;
}

const TaskDistribution: React.FC<TaskDistributionProps> = ({ teamStats }) => {
  const distributionData = useMemo(() => {
    const projects = teamStats.projects || [];

    // Initialize counters
    let modelling = 0;
    let modelChecking = 0;
    let detailing = 0;
    let detailChecking = 0;
    let erection = 0;
    let erectionChecking = 0;

    projects.forEach((proj: any) => {
      modelling += Number(proj.modelingHours || 0);
      modelChecking += Number(proj.modelCheckingHours || 0);
      detailing += Number(proj.detailingHours || 0);
      detailChecking += Number(proj.detailCheckingHours || 0);
      erection += Number(proj.executionHours || 0);
      erectionChecking += Number(proj.executionCheckingHours || 0);
    });

    return [
      { label: "Modelling", value: modelling, icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Model Checking", value: modelChecking, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
      { label: "Detailing", value: detailing, icon: PenTool, color: "text-purple-600", bg: "bg-purple-50" },
      { label: "Detail Checking", value: detailChecking, icon: FileSearch, color: "text-indigo-600", bg: "bg-indigo-50" },
      { label: "Erection", value: erection, icon: HardHat, color: "text-orange-600", bg: "bg-orange-50" },
      { label: "Erection Checking", value: erectionChecking, icon: Circle, color: "text-red-600", bg: "bg-red-50" },
    ];
  }, [teamStats.projects]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Layers className="text-gray-400" size={20} />
        Task Distribution
        <span className="text-xs font-normal text-gray-400 ml-auto bg-gray-50 px-2 py-1 rounded-md">Total Hours Estimate</span>
      </h3>

      <div className="space-y-4">
        {distributionData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-gray-600 font-medium text-sm group-hover:text-gray-900">{item.label}</span>
              </div>
              <span className="text-gray-800 font-bold bg-gray-100 px-3 py-1 rounded-full text-sm">
                {item.value || 0}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default TaskDistribution;
