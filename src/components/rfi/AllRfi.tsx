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

  const userRole = sessionStorage.getItem("userRole") || "";
  const userRoleUpper = userRole.toUpperCase();
  const currentUserId = sessionStorage.getItem("userId") || "";

  const isClient = ["CLIENT", "CLIENT_ADMIN", "CLIENT_ESTIMATOR"].includes(userRoleUpper);
  const isConnectionDesigner = [
    "CONNECTION_DESIGNER",
    "CONNECTION_DESIGNER_ADMIN",
    "CONNECTION_DESIGNER_ENGINEER",
  ].includes(userRoleUpper);

  const isWBTStaff = !isClient && !isConnectionDesigner;

  const [activeSubTab, setActiveSubTab] = useState<"general" | "cd">("general");
  const [sentReceivedTab, setSentReceivedTab] = useState<"sent" | "received">("received");

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

  const getStatusInfo = (item: any) => {
    const responses = item.rfiresponse || [];
    if (responses.length > 0) {
      const sorted = [...responses].sort(
        (a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime()
      );
      const latest = sorted[0];
      
      const roleStr = latest.user?.role || latest.sender?.role || "";
      const roleUpper = roleStr.toUpperCase();
      const isClientResp = ["CLIENT", "CLIENT_ADMIN", "CLIENT_ESTIMATOR"].includes(roleUpper) || roleUpper.includes("CLIENT");
      const isParent = !latest.parentResponseId;

      let rfiStatus;
      if (isClientResp && isParent) {
        rfiStatus = latest.exStatus || latest.status;
      } else {
        rfiStatus = latest.wbtStatus || latest.status;
      }

      if (rfiStatus) {
        const statusStr = rfiStatus.toUpperCase();
        switch (statusStr) {
          case "OPEN":
            return { label: "OPEN", className: "bg-blue-100 text-black shadow-sm" };
          case "PARTIAL":
            return { label: "PARTIAL", className: "bg-orange-100 text-black shadow-sm" };
          case "COMPLETE":
            return { label: "COMPLETE", className: "bg-green-100 text-black shadow-sm" };
          default:
            return { label: statusStr, className: "bg-gray-100 text-black shadow-sm" };
        }
      }
    }

    // Fallback if no responses exist
    if (item.status === true || item.status === "OPEN" || item.status === "PENDING") {
      return { label: "PENDING", className: "bg-green-100 text-black shadow-sm" };
    } else {
      return { label: "ANSWERED", className: "bg-orange-100 text-black shadow-sm" };
    }
  };

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
        const statusInfo = getStatusInfo(row.original);
        return (
          <span
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border border-black ${statusInfo.className}`}
          >
            {statusInfo.label}
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

  const isCDRole = (roleStr?: string) => {
    if (!roleStr) return false;
    const r = roleStr.toUpperCase();
    return r.includes("CONNECTION_DESIGNER") || r.includes("CD_") || r === "CD";
  };

  const isClientRole = (roleStr?: string) => {
    if (!roleStr) return false;
    const r = roleStr.toUpperCase();
    return ["CLIENT", "CLIENT_ADMIN", "CLIENT_ESTIMATOR"].includes(r) || r.includes("CLIENT");
  };

  const isConnectionDesignerRFI = (rfi: RFIItem) => {
    const isCDFlag = rfi.isConnectionDesign === true || String(rfi.isConnectionDesign).toLowerCase() === "true";
    if (isCDFlag) return true;

    if (rfi.sender && isCDRole(rfi.sender.role)) return true;

    if (rfi.recepients && isCDRole((rfi.recepients as any).role)) return true;

    const multipleRecipients = (rfi as any).multipleRecipients || [];
    if (Array.isArray(multipleRecipients) && multipleRecipients.some((r: any) => isCDRole(r?.role))) return true;

    return false;
  };

  const filteredRfis = rfis.filter((rfi) => {
    // 1. Search Query Filter
    const searchMatch = rfi.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        rfi.sender?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        rfi.sender?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Status Filter
    const statusInfo = getStatusInfo(rfi);
    const statusText = statusInfo.label === "PENDING" ? "Pending" : "Responded";
    const statusMatch = statusFilter === "All" || statusText === statusFilter;

    if (!searchMatch || !statusMatch) return false;

    // 3. Category/Role Filtering
    const isRfiCD = isConnectionDesignerRFI(rfi);

    if (isWBTStaff) {
      if (activeSubTab === "general") {
        if (sentReceivedTab === "sent") {
          // Sent by WBT staff to Client
          return !isRfiCD && (rfi.senderId === currentUserId || !isClientRole(rfi.sender?.role));
        } else {
          // Received by WBT from Client
          return !isRfiCD && (rfi.senderId !== currentUserId && isClientRole(rfi.sender?.role));
        }
      } else {
        // CD RFI Subtab: Filter by Sent/Received from WBT's perspective
        if (sentReceivedTab === "sent") {
          // Sent by WBT staff to CD
          return isRfiCD && (rfi.senderId === currentUserId || !isCDRole(rfi.sender?.role));
        } else {
          // Received by WBT from CD
          return isRfiCD && (rfi.senderId !== currentUserId && isCDRole(rfi.sender?.role));
        }
      }
    } else if (isConnectionDesigner) {
      // Connection Designer role: only see CD RFIs (inherent from rolesForReceived, but verify just in case)
      const sId = rfi.senderId || (rfi as any).sender_id || rfi.sender?.id;
      if (sentReceivedTab === "sent") {
        // Sent by the logged-in CD
        return sId === currentUserId;
      } else {
        // Received by the logged-in CD
        return sId !== currentUserId;
      }
    } else if (isClient) {
      // Client role: only see General RFIs
      return !isRfiCD;
    }

    return true;
  });

  const getEmptyStateMessage = () => {
    if (isClient) {
      return "No RFIs have been received for this project yet.";
    }
    return `No RFIs have been ${sentReceivedTab} yet.`;
  };

  // ✅ Render DataTable with tabs and controls
  return (
    <div className="bg-white rounded-3xl overflow-hidden flex flex-col pt-4">
      {/* Tabs and Controls Container */}
      <div className="px-4 mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4">
        {/* Main tabs / subtabs (visible to WBT Staff) & Sent/Received toggles & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Sub-tabs for WBT Staff */}
          {isWBTStaff && (
            <div className="flex border-b border-transparent gap-6">
              <button
                onClick={() => {
                  setActiveSubTab("general");
                  setSearchQuery("");
                }}
                className={`pb-2 px-1 border-b-2 font-bold text-sm uppercase tracking-tight transition-all duration-200 ${
                  activeSubTab === "general"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                General RFIs
              </button>
              <button
                onClick={() => {
                  setActiveSubTab("cd");
                  setSearchQuery("");
                }}
                className={`pb-2 px-1 border-b-2 font-bold text-sm uppercase tracking-tight transition-all duration-200 ${
                  activeSubTab === "cd"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Connection Designer's RFI
              </button>
            </div>
          )}

          {/* Controls right-aligned or inline */}
          <div className="flex flex-wrap items-center gap-4 ml-auto lg:ml-0">
            {/* SENT / RECEIVED Toggles */}
            {!isClient && (
              <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200/50">
                <button
                  onClick={() => setSentReceivedTab("sent")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    sentReceivedTab === "sent"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Sent
                </button>
                <button
                  onClick={() => setSentReceivedTab("received")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    sentReceivedTab === "received"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Received
                </button>
              </div>
            )}

            {/* Search input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6bbd45]/50 transition-all text-black font-semibold placeholder-gray-400"
              />
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6bbd45]/50 transition-all cursor-pointer appearance-none uppercase"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1rem",
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Responded">Responded</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Main Table area */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-green-500 border-t-transparent animate-spin mb-4" />
            <p className="text-black font-black uppercase tracking-widest text-xs">Accessing intelligence...</p>
          </div>
        ) : filteredRfis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-32 bg-white rounded-3xl border border-dashed border-gray-100 italic text-gray-400">
            <Inbox className="w-10 h-10 mb-3 text-gray-200" />
            <p className="text-black font-black text-lg uppercase tracking-tight">No RFIs Available</p>
            <p className="text-sm font-bold uppercase tracking-wider">
              {getEmptyStateMessage()}
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredRfis}
            onRowClick={(row) => setSelectedRfiID(row.id)}
            pageSizeOptions={[10]}
            noBorder
          />
        )}
      </div>

      {selectedRfiID && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-md text-white font-black uppercase tracking-widest text-xs">
              Accessing intelligence...
            </div>
          }
        >
          <GetRFIByID id={selectedRfiID} onClose={() => setSelectedRfiID(null)} />
        </Suspense>
      )}
    </div>
  );
};

export default AllRFI;
