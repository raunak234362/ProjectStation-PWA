/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  AlertCircle,
  FileText,
  Settings,
  Settings2,
  FolderOpenDot,
  Users,
  Clock,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Activity,
  MessageSquare,
  CalendarCheck,
  Compass,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { setMilestonesForProject } from "../../store/milestoneSlice";
import { formatSeconds } from "../../utils/timeUtils";
import { formatDate } from "../../utils/dateUtils";
import Service from "../../api/Service";

import AllDocument from "./projectDocument/AllDocument";
import { type ProjectData } from "../../interface";
import WBS from "./wbs/WBS";
import ProjectAnalyticsDashboard from "./ProjectAnalyticsDashboard";

import EditProject from "./EditProject";

import AllCO from "../co/AllCO";
import AddCO from "../co/AddCO";
import CoTable from "../co/CoTable";
import ProjectMilestoneMetrics from "./ProjectMilestoneMetrics";
import AllDocumentsByProjectID from "./designDrawings/AllDocumentsByProjectID";
import TeamsAnalytics from "./TeamsAnalytics";
import RfiLayout from "../../layout/RfiLayout";
import SubmittalLayout from "../../layout/SubmittalLayout";
import MilestoneLayout from "../../layout/MilestoneLayout";
import NotesLayout from "../../layout/NotesLayout";
import ProjectNotesLayout from "../../layout/ProjectNotesLayout";
import ProjectUpcomingMilestones from "./ProjectUpcomingMilestones";
import GetSubmittalByID from "../submittals/GetSubmittalByID";
import GetMilestoneByID from "./mileStone/GetMilestoneByID";
import ProjectProgress from "./progressReports/ProjectProgress";
import CoordinationDrawings from "./coordinationDrawings/CoordinationDrawings";


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
  const [allDocuments, setAllDocuments] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [] = useState<"list" | "add">("list");
  const [] = useState<"list" | "add">("list");
  const [editModel, setEditModel] = useState<ProjectData | null>(null);
  const [changeOrderView, setChangeOrderView] = useState<
    "list" | "add" | "table"
  >("list");
  const [selectedCoId, setSelectedCoId] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<any[]>([]); // Tasks for stats
  const [selectedOtherBundle, setSelectedOtherBundle] = useState<{
    key: string;
    tasks: any[];
  } | null>(null);
  const [selectedSubmittalToView, setSelectedSubmittalToView] = useState<
    string | null
  >(null);
  const [selectedMilestoneToView, setSelectedMilestoneToView] = useState<
    any | null
  >(null);
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

  // Fetch milestones if not available or when project is refreshed
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

  useEffect(() => {
    if (!milestonesByProject[id]) {
      fetchMileStone();
    }
  }, [id, milestonesByProject, dispatch]);

  const milestoneData = useMemo(() => {
    return milestonesByProject[id] || [];
  }, [milestonesByProject, id]);

  const changeOrderData = useMemo(() => {
    return project?.changeOrders || [];
  }, [project]);
  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Service.GetProjectById(id);
      const projData = response?.data || null;
      setProject(projData);
      fetchMileStone(); // Keep milestones in sync
    } catch (err) {
      setError("Failed to load project details");
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittalsForProject = async () => {
    if (!id || !project) return;
    try {
      const res = await Service.GetSubmittalByProjectId(id);
      const allSubmittals = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      setProject((prev) =>
        prev ? { ...prev, submittals: allSubmittals } : null,
      );
    } catch (error) {
      console.error("Error fetching project submittals:", error);
    }
  };

  useEffect(() => {
    if (id && project) {
      fetchSubmittalsForProject();
    }
  }, [id, !!project]);

  const fetchRfiForProject = async () => {
    if (!id || !project) return;
    try {
      const rolesForReceived = [
        "client",
        "connection_designer_engineer",
        "connection_designer_admin",
      ];

      let allRfi: any[] = [];
      if (rolesForReceived.includes(userRole)) {
        // Fetch both received and sent RFIs for these roles
        const [receivedRes, sentRes] = await Promise.all([
          Service.GetReceivedRFIByProjectId(id),
          Service.GetRFISentByProId(id),
        ]);

        const received = Array.isArray(receivedRes?.data)
          ? receivedRes.data
          : Array.isArray(receivedRes)
            ? receivedRes
            : [];
        const sent = Array.isArray(sentRes?.data)
          ? sentRes.data
          : Array.isArray(sentRes)
            ? sentRes
            : [];

        // Combine and remove duplicates based on RFI ID
        const combined = [...received, ...sent];
        const uniqueRfi = Array.from(
          new Map(combined.map((item) => [item.id, item])).values(),
        );
        allRfi = uniqueRfi;
      } else {
        const res = await Service.GetRFIByProjectId(id);
        allRfi = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
      }

      setProject((prev) => (prev ? { ...prev, rfi: allRfi } : null));
    } catch (error) {
      console.error("Error fetching project RFIs:", error);
    }
  };

  useEffect(() => {
    if (id && project) {
      fetchRfiForProject();
    }
  }, [id, !!project]);

  const fetchChangeOrderForProject = async () => {
    if (!id || !project) return;
    try {
      const res = await Service.GetChangeOrder(id);
      const allCO = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      setProject((prev) => (prev ? { ...prev, changeOrders: allCO } : null));
    } catch (error) {
      console.error("Error fetching project Change Orders:", error);
    }
  };

  useEffect(() => {
    if (id && project) {
      fetchChangeOrderForProject();
    }
  }, [id, !!project]);

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

  // Group "others" wbsType tasks by their projectBundle.bundleKey
  const otherTasksByBundle = useMemo(() => {
    const projectTasks = allTasks.filter(
      (task: any) =>
        task.project_id === id &&
        String(task.wbsType || "").toLowerCase() === "others",
    );

    const grouped: Record<string, any[]> = {};
    projectTasks.forEach((task: any) => {
      const key =
        task.projectBundle?.bundleKey ||
        task.projectBundle?.bundle?.bundleKey ||
        task.bundleKey ||
        "Uncategorised";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });
    return grouped;
  }, [allTasks, id]);

  // Fetch analytics data

  // Fetch analytics data
  // useEffect(() => {
  //   const fetchAnalytics = async () => {
  //     // Don't fetch analytics for clients
  //     if (userRole === "client" || userRole === "client_admin") return;

  //     try {
  //       const data = {
  //         projectId: id,
  //         managerId: sessionStorage.getItem("userId"),
  //       };
  //       const response = await Service.GetAnalyticsScore(data);
  //       console.log("Analytics Score:", response);
  //       const analyticsData = response?.data || response || [];
  //       setAnalyticsData(analyticsData);
  //     } catch (error) {
  //       console.error("Error fetching analytics:", error);
  //     }
  //   };
  //   fetchAnalytics();
  // }, [id, userRole]);
  // console.log(analyticsData);

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

  const milestonesWithoutSubmittals = useMemo(() => {
    const submittalMsIds = new Set(
      submittalData.map((s: any) =>
        String(s.mileStoneId || s.milestoneId || ""),
      ),
    );
    return milestoneData.filter(
      (ms: any) =>
        !submittalMsIds.has(String(ms.id)) &&
        ms.status !== "APPROVED" &&
        ms.status !== "COMPLETED",
    );
  }, [milestoneData, submittalData]);

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
      setAllDocuments(response?.data || null);
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
      fetchChangeOrderForProject(); // Refresh CO list
    }
  };

  const isClient = userRole === "client" || userRole === "client_admin";
  const isConnectionDesigner =
    userRole === "connection_designer_engineer" ||
    userRole === "connection_designer_admin";

  const clientTabs = [
    { key: "overview", label: "Overview", icon: ClipboardList },
    // { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "files", label: "Files", icon: FileText },
    // { key: "milestones", label: "Milestones", icon: FileText },
    { key: "rfi", label: "RFI", icon: FolderOpenDot },
    { key: "submittals", label: "Submittals", icon: FolderOpenDot },
    { key: "changeOrder", label: "Change Order", icon: FolderOpenDot },
    { key: "coordinationDrawings", label: "Coordination Drawings", icon: Compass },
    { key: "projectNotes", label: "Project Notes", icon: MessageSquare },
  ];


  const defaultDesktopTabs = [
    { key: "overview", label: "Overview", icon: ClipboardList },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "teamsAnalytics", label: "Teams Analytics", icon: Activity },
    { key: "files", label: "Files", icon: FileText },
    { key: "wbs", label: "WBS", icon: FileText },
    { key: "milestones", label: "Milestones", icon: FileText },
    { key: "notes", label: "Notes", icon: FolderOpenDot },
    { key: "projectNotes", label: "Project Notes", icon: MessageSquare },
    { key: "rfi", label: "RFI", icon: FolderOpenDot },
    { key: "submittals", label: "Submittals", icon: FolderOpenDot },
    { key: "changeOrder", label: "Change Order", icon: FolderOpenDot },
    { key: "coordinationDrawings", label: "Coordination Drawings", icon: Compass },
  ];

  const defaultMobileTabs = [
    { key: "details", label: "Details" },
    { key: "analytics", label: "Analytics" },
    { key: "teamsAnalytics", label: "Teams Analytics" },
    { key: "files", label: "Files" },
    { key: "wbs", label: "WBS" },
    { key: "milestones", label: "Milestones" },
    { key: "team", label: "Team" },
    { key: "timeline", label: "Timeline" },
    { key: "notes", label: "Notes" },
    { key: "projectNotes", label: "Project Notes" },
    { key: "rfi", label: "RFI" },
    { key: "submittals", label: "Submittals" },
    { key: "changeOrder", label: "Change Order" },
    { key: "coordinationDrawings", label: "Coordination Drawings" },
    { key: "otherTasks", label: "Other Tasks" },
  ];


  const isAuthorizedForNotes = [
    "admin",
    "project_manager",
    "deputy_manager",
    "connection_designer_engineer",
    "connection_designer_admin",
    "client",
    "client_admin",
  ].includes(userRole || "");

  const filterTabsByRole = (tabs: any[]) => {
    return tabs.filter((tab) => {
      if (tab.key === "projectNotes") {
        return isAuthorizedForNotes;
      }
      if (isConnectionDesigner) {
        const hiddenTabs = [
          "analytics",
          "teamsAnalytics",
          "wbs",
          "changeOrder",
          "notes",
        ];
        if (hiddenTabs.includes(tab.key)) return false;
      }
      return true;
    });
  };

  const tabsToShow = useMemo(() => {
    return filterTabsByRole(isClient ? clientTabs : defaultDesktopTabs);
  }, [isClient, userRole]);

  const mobileTabsToShow = useMemo(() => {
    return filterTabsByRole(isClient ? clientTabs : defaultMobileTabs);
  }, [isClient, userRole]);

  if (loading)
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-md text-white">
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
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-transparent dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 mb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">
              {project.name}
            </h2>

          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {project.projectNumber && (
              <div className="inline-block px-4 py-1.5 bg-green-50 border-2 border-[#6bbd45] rounded-lg">
                <span className="text-black font-bold text-sm tracking-tight">
                  Project No: {project.projectNumber}
                </span>
              </div>
            )}
            <span className="px-4 py-1.5 rounded-lg text-sm font-bold bg-gray-50 text-black border-2 border-black/5 uppercase tracking-tight">
              {project.stage}
            </span>
            <span className="px-4 py-1.5 rounded-lg text-sm font-bold bg-gray-50 text-black border-2 border-black/5 uppercase tracking-tight">
              {project.status}
            </span>
            {userRole === "admin" && (
              <button
                onClick={() => handleEditModel(project)}
                className="px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
              >
                Edit
              </button>
            )}
            {close && (
              <button
                onClick={close}
                className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Main Body (Flex Row Layout) */}
        <div className="flex flex-1 flex-col md:flex-row min-h-0 overflow-hidden gap-4">
          {/* Desktop Left Sidebar */}
          <aside className="hidden md:flex md:w-64 border-r border-gray-100 dark:border-slate-800 flex-col overflow-y-auto py-2 pr-4 space-y-1 shrink-0">
            <nav className="flex flex-col gap-1.5 w-full">
              {tabsToShow.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg transition-all duration-200 relative w-full text-left
                      ${isActive
                        ? "bg-gray-50 dark:bg-slate-800 text-black dark:text-white border border-black/10 dark:border-white/10 border-l-[4px] border-l-[#6bbd45]"
                        : "text-black dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white hover:border-y hover:border-r hover:border-black/10 hover:border-l-[4px] hover:border-l-[#6bbd45] border border-transparent border-l-[4px] border-l-transparent"
                      }`}
                  >
                    <Icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? "text-[#6bbd45]" : "text-gray-500 dark:text-gray-400"}`} />
                    <span className="truncate tracking-wide">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Dropdown Selector */}
          <div className="block md:hidden shrink-0">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-[#6bbd45] text-white focus:outline-none focus:ring-2 focus:ring-green-500 font-bold uppercase tracking-tight text-sm"
            >
              {mobileTabsToShow.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-2 md:p-4 overflow-y-auto min-h-0 custom-scrollbar">
          {/* ✅ Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {!isClient &&
                !isConnectionDesigner &&
                userRole !== "connection_designer_admin" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                      icon={<Clock className="text-blue-600" />}
                      label="Estimated Hours"
                      value={`${Number(project.estimatedHours || 0).toFixed(2).replace(/\.00$/, '')}h`}
                      color="bg-blue-50"
                      layout="horizontal"
                    />
                    <StatCard
                      icon={<Clock className="text-blue-600" />}
                      label="Estimated Hours for Approval"
                      value={`${(Number(project.estimatedHours || 0) * 0.8).toFixed(2).replace(/\.00$/, '')}h`}
                      color="bg-blue-50"
                      layout="horizontal"
                    />
                    <StatCard
                      icon={<Clock className="text-blue-600" />}
                      label="Estimated Hours for Fabrication"
                      value={`${(Number(project.estimatedHours || 0) * 0.2).toFixed(2).replace(/\.00$/, '')}h`}
                      color="bg-blue-50"
                      layout="horizontal"
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
                      layout="horizontal"
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
                      layout="horizontal"
                    />
                  </div>
                )}

              {/* ✅ New Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 text-black text-sm">
                <StatCard
                  icon={<MessageSquare className="text-green-600" />}
                  label="RFIs"
                  value={project.rfi?.length || 0}
                  color="bg-green-50"
                  layout="horizontal"
                  onClick={() => setActiveTab("rfi")}
                />
                <StatCard
                  icon={<FileText className="text-green-600" />}
                  label="Submittals"
                  value={project.submittals?.length || 0}
                  color="bg-green-50"
                  layout="horizontal"
                  onClick={() => setActiveTab("submittals")}
                />
                {!isConnectionDesigner && (
                  <StatCard
                    icon={<ClipboardList className="text-green-600" />}
                    label="Change Orders"
                    value={project.changeOrders?.length || 0}
                    color="bg-green-50"
                    layout="horizontal"
                    onClick={() => setActiveTab("changeOrder")}
                  />
                )}
                <StatCard
                  icon={<CalendarCheck className="text-green-600" />}
                  label="Milestones"
                  value={milestoneData.length}
                  color="bg-green-50"
                  layout="horizontal"
                  onClick={() => {
                    if (isClient) {
                      setActiveTab("overview");
                      setTimeout(() => {
                        const el = document.getElementById("project-progress");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    } else {
                      setActiveTab("milestones");
                    }
                  }}
                />
                <StatCard
                  icon={<FolderOpenDot className="text-green-600" />}
                  label="Documents / Files"
                  value={
                    (allDocuments?.designDrawings?.length || 0) +
                    (allDocuments?.project?.files?.length || 0)
                  }
                  color="bg-green-50"
                  layout="horizontal"
                  onClick={() => setActiveTab("files")}
                />
              </div>

              {/* ✅ Details (Moved to Overview) */}
              <div className="bg-slate-50/50 p-6 sm:p-8 rounded-[32px] border border-black/5 animate-in fade-in slide-in-from-top-4 duration-700 space-y-8">
                {/* Main Project Info Grid */}
                <div className="grid max-sm:grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-3 text-sm">
                  <div className="space-y-3.5">
                    {!isConnectionDesigner && (
                      <InfoRow
                        label="Department"
                        value={project.department?.name || "—"}
                      />
                    )}
                    <InfoRow
                      label="Team / Tools"
                      value={project.team?.name || "—"}
                    />
                    <InfoRow
                      label="WBT Manager"
                      value={
                        project.manager
                          ? `${project.manager.firstName} ${project.manager.lastName} `
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Project Manager"
                      value={
                        project.clientProjectManagers && project.clientProjectManagers.length > 0
                          ? project.clientProjectManagers.map((pm: any) => `${pm.firstName.trim()} ${pm.lastName.trim()}`).join(", ")
                          : "—"
                      }
                    />
                  </div>
                  <div className="space-y-3.5">
                    {userRole !== "client" &&
                      userRole !== "client_admin" &&
                      !isConnectionDesigner && (
                        <InfoRow
                          label="Fabricator"
                          value={project.fabricator?.fabName || "—"}
                        />
                      )}
                    <InfoRow label="Stage" value={project.stage || "—"} />
                    <InfoRow
                      label="Start Date"
                      value={formatDate(project.startDate)}
                    />
                  </div>
                </div>

                {/* Scopes - Full Width Sections */}
                <div className="space-y-4">
                  {/* Connection Design Scope */}
                  <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm transition-all hover:shadow-md">
                    <h4 className="text-sm font-bold text-black mb-5 flex items-center gap-2 uppercase tracking-tight">
                      <Settings className="w-5 h-5 text-green-600" /> Connection Design Scope
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <ScopeTag
                        label="Main Design"
                        active={project.connectionDesign}
                      />
                      <ScopeTag
                        label="Misc Design"
                        active={project.miscDesign}
                      />
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

                  {/* Detailing Scope */}
                  <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm transition-all hover:shadow-md">
                    <h4 className="text-sm font-bold text-black mb-5 flex items-center gap-2 uppercase tracking-tight">
                      <Settings2 className="w-5 h-5 text-green-600" /> Detailing Scope
                    </h4>
                    <div className="flex flex-wrap gap-3">
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
                </div>

                {/* Project Description */}
                <div className="pt-4 border-t border-black/5">
                  <h4 className="font-bold text-black mb-4 text-base flex items-center gap-2 uppercase tracking-tight">
                    <FolderOpenDot className="w-5 h-5 text-green-600" />
                    Project Description
                  </h4>
                  <div
                    className="text-gray-700 bg-white p-6 rounded-2xl border border-black/5 shadow-sm prose prose-sm max-w-none leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        project.description || "No description available.",
                    }}
                  />
                </div>
              </div>

              {/* Project Progress Reports */}
              <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm">
                <ProjectProgress projectId={id} />
              </div>

              <div id="project-progress">
                <ProjectMilestoneMetrics projectId={id} />
              </div>

              <ProjectUpcomingMilestones
                milestones={milestonesWithoutSubmittals}
                onViewAll={() => {
                  if (isClient) {
                    const el = document.getElementById("project-progress");
                    el?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    setActiveTab("milestones");
                  }
                }}
                onMilestoneClick={(ms) => setSelectedMilestoneToView(ms)}
              />

              {/* Other Tasks Hours Breakdown (Overview only) */}
              {!isClient && Object.keys(otherTasksByBundle).length > 0 && (
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Section header */}
                  <div className="px-5 py-3 bg-slate-50 border-b border-gray-200 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-slate-500" />
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-700">
                      Other Tasks &mdash; Logged Time
                    </h4>
                    <span className="ml-auto text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                      {Object.values(otherTasksByBundle).reduce(
                        (s, t) => s + t.length,
                        0,
                      )}{" "}
                      tasks
                    </span>
                  </div>

                  {/* Grouped by bundleKey */}
                  <div className="divide-y divide-gray-100">
                    {Object.entries(otherTasksByBundle).map(
                      ([bundleKey, tasks]) => {
                        const bundleTotalSeconds = tasks.reduce(
                          (sum: number, t: any) =>
                            sum +
                            (t.workingHourTask || []).reduce(
                              (s: number, w: any) =>
                                s + (w.duration_seconds || 0),
                              0,
                            ),
                          0,
                        );

                        const statusMap: Record<string, string> = {
                          completed:
                            "bg-green-100 text-green-700 border-green-200",
                          complete:
                            "bg-green-100 text-green-700 border-green-200",
                          validate_complete:
                            "bg-green-100 text-green-700 border-green-200",
                          assigned: "bg-blue-100 text-blue-700 border-blue-200",
                          in_progress:
                            "bg-yellow-100 text-yellow-700 border-yellow-200",
                          rework:
                            "bg-orange-100 text-orange-700 border-orange-200",
                        };

                        return (
                          <div key={bundleKey}>
                            {/* Bundle key header */}
                            <div className="flex items-center gap-3 px-5 py-2 bg-slate-50/70 border-b border-gray-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#6bbd45] shrink-0" />
                              <span className="flex-1 text-xs font-black uppercase tracking-tight text-slate-600">
                                {bundleKey}
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                {tasks.length} task
                                {tasks.length !== 1 ? "s" : ""}
                              </span>
                              <span className="text-xs font-black text-[#3a8a1a] min-w-[52px] text-right">
                                {formatSeconds(bundleTotalSeconds)}
                              </span>
                            </div>

                            {/* Tasks */}
                            <div className="divide-y divide-gray-50">
                              {tasks.map((task: any, idx: number) => {
                                const assignee = task.user
                                  ? `${task.user.firstName || ""} ${task.user.lastName || ""}`.trim()
                                  : task.assignedTo
                                    ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim()
                                    : "Unassigned";

                                const initials = assignee
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((n: string) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase();

                                const taskSeconds = (
                                  task.workingHourTask || []
                                ).reduce(
                                  (s: number, w: any) =>
                                    s + (w.duration_seconds || 0),
                                  0,
                                );

                                const sc =
                                  statusMap[
                                  (task.status || "").toLowerCase()
                                  ] ||
                                  "bg-gray-100 text-gray-500 border-gray-200";

                                return (
                                  <div
                                    key={task.id || idx}
                                    className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 transition-colors"
                                  >
                                    {/* Avatar */}
                                    <div className="w-7 h-7 rounded-full from-slate-300 to-slate-400 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                      {initials || "?"}
                                    </div>

                                    {/* Assignee + task name */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-gray-800 truncate leading-tight">
                                        {assignee}
                                      </p>
                                      <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                                        {task.name ||
                                          task.title ||
                                          `Task #${idx + 1}`}
                                      </p>
                                    </div>

                                    {/* Status */}
                                    <span
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide shrink-0 ${sc}`}
                                    >
                                      {task.status || "—"}
                                    </span>

                                    {/* Logged time from duration_seconds */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs font-black text-gray-700 min-w-[42px] text-right">
                                        {taskSeconds > 0
                                          ? formatSeconds(taskSeconds)
                                          : "—"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
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
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">
                        Approval Date
                      </span>
                      <span className="text-slate-800 ">
                        {formatDate(project.approvalDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">
                        Expected Project Completion Date
                      </span>
                      <span className="text-slate-800 ">
                        {formatDate(project.endDate)}
                      </span>
                    </div>
                  </div>
                </div> */}

                {/*<div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                  <div className="mb-4 p-4 bg-white rounded-full shadow-inner border border-slate-200">
                    <Activity size={32} className="text-green-500" />
                  </div>
                  <h4 className=" text-slate-800 mb-1">Project Status</h4>
                  <div className="mt-2 px-6 py-2 rounded-lg text-md border border-gray-200 bg-gray-100 text-black uppercase tracking-tight">
                    {project.status}
                  </div>
                  <p className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-tighter">
                    Current Development Phase: {project.stage}
                  </p>
                </div>*/}


              </div>

            </div>
          )}

          {/* ✅ Analytics Dashboard */}
          {activeTab === "analytics" && !isConnectionDesigner && (
            <ProjectAnalyticsDashboard projectId={id} />
          )}

          {/* ✅ Teams Analytics */}
          {activeTab === "teamsAnalytics" && !isConnectionDesigner && (
            <TeamsAnalytics
              projectId={id}
              managerId={project.managerID}
              tasks={allTasks}
            />
          )}

          {/* ✅ Files */}
          {activeTab === "files" && (
            <div className="space-y-4">
              <AllDocumentsByProjectID projectId={id} />
              <AllDocument projectId={id} />
            </div>
          )}
          {activeTab === "milestones" && (
            <MilestoneLayout project={project} onUpdate={fetchProject} />
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
          {activeTab === "notes" && <NotesLayout projectId={id} />}
          {/* ✅ Project Notes (Team Meeting Notes) */}
          {activeTab === "projectNotes" && (
            <ProjectNotesLayout projectId={id} project={project} />
          )}

          {activeTab === "wbs" && !isConnectionDesigner && (
            <div className="text-gray-700 italic text-center">
              {/* <FolderOpenDot className="w-6 h-6 mx-auto mb-2 text-gray-400" /> */}
              <WBS id={id} stage={project.stage || ""} />
            </div>
          )}

          {/* ✅ Other Tasks – grouped by projectBundle.bundleKey */}
          {activeTab === "otherTasks" && (
            <OtherTasksPanel otherTasksByBundle={otherTasksByBundle} />
          )}
          {activeTab === "rfi" && (
            <div className="space-y-4">
              <RfiLayout
                project={project}
                rfiData={rfiData}
                onSuccess={fetchProject}
              />
            </div>
          )}

          {activeTab === "submittals" && (
            <div className="space-y-4">
              <SubmittalLayout
                project={project}
                submittalData={submittalData}
                onSuccess={fetchProject}
              />
            </div>
          )}


          {activeTab === "coordinationDrawings" && (
            <div className="space-y-4 h-full">
              <CoordinationDrawings projectId={id} />
            </div>
          )}

          {activeTab === "changeOrder" && !isConnectionDesigner && (

            <div className="space-y-6">
              {/* Pill-style Sub-tabs for Change Order */}
              <div className="flex p-1.5 bg-gray-100/30 rounded-2xl w-fit mb-6 border border-gray-200/50 gap-2">
                <button
                  onClick={() => setChangeOrderView("list")}
                  className={`
                    px-8 py-3 rounded-lg border-2 font-bold text-sm uppercase tracking-tight transition-all duration-300 active:scale-95
                    ${changeOrderView === "list"
                      ? "bg-green-50 text-black border-green-700/80 shadow-sm"
                      : "bg-gray-100 text-black border-black/10 hover:border-black/20"
                    }
                  `}
                >
                  All Change Orders
                </button>
                {!isClient && (
                  <button
                    onClick={() => setChangeOrderView("add")}
                    className={`
                      px-8 py-3 rounded-lg border-2 font-bold text-sm uppercase tracking-tight transition-all duration-300 active:scale-95
                      ${changeOrderView === "add"
                        ? "bg-green-50 text-black border-green-700/80 shadow-sm"
                        : "bg-gray-100 text-black border-black/10 hover:border-black/20"
                      }
                  `}
                  >
                    Raise Change Order
                  </button>
                )}
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
                      className="px-4 py-2 bg-gray-100 text-black border-2 border-black/10 rounded-lg hover:border-black/20 transition-all font-bold text-xs uppercase tracking-tight flex items-center gap-2"
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

      {/* ✅ Other Tasks Detail Modal */}
      {selectedOtherBundle &&
        createPortal(
          <div
            className="fixed inset-0  flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedOtherBundle(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-slate-50 rounded-t-3xl">
                <ClipboardList className="w-5 h-5 text-[#6bbd45]" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black uppercase tracking-tight text-gray-900 truncate">
                    {selectedOtherBundle.key}
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tight font-semibold">
                    {selectedOtherBundle.tasks.length} task
                    {selectedOtherBundle.tasks.length !== 1 ? "s" : ""}{" "}
                    &nbsp;·&nbsp;
                    {formatSeconds(
                      selectedOtherBundle.tasks.reduce(
                        (s: number, t: any) =>
                          s +
                          (t.workingHourTask || []).reduce(
                            (ws: number, w: any) =>
                              ws + (w.duration_seconds || 0),
                            0,
                          ),
                        0,
                      ),
                    )}{" "}
                    logged
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOtherBundle(null)}
                  className="ml-auto p-2 w-10 h-10 rounded-xl bg-gray-100 border-2 border-black/5 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all flex items-center justify-center text-gray-500"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Task List */}
              <div className="overflow-y-auto flex-1 p-4 space-y-2 custom-scrollbar">
                {selectedOtherBundle.tasks.length === 0 ? (
                  <p className="text-sm text-center text-gray-400 italic py-10">
                    No tasks found.
                  </p>
                ) : (
                  selectedOtherBundle.tasks.map((task: any, idx: number) => {
                    const assignee = task.user
                      ? `${task.user.firstName || ""} ${task.user.lastName || ""}`.trim()
                      : task.assignedTo
                        ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim()
                        : task.assignee
                          ? `${task.assignee.firstName || ""} ${task.assignee.lastName || ""}`.trim()
                          : "Unassigned";

                    const initials = assignee
                      .split(" ")
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    const statusMap: Record<string, string> = {
                      completed: "bg-green-100 text-green-700 border-green-200",
                      complete: "bg-green-100 text-green-700 border-green-200",
                      validate_complete:
                        "bg-green-100 text-green-700 border-green-200",
                      assigned: "bg-blue-100 text-blue-700 border-blue-200",
                      in_progress:
                        "bg-yellow-100 text-yellow-700 border-yellow-200",
                      rework: "bg-orange-100 text-orange-700 border-orange-200",
                    };
                    const sc =
                      statusMap[(task.status || "").toLowerCase()] ||
                      "bg-gray-100 text-gray-500 border-gray-200";

                    return (
                      <div
                        key={task.id || idx}
                        className="flex items-center gap-4 bg-slate-50 hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm rounded-2xl px-4 py-3 transition-all"
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full from-slate-300 to-slate-400 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm">
                          {initials || "?"}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {assignee}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {task.name || task.title || `Task #${idx + 1}`}
                          </p>
                        </div>

                        {/* Status */}
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider shrink-0 ${sc}`}
                        >
                          {task.status || "—"}
                        </span>

                        {/* Hours – computed from workingHourTask.duration_seconds */}
                        <div className="flex flex-col items-end shrink-0 gap-0.5">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-black">
                              {formatSeconds(
                                (task.workingHourTask || []).reduce(
                                  (s: number, w: any) =>
                                    s + (w.duration_seconds || 0),
                                  0,
                                ),
                              )}
                            </span>
                          </div>
                          <span className="text-[9px] text-gray-400 uppercase tracking-tight">
                            logged
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
      {selectedSubmittalToView &&
        createPortal(
          <GetSubmittalByID
            id={selectedSubmittalToView}
            onClose={() => setSelectedSubmittalToView(null)}
          />,
          document.body,
        )}
      {selectedMilestoneToView &&
        createPortal(
          <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-5xl my-auto animate-in fade-in zoom-in duration-200">
              <GetMilestoneByID
                row={selectedMilestoneToView}
                close={() => {
                  setSelectedMilestoneToView(null);
                  fetchMileStone();
                }}
              />
            </div>
          </div>,
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
    className={`px-3 py-1.5 text-sm font-bold rounded-lg border-2 uppercase tracking-tight transition-all ${active
      ? "bg-green-50 text-black border-green-700/80 shadow-sm"
      : "bg-gray-100 text-black border-black/10 hover:border-black/20"
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
  onClick,
  layout = "vertical",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  description?: string;
  isAlert?: boolean;
  onClick?: () => void;
  layout?: "vertical" | "horizontal";
}) => {
  if (layout === "horizontal") {
    return (
      <div
        onClick={onClick}
        className={`${color} p-5 rounded-2xl border border-white/50 shadow-sm flex items-center justify-between transition-all hover:scale-[1.02] ${isAlert ? "ring-2 ring-red-500 ring-offset-2 animate-pulse" : ""
          } ${onClick ? "cursor-pointer" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
            {icon}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-gray-700 uppercase tracking-tight leading-tight">
              {label}
            </p>
            {description && (
              <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-tighter leading-tight">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="text-right ml-4 shrink-0">
          <p
            className={`text-3xl font-black ${isAlert ? "text-red-700" : "text-black"} tracking-tight`}
          >
            {value}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${color} p-5 rounded-2xl border border-white/50 shadow-sm flex flex-col transition-all hover:scale-[1.02] ${isAlert ? "ring-2 ring-red-500 ring-offset-2 animate-pulse" : ""
        } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        <p className="text-sm font-bold text-gray-700 uppercase tracking-tight">
          {label}
        </p>
      </div>
      <p
        className={`text-3xl font-black ${isAlert ? "text-red-700" : "text-black"} tracking-tight`}
      >
        {value}
      </p>
      {description && (
        <p className="text-sm text-gray-400 mt-2 font-medium uppercase tracking-tighter">
          {description}
        </p>
      )}
    </div>
  );
};

// ✅ OtherTasksPanel – groups "others" wbsType tasks by projectBundle.bundleKey
const OtherTasksPanel = ({
  otherTasksByBundle,
}: {
  otherTasksByBundle: Record<string, any[]>;
}) => {
  const bundleKeys = Object.keys(otherTasksByBundle);
  const [selectedKey, setSelectedKey] = useState<string>(bundleKeys[0] || "");

  // Keep selectedKey in sync when bundleKeys change (e.g. first load)
  useEffect(() => {
    if (!selectedKey && bundleKeys.length > 0) {
      setSelectedKey(bundleKeys[0]);
    }
  }, [bundleKeys, selectedKey]);

  if (bundleKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
        <ClipboardList className="w-10 h-10 text-gray-300" />
        <p className="text-sm font-medium uppercase tracking-tight">
          No "Others" tasks found for this project
        </p>
      </div>
    );
  }

  const activeTasks = otherTasksByBundle[selectedKey] || [];

  const statusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "complete" || s === "validate_complete")
      return "bg-green-100 text-green-700 border-green-200";
    if (s === "assigned") return "bg-blue-100 text-blue-700 border-blue-200";
    if (s === "in_progress" || s === "inprogress")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (s === "rework")
      return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="flex h-full min-h-[400px] gap-0 rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Left sidebar – bundle key list */}
      <div className="w-64 shrink-0 bg-slate-50 border-r border-gray-200 overflow-y-auto">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
            Bundle Categories
          </p>
        </div>
        <ul className="flex flex-col gap-0.5 p-2">
          {bundleKeys.map((key) => (
            <li key={key}>
              <button
                onClick={() => setSelectedKey(key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-bold transition-all border-2 active:scale-95 ${selectedKey === key
                  ? "bg-green-50 border-green-700/80 text-black shadow-sm"
                  : "bg-white border-black/5 text-slate-600 hover:border-black/20 hover:text-black hover:shadow-sm"
                  }`}
              >
                <span className="uppercase tracking-tight leading-tight">
                  {key}
                </span>
                <span
                  className={`ml-2 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selectedKey === key
                    ? "bg-[#6bbd45]/20 text-[#3a8a1a]"
                    : "bg-slate-200 text-slate-500"
                    }`}
                >
                  {otherTasksByBundle[key].length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel – tasks for selected bundle key */}
      <div className="flex-1 overflow-y-auto bg-white p-5">
        <h3 className="text-base font-black uppercase tracking-tight text-black mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#6bbd45]" />
          {selectedKey}
          <span className="ml-auto text-xs font-semibold text-gray-400">
            {activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""}
          </span>
        </h3>

        {activeTasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-8">
            No tasks under this category.
          </p>
        ) : (
          <div className="space-y-2">
            {activeTasks.map((task: any, idx: number) => {
              const assignee = task.user
                ? `${task.user.firstName || ""} ${task.user.lastName || ""}`.trim()
                : task.assignedTo
                  ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim()
                  : "Unassigned";

              const hours = task.hours || task.duration || "—";

              return (
                <div
                  key={task.id || idx}
                  className="flex items-start justify-between gap-4 p-3 rounded-xl border border-gray-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {task.name || task.title || `Task #${idx + 1}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      👤 {assignee}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${statusColor(task.status)}`}
                    >
                      {task.status || "—"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      <Clock className="inline w-3 h-3 mr-0.5" />
                      {hours}h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetProjectById;
