import React, { useMemo } from "react";
import { Users, Clock, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import type { ProjectData } from "../../../interface";

interface MonthlyProjectStatsProps {
  tasks: any[];
  projects: ProjectData[];
  selectedMonth?: number | null;
  selectedYear?: number | null;
  teams?: any[];
  projectsByTeam: Record<
    string,
    {
      teamName: string;
      projects: ProjectData[];
      totalSeconds: number;
      stats: Record<
        string,
        { active: number; onHold: number; completed: number; total: number }
      >;
    }
  >;
  handleStatClick: (
    projects: ProjectData[],
    stage: "IFA" | "IFC" | "CO#",
    status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "TOTAL"
  ) => void;
}

const formatSeconds = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const MonthlyProjectStats: React.FC<MonthlyProjectStatsProps> = ({
  tasks,
  projects,
  selectedMonth,
  selectedYear,
  teams = [],
  projectsByTeam,
  handleStatClick,
}) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const isFiltered = selectedMonth !== null || selectedYear !== null;

  const teamSummary = useMemo(() => {
    const summary: Record<
      string,
      {
        teamName: string;
        totalSeconds: number;
        projectCount: number;
        monthlyBreakdown: Record<string, number>;
        stats: Record<
          string,
          { active: number; onHold: number; completed: number; total: number }
        >;
      }
    > = {};

    // Initialize with all teams
    teams.forEach((team) => {
      summary[team.id] = {
        teamName: team.name,
        totalSeconds: 0,
        projectCount: 0,
        monthlyBreakdown: {},
        stats: {
          IFA: { active: 0, onHold: 0, completed: 0, total: 0 },
          IFC: { active: 0, onHold: 0, completed: 0, total: 0 },
          "CO#": { active: 0, onHold: 0, completed: 0, total: 0 },
        },
      };
    });

    // Merge data from projectsByTeam
    Object.entries(projectsByTeam).forEach(([teamId, data]) => {
      if (!summary[teamId]) {
        summary[teamId] = {
          teamName: data.teamName,
          totalSeconds: 0,
          projectCount: 0,
          monthlyBreakdown: {},
          stats: data.stats,
        };
      } else {
        summary[teamId].stats = data.stats;
      }
      summary[teamId].projectCount = data.projects.length;
      summary[teamId].totalSeconds = data.totalSeconds;
    });

    // Calculate monthly breakdown if filtered or for all tasks
    tasks.forEach((task) => {
      const project = projects.find((p) => p.id === task.project_id);
      const teamId = project?.team?.id || "unassigned";

      if (summary[teamId] && task.start_date) {
        const date = new Date(task.start_date);
        const m = date.getMonth();
        const y = date.getFullYear();

        const matchesYear =
          selectedYear === null ||
          selectedYear === undefined ||
          y === selectedYear;
        const matchesMonth =
          selectedMonth === null ||
          selectedMonth === undefined ||
          m === selectedMonth;

        if (matchesYear && matchesMonth) {
          const hours = (task.workingHourTask || []).reduce(
            (sum: number, wht: any) => sum + (wht.duration_seconds || 0),
            0
          );
          const monthYear = `${months[m]} ${y}`;
          summary[teamId].monthlyBreakdown[monthYear] =
            (summary[teamId].monthlyBreakdown[monthYear] || 0) + hours;
        }
      }
    });

    return Object.values(summary);
  }, [projects, tasks, teams, projectsByTeam, selectedMonth, selectedYear]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {teamSummary.map((team) => (
        <motion.div
          key={team.teamName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-green-200 transition-all group"
        >
          {/* Team Header */}
          <div className="bg-background p-4 text-center border-b border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-white" />
              <h3 className="text-xl font-bold text-white uppercase tracking-wider truncate">
                {team.teamName}
              </h3>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-400 uppercase">
                  Projects
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-gray-800">
                    {team.projectCount}
                  </span>
                  <Briefcase className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-xl flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-green-600 uppercase">
                  Work Done
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-green-600">
                    {formatSeconds(team.totalSeconds)}
                  </span>
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>

            {/* IFA/IFC/CO# Grid */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
                {["IFA", "IFC", "CO#"].map((s) => (
                  <div
                    key={s}
                    className="py-1 text-center text-md font-black tracking-wide text-gray-800 border-r last:border-0 border-gray-100"
                  >
                    {s}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                {["IFA", "IFC", "CO#"].map((stage) => (
                  <div key={stage} className="p-2 space-y-2">
                    {[
                      { label: "Active", key: "active", color: "green" },
                      { label: "On-Hold", key: "onHold", color: "orange" },
                      { label: "Completed", key: "completed", color: "blue" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() =>
                          handleStatClick(
                            projectsByTeam[
                              Object.keys(projectsByTeam).find(
                                (k) =>
                                  projectsByTeam[k].teamName === team.teamName
                              ) || ""
                            ]?.projects || [],
                            stage as any,
                            item.key.toUpperCase() as any
                          )
                        }
                        className={`w-full flex items-center justify-between px-1.5 py-1 rounded-md hover:bg-${item.color}-50 transition-colors group/btn`}
                      >
                        <span className="text-md font-bold text-gray-800 uppercase group-hover/btn:text-gray-600">
                          {item.label}
                        </span>
                        <span
                          className={`text-md font-black text-${item.color}-600`}
                        >
                          {(team.stats[stage] as any)?.[item.key] || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Breakdown Section (Only when filtered) */}
            {isFiltered && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Monthly Breakdown
                </h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {Object.entries(team.monthlyBreakdown)
                    .sort((a, b) => {
                      const [monthA, yearA] = a[0].split(" ");
                      const [monthB, yearB] = b[0].split(" ");
                      const dateA = new Date(`${monthA} 1, ${yearA}`);
                      const dateB = new Date(`${monthB} 1, ${yearB}`);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map(([monthYear, seconds]) => (
                      <div
                        key={monthYear}
                        className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-[10px] font-medium text-gray-600">
                          {monthYear}
                        </span>
                        <span className="text-[10px] font-bold text-gray-800">
                          {formatSeconds(seconds)}
                        </span>
                      </div>
                    ))}
                  {Object.keys(team.monthlyBreakdown).length === 0 && (
                    <p className="text-[10px] text-gray-400 italic text-center py-2">
                      No task data for this period
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MonthlyProjectStats;
