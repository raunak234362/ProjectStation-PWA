import React from "react";
import {
  Files,
  Activity,
  CheckCircle2,
  PauseCircle,
  Building2,
} from "lucide-react";
import { cn } from "../../../lib/utils";

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
  const projectCards = [
    {
      label: "Total",
      value: stats.totalProjects,
      icon: Files,
      color: "indigo",
      clickable: false,
    },
    {
      label: "Active",
      value: stats.activeProjects,
      icon: Activity,
      color: "green",
      status: "ACTIVE",
      clickable: true,
    },
    {
      label: "Completed",
      value: stats.completedProjects,
      icon: CheckCircle2,
      color: "blue",
      status: "COMPLETED",
      clickable: true,
    },
    {
      label: "On Hold",
      value: stats.onHoldProjects,
      icon: PauseCircle,
      color: "orange",
      status: "ON_HOLD",
      clickable: true,
    },
  ];

  const colorClasses = {
    indigo: {
      hoverBg: "hover:bg-indigo-100",
      iconBg: "bg-indigo-500",
      text: "text-indigo-700",
    },
    green: {
      hoverBg: "hover:bg-green-100",
      iconBg: "bg-green-500",
      text: "text-green-700",
    },
    blue: {
      hoverBg: "hover:bg-blue-100",
      iconBg: "bg-blue-500",
      text: "text-blue-700",
    },
    orange: {
      hoverBg: "hover:bg-orange-100",
      iconBg: "bg-orange-500",
      text: "text-orange-700",
    },
  };

  return (
    <div className="flex flex-col justify-center h-full bg-white rounded-2xl p-6 transition-all duration-300">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 px-2 flex items-center gap-3 tracking-tight">
        <Building2 size={24} strokeWidth={2.5} className="text-[#6bbd45]" />
        PROJECT STATISTICS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectCards.map((card) => {
          const isClickable = card.status && onCardClick;
          const colors = colorClasses[card.color as keyof typeof colorClasses];

          return (
            <div
              key={card.label}
              onClick={() =>
                isClickable && card.status && onCardClick(card.status)
              }
              className={cn(
                "hover-card p-5 group flex flex-row gap-5",
                !isClickable &&
                  "cursor-default hover:bg-gray-50/80 hover:shadow-sm",
              )}
            >
              <div
                className={cn(
                  "p-3.5 rounded-xl shadow-sm text-white shrink-0 transition-transform group-hover:scale-110",
                  colors.iconBg,
                )}
              >
                <card.icon size={25} strokeWidth={2.5} />
              </div>

              <div className="flex flex-row items-center justify-between w-full min-w-0">
                <span className="text-sm md:text-lg font-semibold text-gray-600 uppercase tracking-widest truncate pr-2">
                  {card.label}
                </span>
                <span className="text-2xl md:text-3xl font-bold text-[#6bbd45] tracking-tighter">
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectStats;
