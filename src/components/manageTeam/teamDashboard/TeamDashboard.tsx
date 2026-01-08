/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Service from "../../../api/Service";
import AddTeam from "../team/AddTeam";
import GetTeamByID from "../team/GetTeamById";
import GetEmployeeByID from "../employee/GetEmployeeByID";
import DashboardHeader from "./components/DashboardHeader";
import TeamsList from "./components/TeamsList";
import TeamStatsCards from "./components/TeamStatsCards";
import MonthlyEfficiencyChart from "./components/MonthlyEfficiencyChart";
import TeamMembersTable from "./components/TeamMembersTable";
import TaskDistribution from "./components/TaskDistribution";
import DailyWorkReportModal from "./components/DailyWorkReportModal";
import TeamCalendar from "./components/TeamCalendar";
import { toast } from "react-toastify";

const TeamDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [allMemberStats, setAllMemberStats] = useState<any[]>([]);
  const [monthlyEfficiency, setMonthlyEfficiency] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState({
    type: "all",
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    weekStart: new Date(
      new Date().setDate(new Date().getDate() - new Date().getDay())
    ).getTime(),
    weekEnd: new Date(
      new Date().setDate(new Date().getDate() - new Date().getDay() + 6)
    ).getTime(),
    startMonth: 0,
    endMonth: new Date().getMonth(),
    startDate: new Date(
      new Date().setDate(new Date().getDate() - 30)
    ).toISOString(),
    endDate: new Date().toISOString(),
  });

  // Fetch all teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await Service.AllTeam();
        const teamsData = response?.data || [];
        setTeams(teamsData);
        setFilteredTeams(teamsData);
        setLoading(false);
      } catch (error: any) {
        console.error(error.message);
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // Fetch team stats (Reusable)
  const fetchTeamStats = useCallback(async (teamId: string) => {
    try {
      const response = await Service.GetTeamByID(teamId);
      if (!response?.data) return null;

      const teamData = response.data;
      const activeMembers = (teamData.members || []).filter(
        (member: any) => !member.is_disabled && !member.member?.is_disabled
      );

      const memberStats = await Promise.all(
        activeMembers.map(async (member: any) => {
          try {
            const userId = member.userId || member.member?.id || member.id;
            const response = await Service.getUsersStats(userId);
            return { ...member, ...response.data, id: userId }; // Ensure id is the userId for mapping
          } catch (error) {
            console.error(
              `Error fetching stats for member ${member.id}:`,
              error
            );
            return {
              ...member,
              tasks: [],
              id: member.userId || member.member?.id || member.id,
            };
          }
        })
      );

      return { members: activeMembers, memberStats };
    } catch (error) {
      console.error("Error fetching team stats:", error);
      return null;
    }
  }, []);

  // Handle team selection
  useEffect(() => {
    if (!selectedTeam) return;

    const loadTeamData = async () => {
      setLoading(true);
      const data = await fetchTeamStats(selectedTeam);
      if (data) {
        setTeamMembers(data.members);
        setAllMemberStats(data.memberStats);
      }
      setLoading(false);
    };

    loadTeamData();
  }, [selectedTeam, fetchTeamStats]);

  // Apply filters and calculate stats
  useEffect(() => {
    if (!allMemberStats || allMemberStats.length === 0) return;

    const filteredStats = allMemberStats.map((memberStat) => {
      const filteredTasks = filterTasksByDateRange(
        memberStat.tasks || [],
        dateFilter
      );
      return {
        ...memberStat,
        tasks: filteredTasks,
      };
    });

    calculateTeamSummary(filteredStats);
  }, [allMemberStats, dateFilter]);

  const calculateTeamSummary = (filteredStats: any[]) => {
    try {
      const allFilteredTasks = filteredStats.flatMap((m) => m.tasks || []);

      const uniqueProjects: any[] = [];
      const projectIds = new Set();
      for (const t of allFilteredTasks) {
        const p = t?.project;
        if (p && p.id != null && !projectIds.has(p.id)) {
          projectIds.add(p.id);
          uniqueProjects.push(p);
        }
      }

      const totalAssignedHours = filteredStats.reduce((total, member) => {
        const memberAssignedHours = (member.tasks || []).reduce(
          (sum: number, task: any) =>
            sum + parseDurationToMinutes(task.duration || "00:00:00") / 60,
          0
        );
        return total + memberAssignedHours;
      }, 0);

      const totalWorkedHours = filteredStats.reduce((total, member) => {
        const memberWorkedHours = (member.tasks || [])
          .flatMap((task: any) => task.workingHourTask || [])
          .reduce(
            (sum: number, entry: any) => sum + (entry.duration || 0) / 60,
            0
          );
        return total + memberWorkedHours;
      }, 0);

      const totalTasks = filteredStats.reduce(
        (total, member) => total + (member.tasks?.length || 0),
        0
      );

      const projectCount = uniqueProjects.length;

      const completedTasks = filteredStats.reduce(
        (total, member) =>
          total +
          (member.tasks || []).filter((task: any) => task.status === "COMPLETE")
            .length,
        0
      );

      const inProgressTasks = filteredStats.reduce(
        (total, member) =>
          total +
          (member.tasks || []).filter(
            (task: any) => task.status === "IN_PROGRESS"
          ).length,
        0
      );

      const completedTasksList = filteredStats.flatMap((m) =>
        (m.tasks || []).filter((task: any) => task.status === "COMPLETE")
      );

      const efficiencyAssignedHours = completedTasksList.reduce(
        (sum, task) =>
          sum + parseDurationToMinutes(task.duration || "00:00:00") / 60,
        0
      );

      const efficiencyWorkedHours = completedTasksList
        .flatMap((task) => task.workingHourTask || [])
        .reduce((sum, entry) => sum + (entry.duration || 0) / 60, 0);

      let efficiency = 0;
      if (efficiencyWorkedHours > 0) {
        efficiency = Math.round(
          (efficiencyAssignedHours / efficiencyWorkedHours) * 100
        );
      }

      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setTeamStats({
        totalAssignedHours: totalAssignedHours.toFixed(2),
        totalWorkedHours: totalWorkedHours.toFixed(2),
        totalTasks,
        completedTasks,
        inProgressTasks,
        efficiency,
        completionRate,
        memberStats: filteredStats,
        projects: uniqueProjects,
        projectCount,
      });

      calculateMonthlyEfficiency(filteredStats);
    } catch (error) {
      console.error("Error calculating team stats:", error);
    }
  };

  const calculateMonthlyEfficiency = (memberStats: any[]) => {
    const monthlyData: any = {};
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i, 1).toLocaleString("default", {
        month: "short",
      });
      monthlyData[i] = {
        month: monthName,
        assignedHours: 0,
        workedHours: 0,
        efficiency: 0,
      };
    }

    memberStats.forEach((member) => {
      (member.tasks || []).forEach((task: any) => {
        const startDate = new Date(task.start_date || task.startDate);
        const month = startDate.getMonth();

        if (startDate.getFullYear() === currentYear) {
          const assignedHours =
            parseDurationToMinutes(task.duration || "00:00:00") / 60;
          monthlyData[month].assignedHours += assignedHours;

          const workedHours = (task.workingHourTask || []).reduce(
            (sum: number, entry: any) => sum + (entry.duration || 0) / 60,
            0
          );
          monthlyData[month].workedHours += workedHours;
        }
      });
    });

    Object.keys(monthlyData).forEach((month: any) => {
      const { assignedHours, workedHours } = monthlyData[month];
      monthlyData[month].efficiency =
        assignedHours > 0 && workedHours > 0
          ? Math.round((assignedHours / workedHours) * 100)
          : 0;
    });

    setMonthlyEfficiency(Object.values(monthlyData));
  };

  useEffect(() => {
    if (!teams) return;

    let filtered = [...teams];

    if (searchTerm) {
      filtered = filtered.filter((team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTeams(filtered);
  }, [searchTerm, teams]);

  const handleTeamSelect = (teamId: string) => setSelectedTeam(teamId);
  const handleMemberClick = (memberId: string) => setSelectedEmployee(memberId);
  const handleCloseModal = () => setSelectedEmployee(null);

  const getEfficiencyColorClass = (efficiency: number) => {
    if (efficiency >= 90) return "bg-green-100 text-green-800";
    if (efficiency >= 70) return "bg-blue-100 text-blue-800";
    if (efficiency >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const tableData = useMemo(() => {
    if (!teamMembers || !teamStats.memberStats) return [];

    return teamMembers
      .filter((member) => !member.is_disabled && !member.member?.is_disabled)
      .map((member, index) => {
        const user = member.member || {};
        const memberStat = teamStats.memberStats?.find(
          (stat: any) => stat.id === (member.userId || user.id || member.id)
        );

        const assignedHours =
          (memberStat?.tasks || []).reduce(
            (sum: number, task: any) =>
              sum + parseDurationToMinutes(task.duration || "00:00:00") / 60,
            0
          ) || 0;

        const workedHours =
          (memberStat?.tasks || [])
            .flatMap((task: any) => task.workingHourTask || [])
            .reduce(
              (sum: number, entry: any) => sum + (entry.duration || 0) / 60,
              0
            ) || 0;

        const totalTasks = memberStat?.tasks?.length || 0;
        const completedTasks =
          (memberStat?.tasks || []).filter((task: any) =>
            ["COMPLETE", "USER_FAULT", "VALIDATE_COMPLETED"].includes(
              task.status
            )
          ).length || 0;

        const memberCompletedTasks = (memberStat?.tasks || []).filter(
          (task: any) => task.status === "COMPLETE"
        );

        const efficiencyAssigned =
          memberCompletedTasks?.reduce(
            (sum: number, task: any) =>
              sum + parseDurationToMinutes(task.duration || "00:00:00") / 60,
            0
          ) || 0;

        const efficiencyWorked =
          memberCompletedTasks
            ?.flatMap((task: any) => task.workingHourTask || [])
            .reduce(
              (sum: number, entry: any) => sum + (entry.duration || 0) / 60,
              0
            ) || 0;

        let efficiency = 0;
        if (efficiencyWorked > 0) {
          efficiency = Math.round(
            (efficiencyAssigned / efficiencyWorked) * 100
          );
        }

        return {
          sno: index + 1,
          id: member.userId || user.id || member.id,
          name:
            `${user.firstName || ""} ${user.middleName || ""} ${
              user.lastName || ""
            }`.trim() || "Unknown",
          role: member.role || "Member",
          assignedHours: assignedHours.toFixed(2),
          workedHours: workedHours.toFixed(2),
          totalTasks,
          completedTasks,
          efficiency,
        };
      });
  }, [teamMembers, teamStats.memberStats]);

  const formatToHoursMinutes = (val: number) => {
    if (!val && val !== 0) return "00 hrs 00 mins";
    const hrs = Math.floor(val);
    const mins = Math.round((val - hrs) * 60);
    return `${hrs.toString().padStart(2, "0")} hrs ${mins
      .toString()
      .padStart(2, "0")} mins`;
  };

  const handleGenerateReport = () => {
    toast.info(
      "PDF generation is currently being set up. Please try again later."
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6 overflow-y-auto">
      <DashboardHeader
        onAddTeam={() => setIsModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onGenerateReport={handleGenerateReport}
        onDailyReport={() => setIsReportModalOpen(true)}
      />

      {loading && !selectedTeam ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">
            Loading dashboard data...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <TeamsList
            filteredTeams={filteredTeams}
            selectedTeam={selectedTeam}
            onTeamSelect={handleTeamSelect}
          />

          {selectedTeam && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Team:{" "}
                    <span className="text-teal-600">
                      {teams?.find((t) => t.id === selectedTeam)?.name}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(true)}
                  className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
                >
                  View Full Details
                </button>
              </div>

              <TeamStatsCards teamStats={teamStats} />

              <TeamCalendar
                members={allMemberStats}
                selectedTeamName={
                  teams?.find((t) => t.id === selectedTeam)?.name
                }
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <MonthlyEfficiencyChart
                    monthlyEfficiency={monthlyEfficiency}
                    teams={teams}
                    fetchTeamStats={fetchTeamStats}
                    selectedTeam={selectedTeam}
                  />
                </div>
                <div>
                  <TaskDistribution teamStats={teamStats} />
                </div>
              </div>

              <TeamMembersTable
                tableData={tableData}
                onMemberClick={handleMemberClick}
                formatToHoursMinutes={formatToHoursMinutes}
                getEfficiencyColorClass={getEfficiencyColorClass}
              />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10 transition-colors"
            >
              <XIcon />
            </button>
            <div className="max-h-[80vh] overflow-y-auto">
              <AddTeam />
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10 transition-colors"
            >
              <XIcon />
            </button>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <GetTeamByID id={selectedTeam} />
            </div>
          </div>
        </div>
      )}

      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10 transition-colors"
            >
              <XIcon />
            </button>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <GetEmployeeByID id={selectedEmployee} />
            </div>
          </div>
        </div>
      )}

      <DailyWorkReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        members={allMemberStats}
      />
    </div>
  );
};

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const parseDurationToMinutes = (duration: any) => {
  if (!duration) return 0;
  if (typeof duration === "number") return duration;
  if (typeof duration === "string" && !duration.includes(":")) {
    return parseFloat(duration);
  }
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  return hours * 60 + (minutes || 0) + Math.floor((seconds || 0) / 60);
};

const filterTasksByDateRange = (tasks: any[], filter: any) => {
  if (!tasks || !Array.isArray(tasks)) return [];
  if (filter.type === "all") return tasks;

  return tasks.filter((task) => {
    const taskStartDate = new Date(task.start_date || task.startDate);
    const taskEndDate = new Date(task.due_date || task.endDate);

    switch (filter.type) {
      case "week":
        const weekStart = new Date(filter.weekStart);
        const weekEnd = new Date(filter.weekEnd);
        return taskStartDate <= weekEnd && taskEndDate >= weekStart;

      case "month":
        const monthStart = new Date(filter.year, filter.month, 1);
        const monthEnd = new Date(filter.year, filter.month + 1, 0);
        return taskStartDate <= monthEnd && taskEndDate >= monthStart;

      case "year":
        const yearStart = new Date(filter.year, 0, 1);
        const yearEnd = new Date(filter.year, 11, 31);
        return taskStartDate <= yearEnd && taskEndDate >= yearStart;

      case "range":
        const rangeStart = new Date(filter.year, filter.startMonth, 1);
        const rangeEnd = new Date(filter.year, filter.endMonth + 1, 0);
        return taskStartDate <= rangeEnd && taskEndDate >= rangeStart;

      case "dateRange":
        const startDate = new Date(filter.startDate);
        const endDate = new Date(filter.endDate);
        return taskStartDate <= endDate && taskEndDate >= startDate;

      case "specificDate":
        const specificDate = new Date(filter.date);
        return taskStartDate.toDateString() === specificDate.toDateString();

      default:
        return true;
    }
  });
};

export default TeamDashboard;
