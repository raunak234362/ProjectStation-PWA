import DataTable from "../ui/table";
import React, { Suspense, useEffect, useState, useCallback } from "react";
import Service from "../../api/Service";
import { Loader2, Search, X } from "lucide-react";

const GetProjectById = React.lazy(() =>
  import("./GetProjectById").then((module) => ({ default: module.default }))
);

const AllProjects = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETE" | "ONHOLD">("ALL");

  // Pagination and query filter states
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [stage, setStage] = useState<string>("");
  const [managerName, setManagerName] = useState<string>("");
  const [fabricatorName, setFabricatorName] = useState<string>("");
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();
  const isConnectionDesigner = userRole === "connection_designer" || userRole === "connection_designer_admin";
  const isClient = userRole === "client" || userRole === "client_admin" || userRole === "client_estimator";

  // Debounce search typing so input never loses focus or unmounts
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Service.GetAllProjects(
        page,
        limit,
        debouncedSearch || undefined,
        managerName || undefined,
        fabricatorName || undefined,
        stage || undefined
      );

      if (response && response.status === "success") {
        setProjects(response.data || []);
        if (response.meta) {
          setMeta(response.meta);
        } else {
          setMeta({
            total: response.data?.length || 0,
            page,
            limit,
            totalPages: Math.ceil((response.data?.length || 0) / limit) || 1,
          });
        }
      } else if (response && Array.isArray(response.data)) {
        setProjects(response.data);
        if (response.meta) {
          setMeta(response.meta);
        } else {
          setMeta({
            total: response.data.length,
            page,
            limit,
            totalPages: Math.ceil(response.data.length / limit) || 1,
          });
        }
      } else if (Array.isArray(response)) {
        setProjects(response);
        setMeta({
          total: response.length,
          page,
          limit,
          totalPages: Math.ceil(response.length / limit) || 1,
        });
      } else {
        setProjects([]);
        setMeta(null);
      }
    } catch (error) {
      console.error("Error fetching all projects:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, stage, managerName, fabricatorName]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const stats = React.useMemo(() => ({
    total: meta?.total ?? projects.length,
    active: projects.filter((p: any) => p.status === "ACTIVE").length,
    completed: projects.filter((p: any) => p.status === "COMPLETE").length,
    onHold: projects.filter((p: any) => p.status === "ONHOLD").length,
  }), [projects, meta]);

  const filteredProjects = React.useMemo(() => {
    if (statusFilter === "ALL") return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const uniqueManagers = React.useMemo(() => {
    const managers = new Set<string>();
    projects.forEach(p => {
      if (p.clientProjectManagers && Array.isArray(p.clientProjectManagers)) {
        p.clientProjectManagers.forEach((m: any) => {
          if (m.firstName || m.lastName) {
            managers.add(`${m.firstName || ''} ${m.lastName || ''}`.trim());
          }
        });
      }
    });
    return Array.from(managers).sort();
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
          {/* <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
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
          </div> */}
          <span className="text-sm  uppercase tracking-normal text-black group-hover:text-green-700 transition-colors">
            {row.original.name}
          </span>
        </div>
      ),
      size: 550,
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }: { row: any }) => (
        <span className="px-2 py-0.5 text-sm uppercase tracking-normal rounded-md bg-gray-50 text-black border border-black/5">
          {row.original.stage || "—"}
        </span>
      ),
      size: 100,
    },
    ...(isConnectionDesigner ? [] : [{
      accessorKey: "clientProjectManagers",
      header: "Project Manager",
      cell: ({ row }: { row: any }) => {
        const managers = row.original.clientProjectManagers;
        if (!managers || managers.length === 0) return <span className="text-black">—</span>;
        return (
          <div className="flex flex-col gap-1">
            {managers.map((m: any, idx: number) => (
              <span key={idx} className="text-sm uppercase tracking-normal text-black">
                {m.firstName} {m.lastName}
              </span>
            ))}
          </div>
        );
      },
      size: 150,
    }]),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => (
        <span className="px-2 py-0.5 text-sm uppercase tracking-normal rounded-md bg-gray-50 text-black border border-black/5">
          {row.getValue("status") || "—"}
        </span>
      ),
      size: 100,
    },
  ];

  const handleResetFilters = () => {
    setSearch("");
    setStage("");
    setManagerName("");
    setFabricatorName("");
    setStatusFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col gap-4 mb-2 px-2">
        {/* Status Tabs */}
        {!isClient && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`flex items-center px-4 py-1.5 text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                statusFilter === "ALL" ? "bg-[#386641] text-white" : "bg-[#6a994e] text-white hover:bg-[#386641]"
              }`}
            >
              Total - {stats.total}
            </button>
            
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`flex items-center px-4 py-1.5 text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                statusFilter === "ACTIVE" ? "bg-[#386641] text-white" : "bg-[#6a994e] text-white hover:bg-[#386641]"
              }`}
            >
              Active - {stats.active}
            </button>
            
            <button
              onClick={() => setStatusFilter("COMPLETE")}
              className={`flex items-center px-4 py-1.5 text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                statusFilter === "COMPLETE" ? "bg-[#386641] text-white" : "bg-[#6a994e] text-white hover:bg-[#386641]"
              }`}
            >
              Completed - {stats.completed}
            </button>
            
            <button
              onClick={() => setStatusFilter("ONHOLD")}
              className={`flex items-center px-4 py-1.5 text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                statusFilter === "ONHOLD" ? "bg-[#386641] text-white" : "bg-[#6a994e] text-white hover:bg-[#386641]"
              }`}
            >
              On Hold - {stats.onHold}
            </button>
          </div>
        )}

        {/* UI Consistent Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-4 mb-2">
          {/* Search Bar */}
          <div className="relative group flex-1 max-w-sm min-w-[200px]">
            <div className="absolute -inset-1  from-green-100 to-emerald-100 rounded-xl blur-sm opacity-25 group-hover:opacity-40 transition-all duration-1000"></div>
            <div className="relative bg-white border border-gray-400 rounded-xl flex items-center shadow-sm hover:border-green-500 transition-colors h-10">
              <Search className="ml-3 w-4 h-4 text-gray-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH PROJECT..."
                className="flex-1 px-3 py-1 bg-transparent text-black placeholder-gray-600 font-bold focus:outline-none text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="p-1 px-3 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Stage Select */}
          <select
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-gray-400 px-3 py-1.5 h-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20 text-black uppercase"
          >
            <option value="">ALL STAGES</option>
            <option value="IFA">IFA</option>
            <option value="IFC">IFC</option>
            <option value="BFA">BFA</option>
            <option value="RELEASED">RELEASED</option>
          </select>

          {/* Project Manager Select */}
          <select
            value={managerName}
            onChange={(e) => {
              setManagerName(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-gray-400 px-3 py-1.5 h-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20 text-black uppercase min-w-[160px]"
          >
            <option value="">ALL MANAGERS</option>
            {uniqueManagers.map((manager, idx) => (
              <option key={idx} value={manager}>
                {manager}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="bg-white border border-gray-400 px-3 py-1.5 h-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20 text-black uppercase min-w-[140px]"
          >
            <option value="ALL">ALL STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETE">COMPLETED</option>
            <option value="ONHOLD">ON HOLD</option>
          </select>

          {/* Reset Button */}
          {(search || stage || managerName || statusFilter !== "ALL") && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-4 py-1.5 h-10 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm shrink-0"
            >
              <X size={14} strokeWidth={3} />
              RESET
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl overflow-hidden flex flex-col border border-black/5 shadow-sm relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-2" />
            <p className="text-black font-black uppercase tracking-widest text-xs">Loading..</p>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={filteredProjects}
            onRowClick={handleRowClick}
            pageSizeOptions={[10, 25, 50, 100]}
            manualPagination={true}
            pageCount={meta?.totalPages || 1}
            pageIndex={page - 1}
            onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
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
