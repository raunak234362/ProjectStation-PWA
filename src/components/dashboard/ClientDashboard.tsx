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
const ActionListModal = lazy(() => import("./components/ActionListModal"));

const ClientDashboard = () => {
  const [loading, setLoading] = useState(true);

  // Data State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pendingSubmittals, setPendingSubmittals] = useState<any[]>([]);
  const [pendingRFQs, setPendingRFQs] = useState<any[]>([]);
  const [pendingRFIs, setPendingRFIs] = useState<any[]>([]);
  const [pendingCOs, setPendingCOs] = useState<any[]>([]);
  const [upcomingSubmittals, setUpcomingSubmittals] = useState<any[]>([]);
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittalModalOpen, setIsSubmittalModalOpen] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isRfiModalOpen, setIsRfiModalOpen] = useState(false);
  const [isCoModalOpen, setIsCoModalOpen] = useState(false);
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
        const [sent, received, allInvoices, pendingRFIsData, pendingCOsData] =
          await Promise.all([
            Service.RfqSent(),
            Service.RFQRecieved(),
            Service.SubmittalRecieved(),
            Service.InvoiceDashboardData(),
            Service.pendingRFIs(),
            Service.PendingCo(),
          ]);

        setInvoices(
          Array.isArray(allInvoices) ? allInvoices : allInvoices?.data || [],
        );
        const rfqs = received?.data || received || [];
        const filteredRfqs = rfqs.filter(
          (rfq: any) => !rfq.responses || rfq.responses.length === 0,
        );
        setPendingRFQs(filteredRfqs);
        setPendingRFIs(pendingRFIsData?.data || pendingRFIsData || []);
        setPendingCOs(pendingCOsData?.data || pendingCOsData || []);

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

  const fetchDashboardData = async () => {
    try {
      const response = await Service.DashboardData();
      setDashboardStats(response?.data || response || null);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const fetchUpcomingSubmittals = async () => {
    try {
      const response = await Service.ClientAdminPendingSubmittals();
      console.log(response);

      setUpcomingSubmittals(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch submittals", error);
    }
  };

  const fetchPendingSubmittals = async () => {
    try {
      const response = await Service.SubmittalRecieved();
      console.log(response);

      setPendingSubmittals(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch submittals", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUpcomingSubmittals();
    fetchPendingSubmittals();
  }, []);

  const handleCardClick = (status: string) => {
    const filtered = projects.filter((p: any) => p.status === status);
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
    } else if (actionType === "PENDING_CO") {
      setIsCoModalOpen(true);
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
                filter={["RFQ", "RFI", "CO", "Submittals"]}
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
                pendingSubmittals={upcomingSubmittals}
                invoices={invoices}
                initialTab="submittals"
                hideTabs={true}
                hideFabricator={true}
                onSubmittalClick={(submittal) => {
                  const project =
                    submittal.project ||
                    (submittal.projectId ? { id: submittal.projectId } : null);
                  if (project) {
                    // Add a flag to indicate we want to show analytics
                    setSelectedProject({ ...project, showAnalytics: true });
                  }
                }}
              />
            </div>
          </div>
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Invoices Received
              </h2>
            </div>
            <div className="p-2">
              <UpcomingSubmittals
                pendingSubmittals={upcomingSubmittals}
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
          type="PENDING_CO"
          data={pendingCOs}
        />
      </Suspense>
    </div>
  );
};

export default ClientDashboard;
