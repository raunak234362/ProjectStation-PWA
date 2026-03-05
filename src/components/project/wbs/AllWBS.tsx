/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, AlertCircle } from "lucide-react";
import DataTable from "../../ui/table";
import Service from "../../../api/Service";
import GetWBSByID from "./GetWBSByID";
import { Button } from "../../ui/button";
import FetchWBSTemplate from "./FetchWBSTemplate";

import { useDispatch } from "react-redux";
import { setWBSForProject } from "../../../store/wbsSlice";

const AllWBS = ({ id, stage }: { id: string; stage: string }) => {
  const dispatch = useDispatch();
  const [wbsBundles, setWbsBundles] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWBS, setSelectedWBS] = useState<any | null>(null);
  const [showFetchTemplate, setShowFetchTemplate] = useState(false);
  const projectId = id;

  // ✅ Fetch all WBS items
  const fetchAllWBS = async () => {
    console.log("fetchAllWBS called for project:", projectId, "stage:", stage);
    try {
      setLoading(true);
      setError(null);

      const wbsBundlesResponse = await Service.GetBundleByProjectId(projectId);

      const sortOrderMap: Record<string, number> = {
        MAIN_STEEL_PLACEMENT: 1,
        MAIN_STEEL_CONNECTION: 2,
        "MISC.STEEL_PLACEMENT_&_CONNECTION": 3,
        ERECTION_OF_MAIN_STEEL: 4,
        ERECTION_OF_MISC_STEEL: 5,
        DETAILING_OF_MAIN_STEEL: 6,
        DETAILING_OF_MISC_STEEL: 7,
        OTHERS: 8,
      };

      const sortedBundles = (wbsBundlesResponse.data || []).sort(
        (a: any, b: any) => {
          const keyA = a.bundleKey || a.bundle?.bundleKey;
          const keyB = b.bundleKey || b.bundle?.bundleKey;
          const orderA = sortOrderMap[keyA] || 99;
          const orderB = sortOrderMap[keyB] || 99;
          return orderA - orderB;
        },
      );

      setWbsBundles(sortedBundles);
      console.log("Fetched WBS Bundle:", sortedBundles);
      dispatch(setWBSForProject({ projectId, wbs: sortedBundles }));
    } catch (err) {
      console.error("Error fetching WBS:", err);
      setError("Failed to load WBS data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWBS();
  }, [id, stage]);

  const formatTime = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return "00:00";
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // ✅ Define table columns for bundles
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "bundleKey",
      header: "Bundle Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-700">
          {row.original.name ||
            row.original.bundle?.name ||
            row.original.bundleKey ||
            "—"}
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
      accessorKey: "totalQtyNo",
      header: "Total Quantity",
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.totalQtyNo || 0}</span>
      ),
    },
    {
      accessorKey: "totalExecHr",
      header: "Total Exec Hrs",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {formatTime(row.original.totalExecHr)} hrs
        </span>
      ),
    },
    {
      accessorKey: "totalCheckHr",
      header: "Total Check Hrs",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {formatTime(row.original.totalCheckHr)} hrs
        </span>
      ),
    },
  ];

  // ✅ Handle row click — open details
  const handleRowClick = (row: any) => {
    setSelectedWBS(row);
  };

  // ✅ Render loading/error states
  const totalExecHrsSum =
    wbsBundles?.reduce(
      (acc: number, curr: any) => acc + (curr.totalExecHr || 0),
      0,
    ) || 0;
  const totalCheckHrsSum =
    wbsBundles?.reduce(
      (acc: number, curr: any) => acc + (curr.totalCheckHr || 0),
      0,
    ) || 0;

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
          <div className="flex gap-4 text-sm text-gray-700 mb-4">
            <p>
              Total Bundles:{" "}
              <span className="font-semibold text-gray-700">
                {wbsBundles?.length || 0}
              </span>
            </p>
            <p>
              Total Exec Hrs:{" "}
              <span className="font-semibold text-emerald-600">
                {formatTime(totalExecHrsSum)} hrs
              </span>
            </p>
            <p>
              Total Check Hrs:{" "}
              <span className="font-semibold text-emerald-600">
                {formatTime(totalCheckHrsSum)} hrs
              </span>
            </p>
          </div>
        </div>
        <div>
          <Button onClick={() => setShowFetchTemplate(true)}>
            Add New Bundle
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={wbsBundles || []}
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
