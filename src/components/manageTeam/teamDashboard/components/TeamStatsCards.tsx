import React from "react";
import { Clock, CheckCircle2, Zap, Layout } from "lucide-react";

interface TeamStatsCardsProps {
  teamStats: any;
}

const TeamStatsCards: React.FC<TeamStatsCardsProps> = ({ teamStats }) => {
  const stats = [
    {
      label: "Hours",
      value: `${teamStats.totalWorkedHours || 0} hrs`,
      subValue: `Assigned: ${teamStats.totalAssignedHours || 0} hrs`,
      icon: <Clock className="text-blue-600" size={24} />,
      bg: "bg-blue-50",
      border: "border-blue-100",
      progress:
        Math.min(
          100,
          (teamStats.totalWorkedHours / teamStats.totalAssignedHours) * 100
        ) || 0,
      progressColor: "bg-blue-500",
    },
    {
      label: "Tasks",
      value: teamStats.totalTasks || 0,
      subValue: `Completed: ${teamStats.completedTasks || 0}`,
      icon: <CheckCircle2 className="text-green-600" size={24} />,
      bg: "bg-green-50",
      border: "border-green-100",
      progress: (teamStats.completedTasks / teamStats.totalTasks) * 100 || 0,
      progressColor: "bg-green-500",
    },
    {
      label: "Efficiency",
      value: `${teamStats.efficiency || 0}%`,
      subValue: "Hours worked vs assigned",
      icon: <Zap className="text-purple-600" size={24} />,
      bg: "bg-purple-50",
      border: "border-purple-100",
      progress: teamStats.efficiency || 0,
      progressColor: "bg-purple-500",
    },
    {
      label: "Projects",
      value: teamStats.projectCount || 0,
      subValue: "Active projects",
      icon: <Layout className="text-orange-600" size={24} />,
      bg: "bg-orange-50",
      border: "border-orange-100",
      progress: 100,
      progressColor: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-white p-6 rounded-2xl border ${stat.border} shadow-sm transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stat.subValue}</span>
              {stat.label !== "Projects" && (
                <span>{Math.round(stat.progress)}%</span>
              )}
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.progressColor} rounded-full transition-all duration-500`}
                style={{ width: `${stat.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamStatsCards;
