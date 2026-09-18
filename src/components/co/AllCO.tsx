/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ChangeOrderItem } from "../../interface";
import { Loader2, Inbox, Search, X } from "lucide-react";
import GetCOByID from "./GetCOByID";
import { formatDate } from "../../utils/dateUtils";

interface AllCOProps {
  changeOrderData?: ChangeOrderItem[];
}

const AllCO = ({ changeOrderData = [] }: AllCOProps) => {
  const [changeOrders, setChangeOrders] = useState<ChangeOrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const statuses = ["All", ...Array.from(new Set(changeOrders.map(co => co.status).filter(Boolean))).sort()];

  console.log(changeOrderData);

  const userRole = sessionStorage.getItem("userRole");

  useEffect(() => {
    if (changeOrderData && changeOrderData.length > 0) {
      const normalized = changeOrderData.map((item: any) => ({
        ...item,
        createdAt: item.createdAt || item.date || null,
      }));
      setChangeOrders(normalized);
      setLoading(false);
    } else {
      setChangeOrders([]);
      setLoading(false);
    }
  }, [changeOrderData]);

  const columns: ColumnDef<ChangeOrderItem>[] = [
    {
      accessorKey: "changeOrderNumber",
      header: "CO Number",
      cell: ({ row }) => {
        const num = row.original.changeOrderNumber;
        if (!num) return "—";
        const last3 = num.slice(-3);
        return <span className="font-bold text-black">COR-{last3}</span>;
      },
    },
    {
      accessorKey: "remarks",
      header: "remarks",
    },
    {
      accessorKey: "senders",
      header: "sender",
      cell: ({ row }) => {
        const s = row.original.senders;
        return s
          ? `${s.firstName ?? ""} ${s.middleName ?? ""} ${s.lastName ?? ""}`.trim() ||
          s.username ||
          "—"
          : "—";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        const map: Record<string, string> = {
          NOT_REPLIED: "bg-yellow-100 text-yellow-700",
          APPROVED: "bg-green-100 text-green-700",
          REJECTED: "bg-red-100 text-red-700",
        };

        const statusClass = status ? (map[status] ?? "") : "";

        return (
          <span className={`px-2 py-1 text-sm font-bold uppercase tracking-widest rounded-full ${statusClass}`}>
            {status ?? "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-700">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        Loading Change Orders...
      </div>
    );
  }

  if (!changeOrders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-700">
        <Inbox className="w-10 h-10 mb-3 text-gray-400" />
        <p className="text-lg font-medium">No Change Orders Available</p>
        <p className="text-sm text-gray-400">
          {userRole === "CLIENT"
            ? "You haven’t created any Change Orders yet."
            : "No Change Orders raised for this project now."}
        </p>
      </div>
    );
  }

  const filteredCOs = changeOrders.filter((co) => {
    const q = searchQuery.toLowerCase();
    const numMatch = !searchQuery || co.changeOrderNumber?.toLowerCase().includes(q);
    const remarkMatch = !searchQuery || co.remarks?.toLowerCase().includes(q);
    const searchMatch = numMatch || remarkMatch;

    const statusMatch = statusFilter === "All" || co.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // ✅ Render DataTable
  return (
    <div className="bg-white rounded-3xl overflow-hidden flex flex-col pt-4">
      {/* UI Consistent Filters */}
      <div className="flex flex-wrap items-center gap-4 mt-4 mb-6 px-4">
        {/* Search Bar */}
        <div className="relative group flex-1 max-w-sm min-w-[200px]">
          <div className="absolute -inset-1 from-green-100 to-emerald-100 rounded-xl blur-sm opacity-25 group-hover:opacity-40 transition-all duration-1000"></div>
          <div className="relative bg-white border border-gray-400 rounded-xl flex items-center shadow-sm hover:border-green-500 transition-colors h-10">
            <Search className="ml-3 w-4 h-4 text-gray-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH CHANGE ORDERS..."
              className="flex-1 px-3 py-1 bg-transparent text-black placeholder-gray-600 font-bold focus:outline-none text-sm uppercase"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 px-3 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status Select */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-400 px-3 py-1.5 h-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20 text-black uppercase"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === "All" ? "ALL STATUS" : String(status).replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-h-0">
      <DataTable
        columns={columns}
        data={filteredCOs}
        detailComponent={({ row, close }) => (
          <GetCOByID id={row.id} projectId={row.project} onClose={close} />
        )}
        noBorder
        disableMaxHeight={true}
      />
      </div>
    </div>
  );
};

export default AllCO;
