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
      header: () => <span className="pl-8">Project Name</span>,
      cell: ({ row }: { row: any }) => (
        <span className="font-bold text-black pl-8 block">{row.original.name}</span>
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
