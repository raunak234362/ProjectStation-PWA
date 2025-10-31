/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import GetFabricatorByID from "./GetFabricatorByID";
import type { Fabricator } from "../../../interface";

const AllFabricator = () => {
  const [fabricators, setFabricators] = useState<Fabricator[]>([]);
  const [fabricatorId, setFabricatorId] = useState<string | "">();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all fabricators on component mount
  useEffect(() => {
    const fetchFabricators = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Service.GetAllFabricators();
        console.log(response);
        // Adjust based on your backend response
        const data = response.data || [];
        setFabricators(data);
      } catch (err) {
        console.error("Failed to fetch fabricators:", err);
        setError("Failed to load fabricators");
        toast.error("Failed to load fabricators");
      } finally {
        setLoading(false);
      }
    };

    fetchFabricators();
  }, []);
  console.log(fabricators);

  // // Handle delete action
  // const handleDelete = async (selectedRows: Fabricator[]) => {
  //   try {
  //     const ids = selectedRows.map((fab) => fab.id);
  //     console.log("Deleting fabricators:", ids);

  //     // TODO: Uncomment when Delete API is ready
  //     // await Service.DeleteFabricators(ids);

  //     // Remove deleted rows from table
  //     setFabricators((prev) => prev.filter((fab) => !ids.includes(fab.id)));
  //     toast.success(`${selectedRows.length} fabricator(s) deleted`);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to delete fabricators");
  //   }
  // };

  // Handle row click (optional)
  const handleRowClick = (row: Fabricator) => {
    const fabricatorUniqueId = (row as any).id ?? (row as any).fabId ?? "";
    // alert(`You clicked fabricator: ${fabricatorUniqueId}`);
    setFabricatorId(fabricatorUniqueId);
  };

  // Define columns for DataTable
  const columns: ColumnDef<Fabricator>[] = [
    { accessorKey: "fabName", header: "Fabricator Name" },
  ];

  // Loading and error states
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  // Render DataTable
  return (
    <div className=" bg-white p-4 rounded-2xl shadow-sm">
      <DataTable
        columns={columns}
        data={fabricators}
        onRowClick={handleRowClick}
        detailComponent={({ row }) => {
          const fabricatorUniqueId =
            (row as any).id ?? (row as any).fabId ?? "";
          return <GetFabricatorByID id={fabricatorUniqueId} />;
        }}
        searchPlaceholder="Search fabricators..."
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default AllFabricator;
