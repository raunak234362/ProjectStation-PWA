import React from "react";
import { Files, Activity, CheckCircle2, PauseCircle } from "lucide-react";
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
      label: "Total Projects",
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
    <div className="flex flex-col justify-center h-full">
      <h2 className="text-xl font-extrabold text-slate-800 mb-4 px-2">
        Project Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectCards.map((card) => {
          const colors = colorClasses[card.color as keyof typeof colorClasses];
          const isClickable = card.clickable;

          return (
            <div
              key={card.label}
              onClick={() => isClickable && card.status && onCardClick(card.status)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl bg-[#f9fdf7] shadow-soft transition-all duration-300",
                isClickable ? "cursor-pointer hover:shadow-medium hover:scale-[1.02] active:scale-[0.98]" : ""
              )}
            >
              <div
                className={cn(
                  "p-3 rounded-xl shadow-sm text-white shrink-0",
                  colors.iconBg
                )}
              >
                <card.icon size={22} strokeWidth={2.5} />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-tight truncate">
                  {card.label}
                </span>
                <span className={cn(
                  "text-2xl font-extrabold tracking-tight",
                  colors.text
                )}>
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