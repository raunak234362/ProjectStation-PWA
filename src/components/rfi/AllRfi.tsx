/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { RFIItem } from "../../interface";
import GetRFIByID from "./GetRFIByID";
import { Loader2, Inbox } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";
import { Suspense } from "react";

interface AllRFIProps {
  rfiData?: RFIItem[];
}

const AllRFI = ({ rfiData = [] }: AllRFIProps) => {
  const [rfis, setRFIs] = useState<RFIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfiID, setSelectedRfiID] = useState<string | null>(null);
  console.log(rfiData);

  const userRole = sessionStorage.getItem("userRole");

  useEffect(() => {
    if (rfiData && rfiData.length > 0) {
      const normalized = rfiData.map((item: any) => ({
        ...item,
        createdAt: item.createdAt || item.date || null,
      }));
      setRFIs(normalized);
      setLoading(false);
    } else {
    }
  }, [rfiData]);

  // const handleRowClick = (row: RFIItem) => {
  //   // setSelectedRfiID(row.id);
  // };

  // ✅ Define columns
  const columns: ColumnDef<RFIItem>[] = [
    { accessorKey: "subject", header: "Subject" },
    {
      accessorKey: "sender",
      header: "Sender",
      cell: ({ row }) => {
        const s = row.original.sender;
        return s
          ? `${s.firstName ?? ""} ${s.middleName ?? ""} ${s.lastName ?? ""}`.trim() ||
          s.username ||
          "—"
          : "—";
      },
    },
  ];

  columns.push(
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className="px-3 py-1 text-[10px] uppercase font-bold tracking-tight rounded-lg bg-gray-100 text-black border border-gray-200"
        >
          {row.original.status ? "PENDING" : "RESPONDED"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  );

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-700">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        Loading RFIs...
      </div>
    );
  }

  // ✅ Empty state
  if (!loading && (!rfis || rfis.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-700">
        <Inbox className="w-10 h-10 mb-3 text-gray-400" />
        <p className="text-lg font-medium">No RFIs Available</p>
        <p className="text-sm text-gray-400">
          {userRole === "CLIENT"
            ? "You haven’t sent any RFIs yet."
            : "No RFIs have been received yet."}
        </p>
      </div>
    );
  }

  // ✅ Render DataTable
  return (
    <div className="bg-white p-2 rounded-2xl shadow-md">
      <DataTable
        columns={columns}
        data={rfis}
        onRowClick={(row) => setSelectedRfiID(row.id)}
        pageSizeOptions={[5, 10, 25]}
      />
      {selectedRfiID && (
        <Suspense fallback={<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md text-white">Loading...</div>}>
          <GetRFIByID id={selectedRfiID} onClose={() => setSelectedRfiID(null)} />
        </Suspense>
      )}
    </div>
  );
};

export default AllRFI;
