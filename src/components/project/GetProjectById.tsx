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
import { useDispatch, useSelector } from "react-redux";
import { setMilestonesForProject } from "../../store/milestoneSlice";
import { formatSeconds } from "../../utils/timeUtils";
import { formatDate } from "../../utils/dateUtils";
import Service from "../../api/Service";
import Button from "../fields/Button";
import AllMileStone from "./mileStone/AllMileStone";
import AllDocument from "./projectDocument/AllDocument";
import { type ProjectData } from "../../interface";
import WBS from "./wbs/WBS";
import ProjectAnalyticsDashboard from "./ProjectAnalyticsDashboard";

import AllRFI from "../rfi/AllRfi";
import AddRFI from "../rfi/AddRFI";
import AllSubmittals from "../submittals/AllSubmittals";
import AllNotes from "./notes/AllNotes";
import EditProject from "./EditProject";
import AddSubmittal from "../submittals/AddSubmittals";

import AllCO from "../co/AllCO";
import AddCO from "../co/AddCO";
import CoTable from "../co/CoTable";
import ProjectMilestoneMetrics from "./ProjectMilestoneMetrics";
import AllDocumentsByProjectID from "./designDrawings/AllDocumentsByProjectID";

const GetProjectById = ({
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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [rfiView, setRfiView] = useState<"list" | "add">("list");
  const [submittalView, setSubmittalView] = useState<"list" | "add">("list");
  const [editModel, setEditModel] = useState<ProjectData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [changeOrderView, setChangeOrderView] = useState<
    "list" | "add" | "table"
  >("list");
  const [selectedCoId, setSelectedCoId] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<any[]>([]); // Tasks for stats
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  const rfiData = useMemo(() => {
    return project?.rfi || [];
  }, [project]);
  console.log("projects-----ByID", project);

  // Redux hooks for milestones
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const milestonesByProject = useSelector(
    (state: any) => state.milestoneInfo?.milestonesByProject || {},
  );

  // Fetch milestones if not available
  useEffect(() => {
    const fetchMileStone = async () => {
      try {
        const response = await Service.GetProjectMilestoneById(id);
        if (response && response.data) {
          dispatch(
            setMilestonesForProject({
              projectId: id,
              milestones: response.data,
            }),
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (!milestonesByProject[id]) {
      fetchMileStone();
    }
  }, [id, milestonesByProject, dispatch]);

  const changeOrderData = useMemo(() => {
    return project?.changeOrders || [];
  }, [project]);
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

  // Fetch tasks for stats
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

    return {
      workedSeconds,
      isOverrun,
    };
  }, [project, allTasks, id]);

  // Fetch analytics data

  // Fetch analytics data
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
        console.log("Analytics Score:", response);
        const analyticsData = response?.data || response || [];
        setAnalyticsData(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };
    fetchAnalytics();
  }, [id, userRole]);
  console.log(analyticsData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const getTaskCompletionPercentage = (tasks: any[]) => {
  //   if (!Array.isArray(tasks) || tasks.length === 0) return 0;
  //   const completedStatuses = [
  //     "COMPLETE",
  //     "VALIDATE_COMPLETE",
  //     "COMPLETE_OTHER",
  //     "USER_FAULT",
  //     "COMPLETED", // Added COMPLETED based on user data
  //   ];

  //   const completed = tasks.filter((task: any) =>
  //     completedStatuses.includes(task.status),
  //   ).length;

  //   return Math.round((completed / tasks.length) * 100);
  // };

  // Group tasks by milestone (subject + id) and compute completion percentage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const handleEditModel = (project: ProjectData) => {
    console.log(project);
    setEditModel(project);
  };

  const submittalData = useMemo(() => {
    return project?.submittals || [];
  }, [project]);

  // const FetchWBSbyProjectId = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const response = await Service.GetWBSByProjectId(id);
  //   //   setProject(response?.data || null);
  //   console.log(response);

  //   } catch (err) {
  //     setError("Failed to load WBS details");
  //     console.error("Error fetching project:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAllDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Service.GetAllDocumentsByProjectId(id);
      //   setProject(response?.data || null);
      console.log(response);
    } catch (err) {
      setError("Failed to load WBS details");
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocuments();
    if (id) fetchProject();
  }, [id]);

  const handleCoSuccess = (createdCO: any) => {
    const coId = createdCO?.id || createdCO?._id;
    if (coId) {
      setSelectedCoId(coId);
      setChangeOrderView("table");
      fetchProject(); // Refresh project to get updated CO list
    }
  };

  const isClient = userRole === "client" || userRole === "client_admin";

  const clientTabs = [
    { key: "overview", label: "Overview", icon: ClipboardList },
    // { key: "analytics", label: "Analytics", icon: TrendingUp },
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md text-white">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading project details...
      </div>
    );

  if (error || !project)
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Project not found"}
      </div>
    );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 p-5 w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-transparent dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">
              {project.name}
            </h2>
            <p className="text-gray-700 text-sm">
              Project No: {project.projectNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-lg text-md md:text-lg bg-gray-100 text-black border border-gray-200 uppercase tracking-widest"
            >
              {project.status}
            </span>
            {close && (
              <button
                onClick={close}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
              >
                <CloseIcon size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b">
          {/* Mobile Dropdown */}
          <div className="block md:hidden mb-2">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-primary text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {mobileTabsToShow.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex gap-2 overflow-x-auto">
            {tabsToShow.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 text-md rounded-xl font-bold transition-all whitespace-nowrap border ${activeTab === key
                  ? "bg-green-50 text-black border-[#6bbd45]"
                  : "bg-white text-black border-black hover:bg-green-50"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Tab Content */}
        <div className="p-2 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {/* ✅ Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {!isClient && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    {/* <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">
                        Approval Date
                      </span>
                      <span className="text-slate-800 ">
                        {formatDate(project.approvalDate)}
                      </span>
                    </div> */}
                    {/* <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">
                        Expected Project Completion Date
                      </span>
                      <span className="text-slate-800 ">
                        {formatDate(project.endDate)}
                      </span>
                    </div> */}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                  <div className="mb-4 p-4 bg-white rounded-full shadow-inner border border-slate-200">
                    <Activity size={32} className="text-green-500" />
                  </div>
                  <h4 className=" text-slate-800 mb-1">Project Status</h4>
                  <div
                    className="mt-2 px-6 py-2 rounded-lg text-md border border-gray-200 bg-gray-100 text-black uppercase tracking-widest"
                  >
                    {project.status}
                  </div>
                  <p className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-tighter">
                    Current Development Phase: {project.stage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Analytics Dashboard */}
          {activeTab === "analytics" && (
            <ProjectAnalyticsDashboard projectId={id} />
          )}

          {/* ✅ Details */}
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
                {/* <InfoRow
                  label="Estimated Hours"
                  value={project.estimatedHours || 0}
                /> */}
                <InfoRow
                  label="Department"
                  value={project.department?.name || "—"}
                />
                <InfoRow label="Team / Tools" value={project.team?.name || "—"} />
                <InfoRow
                  label="Manager"
                  value={
                    project.manager
                      ? `${project.manager.firstName} ${project.manager.lastName} (${project.manager.username})`
                      : "—"
                  }
                />
                {userRole !== "client" && userRole !== "client_admin" && (
                  <>
                    <InfoRow
                      label="Fabricator"
                      value={project.fabricator?.fabName || "—"}
                    />
                    <InfoRow label="Tools" value={project.tools || "—"} />
                  </>
                )}
                {userRole !== "client" && userRole !== "client_admin" && (
                  <>
                    <InfoRow
                      label="Fabricator"
                      value={project.fabricator?.fabName || "—"}
                    />
                    <InfoRow label="Tools" value={project.tools || "—"} />
                  </>
                )}
              </div>

              <div className="space-y-3">
                <InfoRow label="Stage" value={project.stage || "—"} />
                <InfoRow
                  label="Start Date"
                  value={formatDate(project.startDate)}
                />
                {/* <InfoRow
                  label="Approval Date"
                  value={formatDate(project.approvalDate)}
                />
                <InfoRow
                  label="Fabrication Date"
                  value={formatDate(project.fabricationDate)}
                />
                <InfoRow label="End Date" value={formatDate(project.endDate)} /> */}
                {/* <InfoRow label="RFQ ID" value={project.rfqId || "—"} /> */}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border text-sm">
                <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-1">
                  <Settings className="w-5 h-5" /> Connection Design Scope
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ScopeTag
                    label="Main Design"
                    label="Main Design"
                    active={project.connectionDesign}
                  />
                  <ScopeTag label="Misc Design" active={project.miscDesign} />
                  <ScopeTag
                    label={
                      project.customerDesign
                      ? "Connection Design by WBT"
                      : `Connection Design by ${project.fabricator?.fabName ?? ""}`
                    }
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
              {userRole !== "client" && userRole !== "client_admin" && (
                <div className="pt-2 flex flex-wrap gap-3">
                  <Button
                    className="py-1 px-3 text-sm bg-white text-black border border-black hover:bg-green-50 font-bold rounded-lg"
                    onClick={() => handleEditModel(project)}
                  >
                  Edit Project
                </Button>
              </div>
              )}
            </div>
          )}

          {/* ✅ Files */}
          {activeTab === "files" && (
            <div className="space-y-4">
              <AllDocumentsByProjectID projectId={id} />
              <AllDocument projectId={id} />
            </div>
          )}
          {activeTab === "milestones" && (
            <AllMileStone project={project} onUpdate={fetchProject} />
          )}

          {/* ✅ Team */}
          {activeTab === "team" && (
            <div className="text-gray-700 text-sm">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" /> Assigned Team
              </h4>
              <p>Team: {project.team?.name || "No team assigned."}</p>
              <p>
                Manager:{" "}
                {project.manager
                  ? `${project.manager.firstName} ${project.manager.lastName} (${project.manager.username})`
                  : "Not assigned."}
              </p>
            </div>
          )}

          {/* ✅ Timeline */}
          {activeTab === "timeline" && (
            <div className="text-gray-700 italic text-center py-10">
              <Clock className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              Timeline view will be integrated soon.
            </div>
          )}

          {/* ✅ Notes */}
          {activeTab === "notes" && <AllNotes projectId={id} />}
          {activeTab === "wbs" && (
            <div className="text-gray-700 italic text-center">
              {/* <FolderOpenDot className="w-6 h-6 mx-auto mb-2 text-gray-400" /> */}
              <WBS id={id} stage={project.stage || ""} />
            </div>
          )}
          {activeTab === "rfi" && (
            <div className="space-y-4">
              {/* Sub-tabs for RFI */}
              <div className="flex justify-start border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setRfiView("list")}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${rfiView === "list"
                        ? "border-[#6bbd45] text-black font-bold"
                        : "border-transparent text-gray-500 hover:text-black hover:border-gray-200"
                      }
                    `}
                  >
                    All RFIs
                  </button>
                  {!isClient && (
                    <button
                      onClick={() => setRfiView("add")}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        ${rfiView === "add"
                          ? "border-[#6bbd45] text-black font-bold"
                          : "border-transparent text-gray-500 hover:text-black hover:border-gray-200"
                        }
                    `}
                    >
                      Create RFI
                    </button>
                  )}
                </nav>
              </div>

              {/* RFI Content */}
              {rfiView === "list" ? (
                <AllRFI rfiData={rfiData} />
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
              {/* Sub-tabs for RFI */}
              <div className="flex justify-start border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setRfiView("list")}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${rfiView === "list"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    All RFIs
                  </button>
                  {!isClient && (
                    <button
                      onClick={() => setRfiView("add")}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        ${rfiView === "add"
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                        }
                    `}
                    >
                      Create RFI
                    </button>
                  )}
                </nav>
              </div>

              {/* RFI Content */}
              {rfiView === "list" ? (
                <AllRFI rfiData={rfiData} />
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
              {/* Sub-tabs for RFI */}
              <div className="flex justify-start border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setSubmittalView("list")}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${submittalView === "list"
                        ? "border-[#6bbd45] text-black font-bold"
                        : "border-transparent text-gray-500 hover:text-black hover:border-gray-200"
                      }
                    `}
                  >
                    All Submittals
                  </button>
                  {!isClient && (
                    <button
                      onClick={() => setSubmittalView("add")}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        ${submittalView === "add"
                          ? "border-[#6bbd45] text-black font-bold"
                          : "border-transparent text-gray-500 hover:text-black hover:border-gray-200"
                        }
                    `}
                    >
                      Create Submittal
                    </button>
                  )}
                </nav>
              </div>

              {/* Submittal Content */}
              {submittalView === "list" ? (
                <AllSubmittals submittalData={submittalData} />
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
              {/* Sub-tabs for RFI */}
              <div className="flex justify-start border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setSubmittalView("list")}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${submittalView === "list"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    All Submittals
                  </button>
                  {!isClient && (
                    <button
                      onClick={() => setSubmittalView("add")}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        ${submittalView === "add"
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                        }
                    `}
                    >
                      Create Submittal
                    </button>
                  )}
                </nav>
              </div>

              {/* Submittal Content */}
              {submittalView === "list" ? (
                <AllSubmittals submittalData={submittalData} />
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
              {/* Sub-tabs for RFI */}
              <div className="flex justify-start border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setChangeOrderView("list")}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${changeOrderView === "list"
                        ? "border-[#6bbd45] text-black font-bold"
                        : "border-transparent text-gray-500 hover:text-black hover:border-gray-200"
                      }
                    `}
                  >
                    All Change Order
                  </button>
                  {!isClient && (
                    <button
                      onClick={() => setChangeOrderView("add")}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        ${changeOrderView === "add"
                          ? "border-[#6bbd45] text-black font-bold"
                          : "border-transparent text-gray-500 hover:text-black hover:border-gray-200"
                        }
                    `}
                    >
                      Raise Change Order
                    </button>
                  )}
                </nav>
              </div>

              {/* Change Order Content */}
              {changeOrderView === "list" ? (
                <AllCO changeOrderData={changeOrderData} />
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
      </div>
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
    </div>,
    document.body,
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

const ScopeTag = ({ label, active }: { label: string; active: boolean }) => (
  <span
    className={`px-3 py-1 text-sm font-bold rounded-lg border ${active
      ? "bg-green-50 text-black border-[#6bbd45]"
      : "bg-gray-100 text-black border-gray-200"
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
    className={`${color} p-5 rounded-2xl border border-white/50 shadow-sm flex flex-col transition-all hover:scale-[1.02] ${isAlert ? "ring-2 ring-red-500 ring-offset-2 animate-pulse" : ""
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

export default GetProjectById;
