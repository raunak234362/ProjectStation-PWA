import { useEffect, useState } from "react";
import Service from "../../api/Service";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { RFIItem } from "../../interface";
import GetRFIByID from "./GetRFIByID";

const AllRFI = () => {

  const [rfis, setRFIs] = useState<RFIItem[]>([]);
  const [selectedRfiID, setSelectedRfiID] = useState<string | null>(null);

  const userRole = sessionStorage.getItem("userRole"); 

  const fetchRFI = async () => {
    try {
      let result;

      if (userRole === "CLIENT") {
        result = await Service.RfiSent();
      } else {
        result = await Service.RfiRecieved();
      }

      // Some APIs return `{data:[...]}`, some return array directly → normalize:
      // const arrayData = Array.isArray(result) ? result : result?.data || [];
      // setRFIs(arrayData);

      const arrayData = Array.isArray(result) ? result : result?.data || [];

const normalized = arrayData.map((item: any) => ({
  ...item,
  createdAt: item.createdAt || item.date || null, // 👈 unify
}));

setRFIs(normalized);


    } catch (error) {
      console.error("Error fetching RFI:", error);
    }
  };

  useEffect(() => {
    fetchRFI();
  }, []);

  const handleRowClick = (row: RFIItem) => {
    setSelectedRfiID(row.id);
  };

  
  const columns: ColumnDef<RFIItem>[] = [
    { accessorKey: "subject", header: "Subject" },

    {
      accessorKey: "sender",
      header: "Sender",
      cell: ({ row }) => {
        const s = row.original.sender;
        return s
          ? `${s.firstName ?? ""} ${s.middleName ?? ""} ${s.lastName ?? ""}`.trim()
          : "—";
      },
    },
  ];

  // ➕ Only Admin / Staff should see fabricator info
  if (userRole !== "CLIENT") {
    columns.push({
      accessorKey: "fabricator",
      header: "Fabricator",
      cell: ({ row }) => row.original.fabricator?.fabName || "—",
    });
  }

  columns.push(
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.original.status === true
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {row.original.status ? "PENDING" : "RESPONDED"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }) =>
        row.original.date
          ? new Date(row.original.date).toLocaleDateString()
          : "—",
    }
  );

  return (
    <div className="bg-white p-2 rounded-2xl shadow-md">
      <DataTable
        columns={columns}
        data={rfis}
        onRowClick={handleRowClick}
        detailComponent={({ row }) => <GetRFIByID id={row.id} />}
        searchPlaceholder="Search RFIs..."
        pageSizeOptions={[5, 10, 25]}
      />

      {/* Details Modal */}
      {/* {selectedRfiID && (
        <GetRFIByID
          id={selectedRfiID}
          onClose={() => setSelectedRfiID(null)}
        />
      )} */}
    </div>
  );
};

export default AllRFI;
