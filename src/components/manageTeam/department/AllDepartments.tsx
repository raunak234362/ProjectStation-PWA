/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { Department } from "../../../interface";
import DataTable from "../../ui/table";
import GetDepartmentById from "./GetDepartmentById";

const AllDepartments = () => {
  const departments = useSelector(
    (state: any) => state.userInfo.departmentData
  );
  const [departmentID, setDepartmentID] = useState<string | null>();
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // console.log(departments);

  const handleRowClick = (row:Department)=>{
    setDepartmentID(row.id)
  }
console.log(departmentID)
  const columns: ColumnDef<Department>[] = [
    { accessorKey: "name", header: "Department Name" },

    {
      accessorKey: "managerIds",
      header: "Department Manager",
      cell: ({ row }) => {
        const managers = row.original.managerIds;

        // managerIds can be string | [] | { firstName?, lastName? }
        if (Array.isArray(managers)) {
          const first = (managers as any[])[0];
          if (first && (first.firstName || first.lastName)) {
            return `${first.firstName ?? ""} ${first.lastName ?? ""}`.trim() ||
              "No Manager Assigned";
          }
          return "No Manager Assigned";
        }

        if (
          managers &&
          typeof managers === "object" &&
          (managers as any).firstName !== undefined
        ) {
          const m = managers as { firstName?: string; lastName?: string };
          return `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() ||
            "No Manager Assigned";
        }

        if (typeof managers === "string") {
          return managers || "No Manager Assigned";
        }

        return "No Manager Assigned";
      },
    },
  ];

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div>
      <DataTable
        columns={columns}
        data={departments}
        onRowClick={handleRowClick}
        detailComponent={({ row }) => <GetDepartmentById id={row.id || ""} />}
        // onDelete={handleDelete}
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default AllDepartments;
