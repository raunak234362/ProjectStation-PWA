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

  const handleRowClick = (row: any) => {
    const projectUniqueId = row.id || row._id || "";
    setSelectedProjectId(projectUniqueId);
  };

  const userRole = sessionStorage.getItem("userRole");
  const isClient = userRole === "CLIENT" || userRole === "CLIENT_ADMIN";

  const columns: any[] = [
    {
      accessorKey: "name",
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
      enableColumnFilter: !isClient,
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
    <div className="bg-white rounded-3xl overflow-hidden flex flex-col border border-black/5 shadow-sm">
      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={projects}
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
  );
};

export default AllProjects;
