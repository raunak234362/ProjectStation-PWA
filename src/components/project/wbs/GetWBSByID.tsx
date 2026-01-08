/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Layers,
  ListChecks,
  Clock,
  X,
  Pencil,
  Check,
  XCircle,
} from "lucide-react";
import Service from "../../../api/Service";
import type { WBSData, LineItem } from "../../../interface";

const GetWBSByID = ({
  id,
  projectId,
  stage,
  onClose,
  initialData,
}: {
  id: string;
  projectId: string;
  stage: string;
  onClose?: () => void;
  initialData?: any;
}) => {
  const wbsData = initialData || null;
  const [wbs, setWbs] = useState<WBSData | null>(wbsData);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    qtyNo: number;
    unitTime: number;
    checkUnitTime: number;
  }>({ qtyNo: 0, unitTime: 0, checkUnitTime: 0 });

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  const canEditTime = userRole === "admin" || userRole === "deputy_manager";
console.log("WBS Data:", wbsData);

  useEffect(() => {
    if (id) fetchWBSById(id);
  }, [id, projectId, stage]);

  const fetchWBSById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await Service.GetWBSLineItemById(projectId, id, stage);
      console.log("WBS Detail Response:", response);
      // Handle potential different response structures from the new endpoint
      if (response && response.data) {
        setLineItems(response.data || []);
      } else if (response && Array.isArray(response.data)) {
        // If it returns { lineItems: [...] } but no wbs metadata, we might need to handle it
        // For now assume it has the metadata or it's the old structure
        setWbs(response);
      } else {
        setWbs(response || null);
      }
    } catch (err: any) {
      console.error("Error fetching WBS:", err);
      setError("Failed to load WBS details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: LineItem) => {
    setEditingId(item.id);
    setEditValues({
      qtyNo: item.qtyNo || 0,
      unitTime: item.unitTime || 0,
      checkUnitTime: item.checkUnitTime || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ qtyNo: 0, unitTime: 0, checkUnitTime: 0 });
  };

  const handleSaveLineItem = async (lineItemId: string) => {
    const item = lineItems.find((i) => i.id === lineItemId);
    if (!item) return;

    const { qtyNo, unitTime, checkUnitTime } = editValues;
    const checkHr = checkUnitTime * qtyNo;
    const execHr = unitTime * qtyNo;

    try {
      await Service.UpdateWBSLineItem(projectId, lineItemId, {
        qtyNo,
        unitTime,
        checkUnitTime,
        checkHr,
        execHr,
      });
      // Refresh data
      await fetchWBSById(id);
      setEditingId(null);
    } catch (err) {
      console.error("Error updating line item:", err);
    }
  };

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  if (loading && !wbs)
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 border border-white/20">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
            <Loader2 className="w-6 h-6 text-green-600 absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="text-green-900 font-medium animate-pulse">
            Fetching WBS details...
          </p>
        </div>
      </div>
    );

  if (error || !wbs)
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-700">Oops!</h3>
          <p className="text-gray-700">{error || "WBS data not found"}</p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            Close Window
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-green-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-700 tracking-tight">
                {wbsData.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                  {wbsData.type}
                </span>
                <span className="text-gray-400 text-xs">•</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Summary Grid */}
      
           

            <div className="bg-gray-900 rounded-2xl p-2 text-white shadow-xl shadow-gray-200 flex flex-col justify-between">
              <div>
                 <DetailCard
              label="Stage"
              value={wbsData.stage}
              icon={<Layers className="w-4 h-4" />}
            />
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-1">
                  Total Quantity
                </p>
                <h3 className="text-2xl font-bold text-white">
                  {wbsData.totalQtyNo || 0}
                </h3>
              </div>
              <div className="pt-4 border-t border-gray-800 mt-4 flex justify-between items-end">
                <div>
                  <p className="text-gray-700 text-[10px] uppercase font-bold">
                    Last Updated
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatDate(wbsData.updatedAt)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </div>
       

          {/* Hours Overview */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-700">
                Hours Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Execution Hours"
                value={wbsData.totalExecHr}
                subValue={wbsData.execHrWithRework}
                subLabel="w/ Rework"
                color="green"
              />
              <StatCard
                label="Checking Hours"
                value={wbsData.totalCheckHr}
                subValue={wbsData.checkHrWithRework}
                subLabel="w/ Rework"
                color="indigo"
              />
              <StatCard
                label="Total Hours"
                value={(wbsData.totalExecHr || 0) + (wbsData.totalCheckHr || 0)}
                color="gray"
              />
              <StatCard
                label="Rework Total"
                value={
                  (wbsData.execHrWithRework || 0) +
                  (wbsData.checkHrWithRework || 0)
                }
                color="red"
              />
            </div>
          </section>

          {/* Line Items Table */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-700">Line Items</h3>
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full">
                  {lineItems?.length || 0} Items
                </span>
                {loading && (
                  <Loader2 className="w-4 h-4 text-green-600 animate-spin ml-2" />
                )}
              </div>
            </div>

            {lineItems && lineItems.length > 0 ? (
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 border-b border-gray-100">#</th>
                      <th className="px-6 py-4 border-b border-gray-100">
                        Description
                      </th>
                      <th className="px-6 py-4 border-b border-gray-100 text-center">
                        Qty
                      </th>
                      {canEditTime && (
                        <>
                          <th className="px-6 py-4 border-b border-gray-100 text-center">
                            Exec Unit
                          </th>
                          <th className="px-6 py-4 border-b border-gray-100 text-center">
                            Check Unit
                          </th>
                        </>
                      )}
                      <th className="px-6 py-4 border-b border-gray-100 text-center">
                        Exec Total
                      </th>
                      <th className="px-6 py-4 border-b border-gray-100 text-center">
                        Check Total
                      </th>
                      <th className="px-6 py-4 border-b border-gray-100 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lineItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="group hover:bg-green-50/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-700 line-clamp-2">
                            {item.description}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Updated:{" "}
                            {item.updatedAt ? formatDate(item.updatedAt) : "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {editingId === item.id ? (
                            <input
                              type="number"
                              value={editValues.qtyNo}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  qtyNo: Number(e.target.value),
                                })
                              }
                              className="w-16 h-8 text-center border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md">
                              {item.qtyNo ?? 0}
                            </span>
                          )}
                        </td>
                        {canEditTime && (
                          <>
                            <td className="px-6 py-4 text-center">
                              {editingId === item.id ? (
                                <input
                                  type="number"
                                  value={editValues.unitTime}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      unitTime: Number(e.target.value),
                                    })
                                  }
                                  className="w-16 h-8 text-center border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                />
                              ) : (
                                <span className="text-sm text-gray-700 font-medium">
                                  {item.unitTime ?? 0}h
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {editingId === item.id ? (
                                <input
                                  type="number"
                                  value={editValues.checkUnitTime}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      checkUnitTime: Number(e.target.value),
                                    })
                                  }
                                  className="w-16 h-8 text-center border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                />
                              ) : (
                                <span className="text-sm text-gray-700 font-medium">
                                  {item.checkUnitTime ?? 0}h
                                </span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-gray-700">
                            {(item.execHr ?? 0).toFixed(1)}h
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-gray-700">
                            {(item.checkHr ?? 0).toFixed(1)}h
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {editingId === item.id ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleSaveLineItem(item.id)}
                                className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                  <ListChecks className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-700 font-medium">
                  No line items found for this WBS.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer Section */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
          <button className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
            Download Report
          </button>
          <button className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-100">
            Add Quantity
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
}) => (
  <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-700">{value || "—"}</p>
    </div>
  </div>
);

const StatCard = ({
  label,
  value,
  subValue,
  subLabel,
  color,
}: {
  label: string;
  value: number | string;
  subValue?: number | string;
  subLabel?: string;
  color: "green" | "indigo" | "gray" | "red";
}) => {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    gray: "bg-gray-50 text-gray-700 border-gray-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div
      className={`p-5 rounded-2xl border ${colors[color]} flex flex-col justify-between h-full`}
    >
      <div>
        <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider mb-2">
          {label}
        </p>
        <p className="text-2xl font-black tracking-tight">{value ?? 0}h</p>
      </div>
      {subValue !== undefined && (
        <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between">
          <span className="text-[9px] uppercase font-bold opacity-60">
            {subLabel}
          </span>
          <span className="text-xs font-bold">{subValue}h</span>
        </div>
      )}
    </div>
  );
};

export default GetWBSByID;
