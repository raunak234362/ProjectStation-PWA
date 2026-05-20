import DataTable from "../ui/table";
import React, { Suspense, useEffect, useState } from "react";
import Service from "../../api/Service";
import { Loader2 } from "lucide-react";

const GetProjectById = React.lazy(() =>
  import("./GetProjectById").then((module) => ({ default: module.default }))
);

const AllProjects = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETE" | "ONHOLD">("ALL");

  const stats = React.useMemo(() => ({
    total: projects.length,
    active: projects.filter((p: any) => p.status === "ACTIVE").length,
    completed: projects.filter((p: any) => p.status === "COMPLETE").length,
    onHold: projects.filter((p: any) => p.status === "ONHOLD").length,
  }), [projects]);

  const filteredProjects = React.useMemo(() => {
    if (statusFilter === "ALL") return projects;
    return projects.filter(p => p.status === statusFilter);
  }, [projects, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await Service.GetAllProjects();
      setProjects(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error("Error fetching all projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const stageOptions = React.useMemo(() => {
    const stages = Array.from(new Set(projects.map((p) => p.stage).filter(Boolean)));
    return stages.map((s) => ({ value: s as string, label: s as string }));
  }, [projects]);

  const pmOptions = React.useMemo(() => {
    const pms = new Map();
    projects.forEach((p) => {
      if (p.clientProjectManagers) {
        p.clientProjectManagers.forEach((m: any) => {
          const fullName = `${m.firstName || ""} ${m.lastName || ""}`.trim();
          if (fullName) {
            pms.set(fullName, fullName);
          }
        });
      }
    });
    return Array.from(pms.values()).map((name) => ({ value: name, label: name }));
  }, [projects]);

  const handleRowClick = (row: any) => {
    const projectUniqueId = row.id || row._id || "";
    setSelectedProjectId(projectUniqueId);
  };

  const columns: any[] = [
    {
      accessorKey: "name",
      id: "Project",
      header: () => <span className="pl-6">Project Name</span>,
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-4 pl-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <span className="font-black text-black group-hover:text-green-700 transition-colors">
            {row.original.name}
          </span>
        </div>
      ),
      size: 550,
      enableColumnFilter: true,
      filterType: "text",
      filterFn: "includesString",
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }: { row: any }) => (
        <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md bg-gray-50 text-black border border-black/5">
          {row.original.stage || "—"}
        </span>
      ),
      size: 100,
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: stageOptions,
      filterFn: "equalsString",
    },
    {
      accessorKey: "clientProjectManagers",
      header: "Client PM",
      cell: ({ row }: { row: any }) => {
        const managers = row.original.clientProjectManagers;
        if (!managers || managers.length === 0) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex flex-col gap-1">
            {managers.map((m: any, idx: number) => (
              <span key={idx} className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-700">
                {m.firstName} {m.lastName}
              </span>
            ))}
          </div>
        );
      },
      size: 150,
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: pmOptions,
      filterFn: (row: any, _id: string, filterValue: string) => {
        const managers = row.original.clientProjectManagers;
        if (!managers) return false;
        if (!filterValue) return true;
        const search = filterValue.toLowerCase();
        return managers.some((m: any) => {
          const fullName = `${m.firstName || ""} ${m.lastName || ""}`.trim().toLowerCase();
          return fullName === search;
        });
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => (
        <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md bg-gray-50 text-black border border-black/5">
          {row.getValue("status") || "—"}
        </span>
      ),
      size: 100,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 italic text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-4" />
        <p className="text-black font-black uppercase tracking-widest text-xs not-italic">Accessing intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-start gap-4 mb-2 px-2">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto max-w-full">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              statusFilter === "ALL"
                ? "bg-green-200/50 text-black shadow-sm border border-green-300"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
          >
            Total
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${
              statusFilter === "ALL" ? "bg-green-300/50 text-green-800" : "bg-gray-200 text-gray-600"
            }`}>
              {stats.total}
            </span>
          </button>
          
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              statusFilter === "ACTIVE"
                ? "bg-green-200/50 text-black shadow-sm border border-green-300"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
          >
            Active
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${
              statusFilter === "ACTIVE" ? "bg-green-300/50 text-green-800" : "bg-gray-200 text-gray-600"
            }`}>
              {stats.active}
            </span>
          </button>
          
          <button
            onClick={() => setStatusFilter("COMPLETE")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              statusFilter === "COMPLETE"
                ? "bg-green-200/50 text-black shadow-sm border border-green-300"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
          >
            Completed
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${
              statusFilter === "COMPLETE" ? "bg-green-300/50 text-green-800" : "bg-gray-200 text-gray-600"
            }`}>
              {stats.completed}
            </span>
          </button>
          
          <button
            onClick={() => setStatusFilter("ONHOLD")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              statusFilter === "ONHOLD"
                ? "bg-green-200/50 text-black shadow-sm border border-green-300"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
          >
            On Hold
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${
              statusFilter === "ONHOLD" ? "bg-green-300/50 text-green-800" : "bg-gray-200 text-gray-600"
            }`}>
              {stats.onHold}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden flex flex-col border border-black/5 shadow-sm">
        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={filteredProjects}
            onRowClick={handleRowClick}
            pageSizeOptions={[25, 50, 100]}
            noBorder
          />
      </div>
      {selectedProjectId && (
        <Suspense fallback={<div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-md text-white font-black uppercase tracking-widest text-xs">Accessing intelligence...</div>}>
          <GetProjectById id={selectedProjectId} close={() => setSelectedProjectId(null)} />
        </Suspense>
      )}
      </div>
    </div>
  );
};

export default AllProjects;
