import React, { useMemo } from "react";
import { CheckCircle2, Circle, Layers, PenTool, HardHat, FileSearch } from "lucide-react";

interface TaskDistributionProps {
  teamStats: any;
}

const TaskDistribution: React.FC<TaskDistributionProps> = ({ teamStats }) => {
  const distributionData = useMemo(() => {
    const counts = teamStats.taskTypeCounts || {};

    return [
      { label: "Modelling", value: counts.modelling || 0, icon: Layers, color: "text-green-700", bg: "bg-green-100" },
      { label: "Model Checking", value: counts.modelChecking || 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Detailing", value: counts.detailing || 0, icon: PenTool, color: "text-teal-600", bg: "bg-teal-50" },
      { label: "Detail Checking", value: counts.detailChecking || 0, icon: FileSearch, color: "text-cyan-600", bg: "bg-cyan-50" },
      { label: "Erection", value: counts.erection || 0, icon: HardHat, color: "text-green-800", bg: "bg-green-50" },
      { label: "Erection Checking", value: counts.erectionChecking || 0, icon: Circle, color: "text-lime-600", bg: "bg-lime-50" },
    ];
  }, [teamStats.taskTypeCounts]);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-soft mb-12 h-full">
      <h3 className="text-xl font-black text-black mb-8 flex items-center gap-3 uppercase tracking-tight">
        <Layers className="text-[#6bbd45]" size={24} strokeWidth={2.5} />
        Task Distribution
        <span className="text-[10px] font-black text-[#4b8a2e] ml-auto bg-green-50 px-3 py-1.5 rounded-full border border-[#6bbd45]/20 uppercase tracking-widest">Task Counts</span>
      </h3>

      <div className="space-y-3">
        {distributionData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-2xl border border-transparent hover:border-black/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${item.bg} ${item.color} shadow-sm`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="text-black/60 font-bold text-sm tracking-tight group-hover:text-black">{item.label}</span>
              </div>
              <span className="text-black font-black bg-white border border-black/10 px-5 py-2 rounded-xl text-sm shadow-sm group-hover:border-black/20 transition-all">
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
