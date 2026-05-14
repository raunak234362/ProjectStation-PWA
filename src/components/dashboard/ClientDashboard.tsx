import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import Service from "../../api/Service";
import { useSelector, useDispatch } from "react-redux";
import { incrementModalCount, decrementModalCount } from "../../store/uiSlice";
import DashboardSkeleton from "./components/DashboardSkeleton";
import type { DashboardStats } from "./WBTDashboard";
import { Loader2 } from "lucide-react";

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
import { Search, Activity } from "lucide-react";






const InvoiceSummary = lazy(() => import("./components/InvoiceSummary"));
const GetMilestoneByID = lazy(
  () => import("../project/mileStone/GetMilestoneByID"),
);

import EstimatorDashboard from "./EstimatorDashboard";

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
    isRfiModalOpen,
    isCoModalOpen,
    selectedProject,
    selectedInvoiceId,
    selectedMilestone,
    selectedRfqId,
    allRFQs,
    dispatch,


  ]);

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
        const [sent, received, allInvoices, pendingCOsData] = await Promise.all(
          [
            isClientRole ? Service.RfqSent() : Service.getAllRFQFab(),
            Service.SubmittalRecieved(),
            Service.GetPendingInvoiceByClient(),
            isClientRole ? Service.GetClientCO() : Service.ClientAdminPendingCOs(),
          ],
        );



        setInvoices(
          Array.isArray(allInvoices) ? allInvoices : allInvoices?.data || [],
        );
        setAllRFQs(Array.isArray(sent) ? sent : sent?.data || []);

        setPendingCOs(pendingCOsData?.data || pendingCOsData || []);

        const sentCount = sent?.length || 0;
        const receivedCount = received?.length || 0;

        const totalProjects = projects.length;
        const activeProjects = projects.filter(
          (p: any) => p.status === "ACTIVE",
        ).length;
        const completedProjects = projects.filter(
          (p: any) => p.status === "COMPLETED" || p.status === "COMPLETE",
        ).length;
        const onHoldProjects = projects.filter(
          (p: any) => p.status === "ONHOLD",
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
      const response = isClientRole ? await Service.RfqSent() : await Service.getAllRFQFab();
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

  const handleActionClick = (actionType: string) => {
    if (actionType === "PENDING_SUBMITTALS") {
      setIsSubmittalModalOpen(true);
    } else if (actionType === "PENDING_RFQ") {
      setIsRfqModalOpen(true);
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
        {/* RFQ Stats Cards for Client Roles */}
        {(isClientRole || isClientAdmin || isClientEstimator) && (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* All RFQs Card */}
            <div
              onClick={() => handleActionClick("ALL_RFQ")}
              className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 z-10">
                <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
                  <Search size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-black tracking-widest">
                    ALL RFQs
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                    Total Requests
                  </span>
                </div>
              </div>
              <div className="z-10 text-right">
                <span className="text-3xl md:text-4xl font-black text-black tracking-tighter">
                  {allRFQs.length}
                </span>
              </div>

              <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
            </div>

            {/* Awarded RFQs Card */}
            <div
              onClick={() => handleActionClick("AWARDED_RFQ")}
              className="p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer bg-white relative overflow-hidden border border-black border-l-[8px] border-l-[#6bbd45] shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 z-10">
                <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-[#f4f6f8] transition-colors text-black">
                  <Activity size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-black tracking-widest">
                    RFQs AWARDED
                  </span>

                </div>
              </div>
              <div className="z-10 text-right">
                <span className="text-3xl md:text-4xl font-black text-black tracking-tighter text-black">
                  {allRFQs.filter(rfq => rfq.wbtStatus === "AWARDED" || rfq.status === "AWARDED" || rfq.status === "COMPLETED").length}
                </span>
              </div>

              <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
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
          isOpen={isRfqModalOpen}
          onClose={() => setIsRfqModalOpen(false)}
          type="PENDING_RFQ"
          data={pendingRFQs}
        />

        <ActionListModal
          isOpen={isAllRfqModalOpen}
          onClose={() => setIsAllRfqModalOpen(false)}
          type="ALL_RFQ"
          data={allRFQs}
        />

        <ActionListModal
          isOpen={isAwardedRfqModalOpen}
          onClose={() => setIsAwardedRfqModalOpen(false)}
          type="AWARDED_RFQ"
          data={allRFQs.filter(rfq => rfq.wbtStatus === "AWARDED" || rfq.status === "AWARDED" || rfq.status === "COMPLETED")}
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
