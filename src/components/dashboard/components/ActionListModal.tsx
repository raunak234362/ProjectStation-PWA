import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
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
  type: "PENDING_RFQ" | "PENDING_RFI" | "PENDING_COR";
}

const ActionListModal: React.FC<ActionListModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
}) => {
  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

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
        return "Pending Attention on RFQs";
      case "PENDING_RFI":
        return "Pending Attention on RFIs";
      case "PENDING_COR":
        return "Pending Attention on Change Orders";
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
      case "PENDING_COR":
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
                className="px-3 py-1 text-md md:text-lg uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200"
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
                className="px-3 py-1 text-md md:text-lg uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200"
              >
                {row.original.status ? "PENDING" : "RESPONDED"}
              </span>
            ),
          },
        ];
      case "PENDING_COR":
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
            cell: ({ row }) => (
              <span
                className="px-3 py-1 text-md md:text-lg uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200"
              >
                {row.original.status ?? "—"}
              </span>
            ),
          },
        ];
      default:
        return [];
    }
  };



  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-tight">
              {getIcon()}
              {getTitle()}
            </h3>

          </div>
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
          >
            Close
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {data.length > 0 ? (
            <>
              <DataTable
                columns={getColumns()}
                data={data}
                pageSizeOptions={[25]}
                onRowClick={(row) => setSelectedId(row.id)}
              />
              {selectedId && type === "PENDING_RFQ" && (
                <GetRFQByID id={selectedId} onClose={() => setSelectedId(null)} />
              )}
              {selectedId && type === "PENDING_RFI" && (
                <GetRFIByID id={selectedId} onClose={() => setSelectedId(null)} />
              )}
              {selectedId && type === "PENDING_COR" && (
                <GetCOByID
                  id={selectedId}
                  projectId={data.find((d) => d.id === selectedId)?.project}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-500">
              <Files size={48} className="mb-4 opacity-20" />
              <p>No pending items found.</p>
            </div>
          )}
        </div>


      </div>
    </div>,
    document.body,
  );
};

export default ActionListModal;
