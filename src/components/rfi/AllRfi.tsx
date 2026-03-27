/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { RFIItem } from "../../interface";
import GetRFIByID from "./GetRFIByID";
import { Inbox } from "lucide-react";
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
    if (rfiData) {
      const normalized = rfiData.map((item: any) => ({
        ...item,
        createdAt: item.createdAt || item.date || null,
      }));
      setRFIs(normalized);
      setLoading(false);
    }
  }, [rfiData]);

  // ✅ Define columns
  const columns: ColumnDef<RFIItem>[] = [
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <span className="font-bold text-black">{row.original.subject}</span>
      ),
    },

    {
      accessorKey: "sender",
      header: "Sender",
      cell: ({ row }) => {
        const s = row.original.sender;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs uppercase">
              {(s?.firstName?.[0] || "") + (s?.lastName?.[0] || "")}
            </div>
            <span className="text-black font-medium">
              {s ? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() : "—"}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isPending = row.original.status === true;
        return (
          <span
            className="px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md bg-gray-50 text-black border border-black/5"
          >
            {isPending ? "Pending" : "Responded"}
          </span>
        );
      },
    },

    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }) => (
        <span className="text-black/60 text-xs font-bold">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];

  // ✅ Empty state
  if (!loading && rfis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-40 bg-white rounded-3xl border border-dashed border-gray-100 italic text-gray-400">
        <Inbox className="w-10 h-10 mb-3 text-gray-200" />
        <p className="text-black font-black text-lg">No RFIs Available</p>
        <p className="text-sm">
          {userRole === "CLIENT"
            ? "You haven’t sent any RFIs yet."
            : "No RFIs have been received yet."}
        </p>
      </div>
    );
  }

  // ✅ Render DataTable
  return (
    <div className="bg-white rounded-3xl overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={rfis}
          onRowClick={(row) => setSelectedRfiID(row.id)}
          pageSizeOptions={[10]}
          noBorder
        />
      </div>
      {selectedRfiID && (
        <Suspense fallback={<div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-md text-white font-black uppercase tracking-widest text-xs">Accessing intelligence...</div>}>
          <GetRFIByID id={selectedRfiID} onClose={() => setSelectedRfiID(null)} />
        </Suspense>
      )}
    </div>
  );
};

export default AllRFI;
