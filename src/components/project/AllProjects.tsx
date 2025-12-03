import { useEffect, useState } from "react";
import Service from "../../api/Service";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../ui/table";


const AllProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const fetchAllProjects = async () => {
    const projects = await Service.GetAllProjects();
    setProjects(projects.data);
    console.log(projects);
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

    // Handle row click (optional)
    const handleRowClick = (row: any) => {
      const projectUniqueId = (row as any).id ?? (row as any).fabId ?? "";
      console.debug("Selected project:", projectUniqueId);
    };

      // Define columns for DataTable
      const columns: ColumnDef<any>[] = [
        { accessorKey: "name", header: "Project Name" },
        { accessorKey: "stage", header: "Stage" },
      ];
    
  return (
    <div className=" bg-white p-4 rounded-2xl shadow-sm">
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={handleRowClick}
        searchPlaceholder="Search projects..."
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  )
}

export default AllProjects