/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  AlertCircle,
  FileText,
  Settings,
  FolderOpenDot,
  Users,
  Clock,
  ClipboardList,
  X as CloseIcon,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react";
import Service from "../../api/Service";
import RenderFiles from "../ui/RenderFiles";
import EditProject from "./EditProject";

import AllMileStone from "./mileStone/AllMileStone";
import ProjectAnalyticsDashboard from "./ProjectAnalyticsDashboard";
import WBS from "./wbs/WBS";
import AllNotes from "./notes/AllNotes";
import AllRFI from "../rfi/AllRfi";
import AddRFI from "../rfi/AddRFI";
import AllSubmittals from "../submittals/AllSubmittals";
import AddSubmittal from "../submittals/AddSubmittals";
import AllCO from "../co/AllCO";
import AddCO from "../co/AddCO";
import CoTable from "../co/CoTable";
import ProjectMilestoneMetrics from "./ProjectMilestoneMetrics";

import { formatSeconds } from "../../utils/timeUtils";
import { formatDate } from "../../utils/dateUtils";
import { type ProjectData } from "../../interface";
import AllDocument from "./projectDocument/AllDocument";

const ProjectDetailsContent = ({
  id,
  close,
  initialTab = "overview",
}: {
  id: string;
  close?: () => void;
  initialTab?: string;
}) => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editModel, setEditModel] = useState<ProjectData | null>(null);
  const [rfiView, setRfiView] = useState<"list" | "add">("list");
  const [submittalView, setSubmittalView] = useState<"list" | "add">("list");
  const [changeOrderView, setChangeOrderView] = useState<
    "list" | "add" | "table"
  >("list");
  const [selectedCoId, setSelectedCoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  const isClient = userRole === "client" || userRole === "client_admin";

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Service.GetProjectById(id);
      setProject(response?.data || null);
    } catch (err) {
      setError("Failed to load project details");
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  /* ✅ ESC KEY CLOSE */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  /* Fetch Tasks for stats */
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await Service.GetAllTask();
        if (response && response.data) {
          setAllTasks(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch tasks for stats", error);
      }
    };
    fetchTasks();
  }, [id]);

  const projectStats = useMemo(() => {
    if (!project || allTasks.length === 0) return null;
    const projectTasks = allTasks.filter((task) => task.project_id === id);
    const workedSeconds = projectTasks.reduce((sum, task) => {
      const taskSeconds = (task.workingHourTask || []).reduce(
        (tSum: number, wht: any) => tSum + (wht.duration_seconds || 0),
        0,
      );
      return sum + taskSeconds;
    }, 0);
    const estimatedHours = project.estimatedHours || 0;
    const workedHours = workedSeconds / 3600;
    const isOverrun = workedHours > estimatedHours && estimatedHours > 0;
    return { workedSeconds, isOverrun };
  }, [project, allTasks, id]);

  /* Fetch analytics data */
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Don't fetch analytics for clients
      if (userRole === "client" || userRole === "client_admin") return;
      try {
        const data = {
          projectId: id,
          managerId: sessionStorage.getItem("userId"),
        };
        const response = await Service.GetAnalyticsScore(data);
        const analyticsData = response?.data || response || [];
        setAnalyticsData(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };
    fetchAnalytics();
  }, [id, userRole]);

  const submittalData = useMemo(() => {
    return project?.submittals || [];
  }, [project]);

  const handleCoSuccess = (createdCO: any) => {
    const coId = createdCO?.id || createdCO?._id;
    if (coId) {
      setSelectedCoId(coId);
      setChangeOrderView("table");
      fetchProject(); // Refresh project to get updated CO list
    }
  };

  const handleEditModel = (project: ProjectData) => {
    setEditModel(project);
  };

  const clientTabs = [
    { key: "overview", label: "Overview", icon: ClipboardList },
    { key: "details", label: "Details", icon: ClipboardList },
    { key: "files", label: "Files", icon: FileText },
    { key: "milestones", label: "Milestones", icon: FileText },
    { key: "rfi", label: "RFI", icon: FolderOpenDot },
    { key: "submittals", label: "Submittals", icon: FolderOpenDot },
    { key: "changeOrder", label: "Change Order", icon: FolderOpenDot },
  ];

  const defaultDesktopTabs = [
    { key: "overview", label: "Overview", icon: ClipboardList },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "details", label: "Details", icon: ClipboardList },
    { key: "files", label: "Files", icon: FileText },
    { key: "wbs", label: "WBS", icon: FileText },
    { key: "milestones", label: "Milestones", icon: FileText },
    { key: "notes", label: "Notes", icon: FolderOpenDot },
    { key: "rfi", label: "RFI", icon: FolderOpenDot },
    { key: "CDrfi", label: "CD RFI", icon: FolderOpenDot },
    { key: "submittals", label: "Submittals", icon: FolderOpenDot },
    { key: "CDsubmittals", label: "CD Submittals", icon: FolderOpenDot },
    { key: "changeOrder", label: "Change Order", icon: FolderOpenDot },
  ];

  const defaultMobileTabs = [
    { key: "details", label: "Details" },
    { key: "analytics", label: "Analytics" },
    { key: "files", label: "Files" },
    { key: "wbs", label: "WBS" },
    { key: "milestones", label: "Milestones" },
    { key: "team", label: "Team" },
    { key: "timeline", label: "Timeline" },
    { key: "notes", label: "Notes" },
    { key: "rfi", label: "RFI" },
    { key: "submittals", label: "Submittals" },
    { key: "changeOrder", label: "Change Order" },
  ];

  const tabsToShow = isClient ? clientTabs : defaultDesktopTabs;
  const mobileTabsToShow = isClient ? clientTabs : defaultMobileTabs;

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );

  if (error || !project)
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Project not found"}
      </div>
    );

  const tabs = isClient
    ? [
        "overview",
        "details",
        "files",
        "milestones",
        "rfi",
        "submittals",
        "changeOrder",
      ]
    : [
        "overview",
        "analytics",
        "details",
        "files",
        "wbs",
        "milestones",
        "notes",
        "rfi",
        "submittals",
        "changeOrder",
      ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* ✅ CLOSE BUTTON */}
      <button
        onClick={close}
        className="absolute top-4 right-4 p-2 rounded-full bg-white shadow hover:scale-105 transition z-10"
      >
        <CloseIcon size={18} />
      </button>

      {/* ✅ HEADER */}
      <div className="px-6 py-4 border-b bg-green-50">
        <h2 className="text-lg font-semibold text-green-700">{project.name}</h2>
        <p className="text-xs text-gray-500">
          Project No: {project.projectNumber}
        </p>
      </div>

      {/* ✅ TABS */}
      <div className="flex gap-2 px-4 py-2 border-b bg-white overflow-x-auto">
        {tabsToShow.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md whitespace-nowrap ${
              activeTab === key
                ? "bg-green-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ✅ CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {activeTab === "overview" && (
          <>
            {!isClient && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard
                  icon={<Clock className="text-blue-600" />}
                  label="Hours Assigned"
                  value={`${project.estimatedHours || 0}h`}
                  color="bg-blue-50"
                  description="Total estimated hours for project"
                />
                <StatCard
                  icon={<CheckCircle2 className="text-green-600" />}
                  label="Hours Completed"
                  value={formatSeconds(
                    projectStats?.workedSeconds ||
                      project.workedSeconds ||
                      project.totalWorkedSeconds ||
                      0,
                  )}
                  color="bg-green-50"
                  description="Total hours logged by team"
                />
                <StatCard
                  icon={
                    <AlertCircle
                      className={
                        (projectStats?.isOverrun ?? project.isOverrun)
                          ? "text-red-600"
                          : "text-gray-400"
                      }
                    />
                  }
                  label="Overrun / Delay"
                  value={
                    (projectStats?.isOverrun ?? project.isOverrun)
                      ? formatSeconds(
                          (projectStats?.workedSeconds ||
                            project.workedSeconds ||
                            project.totalWorkedSeconds ||
                            0) -
                            (project.estimatedHours || 0) * 3600,
                        )
                      : "00:00"
                  }
                  color={
                    (projectStats?.isOverrun ?? project.isOverrun)
                      ? "bg-red-50"
                      : "bg-gray-50"
                  }
                  description={
                    (projectStats?.isOverrun ?? project.isOverrun)
                      ? "Project is exceeding estimates"
                      : "Project is within estimates"
                  }
                  isAlert={projectStats?.isOverrun ?? project.isOverrun}
                />
              </div>
            )}
            <ProjectMilestoneMetrics projectId={id} />
            {/* Timeline / Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className=" text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-indigo-600" />
                  Timeline Overview
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">
                      Start Date
                    </span>
                    <span className="text-slate-800 ">
                      {formatDate(project.startDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                <div className="mb-4 p-4 bg-white rounded-full shadow-inner border border-slate-200">
                  <Activity size={32} className="text-green-500" />
                </div>
                <h4 className=" text-slate-800 mb-1">Project Status</h4>
                <div
                  className={`mt-2 px-6 py-2 rounded-full  text-sm uppercase tracking-widest ${project.status === "ACTIVE" ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  {project.status}
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-tighter">
                  Current Development Phase: {project.stage}
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <ProjectAnalyticsDashboard projectId={id} />
        )}

        {activeTab === "details" && (
          <div className="grid max-sm:grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="md:col-span-2 mt-6">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                <FolderOpenDot className="w-4 h-4" />
                Project Description
              </h4>
              <div
                className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: project.description || "No description available.",
                }}
              />
            </div>
            <div className="space-y-3">
              <InfoRow
                label="Department"
                value={project.department?.name || "—"}
              />
              <InfoRow label="Team" value={project.team?.name || "—"} />
              <InfoRow
                label="Manager"
                value={
                  project.manager
                    ? `${project.manager.firstName} ${project.manager.lastName} (${project.manager.username})`
                    : "—"
                }
              />
              <InfoRow
                label="Fabricator"
                value={project.fabricator?.fabName || "—"}
              />
              <InfoRow label="Tools" value={project.tools || "—"} />
            </div>

            <div className="space-y-3">
              <InfoRow label="Stage" value={project.stage || "—"} />
              <InfoRow
                label="Start Date"
                value={formatDate(project.startDate)}
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border text-sm">
              <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-1">
                <Settings className="w-5 h-5" /> Connection Design Scope
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ScopeTag
                  label="Connection Design"
                  active={project.connectionDesign}
                />
                <ScopeTag label="Misc Design" active={project.miscDesign} />
                <ScopeTag
                  label="Customer Design"
                  active={project.customerDesign}
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border text-sm">
              <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-1">
                <Settings className="w-5 h-5" /> Detailing Scope
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ScopeTag
                  label="Detailing Main"
                  active={project.detailingMain}
                />
                <ScopeTag
                  label="Detailing Misc"
                  active={project.detailingMisc}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                className="py-1 px-3 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => handleEditModel(project)}
              >
                Edit Project
              </button>
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-4">
            <RenderFiles
              files={project.files || []}
              table="project"
              parentId={id}
              formatDate={formatDate}
            />
            <AllDocument />
          </div>
        )}

        {activeTab === "wbs" && <WBS id={id} stage={project.stage || ""} />}

        {activeTab === "milestones" && (
          <AllMileStone project={project} onUpdate={fetchProject} />
        )}

        {activeTab === "notes" && <AllNotes projectId={id} />}

        {activeTab === "rfi" && (
          <div className="space-y-4">
            <div className="flex justify-start border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setRfiView("list")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${rfiView === "list" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  All RFIs
                </button>
                {!isClient && (
                  <button
                    onClick={() => setRfiView("add")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${rfiView === "add" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    Create RFI
                  </button>
                )}
              </nav>
            </div>
            {rfiView === "list" ? (
              <AllRFI rfiData={project.rfi || []} />
            ) : (
              <AddRFI
                project={project}
                onSuccess={() => {
                  fetchProject();
                  setRfiView("list");
                }}
              />
            )}
          </div>
        )}

        {activeTab === "CDrfi" && (
          <div className="space-y-4">
            <div className="flex justify-start border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setRfiView("list")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${rfiView === "list" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  All RFIs
                </button>
                {!isClient && (
                  <button
                    onClick={() => setRfiView("add")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${rfiView === "add" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    Create RFI
                  </button>
                )}
              </nav>
            </div>
            {rfiView === "list" ? (
              <AllRFI rfiData={project.rfi || []} />
            ) : (
              <AddRFI
                project={project}
                onSuccess={() => {
                  fetchProject();
                  setRfiView("list");
                }}
              />
            )}
          </div>
        )}

        {activeTab === "submittals" && (
          <div className="space-y-4">
            <div className="flex justify-start border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setSubmittalView("list")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${submittalView === "list" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  All Submittals
                </button>
                {!isClient && (
                  <button
                    onClick={() => setSubmittalView("add")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${submittalView === "add" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    Create Submittal
                  </button>
                )}
              </nav>
            </div>
            {submittalView === "list" ? (
              <AllSubmittals submittalData={project.submittals || []} />
            ) : (
              <AddSubmittal
                project={project}
                onSuccess={() => {
                  fetchProject();
                  setSubmittalView("list");
                }}
              />
            )}
          </div>
        )}

        {activeTab === "CDsubmittals" && (
          <div className="space-y-4">
            <div className="flex justify-start border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setSubmittalView("list")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${submittalView === "list" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  All Submittals
                </button>
                {!isClient && (
                  <button
                    onClick={() => setSubmittalView("add")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${submittalView === "add" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    Create Submittal
                  </button>
                )}
              </nav>
            </div>
            {submittalView === "list" ? (
              <AllSubmittals submittalData={project.submittals || []} />
            ) : (
              <AddSubmittal
                project={project}
                onSuccess={() => {
                  fetchProject();
                  setSubmittalView("list");
                }}
              />
            )}
          </div>
        )}

        {activeTab === "changeOrder" && (
          <div className="space-y-4">
            <div className="flex justify-start border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setChangeOrderView("list")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${changeOrderView === "list" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  All Change Order
                </button>
                {!isClient && (
                  <button
                    onClick={() => setChangeOrderView("add")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${changeOrderView === "add" ? "border-green-500 text-green-600" : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    Raise Change Order
                  </button>
                )}
              </nav>
            </div>
            {changeOrderView === "list" ? (
              <AllCO changeOrderData={project.changeOrders || []} />
            ) : changeOrderView === "add" ? (
              <AddCO project={project} onSuccess={handleCoSuccess} />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-green-700">
                    Change Order Table
                  </h4>
                  <button
                    onClick={() => setChangeOrderView("list")}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    &larr; Back to List
                  </button>
                </div>
                {selectedCoId && <CoTable coId={selectedCoId} />}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ EDIT PROJECT MODAL */}
      {editModel &&
        createPortal(
          <EditProject
            projectId={id}
            onCancel={() => setEditModel(null)}
            onSuccess={() => {
              setEditModel(null);
              fetchProject();
            }}
          />,
          document.body,
        )}
    </div>
  );
};

// ✅ InfoRow Component
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between border-b border-gray-100 md:text-md text-sm pb-1">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-gray-700">{value}</span>
  </div>
);

// ✅ ScopeTag Component
const ScopeTag = ({ label, active }: { label: string; active: boolean }) => (
  <span
    className={`px-3 py-1 text-sm font-medium rounded-full ${
      active
        ? "bg-green-100 text-green-800 border border-green-300"
        : "bg-gray-100 text-gray-700 border border-gray-200"
    }`}
  >
    {label}
  </span>
);

// ✅ StatCard Component
const StatCard = ({
  icon,
  label,
  value,
  color,
  description,
  isAlert = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  description?: string;
  isAlert?: boolean;
}) => (
  <div
    className={`${color} p-5 rounded-2xl border border-white/50 shadow-sm flex flex-col transition-all hover:scale-[1.02] ${
      isAlert ? "ring-2 ring-red-500 ring-offset-2 animate-pulse" : ""
    }`}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      <p className="text-xs  text-gray-500 uppercase tracking-widest">
        {label}
      </p>
    </div>
    <p
      className={`text-2xl  ${isAlert ? "text-red-700" : "text-gray-800"} tracking-tight`}
    >
      {value}
    </p>
    {description && (
      <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-tighter">
        {description}
      </p>
    )}
  </div>
);

export default ProjectDetailsContent;
