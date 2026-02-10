import { useEffect, useState, Suspense, lazy } from "react";
import Service from "../../api/Service";
import { useSelector } from "react-redux";
import DashboardSkeleton from "./components/DashboardSkeleton";
import type { DashboardStats } from "./WBTDashboard";

// Lazy load components
const ProjectStats = lazy(() => import("./components/ProjectStats"));
const PendingActions = lazy(() => import("./components/PendingActions"));
const UpcomingSubmittals = lazy(
  () => import("./components/UpcomingSubmittals"),
);
const ProjectListModal = lazy(() => import("./components/ProjectListModal"));
const ProjectDetailsModal = lazy(
  () => import("./components/ProjectDetailsModal"),
);
const SubmittalListModal = lazy(
  () => import("./components/SubmittalListModal"),
);

const ClientDashboard = () => {
  const [loading, setLoading] = useState(true);
  // const userRole = sessionStorage.getItem("userRole");
  const userName = sessionStorage.getItem("firstName") || "Client";

  // Data State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pendingSubmittals, setPendingSubmittals] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittalModalOpen, setIsSubmittalModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Redux Data
  const employees = useSelector((state: any) => state.userInfo.staffData || []);
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo.fabricatorData || [],
  );
  const projects = useSelector(
    (state: any) => state.projectInfo.projectData || [],
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sent, received, upcomingSubmittalsRes, allInvoices] =
          await Promise.all([
            Service.RfqSent(),
            Service.RFQRecieved(),
            Service.GetPendingSubmittal(),
            Service.GetAllInvoice(),
          ]);

        setPendingSubmittals(
          Array.isArray(upcomingSubmittalsRes)
            ? upcomingSubmittalsRes
            : upcomingSubmittalsRes?.data || [],
        );
        setInvoices(
          Array.isArray(allInvoices) ? allInvoices : allInvoices?.data || [],
        );

        const dashboardData = await Service.GetDashboardData();
        setDashboardStats(dashboardData.data);
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
        console.error("Failed to fetch client dashboard data", error);
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

  const handleActionClick = (actionType: string) => {
    if (actionType === "PENDING_SUBMITTALS") {
      setIsSubmittalModalOpen(true);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col w-full p-4 space-y-6 pb-8 bg-gray-50/50 dark:bg-slate-900/50 min-h-full">
      <Suspense fallback={<DashboardSkeleton />}>
        {/* Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-1">
              <ProjectStats stats={stats} onCardClick={handleCardClick} />
            </div>
          </div>
          <div className="w-full">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-full">
              <PendingActions
                dashboardStats={dashboardStats}
                onActionClick={handleActionClick}
                filter={["RFQ"]}
              />
            </div>
          </div>
        </div>

        {/* Detailed Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Pending Submittals
              </h2>
            </div>
            <div className="p-2">
              <UpcomingSubmittals
                pendingSubmittals={pendingSubmittals}
                invoices={invoices}
                initialTab="submittals"
                hideTabs={true}
                hideFabricator={true}
                onSubmittalClick={(submittal) => {
                  const project =
                    submittal.project ||
                    (submittal.projectId ? { id: submittal.projectId } : null);
                  if (project) {
                    setSelectedProject(project);
                  }
                }}
              />
            </div>
          </div>
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Recent Invoices
              </h2>
            </div>
            <div className="p-2">
              <UpcomingSubmittals
                pendingSubmittals={pendingSubmittals}
                invoices={invoices}
                initialTab="invoices"
                hideTabs={true}
              />
            </div>
          </div>
        </div>

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
      </Suspense>
    </div>
  );
};

export default ClientDashboard;
