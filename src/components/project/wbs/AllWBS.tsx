/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import DataTable from "../../ui/table";
import Service from "../../../api/Service";
import GetWBSByID from "./GetWBSByID";
import Button from "../../fields/Button";
import FetchWBSTemplate from "./FetchWBSTemplate";

import { useDispatch, useSelector } from "react-redux";
import { setWBSForProject } from "../../../store/wbsSlice";

const AllWBS = ({ id, wbsData }: { id: string; wbsData: any }) => {
  const dispatch = useDispatch();
  const wbsByProject = useSelector(
    (state: any) => state.wbsInfo?.wbsByProject || {}
  );
  const wbsList = wbsByProject[id] || [];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWBS, setSelectedWBS] = useState<any | null>(null);
  const [showFetchTemplate, setShowFetchTemplate] = useState(false);
  const projectId = id;

  // ✅ Fetch all WBS items
  const fetchAllWBS = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Service.GetWBSByProjectId(projectId);
      console.log("Fetched WBS:", response);
      dispatch(setWBSForProject({ projectId, wbs: response || [] }));
    } catch (err) {
      console.error("Error fetching WBS:", err);
      setError("Failed to load WBS data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!wbsByProject[id]) {
      fetchAllWBS();
    }
  }, [id, wbsByProject, dispatch]);

  // ✅ Define table columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "WBS Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-700">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-sm text-green-700 font-semibold">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.stage || "—"}</span>
      ),
    },
    {
      accessorKey: "totalExecHr",
      header: "Total Exec Hrs",
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.totalExecHr || "—"}</span>
      ),
    },
    {
      accessorKey: "totalCheckHr",
      header: "Total Check Hrs",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {row.original.totalCheckHr || "—"}
        </span>
      ),
    },

    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "dd MMM yyyy, HH:mm"),
    },
  ];

  // ✅ Handle row click — open details
  const handleRowClick = (row: any) => {
    setSelectedWBS(row);
  };

  // ✅ Render loading/error states
  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-gray-700">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading WBS data...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center py-10 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" /> {error}
      </div>
    );

  // ✅ Render table
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Work Breakdown Structure (WBS)
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            Total Items:{" "}
            <span className="font-semibold text-gray-700">
              {wbsList.length}
            </span>
          </p>
        </div>
        <div>
          <Button onClick={() => setShowFetchTemplate(true)}>
            Add New Line Item
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={wbsData}
        onRowClick={handleRowClick}
        detailComponent={({ row, close }) => (
          <GetWBSByID
            projectId={projectId}
            id={row.id || row.fabId || ""}
            stage={row.stage || ""}
            onClose={close}
            initialData={row}
          />
        )}
        searchPlaceholder="Search WBS by name or type..."
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* ✅ Modal for WBS Details */}
      {selectedWBS && (
        <GetWBSByID
          projectId={projectId}
          id={selectedWBS.id || selectedWBS.fabId || ""}
          stage={selectedWBS.stage || ""}
          initialData={selectedWBS}
          onClose={() => setSelectedWBS(null)}
        />
      )}

      {/* ✅ Modal for Fetching WBS Templates */}
      {showFetchTemplate && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <FetchWBSTemplate
              id={id}
              onClose={() => setShowFetchTemplate(false)}
              onSelect={() => {
                setShowFetchTemplate(false);
                fetchAllWBS(); // Refresh the list after selection
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWBS;
