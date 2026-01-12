import { useEffect, useState, Suspense, lazy } from "react";
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
}

// Lazy load components
const ProjectStats = lazy(() => import("./components/ProjectStats"));
const PendingActions = lazy(() => import("./components/PendingActions"));
const InvoiceTrends = lazy(() => import("./components/InvoiceTrends"));
const UpcomingSubmittals = lazy(
  () => import("./components/UpcomingSubmittals")
);
const ProjectListModal = lazy(() => import("./components/ProjectListModal"));
const ProjectDetailsModal = lazy(
  () => import("./components/ProjectDetailsModal")
);

import DashboardSkeleton from "./components/DashboardSkeleton";

const WBTDashboard = () => {
  const employees = useSelector((state: any) => state.userInfo.staffData || []);
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo.fabricatorData || []
  );
  const projects = useSelector(
    (state: any) => state.projectInfo.projectData || []
  );
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
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
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Invoice Chart state
  const [invoices, setInvoices] = useState<any[]>([]);

  // Pending Submittals state
  const [pendingSubmittals, setPendingSubmittals] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          sent,
          received,
          pendingSubmittalsRes,
          allInvoices,
          pendingSubmittalNumber,
          pendingRFIs,
        ] = await Promise.all([
          Service.RfqSent(),
          Service.RFQRecieved(),
          Service.GetPendingSubmittal(),
          Service.GetAllInvoice(),
          Service.PendingSubmittal(),
          Service.pendingRFIs(),
        ]);
        console.log(pendingRFIs);

        setPendingSubmittals(
          Array.isArray(pendingSubmittalsRes)
            ? pendingSubmittalsRes
            : pendingSubmittalsRes?.data || []
        );
        setInvoices(
          Array.isArray(allInvoices) ? allInvoices : allInvoices?.data || []
        );

        const dashboardData = await Service.GetDashboardData();
        setDashboardStats(dashboardData.data);
        const sentCount = sent?.length || 0;
        const receivedCount = received?.length || 0;

        const totalProjects = projects.length;
        const activeProjects = projects.filter(
          (p: any) => p.status === "ACTIVE"
        ).length;
        const completedProjects = projects.filter(
          (p: any) => p.status === "COMPLETED"
        ).length;
        const onHoldProjects = projects.filter(
          (p: any) => p.status === "ON_HOLD"
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

  const handleCardClick = (status: string) => {
    const filtered = projects.filter((p: any) => p.status === status);
    setFilteredProjects(filtered);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="h-full p-2 rounded-xl space-y-6 bg-gray-50 overflow-y-auto">
      <Suspense fallback={<DashboardSkeleton />}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ProjectStats stats={stats} onCardClick={handleCardClick} />
          <PendingActions dashboardStats={dashboardStats} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvoiceTrends invoices={invoices} />
          <UpcomingSubmittals
            pendingSubmittals={pendingSubmittals}
            invoices={invoices}
          />
          
        </div>

        {/* Modals */}
        <ProjectListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          status={selectedStatus}
          projects={filteredProjects}
          onProjectSelect={(project) => setSelectedProject(project)}
        />

        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </Suspense>
    </div>
  );
};

export default WBTDashboard;
