import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import type { UserData } from "../../../interface";
import { toast } from "react-toastify";
import DataTable from "../../ui/table";
import GetEmployeeByID from "./GetEmployeeByID";
import type { ColumnDef } from "@tanstack/react-table";
const AllEmployee = () => {
  const [employees, setEmployees] = useState<UserData[]>([]);
  const [employeeID, setEmployeeID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchAllEmployee = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Service.FetchAllEmployee();

        // Adjust based on your API response structure
        const data = response?.data.employees || [];
        setEmployees(data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setError("Failed to load employees");
        toast.error("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };

    fetchAllEmployee();
  }, []);

  console.log(employees);
  const handleDelete = async (selectedRows: UserData[]) => {
    try {
      const ids = selectedRows.map((emp) => emp.id);
      // Example: await Service.DeleteEmployees(ids);
      console.log("Deleting employees:", ids);

      // Remove from UI
      setEmployees((prev) => prev.filter((emp) => !ids.includes(emp.id)));
      toast.success(`${selectedRows.length} employee(s) deleted`);
    } catch (err) {
      console.log(err);

      toast.error("Failed to delete employees");
    }
  };

  const handleRowClick = (row: UserData) => {
    setEmployeeID(row.id)
    // router.push(`/employees/${row.id}`);
  };
  console.log(employeeID)

  const columns: ColumnDef<UserData>[] = [
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    {
      accessorFn: (r) =>
        [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" "),
      header: "Full Name",
      id: "fullName",
    },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "designation", header: "Designation" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-800">
          {row.getValue("role")}
        </span>
      ),
    },
  ];

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="bg-white p-2 rounded-2xl">
      <DataTable
        columns={columns}
        data={employees}
        onRowClick={handleRowClick}
        detailComponent={({ row }) => <GetEmployeeByID id={row.id} />}
        onDelete={handleDelete}
        searchPlaceholder="Search employees..."
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default AllEmployee;
