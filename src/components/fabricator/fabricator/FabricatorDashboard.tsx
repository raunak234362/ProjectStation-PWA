import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import {
  Loader2,
  LayoutDashboard,
  Briefcase,
  FileCheck,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";
import {
  type Fabricator,
  type ProjectData,
  type RFQItem,
} from "../../../interface";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "../../../lib/utils";
import React, { Suspense, lazy } from "react";

const ProjectDetailsModal = lazy(() => import("../../dashboard/components/ProjectDetailsModal"));

interface FabricatorDashboardProps {
  fabricator: Fabricator;
}

const FabricatorDashboard = ({ fabricator }: FabricatorDashboardProps) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    pendingRFIs: 0,
    pendingSubmittals: 0,
    pendingCOs: 0,
    totalRFQs: 0,
  });
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const projectSummaries = fabricator.project || [];

        // Fetch full project details for accurate stats (RFIs, Submittals, etc.)
        const detailedProjectsResponse = await Promise.all(
          projectSummaries.map((p: any) => Service.GetProjectById(p.id))
        );
        const fabProjects = detailedProjectsResponse
          .map((res: any) => res?.data || res)
          .filter(Boolean);

        setProjects(fabProjects);

        // Fetch RFQs using the rfqIds present in the projects as requested
        const rfqIds = Array.from(new Set(fabProjects.map((p: any) => p.rfqId).filter(Boolean)));
        const detailedRfqsResponse = await Promise.all(
          rfqIds.map((id: any) => Service.FetchRFQByID(id))
        );
        const fabRfqs = detailedRfqsResponse
          .map((res: any) => res?.data || res)
          .filter(Boolean);

        setRfqs(fabRfqs);

        // Calculate Stats
        const active = fabProjects.filter(
          (p: ProjectData) => p.status === "ACTIVE",
        ).length;

        let rfiCount = 0;
        let submittalCount = 0;
        let coCount = 0;

        fabProjects.forEach((p: ProjectData) => {
          rfiCount += p.rfi?.length || 0;
          submittalCount += p.submittals?.length || 0;
          if (Array.isArray(p.changeOrders)) {
            coCount += p.changeOrders.length;
          } else if (p.changeOrders) {
            coCount += 1;
          }
        });

        setStats({
          totalProjects: fabProjects.length,
          activeProjects: active,
          pendingRFIs: rfiCount,
          pendingSubmittals: submittalCount,
          pendingCOs: coCount,
          totalRFQs: fabRfqs.length,
        });
      } catch (error) {
        console.error("Error fetching fabricator dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [fabricator]);

  const columns: ColumnDef<ProjectData>[] = [
    { accessorKey: "projectNumber", header: "Project #" },
    {
      accessorKey: "name",
      header: "Project Name",
      cell: ({ row }) => (
        <div
          className="max-w-[150px] truncate font-medium text-gray-800 dark:text-white"
          title={row.original.name}
        >
          {row.original.name}
        </div>
      ),
    },
    { accessorKey: "stage", header: "Stage" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.status === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
            }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Stats",
      cell: ({ row }) => (
        <div className="flex gap-4 text-[10px] font-black uppercase text-black">
          <span title="RFIs" className="flex items-center gap-1.5 border border-black/5 px-2 py-1 rounded bg-orange-50">
            <MessageSquare size={12} className="text-orange-600" /> {row.original.rfi?.length || 0}
          </span>
          <span title="Submittals" className="flex items-center gap-1.5 border border-black/5 px-2 py-1 rounded bg-purple-50">
            <FileCheck size={12} className="text-purple-600" /> {row.original.submittals?.length || 0}
          </span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Briefcase className="text-blue-600" size={20} />}
          label="Total Projects"
          value={stats.totalProjects}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp className="text-green-600" size={20} />}
          label="Active Projects"
          value={stats.activeProjects}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<MessageSquare className="text-orange-600" size={20} />}
          label="Pending RFIs"
          value={stats.pendingRFIs}
          bgColor="bg-orange-50"
        />
        <StatCard
          icon={<FileCheck className="text-purple-600" size={20} />}
          label="Submittals"
          value={stats.pendingSubmittals}
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<AlertCircle className="text-red-600" size={20} />}
          label="Change Orders"
          value={stats.pendingCOs}
          bgColor="bg-red-50"
        />
        <StatCard
          icon={<FileText className="text-cyan-600" size={20} />}
          label="Total RFQs"
          value={stats.totalRFQs}
          bgColor="bg-cyan-50"
        />
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-black overflow-hidden">
        <div className="p-4 border-b border-black flex items-center justify-between bg-green-50/30">
          <h3 className="text-base font-black text-black flex items-center gap-3 uppercase tracking-tight">
            <LayoutDashboard size={18} />
            Project Overview
          </h3>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={projects}
            noBorder={true}
            onRowClick={(row) => setSelectedProject(row)}
          />
        </div>
      </div>

      {selectedProject && (
        <Suspense fallback={null}>
          <ProjectDetailsModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        </Suspense>
      )}

      {/* RFQs Section (Simplified) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="bg-white rounded-2xl border border-black p-5">
          <h3 className="text-base font-black text-black mb-6 flex items-center gap-3 uppercase tracking-tight">
            <FileText size={18} className="text-cyan-600" />
            Recent RFQs
          </h3>
          <div className="space-y-4">
            {rfqs.slice(0, 5).map((rfq) => (
              <div
                key={rfq.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-black/5 hover:border-black/20 hover:bg-white transition-all group"
              >
                <div>
                  <p className="text-sm font-black text-black uppercase">{rfq.projectName}</p>
                  <p className="text-[10px] font-bold text-black/40 mt-1 uppercase tracking-wider">
                    {new Date(rfq.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[10px] font-black text-cyan-800 bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200">
                  {rfq.status || "PENDING"}
                </span>
              </div>
            ))}
            {rfqs.length === 0 && (
              <p className="text-black/40 text-center py-6 text-xs font-bold uppercase tracking-widest">
                No RFQs found
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black p-5">
          <h3 className="text-base font-black text-black mb-6 flex items-center gap-3 uppercase tracking-tight">
            <Clock size={18} className="text-orange-600" />
            Timeline Summary
          </h3>
          <div className="space-y-6">
            <TimelineItem
              label="Latest Project"
              value={projects[0]?.name || "N/A"}
              date={projects[0]?.startDate}
              icon={
                <CheckCircle2
                  className="text-green-600"
                  size={16}
                />
              }
            />
            <TimelineItem
              label="Upcoming Deadline"
              value={projects.find((p) => p.status === "ACTIVE")?.name || "N/A"}
              date={projects.find((p) => p.status === "ACTIVE")?.endDate}
              icon={
                <Clock
                  className="text-orange-600"
                  size={16}
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
}) => (
  <div
    className={`flex items-center justify-between p-4 rounded-xl border border-black/10 transition-all hover:bg-gray-50 group`}
  >
    <div className="flex items-center gap-4">
      <div className={cn("p-2.5 rounded-lg border border-black/5 shadow-sm transition-transform duration-300 group-hover:scale-110", bgColor)}>
        {icon}
      </div>
      <p className="text-[13px] font-black text-black uppercase tracking-widest leading-tight">
        {label}
      </p>
    </div>
    <p className="text-lg font-black text-black tracking-tighter">
      {value}
    </p>
  </div>
);

const TimelineItem = ({
  label,
  value,
  date,
  icon,
}: {
  label: string;
  value: string;
  date?: string;
  icon: React.ReactNode;
}) => (
  <div className="flex gap-4 items-start border-b border-black/5 pb-4 last:border-0 last:pb-0 group">
    <div className="p-2 rounded-lg bg-gray-50 border border-black/5 shrink-0 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[11px] font-black text-black/40 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-black uppercase line-clamp-1">
        {value}
      </p>
      {date && (
        <p className="text-[10px] font-bold text-black/30 mt-1 uppercase tracking-tighter">
          {new Date(date).toLocaleDateString()}
        </p>
      )}
    </div>
  </div>
);

export default FabricatorDashboard;
