/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import DataTable from "../../ui/table";
import { format } from "date-fns";
import EstimationTaskByID from "./EstimationTaskByID";

const AllEstimationTask = ({ estimations, onClose }) => {
  console.log(estimations);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ─────────────── Columns ───────────────
  const columns = [
    {
      header: "Project Name",
      accessorFn: (row) => row.estimation?.projectName || "—",
    },
    {
      header: "Fabricator Name",
      accessorFn: (row) =>
        row.estimation?.fabricators?.fabName || "—",
    },
    {
      header: "Assigned To",
      accessorFn: (row) =>
        `${row.assignedTo?.firstName ?? ""} ${row.assignedTo?.middleName ?? ""} ${row.assignedTo?.lastName ?? ""}`
          .trim() || "—",
    },
    {
      header: "Assigned By",
      accessorFn: (row) =>
        `${row.assignedBy?.firstName ?? ""} ${row.assignedBy?.middleName ?? ""} ${row.assignedBy?.lastName ?? ""}`
          .trim() || "—",
    },
    {
      header: "End Date",
      accessorFn: (row) =>
        row.endDate ? format(new Date(row.endDate), "dd MMM yyyy") : "—",
    },
    {
      header: "Status",
      accessorFn: (row) => row.status,
      cell: ({ getValue }) => {
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
  const handleRowClick = (row) => {
    const taskId = row.id ?? row.estimationId;
    if (!taskId) return;

    setSelectedTaskId(taskId);
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-2"></div>
              Loading tasks...
            </div>
          ) : estimations?.length > 0 ? (
            <DataTable
              columns={columns}
              data={estimations}
              onRowClick={handleRowClick}
              detailComponent={({ row, close }) => {
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
