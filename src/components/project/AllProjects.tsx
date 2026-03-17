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
      header: "Project Name",
      enableColumnFilter: !isClient,
      filterType: "text",
      filterFn: "includesString",
    },
    { accessorKey: "stage", header: "Stage" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => (
        <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md bg-gray-50 text-black border border-black/5">
          {row.getValue("status")}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#6bbd45]" />
      </div>
    );
  }

  return (
    <div className=" bg-white p-2 md:p-3 rounded-xl border border-black/5 shadow-sm">
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={handleRowClick}
        pageSizeOptions={[25, 50, 100]}
      />
      {selectedProjectId && (
        <Suspense fallback={<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md text-white">Loading...</div>}>
          <GetProjectById id={selectedProjectId} close={() => setSelectedProjectId(null)} />
        </Suspense>
      )}
    </div>
  );
};

export default AllProjects;
