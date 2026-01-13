import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Service from "../../api/Service";
import { Calendar, Loader2, Inbox } from "lucide-react";
import { setProjectData, updateProject } from "../../store/projectSlice";
import { setMilestonesForProject } from "../../store/milestoneSlice";
import type { ProjectData } from "../../interface";
import ProjectDetailsModal from "./components/ProjectDetailsModal";
import MonthlyProjectStats from "./components/MonthlyProjectStats";
import ProjectListModal from "./components/ProjectListModal";

import { Button } from "../ui/button";

const ProjectDashboard = () => {
  const dispatch = useDispatch();
  const projects = useSelector(
    (state: any) => state.projectInfo?.projectData || []
  ) as ProjectData[];
  // const milestonesByProject = useSelector(
  //   (state: any) => state.milestoneInfo?.milestonesByProject || {}
  // ) as Record<string, ProjectMilestone[]>;

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [selectedProjectForModal, setSelectedProjectForModal] =
    useState<ProjectData | null>(null);

  // List Modal State
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [listModalProjects, setListModalProjects] = useState<ProjectData[]>([]);
  const [listModalStatus, setListModalStatus] = useState<string>("");

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

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes] = await Promise.all([
        Service.GetAllProjects(),
        Service.GetAllTask(),
      ]);

      if (tasksRes?.data) {
        setAllTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      }

      if (projectsRes?.data) {
        dispatch(setProjectData(projectsRes.data));

        // Fetch full details and milestones for each project to get submittals and accurate progress
        const detailPromises = projectsRes.data.map(async (p: ProjectData) => {
          try {
            const [milestonesRes, projectRes] = await Promise.all([
              Service.GetProjectMilestoneById(p.id),
              Service.GetProjectById(p.id),
            ]);

            if (milestonesRes?.data) {
              dispatch(
                setMilestonesForProject({
                  projectId: p.id,
                  milestones: milestonesRes.data,
                })
              );
            }

            if (projectRes?.data) {
              dispatch(updateProject(projectRes.data));
            }
          } catch (err) {
            console.error(`Error fetching details for project ${p.id}:`, err);
          }
        });

        await Promise.all(detailPromises);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (selectedYear === null) return true;

      const projectDate = new Date(project.startDate);
      const matchesYear = projectDate.getFullYear() === selectedYear;
      const matchesMonth =
        selectedMonth === null || projectDate.getMonth() === selectedMonth;

      return matchesYear && matchesMonth;
    });
  }, [projects, selectedYear, selectedMonth]);

  // Group projects by Team
  const projectsByTeam = useMemo(() => {
    const stages = ["IFA", "IFC", "CO#"] as const;
    const grouped: Record<
      string,
      {
        teamName: string;
        projects: ProjectData[];
        stats: Record<
          (typeof stages)[number],
          { active: number; onHold: number; completed: number; total: number }
        >;
      }
    > = {};

    filteredProjects.forEach((project) => {
      const teamId = project.team?.id || "unassigned";
      const teamName = project.team?.name || "Unassigned";

      if (!grouped[teamId]) {
        grouped[teamId] = {
          teamName,
          projects: [],
          stats: {
            IFA: { active: 0, onHold: 0, completed: 0, total: 0 },
            IFC: { active: 0, onHold: 0, completed: 0, total: 0 },
            "CO#": { active: 0, onHold: 0, completed: 0, total: 0 },
          },
        };
      }

      grouped[teamId].projects.push(project);

      const stage = project.stage;
      if (stages.includes(stage as any)) {
        const s = stage as (typeof stages)[number];
        grouped[teamId].stats[s].total += 1;
        if (project.status === "ACTIVE") grouped[teamId].stats[s].active += 1;
        else if (project.status === "ON_HOLD")
          grouped[teamId].stats[s].onHold += 1;
        else if (project.status === "COMPLETED")
          grouped[teamId].stats[s].completed += 1;
      }
    });

    return grouped;
  }, [filteredProjects]);

  const handleStatClick = (
    projects: ProjectData[],
    stage: "IFA" | "IFC" | "CO#",
    status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "TOTAL"
  ) => {
    let filtered = projects.filter((p) => p.stage === stage);
    if (status !== "TOTAL") {
      filtered = filtered.filter((p) => p.status === status);
    }
    setListModalProjects(filtered);
    setListModalStatus(`${stage} - ${status.replace("_", " ")}`);
    setIsListModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-700">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-green-600" />
        <p className="text-lg font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filters Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedYear === null ? "all" : selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value === "all" ? null : parseInt(e.target.value)
                )
              }
              className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium text-gray-700 focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Button
            onClick={() => setSelectedMonth(null)}
            className={`px-4 py-1.5 rounded-full text-base font-semibold transition-all whitespace-nowrap h-auto ${selectedMonth === null
                ? "bg-green-600 text-white shadow-md shadow-green-100 hover:bg-green-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-none"
              }`}
          >
            All Months
          </Button>
          {months.map((month, index) => (
            <Button
              key={month}
              onClick={() => setSelectedMonth(index)}
              className={`px-4 py-1.5 rounded-full text-base font-semibold transition-all whitespace-nowrap h-auto ${selectedMonth === index
                  ? "bg-green-600 text-white shadow-md shadow-green-100 hover:bg-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-none"
                }`}
            >
              {month}
            </Button>
          ))}
        </div>
      </div>

      {/* Monthly Workload Stats */}
      <MonthlyProjectStats
        tasks={allTasks}
        projects={projects}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* Project Timeline Calendar */}
      {/* <ProjectCalendar projects={projects} tasks={allTasks} /> */}

      {/* Team-based Project Stats */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {Object.keys(projectsByTeam).length > 0 ? (
            Object.values(projectsByTeam).map((teamData) => (
              <div
                key={teamData.teamName}
                className="min-w-[450px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Team Header */}
                <div className="bg-gray-800 p-3 text-center border-b border-gray-200">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider truncate">
                    {teamData.teamName}
                  </h3>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                  <div className="p-2 text-center border-r border-gray-200 font-bold text-gray-700">
                    IFA
                  </div>
                  <div className="p-2 text-center border-r border-gray-200 font-bold text-gray-700">
                    IFC
                  </div>
                  <div className="p-2 text-center font-bold text-gray-700">
                    CO
                  </div>
                </div>

                {/* Grid Body */}
                <div className="grid grid-cols-3 divide-x divide-gray-200">
                  {/* IFA Column */}
                  <div className="p-3 flex flex-col gap-3">
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "IFA", "ACTIVE")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 uppercase group-hover:text-green-600">
                        Active
                      </span>
                      <span className="text-base font-bold text-gray-800 group-hover:text-green-700">
                        {teamData.stats["IFA"].active}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "IFA", "ON_HOLD")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 uppercase group-hover:text-orange-600">
                        On-Hold
                      </span>
                      <span className="text-base font-bold text-gray-800 group-hover:text-orange-700">
                        {teamData.stats["IFA"].onHold}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "IFA", "COMPLETED")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 uppercase group-hover:text-blue-600">
                        Done
                      </span>
                      <span className="text-base font-bold text-gray-800 group-hover:text-blue-700">
                        {teamData.stats["IFA"].completed}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "IFA", "TOTAL")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all group"
                    >
                      <span className="text-[10px] font-bold text-gray-700 uppercase">
                        Total
                      </span>
                      <span className="text-base font-black text-gray-900">
                        {teamData.stats["IFA"].total}
                      </span>
                    </button>
                  </div>

                  {/* IFC Column */}
                  <div className="p-3 flex flex-col gap-3">
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "IFC", "ACTIVE")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 uppercase group-hover:text-green-600">
                        Active
                      </span>
                      <span className="text-base font-bold text-gray-800 group-hover:text-green-700">
                        {teamData.stats["IFC"].active}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "IFC", "ON_HOLD")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 uppercase group-hover:text-orange-600">
                        On-Hold
                      </span>
                      <span className="text-base font-bold text-gray-800 group-hover:text-orange-700">
                        {teamData.stats["IFC"].onHold}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "IFC", "COMPLETED")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 uppercase group-hover:text-blue-600">
                        Done
                      </span>
                      <span className="text-base font-bold text-gray-800 group-hover:text-blue-700">
                        {teamData.stats["IFC"].completed}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "IFC", "TOTAL")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all group"
                    >
                      <span className="text-[10px] font-bold text-gray-700 uppercase">
                        Total
                      </span>
                      <span className="text-base font-black text-gray-900">
                        {teamData.stats["IFC"].total}
                      </span>
                    </button>
                  </div>

                  {/* CO Column */}
                  <div className="p-3 flex flex-col gap-3">
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "CO#", "ACTIVE")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 uppercase group-hover:text-green-600">
                        Active
                      </span>
                      <span className="text-base font-bold text-gray-800 group-hover:text-green-700">
                        {teamData.stats["CO#"].active}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "CO#", "ON_HOLD")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 uppercase group-hover:text-orange-600">
                        On-Hold
                      </span>
                      <span className="text-base font-bold text-gray-800 group-hover:text-orange-700">
                        {teamData.stats["CO#"].onHold}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "CO#", "COMPLETED")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 uppercase group-hover:text-blue-600">
                        Done
                      </span>
                      <span className="text-base font-bold text-gray-800 group-hover:text-blue-700">
                        {teamData.stats["CO#"].completed}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatClick(teamData.projects, "CO#", "TOTAL")
                      }
                      className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all group"
                    >
                      <span className="text-[10px] font-bold text-gray-700 uppercase">
                        Total
                      </span>
                      <span className="text-base font-black text-gray-900">
                        {teamData.stats["CO#"].total}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Inbox className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-700">
                No Projects Found
              </h3>
              <p className="text-lg text-gray-700">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </div>
      </div>

      <ProjectListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        status={listModalStatus}
        projects={listModalProjects}
        onProjectSelect={(project) => {
          setSelectedProjectForModal(project);
          // setIsListModalOpen(false); // Optional: close list modal when opening details
        }}
      />

      <ProjectDetailsModal
        project={selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
      />
    </div>
  );
};

export default ProjectDashboard;

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    />
  </svg>
);
