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
        <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md bg-gray-50 text-black border border-black/5">
          {row.getValue("status")}
        </span>
      )
    },
  ];

  return (
    <div className=" bg-white p-2 md:p-3 rounded-xl border border-black/5 shadow-sm">
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={handleRowClick}
        disablePagination={true}
        pageSizeOptions={[25]}
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
