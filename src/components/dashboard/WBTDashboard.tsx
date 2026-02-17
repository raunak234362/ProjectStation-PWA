import { useEffect, useState, Suspense, lazy, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Service from "../../api/Service";
import { useSelector } from "react-redux";

export interface DashboardStats {
  activeEmployeeCount: number;
  pendingChangeOrders: number;
  pendingRFI: number;
  pendingRFQ: number;
  pendingSubmittals: number;
  totalActiveProjects: number;
  totalCompleteProject: number;
  totalOnHoldProject: number;
  totalProjects: number;
  newRFQ: number;
  newRFI: number;
  newChangeOrders: number;
}

// Lazy load components
const ProjectStats = lazy(() => import("./components/ProjectStats"));
const PendingActions = lazy(() => import("./components/PendingActions"));
const InvoiceTrends = lazy(() => import("./components/InvoiceTrends"));
const UpcomingSubmittals = lazy(
  () => import("./components/UpcomingSubmittals"),
);
const ActionListModal = lazy(() => import("./components/ActionListModal"));
const ProjectListModal = lazy(() => import("./components/ProjectListModal"));
const ProjectDetailsModal = lazy(
  () => import("./components/ProjectDetailsModal"),
);
const SubmittalListModal = lazy(
  () => import("./components/SubmittalListModal"),
);

import DashboardSkeleton from "./components/DashboardSkeleton";

const WBTDashboard = () => {
  const navigate = useNavigate();
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();
  const isClient = userRole === "client" || userRole === "client_admin";

  useEffect(() => {
    if (userRole === "sales" || userRole === "sales_manager") {
      navigate("/dashboard/sales");
    } else if (userRole === "client" || userRole === "client_admin") {
      navigate("/dashboard/client");
    } else if (userRole === "connection_designer_engineer") {
      navigate("/dashboard/designer");
    } else if (userRole === "estimation_head") {
      navigate("/dashboard/estimation");
    } else if (userRole === "HUMAN_RESOURCE") {
      navigate("/dashboard/manage-team");
    }
  }, [userRole, navigate]);

  const employees = useSelector((state: any) => state.userInfo.staffData || []);
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo.fabricatorData || [],
  );
  const projects = useSelector(
    (state: any) => state.projectInfo.projectData || [],
  );
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );

  const [stats, setStats] = useState({
    employees: 0,
    fabricators: 0,
    rfqSent: 0,
    rfqReceived: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittalModalOpen, setIsSubmittalModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Invoice Chart state
  const [invoices, setInvoices] = useState<any[]>([]);

  // Pending Submittals state
  const [pendingSubmittals, setPendingSubmittals] = useState<any[]>([]);
  const [pendingRFQs, setPendingRFQs] = useState<any[]>([]);
  const [pendingRFIs, setPendingRFIs] = useState<any[]>([]);
  const [pendingCOs, setPendingCOs] = useState<any[]>([]);

  // Tasks state for stats calculation
  const [allTasks, setAllTasks] = useState<any[]>([]);

  // Modal visibility state
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isRfiModalOpen, setIsRfiModalOpen] = useState(false);
  const [isCoModalOpen, setIsCoModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          sent,
          received,
          upcomingSubmittalsRes,
          allInvoices,
          _pendingSubmittalsRes,
          pendingRFIsData,
          pendingCOsData,
          dashboardData,
          tasksRes,
        ] = await Promise.all([
          Service.RfqSent(),
          Service.RFQRecieved(),
          isClient
            ? Service.DashboardMilestone()
            : Service.GetPendingSubmittal(),
          isClient ? Service.InvoiceDashboardData() : Service.GetAllInvoice(),
          Service.PendingSubmittal(),
          Service.pendingRFIs(),
          Service.PendingCo(),
          isClient ? Service.DashboardData() : Service.GetDashboardData(),
          Service.GetAllTask(),
        ]);
        console.log("WBT Dashboard Combined Data:", {
          sent,
          received,
          upcomingSubmittalsRes,
          allInvoices,
          dashboardData,
          pendingRFIsData,
        });

        setPendingSubmittals(
          Array.isArray(upcomingSubmittalsRes)
            ? upcomingSubmittalsRes
            : upcomingSubmittalsRes?.data || [],
        );
        setInvoices(
          Array.isArray(allInvoices) ? allInvoices : allInvoices?.data || [],
        );

        if (tasksRes?.data) {
          setAllTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        }

        setPendingRFQs(received?.data || received || []);
        setPendingRFIs(pendingRFIsData?.data || pendingRFIsData || []);
        setPendingCOs(pendingCOsData?.data || pendingCOsData || []);

        setDashboardStats(dashboardData?.data || dashboardData || null);
        const sentCount = sent?.length || 0;
        const receivedCount = received?.length || 0;

        const totalProjects = projects.length;
        const activeProjects = projects.filter(
          (p: any) => p.status === "ACTIVE",
        ).length;
        const completedProjects = projects.filter(
          (p: any) => p.status === "COMPLETED",
        ).length;
        const onHoldProjects = projects.filter(
          (p: any) => p.status === "ON_HOLD",
        ).length;

        setStats({
          employees: employees.length,
          fabricators: fabricators.length,
          rfqSent: sentCount,
          rfqReceived: receivedCount,
          totalProjects,
          activeProjects,
          completedProjects,
          onHoldProjects,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employees.length, fabricators.length, projects.length]);

  const projectsWithStats = useMemo(() => {
    return projects.map((project: any) => {
      const projectTasks = allTasks.filter(
        (task) => task.project_id === project.id,
      );

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
        ...project,
        workedSeconds,
        workedHours,
        isOverrun,
      };
    });
  }, [projects, allTasks]);

  const handleCardClick = (status: string) => {
    if (status === "TOTAL") {
      navigate("/dashboard/projects");
      return;
    }
    const filtered = projectsWithStats.filter((p: any) => p.status === status);
    setFilteredProjects(filtered);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleActionClick = (actionType: string) => {
    if (actionType === "PENDING_SUBMITTALS") {
      setIsSubmittalModalOpen(true);
    } else if (actionType === "PENDING_RFQ") {
      setIsRfqModalOpen(true);
    } else if (actionType === "PENDING_RFI") {
      setIsRfiModalOpen(true);
    } else if (actionType === "PENDING_COR") {
      setIsCoModalOpen(true);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col w-full space-y-4 pb-8 bg-transparent min-h-full">
      <Suspense fallback={<DashboardSkeleton />}>
        {/* Stats Grid - Top Section */}
        <div className="grid grid-cols-1 max-md:grid-cols-2 lg:grid-cols-2 gap-4 shrink-0">
          {/* Project Stats */}
          <div className="w-full">
            <ProjectStats stats={stats} onCardClick={handleCardClick} />
          </div>

          {/* Pending Actions */}
          <div className="w-full">
            <PendingActions
              dashboardStats={dashboardStats}
              onActionClick={handleActionClick}
            />
          </div>
        </div>

        {/* Charts & Actions Section */}
        {isClient ? (
          <>
            {/* Client View: Split Upcoming sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="w-full min-h-[400px]">
                <UpcomingSubmittals
                  pendingSubmittals={pendingSubmittals}
                  invoices={invoices}
                  initialTab="submittals"
                  hideTabs={true}
                />
              </div>
              <div className="w-full min-h-[400px]">
                <UpcomingSubmittals
                  pendingSubmittals={pendingSubmittals}
                  invoices={invoices}
                  initialTab="invoices"
                  hideTabs={true}
                />
              </div>
            </div>

            {/* Client Specific Section */}
            {/* <div className="w-full">
              <ClientProjectDirectory projects={projects} />
            </div> */}
          </>
        ) : (
          <>
            {/* Admin/PMO View: Original InvoiceTrends and Tabbed UpcomingSubmittals */}
            <div className="grid grid-cols-1 gap-4 w-full">
              <div className="w-full min-h-[500px] lg:h-[600px]">
                <InvoiceTrends invoices={invoices} />
              </div>
              <div className="w-full min-h-[500px] lg:h-[600px]">
                <UpcomingSubmittals
                  pendingSubmittals={pendingSubmittals}
                  invoices={invoices}
                />
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        <ProjectListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          status={selectedStatus}
          projects={filteredProjects}
          onProjectSelect={(project) => setSelectedProject(project)}
        />

        <SubmittalListModal
          isOpen={isSubmittalModalOpen}
          onClose={() => setIsSubmittalModalOpen(false)}
          data={pendingSubmittals}
        />

        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />

        <ActionListModal
          isOpen={isRfqModalOpen}
          onClose={() => setIsRfqModalOpen(false)}
          type="PENDING_RFQ"
          data={pendingRFQs}
        />

        <ActionListModal
          isOpen={isRfiModalOpen}
          onClose={() => setIsRfiModalOpen(false)}
          type="PENDING_RFI"
          data={pendingRFIs}
        />

        <ActionListModal
          isOpen={isCoModalOpen}
          onClose={() => setIsCoModalOpen(false)}
          type="PENDING_COR"
          data={pendingCOs}
        />
      </Suspense>
    </div>
  );
};

export default WBTDashboard;
