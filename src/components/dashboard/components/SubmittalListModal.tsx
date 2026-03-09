import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Files } from "lucide-react";
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
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

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



  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-tight">
              Pending Attention on Submittals
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
                columns={columns}
                data={data}
                pageSizeOptions={[10, 25, 50]}
                onRowClick={(row) => setSelectedId(row.id)}
              />
              {selectedId && (
                <GetSubmittalByID id={selectedId} onClose={() => setSelectedId(null)} />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-500">
              <Files size={48} className="mb-4 opacity-20" />
              <p>No pending submittals found.</p>
            </div>
          )}
        </div>


      </div>
    </div>,
    document.body,
  );
};

export default SubmittalListModal;
