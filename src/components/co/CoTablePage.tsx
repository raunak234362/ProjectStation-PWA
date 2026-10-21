import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import CoTableView from "./CoTableView";
import Service from "../../api/Service";
import { getCOTableRowSpan, isMergedCellValue } from "../../utils/coTableUtils";

const CoTablePage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const encodedData = params.get("coData");
  const id = params.get("id");
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [exportingPdf, setExportingPdf] = useState(false);

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

  const downloadPdf = () => {
    if (exportingPdf) return;
    setExportingPdf(true);

    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const margin = 32;
      const corNumber = `COR-${co.changeOrderNumber?.slice(-3) || "—"}`;
      const columns = [
        { title: "#", field: "index" },
        { title: "Description", field: "description" },
        { title: "Reference", field: "referenceDoc" },
        { title: "Elements", field: "elements" },
        { title: "Qty", field: "QtyNo" },
        { title: "Hours", field: "hours" },
        { title: "Cost ($)", field: "cost" },
        { title: "Remarks", field: "remarks" },
      ];
      const remainingRowSpans = Array(columns.length).fill(0);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(70, 145, 45);
      pdf.text("Change Order Reference Table", margin, 30);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(70, 70, 70);
      pdf.text(corNumber, margin, 46);

      autoTable(pdf, {
        startY: 58,
        margin: { left: margin, right: margin },
        head: [["Total Quantity", "Total Hours", "Total Cost ($)"]],
        body: [[String(totalQty), String(totalHours), `$${totalCost.toLocaleString()}`]],
        theme: "grid",
        headStyles: { fillColor: [241, 245, 249], textColor: [35, 45, 60], fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 6, textColor: [35, 45, 60] },
      });

      const body = rows.map((row: any, rowIndex: number) => {
        const cells: any[] = [];
        columns.forEach(({ field }, columnIndex) => {
          if (remainingRowSpans[columnIndex] > 0) {
            remainingRowSpans[columnIndex] -= 1;
            return;
          }

          if (field === "index") {
            cells.push(String(rowIndex + 1));
            return;
          }

          const value = row[field];
          if (isMergedCellValue(value)) {
            cells.push("");
            return;
          }

          const rowSpan = getCOTableRowSpan(rows, rowIndex, field);
          if (rowSpan > 1) remainingRowSpans[columnIndex] = rowSpan - 1;
          cells.push({
            content: field === "cost" ? `$${value ?? 0}` : String(value ?? "—"),
            rowSpan,
          });
        });
        return cells;
      });

      autoTable(pdf, {
        startY: (pdf as any).lastAutoTable.finalY + 14,
        margin: { left: margin, right: margin },
        head: [columns.map(({ title }) => title)],
        body,
        theme: "grid",
        headStyles: { fillColor: [241, 245, 249], textColor: [35, 45, 60], fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak", valign: "middle", textColor: [25, 25, 25] },
        columnStyles: {
          0: { cellWidth: 28, halign: "center" },
          1: { cellWidth: 150 },
          2: { cellWidth: 120 },
          3: { cellWidth: 120 },
          4: { cellWidth: 48, halign: "center" },
          5: { cellWidth: 48, halign: "center" },
          6: { cellWidth: 62, halign: "right" },
        },
      });

      const safeCorNumber = corNumber.replace(/[^\w.-]+/g, "_");
      pdf.save(`${safeCorNumber}_Reference_Table.pdf`);
    } catch (error) {
      console.error("Failed to export change order table PDF:", error);
      window.alert("Failed to download the PDF. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

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

          <div className="flex items-center gap-3">
            <span className="px-4 py-1 text-sm rounded-full bg-green-100 text-green-700 font-semibold">
              Read Only
            </span>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={exportingPdf}
              className="inline-flex items-center gap-2 border border-green-700 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-100 disabled:cursor-wait disabled:opacity-60"
            >
              {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exportingPdf ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>
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
