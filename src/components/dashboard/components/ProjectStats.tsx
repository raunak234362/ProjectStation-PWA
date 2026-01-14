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
      bg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-100",
      iconBg: "bg-indigo-500",
      text: "text-indigo-700",
    },
    green: {
      bg: "bg-green-50",
      hoverBg: "hover:bg-green-100",
      iconBg: "bg-green-500",
      text: "text-green-700",
    },
    blue: {
      bg: "bg-blue-50",
      hoverBg: "hover:bg-blue-100",
      iconBg: "bg-blue-500",
      text: "text-blue-700",
    },
    orange: {
      bg: "bg-orange-50",
      hoverBg: "hover:bg-orange-100",
      iconBg: "bg-orange-500",
      text: "text-orange-700",
    },
  };

  return (
    <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
      <h2 className="text-md font-semibold text-gray-800 mb-2">
        Project Stats
      </h2>

      <div className="grid grid-cols-2 gap-3 h-full">
        {projectCards.map((card) => {
          const colors = colorClasses[card.color as keyof typeof colorClasses];
          const isClickable = card.clickable;

          return (
            <div
              key={card.label}
              onClick={() => isClickable && card.status && onCardClick(card.status)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border 
                ${colors.bg} ${isClickable ? colors.hoverBg + " cursor-pointer" : ""} 
                ${isClickable ? "transition-all duration-200 hover:shadow-md" : ""}
                border-gray-200
              `}
            >
              <div
                className={`p-2 rounded-lg ${colors.iconBg} text-white shrink-0`}
              >
                <card.icon size={20} />
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-600">
                  {card.label}
                </span>
                <span className={`text-lg font-bold mt-0.5 ${colors.text}`}>
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