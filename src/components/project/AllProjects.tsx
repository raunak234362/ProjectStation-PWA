import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../ui/table";
import React, { Suspense } from "react";
import { useSelector } from "react-redux";
const GetProjectById = React.lazy(() =>
  import("./GetProjectById").then((module) => ({ default: module.default }))
);

const ProjectDetailComponent = ({ row }: { row: any }) => {
  const [open, setOpen] = React.useState(true);
  const projectId = row.id ?? row.fabId ?? "";

  if (!open) return null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GetProjectById id={projectId} close={() => setOpen(false)} />
    </Suspense>
  );
};

const AllProjects = () => {
  const projects = useSelector(
    (state: any) => state.projectInfo?.projectData || []
  );

  // Handle row click (optional)
  const handleRowClick = (row: any) => {
    const projectUniqueId = (row as any).id ?? (row as any).fabId ?? "";
    console.debug("Selected project:", projectUniqueId);
  };

  // Define columns for DataTable
  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Project Name" },
    { accessorKey: "stage", header: "Stage" },
    { accessorKey: "status", header: "Status" },
  ];

  return (
    <div className=" bg-white p-4 rounded-2xl shadow-sm laptop-fit">
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={handleRowClick}
        detailComponent={ProjectDetailComponent}
        disablePagination={true}
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default AllProjects;
