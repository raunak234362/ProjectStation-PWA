import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CoTableView from "./CoTableView";
import Service from "../../api/Service";
import { isMergedCellValue } from "../../utils/coTableUtils";

const CoTablePage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const encodedData = params.get("coData");
  const id = params.get("id");
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(Boolean(id));

  let co: any = null;

  if (encodedData) {
    try {
      co = JSON.parse(encodedData);
    } catch (e) {
      console.error("Failed to parse coData", e);
    }
  }

  if (!co && id) {
    const sessionData = sessionStorage.getItem(`coTableData_${id}`);
    if (sessionData) {
      try {
        co = JSON.parse(sessionData);
      } catch (e) {
        console.error("Failed to parse session data", e);
      }
    }
  }

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchTableRows = async () => {
      try {
        const response = await Service.GetAllCOTableRows(id);
        const rows = Array.isArray(response)
          ? response
          : response?.data?.data || response?.data || [];
        setTableRows(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error("Failed to fetch change order table:", error);
        setTableRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTableRows();
  }, [id]);

  if (!co) {
    return <div className="p-6 text-red-500">No Change Order data found</div>;
  }

  const rows = tableRows.length > 0
    ? tableRows
    : co.CoRefersTo || co.changeOrderTables || [];

  const totalQty = rows.reduce((s: number, r: any) => s + (isMergedCellValue(r.QtyNo) ? 0 : Number(r.QtyNo) || 0), 0);
  const totalHours = rows.reduce((s: number, r: any) => s + (isMergedCellValue(r.hours) ? 0 : Number(r.hours) || 0), 0);
  const totalCost = rows.reduce((s: number, r: any) => s + (isMergedCellValue(r.cost) ? 0 : Number(r.cost) || 0), 0);

  if (loading) {
    return <div className="p-6 text-center text-green-600">Loading table data...</div>;
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl  text-green-700">
              Change Order Reference Table
            </h1>
            <p className="text-sm text-gray-700">
              COR - {co.changeOrderNumber?.slice(-3)}
            </p>
          </div>

          <span className="px-4 py-1 text-sm rounded-full bg-green-100 text-green-700 font-semibold">
            Read Only
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Total Quantity" value={totalQty} />
          <SummaryCard label="Total Hours" value={`${totalHours} hrs`} />
          <SummaryCard label="Total Cost" value={`$${totalCost}`} />
        </div>

        {/* Table */}
        <CoTableView rows={rows} />

        {/* Footer */}
        <div className="text-xs text-gray-400 text-center pt-4">
          This table is auto-generated from the Change Order and is read-only.
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white rounded-xl shadow-sm border p-4">
    <p className="text-xs uppercase text-gray-700 font-semibold">{label}</p>
    <p className="text-2xl  text-gray-700 mt-1">{value}</p>
  </div>
);

export default CoTablePage;
