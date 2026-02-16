import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X as CloseIcon, Files } from "lucide-react";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import GetSubmittalByID from "../../submittals/GetSubmittalByID";
import { formatDate } from "../../../utils/dateUtils";
import { useDispatch } from "react-redux";
import {
  incrementModalCount,
  decrementModalCount,
} from "../../../store/uiSlice";

interface SubmittalListModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
}

const SubmittalListModal: React.FC<SubmittalListModalProps> = ({
  isOpen,
  onClose,
  data,
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

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "project.name",
      header: "Project Name",
      cell: ({ row }: any) => (
        <span className="font-medium text-gray-700">
          {row.original.project?.name || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "fabricator.fabName",
      header: "Fabricator Name",
      cell: ({ row }: any) => (
        <span className="text-gray-700">
          {row.original.fabricator?.fabName || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }: any) => (
        <span className="text-gray-700">{row.original.subject || "N/A"}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => (
        <span className="text-gray-700">{formatDate(row.original.date)}</span>
      ),
    },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) => (
    //     <span
    //       className={`px-3 py-1 rounded-full text-xs  ${
    //         row.original.status ===true
    //           ? "bg-green-100 text-green-700"
    //           : "bg-orange-100 text-orange-700"
    //       }`}
    //     >
    //       {row.original.status}
    //     </span>
    //   ),
    // },
  ].filter((col) => {
    if (
      (userRole === "client" || userRole === "client_admin") &&
      col.header === "Fabricator Name"
    ) {
      return false;
    }
    return true;
  });

  const renderDetail = ({ row }: { row: any }) => {
    return <GetSubmittalByID id={row.id} />;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-green-500/20 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-green-500/10 flex items-center justify-between bg-green-50/50">
          <div>
            <h3 className="text-xl  text-gray-700 dark:text-slate-100 flex items-center gap-2">
              Pending Submittals
            </h3>
            <p className="text-sm text-gray-700 dark:text-slate-400 mt-1">
              Showing {data.length} pending submittals
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
              columns={columns}
              data={data}
              pageSizeOptions={[10, 25, 50]}
              detailComponent={renderDetail}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-500">
              <Files size={48} className="mb-4 opacity-20" />
              <p>No pending submittals found.</p>
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

export default SubmittalListModal;
