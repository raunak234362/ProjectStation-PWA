import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import type { Fabricator } from "../../../interface";
import { toast } from "react-toastify";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";

const AllFabricator = () => {
  const [fabricators, setFabricators] = useState<Fabricator>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all fabricators on component mount
  useEffect(() => {
    const fetchFabricators = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Service.GetAllFabricators();

        // Adjust based on your backend response
        const data = response?.data?.fabricators || response || {};
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
    alert(`You clicked fabricator: ${row.fabName}`);
  };

  // Define columns for DataTable
  const columns: ColumnDef<Fabricator>[] = [
    { accessorKey: "fabName", header: "Fabricator Name" },
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) => (
        <a
          href={row.original.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:underline"
        >
          {row.original.website || "—"}
        </a>
      ),
    },
    {
      accessorKey: "drive",
      header: "Drive Link",
      cell: ({ row }) =>
        row.original.drive ? (
          <a
            href={row.original.drive}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Drive
          </a>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "files",
      header: "Files",
      cell: ({ row }) =>
        row.original.files ? (
          <span className="text-gray-700">{row.original.files}</span>
        ) : (
          "—"
        ),
    },
  ];

  // Loading and error states
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  // Render DataTable
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <DataTable
        columns={columns}
        data={fabricators}
        onRowClick={handleRowClick}
       
        searchPlaceholder="Search fabricators..."
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default AllFabricator;
