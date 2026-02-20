/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import type { UserData } from "../../../interface";
import { toast } from "react-toastify";
import DataTable from "../../ui/table";
import GetEmployeeByID from "./GetEmployeeByID";
import type { ColumnDef } from "@tanstack/react-table";
import { useSelector } from "react-redux";
const AllEmployee = () => {
  const staffData = useSelector((state: any) => state.userInfo.staffData);
  const [employees, setEmployees] = useState<UserData[]>(staffData);
  const [employeeID, setEmployeeID] = useState<string | null>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  console.log(employees);
  const handleDelete = async (selectedRows: UserData[]) => {
    try {
      const ids = selectedRows.map((emp) => emp.id);
      // Example: await Service.DeleteEmployees(ids);
      console.log("Deleting employees:", ids);

      // Remove from UI
      setEmployees((prev) => prev.filter((emp) => !ids?.includes(emp.id)));
      toast.success(`${selectedRows.length} employee(s) deleted`);
    } catch (err) {
      console.log(err);

      toast.error("Failed to delete employees");
    }
  };

  const handleRowClick = (row: UserData) => {
    setEmployeeID(row.id);
    // router.push(`/employees/${row.id}`);
  };
  console.log(employeeID);

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <span className="font-black text-black uppercase tracking-tight text-sm">
          {row.original.username}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-black/60 font-bold text-xs lowercase">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorFn: (r) =>
        [r?.firstName, r?.middleName, r?.lastName]
          .filter(Boolean)
          .join(" "),
      header: "Full Name",
      id: "fullName",
      cell: ({ getValue }) => (
        <span className="text-black font-black uppercase tracking-wide text-xs whitespace-nowrap">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-black/60 font-bold text-xs tracking-widest whitespace-nowrap">
          {row.original?.phone}
          {row.original?.extension && (
            <span className="text-black/30 ml-1 font-black">
              (Ext: {row.original?.extension})
            </span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => (
        <span className="px-4 py-1.5 bg-gray-100 text-black font-black uppercase tracking-widest rounded-full text-[10px] border border-black/5 shadow-sm whitespace-nowrap">
          {row.original.designation || "—"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 bg-white rounded-[2.5rem] border border-black/5 shadow-soft">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black/5 border-t-black"></div>
          <span className="text-black font-black uppercase tracking-widest text-xs">Loading employees...</span>
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

  return (
    <div className="bg-white rounded-[2.5rem] shadow-soft border border-black/5 overflow-hidden mt-6">
      <div className="p-10 border-b border-black/5 bg-gray-50/30">
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">All Employees</h2>
        <p className="text-black/60 text-sm font-bold tracking-wide mt-2">
          Directory of all staff members and their designations
        </p>
      </div>

      <div className="p-8">
        <DataTable
          columns={columns}
          data={employees}
          onRowClick={handleRowClick}
          detailComponent={({ row }) => <GetEmployeeByID id={row.id} />}
          onDelete={handleDelete}
          pageSizeOptions={[5, 10, 25]}
        />
      </div>
    </div>
  );
};

export default AllEmployee;
