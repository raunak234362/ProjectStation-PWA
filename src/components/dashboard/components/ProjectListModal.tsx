import React from "react";
import { X as CloseIcon } from "lucide-react";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import { formatSeconds } from "../../../utils/timeUtils";

interface ProjectListModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
  projects: any[];
  onProjectSelect: (project: any) => void;
}

const ProjectListModal: React.FC<ProjectListModalProps> = ({
  isOpen,
  onClose,
  status,
  projects,
  onProjectSelect,
}) => {
  if (!isOpen) return null;

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Project Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-700">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "fabricator.name",
      header: "Fabricator Name",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {row.original.fabricator?.name || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.stage || "N/A"}</span>
      ),
    },
    {
      accessorKey: "estimatedHours",
      header: "Est. Hours",
      cell: ({ row }) => (
        <span className="text-gray-700 font-medium">
          {row.original.estimatedHours || 0}h
        </span>
      ),
    },
    {
      accessorKey: "workedHours",
      header: "Worked Hours",
      cell: ({ row }) => (
        <span
          className={`font-bold ${row.original.isOverrun ? "text-red-600" : "text-green-600"
            }`}
        >
          {formatSeconds(row.original.workedSeconds || 0)}
        </span>
      ),
    },
    {
      accessorKey: "isOverrun",
      header: "Overrun",
      cell: ({ row }) =>
        row.original.isOverrun ? (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-black uppercase tracking-tighter animate-pulse">
            OVERRUN
          </span>
        ) : (
          <span className="text-gray-300 text-[10px] font-bold uppercase">
            Normal
          </span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${row.original.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : row.original.status === "COMPLETED"
                ? "bg-blue-100 text-blue-700"
                : "bg-orange-100 text-orange-700"
            }`}
        >
          {row.original.status}
        </span>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[95%] md:w-[90%] md:max-w-5xl max-h-[85vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
              <div
                className={`w-2 h-6 rounded-full ${status.includes("ACTIVE") || status.includes("IFA")
                    ? "bg-green-500"
                    : status.includes("COMPLETED") ||
                      status.includes("IFC") ||
                      status.includes("Done")
                      ? "bg-blue-500"
                      : status.includes("ON_HOLD") ||
                        status.includes("CO#") ||
                        status.includes("On-Hold")
                        ? "bg-orange-500"
                        : "bg-gray-500"
                  }`}
              ></div>
              {status.replace("_", " ")} Projects
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Showing {projects.length} projects
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <DataTable
            columns={columns}
            data={projects}
            onRowClick={onProjectSelect}
            searchPlaceholder="Search projects..."
            pageSizeOptions={[5, 10, 25]}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg shadow-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectListModal;
