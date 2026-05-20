/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { RFIItem } from "../../interface";
import GetRFIByID from "./GetRFIByID";
import { Inbox, Search, Filter } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";
import { Suspense } from "react";


interface AllRFIProps {
  rfiData?: RFIItem[];
}

const AllRFI = ({ rfiData = [] }: AllRFIProps) => {
  const [rfis, setRFIs] = useState<RFIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfiID, setSelectedRfiID] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const userRole = sessionStorage.getItem("userRole");
  const userRoleUpper = userRole?.toUpperCase();
  const isClient = ["CLIENT", "CLIENT_ADMIN", "CLIENT_ESTIMATOR"].includes(userRoleUpper || "");


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
      size: 400,
    },

    {
      accessorKey: "sender",
      header: "From",
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
      size: 200,
    },

    {
      accessorKey: "recepients",
      header: "To",
      cell: ({ row }) => {
        const original = row.original as any;
        const multipleRecipients = Array.isArray(original.multipleRecipients) ? original.multipleRecipients : [];
        const r = multipleRecipients.length > 0 ? multipleRecipients[0] : original.recepients;
        const additionalCount = multipleRecipients.length > 1 ? multipleRecipients.length - 1 : 0;
        
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase shrink-0">
              {(r?.firstName?.[0] || "") + (r?.lastName?.[0] || "")}
            </div>
            <div className="flex flex-col">
              <span className="text-black font-medium text-xs truncate max-w-[120px]">
                {r ? `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() : "—"}
              </span>
              {additionalCount > 0 && (
                <span className="text-[10px] font-bold text-gray-500">
                  +{additionalCount} more
                </span>
              )}
            </div>
          </div>
        );
      },
      size: 200,
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
      size: 150,
    },

    {
      accessorKey: "respondedAt",
      header: "Responded On",
      cell: ({ row }) => {
        const responses = row.original.rfiresponse || [];
        if (responses.length === 0)
          return <span className="text-gray-400 font-bold text-xs">—</span>;

        const latestResponded = responses.reduce((latest, current) => {
          const currentTS = new Date(current.createdAt).getTime();
          const latestTS = new Date(latest.createdAt).getTime();
          return currentTS > latestTS ? current : latest;
        }, responses[0]);

        return (
          <span className="text-black/60 text-xs font-bold">
            {formatDate(latestResponded?.createdAt)}
          </span>
        );
      },
      size: 150,
    },

    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }) => (
        <span className="text-black/60 text-xs font-bold">
          {formatDate(row.original.createdAt)}
        </span>
      ),
      size: 150,
    },
  ];

  const filteredRfis = rfis.filter((rfi) => {
    const searchMatch = rfi.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        rfi.sender?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        rfi.sender?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isPending = rfi.status === true;
    const statusText = isPending ? "Pending" : "Responded";
    const statusMatch = statusFilter === "All" || statusText === statusFilter;

    return searchMatch && statusMatch;
  });

  // ✅ Empty state
  if (!loading && rfis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-40 bg-white rounded-3xl border border-dashed border-gray-100 italic text-gray-400">
        <Inbox className="w-10 h-10 mb-3 text-gray-200" />
        <p className="text-black font-black text-lg">No RFIs Available</p>
        <p className="text-sm">
          {isClient
            ? "No RFIs have been received for this project yet."
            : "You haven’t initiated any RFIs yet."}
        </p>
      </div>
    );
  }

  // ✅ Render DataTable
  return (
    <div className="bg-white rounded-3xl overflow-hidden flex flex-col pt-4">
      <div className="px-4 mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search RFIs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6bbd45]/50 transition-all"
          />
        </div>
        
        <div className="relative w-full md:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6bbd45]/50 transition-all cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Responded">Responded</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={filteredRfis}
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
