import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../ui/table";
import React, { Suspense } from "react";
import { useSelector } from "react-redux";
const GetProjectById = React.lazy(() =>
  import("./GetProjectById").then((module) => ({ default: module.default }))
);



const AllProjects = () => {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const projects = useSelector(
    (state: any) => state.projectInfo?.projectData || []
  );

  const handleRowClick = (row: any) => {
    const projectUniqueId = (row as any).id ?? (row as any).fabId ?? "";
    setSelectedProjectId(projectUniqueId);
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Project Name" },
    { accessorKey: "stage", header: "Stage" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="px-3 py-1 text-md md:text-lg uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200">
          {row.getValue("status")}
        </span>
      )
    },
  ];

  return (
    <div className=" bg-white p-4 rounded-2xl border border-black shadow-sm laptop-fit">
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={handleRowClick}
        disablePagination={true}
        pageSizeOptions={[5, 10, 25]}
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
