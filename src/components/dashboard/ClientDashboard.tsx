import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import Service from "../../api/Service";
import { useSelector, useDispatch } from "react-redux";
import { incrementModalCount, decrementModalCount } from "../../store/uiSlice";
import DashboardSkeleton from "./components/DashboardSkeleton";
import type { DashboardStats } from "./WBTDashboard";
import { Loader2, Activity, FileText, Clock, CheckCircle2 } from "lucide-react";

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
const GetInvoiceById = lazy(() => import("../invoices/GetInvoiceById"));
const GetRFQByID = lazy(() => import("../rfq/GetRFQByID"));






const InvoiceSummary = lazy(() => import("./components/InvoiceSummary"));
const GetMilestoneByID = lazy(
  () => import("../project/mileStone/GetMilestoneByID"),
);

import EstimatorDashboard from "./EstimatorDashboard";

const StatCard: React.FC<{
  label: string | React.ReactNode;
  value: string | number;
  icon: any;
  onClick: () => void;
}> = ({ label, value, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md"
  >
    <div className="flex items-center gap-4 z-10">
      <div className="p-1 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-black text-black uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
    <div className="z-10 text-right">
      <span className="text-2xl font-black text-black tracking-tighter">
        {value}
      </span>
    </div>
  </div>
);

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();
  const isClientRole = userRole === "client";
  const isClientAdmin = userRole === "client_admin";
  const isClientEstimator = userRole === "client_estimator";



  if (userRole === "client_estimator") {
    return <EstimatorDashboard />;
  }

  // Data State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pendingSubmittals, setPendingSubmittals] = useState<any[]>([]);
  const [pendingRFQs, setPendingRFQs] = useState<any[]>([]);
  const [allRFQs, setAllRFQs] = useState<any[]>([]);

  const [pendingRFIs, setPendingRFIs] = useState<any[]>([]);
  const [pendingCOs, setPendingCOs] = useState<any[]>([]);
  const [upcomingSubmittals, setUpcomingSubmittals] = useState<any[]>([]);
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittalModalOpen, setIsSubmittalModalOpen] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isOngoingRfqModalOpen, setIsOngoingRfqModalOpen] = useState(false);
  const [isAllRfqModalOpen, setIsAllRfqModalOpen] = useState(false);
  const [isAwardedRfqModalOpen, setIsAwardedRfqModalOpen] = useState(false);

  const [isRfiModalOpen, setIsRfiModalOpen] = useState(false);
  const [isCoModalOpen, setIsCoModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [rfqFilter, setRfqFilter] = useState<"ALL" | "MTO" | "DETAILING">("ALL");


  // Redux Data
  const employees = useSelector((state: any) => state.userInfo.staffData || []);
  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo.fabricatorData || [],
  );
  const projects = useSelector(
    (state: any) => state.projectInfo.projectData || [],
  );

  const dispatch = useDispatch();

  // Effect to handle modal open/close state in Redux
  useEffect(() => {
    const isAnyModalOpen =
      isModalOpen ||
      isSubmittalModalOpen ||
      isRfqModalOpen ||
      isOngoingRfqModalOpen ||
      isAllRfqModalOpen ||
      isAwardedRfqModalOpen ||
      isRfiModalOpen ||
      isCoModalOpen ||
      !!selectedProject ||
      !!selectedInvoiceId ||
      !!selectedMilestone ||
      !!selectedRfqId;

    if (isAnyModalOpen) {
      dispatch(incrementModalCount());
    }

    return () => {
      if (isAnyModalOpen) {
        dispatch(decrementModalCount());
      }
    };
  }, [
    isModalOpen,
    isSubmittalModalOpen,
    isRfqModalOpen,
    isOngoingRfqModalOpen,
    isAllRfqModalOpen,
    isAwardedRfqModalOpen,
    isRfiModalOpen,
    isCoModalOpen,
    selectedProject,
    selectedInvoiceId,
    selectedMilestone,
    selectedRfqId,
    dispatch,
  ]);

  const [stats, setStats] = useState({
    employees: 0,
    fabricators: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    // MTO Stats
    totalMTO: 0,
    ongoingMTO: 0,
    completedMTO: 0,
    // Detailing Stats
    totalDetailing: 0,
    awardedDetailing: 0,
    pendingDetailing: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sent, , allInvoices, pendingCOsData] = await Promise.all(
          [
            isClientEstimator ? Service.GetClientEstimatorRFQ() : (isClientAdmin ? Service.getAllRFQFab() : Service.RfqSent()),
            Service.SubmittalRecieved(),
            Service.GetPendingInvoiceByClient(),
            isClientRole ? Service.GetClientCO() : Service.ClientAdminPendingCOs(),
          ],
        );



        setInvoices(
          Array.isArray(allInvoices) ? allInvoices : allInvoices?.data || [],
        );
        const rfqData = Array.isArray(sent) ? sent : sent?.data || [];
        setAllRFQs(rfqData);

        const mtoRfqs = rfqData.filter((r: any) => r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel || r.MTOValue);
        const detailingRfqs = rfqData.filter((r: any) => r.detailingMain || r.detailingMisc || r.connectionDesign || r.customerDesign || r.miscDesign);

        const totalProjects = projects.length;
        const activeProjects = projects.filter((p: any) => p.status === "ACTIVE").length;
        const completedProjects = projects.filter((p: any) => p.status === "COMPLETED" || p.status === "COMPLETE").length;
        const onHoldProjects = projects.filter((p: any) => p.status === "ONHOLD").length;

        setPendingCOs(pendingCOsData?.data || pendingCOsData || []);

        setStats({
          employees: employees.length,
          fabricators: fabricators.length,
          totalProjects,
          activeProjects,
          completedProjects,
          onHoldProjects,
          // MTO Stats
          totalMTO: mtoRfqs.length,
          ongoingMTO: mtoRfqs.filter((r: any) => r.status !== "AWARDED" && r.wbtStatus !== "AWARDED").length,
          completedMTO: mtoRfqs.filter((r: any) => r.status === "AWARDED" || r.wbtStatus === "AWARDED").length,
          // Detailing Stats
          totalDetailing: detailingRfqs.length,
          awardedDetailing: detailingRfqs.filter((r: any) => r.status === "AWARDED" || r.wbtStatus === "AWARDED").length,
          pendingDetailing: detailingRfqs.filter((r: any) => r.status !== "AWARDED" && r.wbtStatus !== "AWARDED").length,
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
      const response = isClientRole ? await Service.GetClientDashboardData() : await Service.DashboardData();
      console.log("Dashboard client Data", response);
      setDashboardStats(response?.data || response || null);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const fetchUpcomingSubmittals = async () => {
    try {
      const response = isClientRole ? await Service.GetClientMilestone() : await Service.ClientAdminPendingMilestoneSubmittals();
      console.log(response);

      setUpcomingSubmittals(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error("Failed to fetch submittals", error);
    }
  };

  const fetchPendingSubmittals = async () => {
    try {
      const response = isClientRole ? await Service.GetClientSubmittals() : await Service.ClientAdminPendingSubmittals();
      console.log("RFI___________________+++", response);

      setPendingSubmittals(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error("Failed to fetch submittals", error);
    }
  };

  const fetchPendingRFIs = async () => {
    try {
      const response = isClientRole ? await Service.GetClientRFI() : await Service.ClientAdminPendingRFIs();
      console.log(response);

      setPendingRFIs(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error("Failed to fetch RFIs", error);
    }
  };

  const fetchPendingRFQs = async () => {
    try {
      let response;
      if (isClientEstimator) {
        response = await Service.GetClientEstimatorRFQ();
      } else if (isClientAdmin) {
        response = await Service.getAllRFQFab();
      } else {
        response = await Service.RfqSent();
      }
      const data = Array.isArray(response) ? response : response?.data || [];

      const pending = data.filter((r: any) => {
        // Original condition: Status is PENDING
        if (r.status === "PENDING") return true;

        // New condition: Has responses but at least one response has no childResponses (unanswered)
        const responses = r.responses || [];
        if (responses.length > 0) {
          const hasUnanswered = responses.some((res: any) => !res.childResponses || res.childResponses.length === 0);
          if (hasUnanswered) return true;
        }

        return false;
      });

      setPendingRFQs(pending);
    } catch (error) {
      console.error("Failed to fetch RFQs", error);
    }
  };
  console.log("response________", pendingRFQs);

  useEffect(() => {
    fetchPendingRFQs();
    fetchPendingRFIs();
    fetchDashboardData();
    fetchUpcomingSubmittals();
    fetchPendingSubmittals();
  }, []);

  const handleCardClick = (status: string) => {
    if (status === "TOTAL") {
      navigate("/dashboard/projects");
      return;
    }
    const filtered = projects.filter((p: any) => p.status === status || (status === "COMPLETE" && p.status === "COMPLETED") || (status === "COMPLETED" && p.status === "COMPLETE"));
    setFilteredProjects(filtered);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleActionClick = (actionType: string, filter: "ALL" | "MTO" | "DETAILING" = "ALL") => {
    setRfqFilter(filter);
    if (actionType === "PENDING_SUBMITTALS") {
      setIsSubmittalModalOpen(true);
    } else if (actionType === "PENDING_RFQ") {
      setIsRfqModalOpen(true);
    } else if (actionType === "ONGOING_RFQ") {
      setIsOngoingRfqModalOpen(true);
    } else if (actionType === "ALL_RFQ") {
      setIsAllRfqModalOpen(true);
    } else if (actionType === "AWARDED_RFQ") {
      setIsAwardedRfqModalOpen(true);
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
    <div className="flex flex-col w-full p-4 space-y-6 pb-8 bg-white min-h-full">
      <Suspense fallback={<DashboardSkeleton />}>
        {/* Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-green-500/20 p-1">
              <ProjectStats stats={stats} onCardClick={handleCardClick} />
            </div>
          </div>
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-green-500/20 h-full">
              <PendingActions
                dashboardStats={dashboardStats}
                onActionClick={handleActionClick}
                filter={["RFQ", "RFI", "COR", "Submittals"]}
              />
            </div>
          </div>
        </div>
        {/* RFQ Overview Sections */}
        {(isClientRole || isClientAdmin || isClientEstimator) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* MTO Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-green-500/20 p-4">
              <h2 className="text-lg font-bold text-black uppercase mb-6 flex items-center gap-2">
                <FileText size={18} className="text-[#6bbd45]" />
                MATERIAL TAKE-OFF RFQ OVERVIEW
              </h2>
              <div className="flex flex-col gap-4">
                <StatCard
                  label="TOTAL MTO"
                  value={stats.totalMTO}
                  icon={FileText}
                  onClick={() => handleActionClick("ALL_RFQ", "MTO")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard
                    label="COMPLETED"
                    value={stats.completedMTO}
                    icon={CheckCircle2}
                    onClick={() => handleActionClick("AWARDED_RFQ", "MTO")}
                  />
                  <StatCard
                    label="ONGOING"
                    value={stats.ongoingMTO}
                    icon={Clock}
                    onClick={() => handleActionClick("ONGOING_RFQ", "MTO")}
                  />
                </div>
              </div>
            </div>

            {/* Detailing Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-green-500/20 p-4">
              <h2 className="text-lg font-bold text-black uppercase mb-6 flex items-center gap-2">
                <Activity size={18} className="text-[#6bbd45]" />
                DETAILING RFQ OVERVIEW
              </h2>
              <div className="flex flex-col gap-4">
                <StatCard
                  label="TOTAL RFQs"
                  value={stats.totalDetailing}
                  icon={FileText}
                  onClick={() => handleActionClick("ALL_RFQ", "DETAILING")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard
                    label="AWARDED"
                    value={stats.awardedDetailing}
                    icon={Activity}
                    onClick={() => handleActionClick("AWARDED_RFQ", "DETAILING")}
                  />
                  <StatCard
                    label="PENDING"
                    value={stats.pendingDetailing}
                    icon={Clock}
                    onClick={() => handleActionClick("ONGOING_RFQ", "DETAILING")}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Summary Section */}
        <div className="w-full">
          <InvoiceSummary
            invoices={invoices}
            projects={projects}
            rfqs={allRFQs}
            onInvoiceClick={(id) => setSelectedInvoiceId(id)}
          />

        </div>

        {/* Detailed Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="w-full bg-white rounded-2xl shadow-sm border border-green-500/20 overflow-hidden min-h-[400px]">
            <div className="p-2">
              <UpcomingSubmittals
                pendingSubmittals={upcomingSubmittals}
                invoices={invoices}
                initialTab="submittals"
                hideTabs={true}
                hideFabricator={true}
                onSubmittalClick={(submittal) => {
                  console.log("Clicked submittal:", submittal);
                  if (submittal && (submittal.id || submittal._id)) {
                    setSelectedMilestone(submittal);
                  }
                }}
              />
            </div>
          </div>
          <div className="w-full bg-white rounded-2xl shadow-sm border border-green-500/20 overflow-hidden min-h-[400px]">
            {/* <div className="p-4 border-b border-green-500/10">
              <h2 className="text-lg text-gray-800 font-bold">
                Invoices Received
              </h2>
            </div> */}
            <div className="p-2">
              <UpcomingSubmittals
                pendingSubmittals={upcomingSubmittals}
                invoices={invoices}
                initialTab="invoices"
                hideTabs={true}
                onInvoiceClick={(invoice: any) => {
                  console.log("Clicked invoice:", invoice);
                  if (invoice?.id) {
                    setSelectedInvoiceId(invoice.id);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {selectedInvoiceId && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0">
            <GetInvoiceById
              id={selectedInvoiceId}
              onClose={() => setSelectedInvoiceId(null)}
            />
          </div>
        )}

        {/* Milestone Details Modal */}
        {selectedMilestone && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <Suspense
                fallback={
                  <div className="flex justify-center p-12 bg-white rounded-xl">
                    <Loader2 className="animate-spin text-green-600" />
                  </div>
                }
              >
                <GetMilestoneByID
                  row={selectedMilestone}
                  close={() => setSelectedMilestone(null)}
                />
              </Suspense>
            </div>
          </div>
        )}

        {/* RFQ Detail Modal */}
        {selectedRfqId && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-5xl max-h-[95vh] overflow-y-auto">
              <Suspense
                fallback={
                  <div className="flex justify-center p-12 bg-white rounded-xl">
                    <Loader2 className="animate-spin text-green-600" />
                  </div>
                }
              >
                <GetRFQByID
                  id={selectedRfqId}
                  onClose={() => setSelectedRfqId(null)}
                />
              </Suspense>
            </div>
          </div>
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
          isOpen={isOngoingRfqModalOpen}
          onClose={() => setIsOngoingRfqModalOpen(false)}
          type="ALL_RFQ"
          data={allRFQs.filter(r => r.wbtStatus !== "AWARDED" && r.status !== "AWARDED").filter((r: any) => {
            if (rfqFilter === "MTO") return r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel || r.MTOValue;
            if (rfqFilter === "DETAILING") return r.detailingMain || r.detailingMisc || r.connectionDesign || r.customerDesign || r.miscDesign;
            return true;
          })}
        />

        <ActionListModal
          isOpen={isRfqModalOpen}
          onClose={() => setIsRfqModalOpen(false)}
          type="PENDING_RFQ"
          data={pendingRFQs.filter((r: any) => {
            if (rfqFilter === "MTO") return r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel || r.MTOValue;
            if (rfqFilter === "DETAILING") return r.detailingMain || r.detailingMisc || r.connectionDesign || r.customerDesign || r.miscDesign;
            return true;
          })}
        />

        <ActionListModal
          isOpen={isAllRfqModalOpen}
          onClose={() => setIsAllRfqModalOpen(false)}
          type="ALL_RFQ"
          data={allRFQs.filter((r: any) => {
            if (rfqFilter === "MTO") return r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel || r.MTOValue;
            if (rfqFilter === "DETAILING") return r.detailingMain || r.detailingMisc || r.connectionDesign || r.customerDesign || r.miscDesign;
            return true;
          })}
        />

        <ActionListModal
          isOpen={isAwardedRfqModalOpen}
          onClose={() => setIsAwardedRfqModalOpen(false)}
          type="AWARDED_RFQ"
          data={allRFQs.filter(r => r.wbtStatus === "AWARDED" || r.status === "AWARDED" || r.status === "COMPLETED").filter((r: any) => {
            if (rfqFilter === "MTO") return r.MTOManual || r.mtoStickModelEnabled || r.MTOStickModel || r.MTOValue;
            if (rfqFilter === "DETAILING") return r.detailingMain || r.detailingMisc || r.connectionDesign || r.customerDesign || r.miscDesign;
            return true;
          })}
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

export default ClientDashboard;
