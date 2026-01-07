import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Service from "../../api/Service";
import { 
  Users, 
  Calendar, 
  LayoutGrid, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Loader2,
  Inbox
} from "lucide-react";
import { motion } from "framer-motion";
import { setProjectData, updateProject } from "../../store/projectSlice";
import { setMilestonesForProject } from "../../store/milestoneSlice";
import type { ProjectData, Team, ProjectMilestone } from "../../interface";
import ProjectDetailsModal from "./components/ProjectDetailsModal";

const ProjectDashboard = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state: any) => state.projectInfo?.projectData || []) as ProjectData[];
  const teamDatas = useSelector((state: any) => state?.userInfo?.teamData || []) as Team[];
  const milestonesByProject = useSelector((state: any) => state.milestoneInfo?.milestonesByProject || {}) as Record<string, ProjectMilestone[]>;

  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<ProjectData | null>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const projectsRes = await Service.GetAllProjects();

      if (projectsRes?.data) {
        dispatch(setProjectData(projectsRes.data));
        
        // Fetch full details and milestones for each project to get submittals and accurate progress
        const detailPromises = projectsRes.data.map(async (p: ProjectData) => {
          try {
            const [milestonesRes, projectRes] = await Promise.all([
              Service.GetProjectMilestoneById(p.id),
              Service.GetProjectById(p.id)
            ]);

            if (milestonesRes?.data) {
              dispatch(setMilestonesForProject({
                projectId: p.id,
                milestones: milestonesRes.data
              }));
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

  const calculateProgress = (project: ProjectData) => {
    const milestones = milestonesByProject[project.id] || [];
    const submittals = project.submittals || [];
    
    const milestoneTotal = milestones.length;
    const submittalTotal = submittals.length;
    
    if (milestoneTotal === 0 && submittalTotal === 0) return 0;

    // Only COMPLETED or APPROVED milestones count as done
    const completedMilestones = milestones.filter(m => m.status === 'COMPLETED' || m.status === 'APPROVED').length;
    // status === false means responded/completed
    const completedSubmittals = submittals.filter(s => s.status === false).length;

    let progress = 0;
    if (milestoneTotal > 0 && submittalTotal > 0) {
      // Weight milestones and submittals 50/50
      progress = (completedMilestones / milestoneTotal * 50) + (completedSubmittals / submittalTotal * 50);
    } else if (milestoneTotal > 0) {
      progress = (completedMilestones / milestoneTotal * 100);
    } else if (submittalTotal > 0) {
      progress = (completedSubmittals / submittalTotal * 100);
    }

    return Math.round(progress);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesTeam = selectedTeam === "all" || project.team?.id === selectedTeam;
      
      const projectDate = new Date(project.startDate);
      const matchesYear = projectDate.getFullYear() === selectedYear;
      const matchesMonth = selectedMonth === null || projectDate.getMonth() === selectedMonth;

      return matchesTeam && matchesYear && matchesMonth;
    });
  }, [projects, selectedTeam, selectedYear, selectedMonth]);

  const groupedProjects = useMemo(() => {
    const groups: Record<string, Record<string, ProjectData[]>> = {};

    filteredProjects.forEach(project => {
      const stage = project.stage || "UNASSIGNED";
      const status = project.status || "UNKNOWN";

      if (!groups[stage]) groups[stage] = {};
      if (!groups[stage][status]) groups[stage][status] = [];
      
      groups[stage][status].push(project);
    });

    return groups;
  }, [filteredProjects]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-teal-600" />
        <p className="text-sm font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filters Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-teal-500 outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="all">All Teams</option>
              {teamDatas.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-teal-500 outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedMonth(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              selectedMonth === null
                ? "bg-teal-600 text-white shadow-md shadow-teal-100"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Months
          </button>
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(index)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedMonth === index
                  ? "bg-teal-600 text-white shadow-md shadow-teal-100"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Projects */}
      <div className="space-y-8">
        {Object.keys(groupedProjects).length > 0 ? (
          Object.entries(groupedProjects).map(([stage, statuses]) => (
            <div key={stage} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <LayoutGrid className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">{stage}</h3>
                <div className="h-px flex-1 bg-gray-100 ml-2" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(statuses).map(([status, projects]) => (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {status}
                      </span>
                      <span className="text-xs font-medium text-gray-400">{projects.length} Projects</span>
                    </div>

                    <div className="space-y-3">
                      {projects.map(project => {
                        const progress = calculateProgress(project);
                        return (
                          <motion.div
                            layout
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedProjectForModal(project)}
                            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-1">
                                  {project.name}
                                </h4>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                                  {project.projectNumber}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-lg font-black text-teal-600 leading-none">
                                  {progress}%
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Progress</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {/* Progress Bar */}
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full rounded-full ${
                                    progress === 100 ? 'bg-green-500' : 'bg-teal-500'
                                  }`}
                                />
                              </div>

                              {/* Stats */}
                              <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span>{milestonesByProject[project.id]?.length || 0} Milestones</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-blue-500" />
                                    <span>{project.submittals?.length || 0} Submittals</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Inbox className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800">No Projects Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>

      <ProjectDetailsModal 
        project={selectedProjectForModal} 
        onClose={() => setSelectedProjectForModal(null)} 
      />
    </div>
  );
};

export default ProjectDashboard;

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);