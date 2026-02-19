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
      label: "TOTAL PROJECTS",
      value: stats.totalProjects,
      icon: Files,
      status: "TOTAL",
      clickable: true,
    },
    {
      label: "ACTIVE",
      value: stats.activeProjects,
      icon: Activity,
      status: "ACTIVE",
      clickable: true,
      active: true, // Primary status
    },
    {
      label: "COMPLETED",
      value: stats.completedProjects,
      icon: CheckCircle2,
      status: "COMPLETED",
      clickable: true,
    },
    {
      label: "ON HOLD",
      value: stats.onHoldProjects,
      icon: PauseCircle,
      status: "ON_HOLD",
      clickable: true,
    },
  ];

  return (
    <div className="flex flex-col justify-start h-full p-2 transition-all duration-300 relative overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold text-black mb-6 flex items-center gap-3 tracking-tight ml-1">
        <Building2 size={24} strokeWidth={2.5} className="text-[#6bbd45]" />
        PROJECT STATISTICS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectCards.map((card) => {
          const isClickable = card.clickable && onCardClick;

          return (
            <div
              key={card.label}
              onClick={() =>
                isClickable && card.status && onCardClick(card.status)
              }
              className={cn(
                "p-5 h-[110px] rounded-xl flex items-center justify-between group transition-all duration-300 bg-white relative overflow-hidden",
                "border border-black border-l-[6px] border-l-[#6bbd45] shadow-sm", // Solid black + green left border
                "hover:shadow-md",
                isClickable && "cursor-pointer",
              )}
            >
              <div className="flex items-center gap-4 z-10">
                <div
                  className={cn(
                    "p-3 rounded-full transition-colors bg-gray-50 group-hover:bg-[#f4f6f8]",
                    card.status === "ACTIVE" ? "text-black" : "text-black",
                  )}
                >
                  <card.icon size={24} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-black uppercase tracking-widest leading-tight">
                    {card.label}
                  </span>
                </div>
              </div>

              <div className="z-10 text-right">
                <span className="text-3xl font-black text-black tracking-tighter">
                  {card.value}
                </span>
              </div>

              {/* Subtle background interaction */}
              {isClickable && (
                <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectStats;
