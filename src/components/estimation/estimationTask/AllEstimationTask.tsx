/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import DataTable from "../../ui/table";
import { format } from "date-fns";
import EstimationTaskByID from "./EstimationTaskByID";

interface EstimationTask {
  id: string;
  estimationId: string;
  endDate: string;
  status: string;
  estimation?: {
    projectName: string;
    fabricators?: {
      fabName: string;
    };
  };
  assignedTo?: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  assignedBy?: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
}

interface AllEstimationTaskProps {
  estimations: EstimationTask[];
  onClose?: () => void;
}

const AllEstimationTask: React.FC<AllEstimationTaskProps> = ({ estimations, onClose }) => {
  console.log(estimations);



  // ─────────────── Columns ───────────────
  const columns = [
    {
      header: "Project Name",
      accessorFn: (row: EstimationTask) => row.estimation?.projectName || "—",
    },
    {
      header: "Fabricator Name",
      accessorFn: (row: EstimationTask) =>
        row.estimation?.fabricators?.fabName || "—",
    },
    {
      header: "Assigned To",
      accessorFn: (row: EstimationTask) =>
        `${row.assignedTo?.firstName ?? ""} ${row.assignedTo?.middleName ?? ""} ${row.assignedTo?.lastName ?? ""}`
          .trim() || "—",
    },
    {
      header: "Assigned By",
      accessorFn: (row: EstimationTask) =>
        `${row.assignedBy?.firstName ?? ""} ${row.assignedBy?.middleName ?? ""} ${row.assignedBy?.lastName ?? ""}`
          .trim() || "—",
    },
    {
      header: "End Date",
      accessorFn: (row: EstimationTask) =>
        row.endDate ? format(new Date(row.endDate), "dd MMM yyyy") : "—",
    },
    {
      header: "Status",
      accessorFn: (row: EstimationTask) => row.status,
      cell: ({ getValue }: { getValue: () => any }) => {
        const status = getValue();
        const color =
          status === "COMPLETED"
            ? "bg-green-100 text-green-800"
            : status === "ASSIGNED"
              ? "bg-yellow-100 text-yellow-800"
              : status === "BREAK"
                ? "bg-orange-100 text-orange-800"
                : "bg-blue-100 text-blue-800";

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
            {status}
          </span>
        );
      },
    },
  ];

  // ─────────────── Row Click Handler ───────────────
  const handleRowClick = (row: EstimationTask) => {
    const taskId = row.id ?? row.estimationId;
    if (!taskId) return;
    console.log("Selected Task ID:", taskId);
  };

  return (
    <>
      {/* Header with Close button (used when opened from Estimation details) */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Estimation Tasks
        </h2>
        {typeof onClose === "function" && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Close
          </button>
        )}
      </div>

      {/* Table */}
      <div className="w-full rounded-xl p-4 ">
        <div className=" rounded-lg">
          {estimations?.length > 0 ? (
            <DataTable
              columns={columns}
              data={estimations}
              onRowClick={handleRowClick}
              detailComponent={({ row, close }: { row: EstimationTask; close: () => void }) => {
                console.log("Detail Component Row:", row.id);
                const estimationUniqueId =
                  row.id ?? row.estimationId ?? "";
                return <EstimationTaskByID id={estimationUniqueId} onClose={close} />;
              }}
              searchPlaceholder="Search tasks..."
              pageSizeOptions={[5, 10, 25]}
            />
          ) : (
            <div className="text-center text-gray-500 py-10">
              No estimation tasks found.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllEstimationTask;
