/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ChangeOrderItem } from "../../interface";
import { Loader2, Inbox } from "lucide-react";
import GetCOByID from "./GetCOByID";
import { formatDate } from "../../utils/dateUtils";

interface AllCOProps {
  changeOrderData?: ChangeOrderItem[];
}

const AllCO = ({ changeOrderData = [] }: AllCOProps) => {
  const [changeOrders, setChangeOrders] = useState<ChangeOrderItem[]>([]);

  const [loading, setLoading] = useState(true);

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
          <span className={`px-2 py-1 text-xs rounded-full ${statusClass}`}>
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
            : "No Change Orders have been received yet."}
        </p>
      </div>
    );
  }

  // ✅ Render DataTable
  return (
    <div className="bg-white p-2 rounded-2xl shadow-md">
      <DataTable
        columns={columns}
        data={changeOrders}
        detailComponent={({ row }) => (
          <GetCOByID id={row.id} projectId={row.project} />
        )}
      />
    </div>
  );
};

export default AllCO;
