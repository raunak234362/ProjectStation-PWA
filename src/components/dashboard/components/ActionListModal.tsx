import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X as CloseIcon,
  Files,
  Search,
  FileText,
  Activity,
} from "lucide-react";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import GetRFQByID from "../../rfq/GetRFQByID";
import GetRFIByID from "../../rfi/GetRFIByID";
import GetCOByID from "../../co/GetCOByID";
import { formatDate } from "../../../utils/dateUtils";
import { useDispatch } from "react-redux";
import {
  incrementModalCount,
  decrementModalCount,
} from "../../../store/uiSlice";

interface ActionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  type: "PENDING_RFQ" | "PENDING_RFI" | "PENDING_CO";
}

const ActionListModal: React.FC<ActionListModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      dispatch(incrementModalCount());
      return () => {
        dispatch(decrementModalCount());
      };
    }
  }, [isOpen, dispatch]);

  console.log("ActionListModal Rendered:", {
    isOpen,
    type,
    dataLength: data?.length,
    data,
  });
  console.log("===============", data);

  const getTitle = () => {
    switch (type) {
      case "PENDING_RFQ":
        return "Pending RFQs";
      case "PENDING_RFI":
        return "Pending RFIs";
      case "PENDING_CO":
        return "Pending Change Orders";
      default:
        return "Pending Actions";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "PENDING_RFQ":
        return <Search size={24} />;
      case "PENDING_RFI":
        return <FileText size={24} />;
      case "PENDING_CO":
        return <Activity size={24} />;
      default:
        return <Files size={24} />;
    }
  };

  const getColumns = (): ColumnDef<any>[] => {
    switch (type) {
      case "PENDING_RFQ":
        return [
          {
            accessorKey: "projectName",
            header: "Project Name",
          },
          {
            accessorKey: "projectNumber",
            header: "RFQ #",
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
              <span
                className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-lg ${
                  row.original.status === "IN_REVIEW"
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : row.original.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-slate-50 text-slate-600 border border-slate-100"
                }`}
              >
                {row.original.status?.replace("_", " ")}
              </span>
            ),
          },
          {
            accessorKey: "estimationDate",
            header: "Due Date",
            cell: ({ row }) =>
              row.original.estimationDate
                ? formatDate(row.original.estimationDate)
                : "—",
          },
        ];
      case "PENDING_RFI":
        return [
          { accessorKey: "subject", header: "Subject" },
          {
            accessorKey: "sender",
            header: "Sender",
            cell: ({ row }) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const s = (row.original as any).sender;
              if (!s) return "—";

              const fullName = [s.firstName, s.middleName, s.lastName]
                .filter(Boolean)
                .join(" ");

              return fullName || s.username || s.email || "—";
            },
          },
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
        ];
      case "PENDING_CO":
        return [
          {
            accessorKey: "changeOrderNumber",
            header: "CO Number",
          },
          {
            accessorKey: "remarks",
            header: "Remarks",
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
              return (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${map[status] || ""}`}
                >
                  {status ?? "—"}
                </span>
              );
            },
          },
        ];
      default:
        return [];
    }
  };

  const renderDetail = React.useCallback(
    ({ row }: { row: any }) => {
      switch (type) {
        case "PENDING_RFQ":
          return <GetRFQByID id={row.id} />;
        case "PENDING_RFI":
          return <GetRFIByID id={row.id} />;
        case "PENDING_CO":
          return <GetCOByID id={row.id} projectId={row.project} />;
        default:
          return null;
      }
    },
    [type],
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-green-500/20 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-green-500/10 flex items-center justify-between bg-green-50/50">
          <div>
            <h3 className="text-xl text-gray-700 dark:text-slate-100 flex items-center gap-2">
              {getIcon()}
              {getTitle()}
            </h3>
            <p className="text-sm text-gray-700 dark:text-slate-400 mt-1">
              Showing {data.length} pending items
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-100 rounded-full transition-colors text-gray-400 hover:text-green-700"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {data.length > 0 ? (
            <DataTable
              columns={getColumns()}
              data={data}
              pageSizeOptions={[25]}
              detailComponent={renderDetail}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-500">
              <Files size={48} className="mb-4 opacity-20" />
              <p>No pending items found.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-green-500/10 bg-green-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg shadow-green-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ActionListModal;
