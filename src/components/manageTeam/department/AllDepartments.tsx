/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { Department } from "../../../interface";
import DataTable from "../../ui/table";
import GetDepartmentById from "./GetDepartmentById";
import { X } from "lucide-react";

const AllDepartments = () => {
  const departments = useSelector(
    (state: any) => state.userInfo.departmentData
  );
  const [departmentID, setDepartmentID] = useState<string | null>();
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // console.log(departments);

  const handleRowClick = (row: Department) => {
    setDepartmentID(row.id)
  }
  console.log(departmentID)
  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 bg-white rounded-[2.5rem] border border-black/5 shadow-soft">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black/5 border-t-black"></div>
          <span className="text-black font-black uppercase tracking-widest text-xs">Loading departments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-red-50 rounded-[2.5rem] border border-red-100">
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "name",
      header: "Department Name",
      cell: ({ row }) => (
        <span className="font-black text-black uppercase tracking-wide text-base">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "managerIds",
      header: "Department Manager",
      cell: ({ row }) => {
        const managers = row.original.managerIds;
        let managerName = "No Manager Assigned";

        if (Array.isArray(managers)) {
          const first = (managers as any[])[0];
          if (first && (first.firstName || first.lastName)) {
            managerName = `${first.firstName ?? ""} ${first.lastName ?? ""}`.trim();
          }
        } else if (managers && typeof managers === "object" && (managers as any).firstName !== undefined) {
          const m = managers as { firstName?: string; lastName?: string };
          managerName = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
        } else if (typeof managers === "string") {
          managerName = managers;
        }

        return (
          <span className="text-black/60 font-bold uppercase tracking-widest text-sm">
            {managerName || "No Manager Assigned"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-soft border border-black/5 overflow-hidden mt-6">
      <div className="p-10 border-b border-black/5 bg-gray-50/30">
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">All Departments</h2>
        <p className="text-black/60 text-sm font-bold tracking-wide mt-2">
          Manage and view all organizational departments
        </p>
      </div>

      <div className="p-8">
        <DataTable
          columns={columns}
          data={departments}
          onRowClick={handleRowClick}
          pageSizeOptions={[5, 10, 25]}
        />
      </div>

      {/* ✅ Department Detail Modal */}
      {departmentID && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-[800px] max-w-full bg-white rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden">
            <div className="relative">
              <button
                onClick={() => setDepartmentID(null)}
                className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-black" />
              </button>
              <GetDepartmentById id={departmentID} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDepartments;
