import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Files,
  Activity,
  CheckCircle2,
  PauseCircle,
  FileText,
  ClipboardList,
  RefreshCw,
  Search,
  X as CloseIcon,
} from "lucide-react";
import Service from "../../api/Service";
import { useSelector } from "react-redux";
import GetProjectById from "../project/GetProjectById";

const COLORS = ["#6366f1", "#22c55e", "#3b82f6", "#f97316"];

interface DashboardStats {
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
  const [rfqData, setRfqData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sent, received] = await Promise.all([
          Service.RfqSent(),
          Service.RFQRecieved(),
        ]);

        const dashboardData = await Service.GetDashboardData();
        console.log(dashboardData);
        setDashboardStats(dashboardData);
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

        setRfqData([
          { name: "Sent", value: sentCount },
          { name: "Received", value: receivedCount },
        ]);
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
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen md:h-[94.6vh] p-2 rounded-xl space-y-6 bg-gray-50">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-gray-800 font-semibold mb-4">Projects Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              <div className="p-2 bg-indigo-500 rounded-lg text-white">
                <Files size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Total</span>
                <span className="text-lg font-bold text-gray-800">
                  {stats.totalProjects}
                </span>
              </div>
            </div>

            <div
              onClick={() => handleCardClick("ACTIVE")}
              className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
            >
              <div className="p-2 bg-green-500 rounded-lg text-white">
                <Activity size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">
                  Active
                </span>
                <span className="text-lg font-bold text-green-700">
                  {stats.activeProjects}
                </span>
              </div>
            </div>

            <div
              onClick={() => handleCardClick("COMPLETED")}
              className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
            >
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">
                  Completed
                </span>
                <span className="text-lg font-bold text-blue-700">
                  {stats.completedProjects}
                </span>
              </div>
            </div>

            <div
              onClick={() => handleCardClick("ON_HOLD")}
              className="flex items-center gap-3 bg-orange-50 p-3 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
            >
              <div className="p-2 bg-orange-500 rounded-lg text-white">
                <PauseCircle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">
                  On Hold
                </span>
                <span className="text-lg font-bold text-orange-700">
                  {stats.onHoldProjects}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardList className="text-teal-600" size={20} />
            Pending Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-100 transition-colors">
                <FileText size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600 mt-2">
                Pending RFI {dashboardStats?.pendingRFI || 0}
              </span>
              <span className="text-xs font-medium text-gray-600 mt-2">
                Response Pending
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
                <RefreshCw size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600 mt-2">
                Pending Submittals response{" "}
                {dashboardStats?.pendingSubmittals || 0}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600 group-hover:bg-rose-100 transition-colors">
                <Activity size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600 mt-2">
                Pending Change Orders response{" "}
                {dashboardStats?.pendingChangeOrders || 0}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600 group-hover:bg-cyan-100 transition-colors">
                <Search size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600 mt-2">
                Pending RFQ response {dashboardStats?.pendingRFQ || 0}
              </span>
              <span className="text-xs font-medium text-gray-600 mt-2">
                New RFQ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Total Number of Invoices Raised{" "}
            <span className="text-xs text-gray-500">(per month graph)</span>
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "RFQs",
                    Sent: stats.rfqSent,
                    Received: stats.rfqReceived,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Sent" fill="#00C49F" />
                <Bar dataKey="Received" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Upcoming Submittals
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rfqData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rfqData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project List Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div
                    className={`w-2 h-6 rounded-full ${
                      selectedStatus === "ACTIVE"
                        ? "bg-green-500"
                        : selectedStatus === "COMPLETED"
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    }`}
                  ></div>
                  {selectedStatus.replace("_", " ")} Projects
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {filteredProjects.length} projects
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <CloseIcon size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredProjects.length > 0 ? (
                  <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase tracking-wider">
                        <th className="px-4 py-2 font-semibold">
                          Project Name
                        </th>
                        <th className="px-4 py-2 font-semibold">Stage</th>
                        <th className="px-4 py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project, index) => (
                        <tr
                          key={index}
                          className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl group cursor-pointer"
                          onClick={() => setSelectedProject(project)}
                        >
                          <td className="px-4 py-4 rounded-l-xl font-medium text-gray-800">
                            {project.name}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {project.stage || "N/A"}
                          </td>
                          <td className="px-4 py-4 rounded-r-xl">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                project.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : project.status === "COMPLETED"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {project.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Files size={48} className="mb-4 opacity-20" />
                  <p>No projects found with this status.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg shadow-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                Project Details
              </h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <CloseIcon size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <GetProjectById id={selectedProject.id || selectedProject._id} />
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-6 py-2 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  bg,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
  </div>
);

export default WBTDashboard;
