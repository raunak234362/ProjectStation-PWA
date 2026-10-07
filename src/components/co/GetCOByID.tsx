import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Service from "../../api/Service";
import type { ChangeOrderItem } from "../../interface";
import { AlertCircle, Loader2, History, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import RenderFiles from "../ui/RenderFiles";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../ui/table";
import CoResponseModal from "./CoResponseModal";
import COResponseDetailsModal from "./CoResponseDetailsModal";
import { getCOTableRowSpan, isMergedCellValue } from "../../utils/coTableUtils";

/* -------------------- Small UI Helper -------------------- */
const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <h4 className="text-sm text-gray-700">{label}</h4>
    <div className="text-gray-700 font-medium">{value}</div>
  </div>
);

/* -------------------- Props -------------------- */
interface GetCOByIDProps {
  id: string;
  projectId?: string;
  onClose?: () => void;
}

/* ========================================================= */
/* ======================= COMPONENT ======================= */
/* ========================================================= */

const GetCOByID = ({ id, projectId, onClose }: GetCOByIDProps) => {
  /* -------------------- STATE (ALL HOOKS AT TOP) -------------------- */
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [co, setCO] = useState<ChangeOrderItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [responses, setResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const userRole = sessionStorage.getItem("userRole");
  console.log(id);

  const effectiveProjectId =
    projectId ||
    (typeof co?.project === "string"
      ? co.project
      : (co?.project as any)?.id ||
        (co as any)?.projectId ||
        (co as any)?.project_id);

  const sortedVersions = useMemo(() => {
    if (!co?.versions) return [];
    return [...co.versions].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [co?.versions]);

  const isClientRole = userRole === "CLIENT" || userRole === "CLIENT_ADMIN";
  const hasMultipleVersions = sortedVersions.length > 1 && !isClientRole;

  const currentVersion = useMemo(() => {
    if (!co) return null;
    const targetId = viewingVersionId || co.currentVersionId;
    return (
      co.versions?.find((v) => v.id === targetId) ||
      sortedVersions[0] ||
      co
    );
  }, [co, sortedVersions, viewingVersionId]);

  const isViewingCurrent = useMemo(() => {
    return currentVersion?.id === co?.currentVersionId || (!co?.versions?.length);
  }, [currentVersion, co]);

  /* -------------------- EXTRACT RESPONSES HELPER -------------------- */
  const extractResponsesArray = (res: any): any[] => {
    if (!res) return [];
    if (typeof res === "string") {
      try {
        const parsed = JSON.parse(res);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.responses)) return res.responses;
    if (Array.isArray(res.data?.responses)) return res.data.responses;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (typeof res === "object" && res !== null) {
      const arrayVal = Object.values(res).find((v) => Array.isArray(v));
      if (Array.isArray(arrayVal)) return arrayVal as any[];

      // In case res is an object with numerical keys: { 0: { id: "..." }, status: "success" }
      const items = Object.values(res).filter(
        (v: any) => v && typeof v === "object" && (v.id || v.CoId || v.description)
      );
      if (items.length > 0) return items;
    }
    return [];
  };

  /* -------------------- FETCH CO RESPONSES -------------------- */
  const fetchCOResponses = async (targetCoId: string, fallbackCoResponses?: any) => {
    if (!targetCoId) return;
    try {
      setLoadingResponses(true);
      console.log("[GetCOByID] Fetching responses for changeOrderId:", targetCoId);
      const res = await Service.GetChangeOrderResponseById(targetCoId);
      const fetched = extractResponsesArray(res);
      console.log("[GetCOByID] Responses fetched successfully:", fetched);
      setResponses(fetched);
    } catch (err) {
      console.error("Failed to fetch CO responses:", err);
      // Fallback to coResponses in Change Order if available
      const rawFallback = fallbackCoResponses ?? co?.coResponses;
      if (rawFallback) {
        try {
          const fallback = Array.isArray(rawFallback)
            ? rawFallback
            : JSON.parse(rawFallback);
          setResponses(fallback || []);
        } catch {
          setResponses([]);
        }
      }
    } finally {
      setLoadingResponses(false);
    }
  };

  /* -------------------- FETCH CO -------------------- */
  const fetchCO = async () => {
    try {
      setLoading(true);

      const response = await Service.GetChangeOrderById(id);
      console.log("GetChangeOrderById response:", response);

      const coData = response?.data?.data || response?.data || response;
      if (!coData || typeof coData !== "object" || !coData.id) {
        setError("Change Order not found");
        return;
      }

      setCO(coData);
      if (coData.currentVersionId) {
        setViewingVersionId(coData.currentVersionId);
      }

      // Technique: Once change order is fetched, fetch the responses using the resolved changeOrderId
      const changeOrderId = coData.id || id;
      await fetchCOResponses(changeOrderId, coData.coResponses);
    } catch (err) {
      console.error(err);
      setError("Failed to load Change Order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedResponse && responses.length > 0) {
      const updated = responses.find((r: any) => r.id === selectedResponse.id);
      if (updated) setSelectedResponse(updated);
    }
  }, [responses]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      const targetUrl = window.location.pathname + window.location.search;
      navigate(`/?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }
    if (id) {
      fetchCO();
    }
  }, [id, navigate]);

  /* -------------------- EARLY RETURNS -------------------- */
  if (loading || error || !co) {
    return createPortal(
      <div className="project-component-container fixed inset-0 z-9999 flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span className="text-gray-700">Loading Change Order details...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600">{error || "Change Order not found"}</span>
              <button
                onClick={onClose}
                className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>,
      document.body
    );
  }

  const handleDownloadPDF = () => {
    if (exportingPdf) return;

    try {
      setExportingPdf(true);
      toast.info("Generating Change Order PDF...");

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const primaryColor: [number, number, number] = [107, 189, 69];
      const textColor: [number, number, number] = [30, 30, 30];
      const lightBg: [number, number, number] = [248, 250, 252];
      const left = 14;
      const contentWidth = 269;
      let currentY = 15;

      const cleanText = (value: unknown) => {
        if (value === undefined || value === null || value === "") return "—";
        const html = String(value)
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/(p|div|li)>/gi, "\n")
          .replace(/&nbsp;/gi, " ");
        const parsed = new DOMParser().parseFromString(html, "text/html");
        return (parsed.body.textContent || "").trim() || "—";
      };
      const formatDate = (value?: string) => value
        ? new Date(value).toLocaleString()
        : "—";
      const addSection = (title: string) => {
        if (currentY > 180) {
          doc.addPage();
          currentY = 15;
        }
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), left, currentY);
        currentY += 4;
      };
      const runTable = (options: Parameters<typeof autoTable>[1]) => {
        autoTable(doc, options);
        currentY = (doc as any).lastAutoTable.finalY + 8;
      };

      const projectName = (co as any).Project?.name || (co as any).project?.name || (co as any).projectName || "—";
      const corNumber = `COR-${co.changeOrderNumber?.slice(-3) || "—"}`;
      const sender = (co as any).senders || (co as any).sender;
      const recipient = (co as any).Recipients || co.recipients || (co as any).recipient;
      const personName = (person: any) => person
        ? [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ").trim() || person.username || "—"
        : "—";
      const status = co.isAproovedByAdmin === true
        ? "Approved"
        : co.isAproovedByAdmin === false
          ? "Rejected"
          : "Pending";
      const description = currentVersion?.description || co.description;
      const remarks = currentVersion?.remarks || co.remarks;
      const tableRows = currentVersion?.changeOrderTables || currentVersion?.CoRefersTo || co.CoRefersTo || co.changeOrderTables || [];
      const filesValue = currentVersion?.files || (currentVersion as any)?.file || co.files || [];
      const files = Array.isArray(filesValue) ? filesValue : filesValue ? [filesValue] : [];
      const flattenResponses = (items: any[]): any[] => items.flatMap((item) => [
        item,
        ...(Array.isArray(item.childResponses) ? flattenResponses(item.childResponses) : []),
      ]);
      const coResponses = flattenResponses(responses);

      doc.setFillColor(...primaryColor);
      doc.rect(left, currentY, contentWidth, 16, "F");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(`CHANGE ORDER DETAILS - ${projectName}`, left + 6, currentY + 10, { maxWidth: contentWidth - 12 });
      currentY += 22;

      addSection("General Information");
      runTable({
        body: [
          ["COR No.", corNumber, "Created At", formatDate(co.createdAt || co.date)],
          ["Project", projectName, "Status", status],
          ["Sender", personName(sender), "Recipient", personName(recipient)],
          ["Version", String(currentVersion?.versionNumber || "—"), "Version Date", formatDate(currentVersion?.createdAt)],
        ],
        startY: currentY,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3, textColor },
        columnStyles: {
          0: { cellWidth: 28, fontStyle: "bold", fillColor: lightBg },
          1: { cellWidth: 107 },
          2: { cellWidth: 28, fontStyle: "bold", fillColor: lightBg },
          3: { cellWidth: 106 },
        },
      });

      if (remarks && cleanText(remarks) !== "—") {
        addSection("Remarks");
        runTable({
          body: [[cleanText(remarks)]],
          startY: currentY,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 4, textColor },
        });
      }

      if (description && cleanText(description) !== "—") {
        addSection("Description");
        runTable({
          body: [[cleanText(description)]],
          startY: currentY,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 4, textColor },
        });
      }

      if (Array.isArray(tableRows) && tableRows.length > 0) {
        addSection("Change Order Reference Table");
        const fields = [
          { title: "#", field: "index" },
          { title: "Description", field: "description" },
          { title: "Reference", field: "referenceDoc" },
          { title: "Elements", field: "elements" },
          { title: "Qty", field: "QtyNo" },
          { title: "Hours", field: "hours" },
          { title: "Cost ($)", field: "cost" },
          { title: "Remarks", field: "remarks" },
        ];
        const remainingRowSpans = Array(fields.length).fill(0);
        const body = tableRows.map((row: any, rowIndex: number) => {
          const cells: any[] = [];
          fields.forEach(({ field }, columnIndex) => {
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
            const rowSpan = getCOTableRowSpan(tableRows, rowIndex, field);
            if (rowSpan > 1) remainingRowSpans[columnIndex] = rowSpan - 1;
            cells.push({
              content: field === "cost" ? `$${value ?? 0}` : cleanText(value),
              rowSpan,
            });
          });
          return cells;
        });
        runTable({
          startY: currentY,
          head: [fields.map(({ title }) => title)],
          body,
          theme: "grid",
          headStyles: { fillColor: lightBg, textColor, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak", valign: "middle", textColor },
          columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 68 },
            2: { cellWidth: 43 },
            3: { cellWidth: 45 },
            4: { cellWidth: 18, halign: "center" },
            5: { cellWidth: 20, halign: "center" },
            6: { cellWidth: 24, halign: "right" },
            7: { cellWidth: 41 },
          },
        });
      }

      if (files.length > 0) {
        addSection(`Attachments (${files.length})`);
        runTable({
          head: [["#", "File Name", "Link"]],
          body: files.map((file: any, index: number) => [
            String(index + 1),
            file.originalName || file.filename || file.name || `File ${index + 1}`,
            file.url || file.link || "—",
          ]),
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak", textColor },
          columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 90 }, 2: { cellWidth: 167 } },
        });
      }

      if (coResponses.length > 0) {
        addSection(`Responses (${coResponses.length})`);
        runTable({
          head: [["#", "From", "Date", "Status", "Response"]],
          body: coResponses.map((response: any, index: number) => {
            const user = response.user || response.createdBy;
            const role = String(response.createdByRole || response.userRole || "").toUpperCase();
            const from = role.includes("CLIENT")
              ? "Client"
              : personName(user) !== "—"
                ? personName(user)
                : "WBT Team";
            return [
              String(index + 1),
              from,
              formatDate(response.createdAt || response.date),
              response.status || response.Status || response.wbtStatus || "—",
              cleanText(response.description || response.reason),
            ];
          }),
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak", textColor },
          columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 45 }, 2: { cellWidth: 42 }, 3: { cellWidth: 30 }, 4: { cellWidth: 140 } },
        });
      }

      const safeCorNumber = corNumber.replace(/[^\w.-]+/g, "_");
      doc.save(`${safeCorNumber}_Change_Order.pdf`);
      toast.success("Change Order PDF downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate Change Order PDF:", err);
      toast.error("Failed to generate Change Order PDF");
    } finally {
      setExportingPdf(false);
    }
  };

  /* -------------------- RESPONSE TABLE COLUMNS -------------------- */
  const responseColumns: ColumnDef<any>[] = [
    {
      id: "from",
      header: "From",
      cell: ({ row }) => {
        const u = row.original.user;
        const fullName = u
          ? [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ").trim() ||
            [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
            u.username ||
            u.name
          : null;

        const role = row.original.createdByRole || row.original.userRole;
        const roleFallback =
          role === "CLIENT" || role === "CLIENT_ADMIN"
            ? "Client"
            : role
            ? "WBT Team"
            : "—";

        const displayName = fullName || row.original.username || row.original.userName || roleFallback;

        return (
          <span className="font-medium text-sm text-black">
            {displayName}
          </span>
        );
      },
    },
    {
      id: "message",
      header: "Message",
      cell: ({ row }) => (
        <p className="truncate max-w-[220px] text-gray-700">
          {row.original.description || row.original.reason || "—"}
        </p>
      ),
    },
    {
      accessorKey: "files",
      header: "Files",
      cell: ({ row }) => {
        const count = row.original.files?.length ?? 0;
        return count > 0 ? (
          <span className="text-black font-medium">{count} file(s)</span>
        ) : (
          <span className="text-gray-400">—</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-gray-700 text-sm">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.Status || row.original.status || "—";
        const colorMap: Record<string, string> = {
          NOT_REPLIED: "bg-amber-50 text-amber-800 border-amber-200",
          PENDING: "bg-amber-50 text-amber-800 border-amber-200",
          APPROVED: "bg-[#6bbd45]/15 text-black border-[#6bbd45]/30 font-black",
          REJECTED: "bg-red-50 text-red-800 border-red-200",
          COMPLETED: "bg-[#6bbd45]/15 text-black border-[#6bbd45]/30 font-black",
        };
        const stKey = typeof st === "string" ? st.toUpperCase() : "";
        return (
          <span
            className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-widest border whitespace-nowrap shadow-2xs ${
              colorMap[stKey] || "bg-gray-50 text-black border-gray-200"
            }`}
          >
            {typeof st === "string" ? st.replace(/_/g, " ") : "—"}
          </span>
        );
      },
    },
  ];

  /* ======================= RENDER ======================= */
  return createPortal(
    <div className="project-component-container fixed inset-0 z-9999 flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50/50">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <span className="w-2 h-6 bg-[#6bbd45] rounded-full"></span>
            Change Order Details
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={exportingPdf}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#6bbd45] text-white rounded-lg hover:bg-[#5aa838] transition-all font-bold text-sm uppercase tracking-tight shadow-sm disabled:cursor-wait disabled:opacity-60"
            >
              {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exportingPdf ? "Generating PDF..." : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
            >
              CLOSE
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white space-y-6">
          {/* ================= VERSION SWITCHER (TOP) ================= */}
          {hasMultipleVersions && (
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-black text-black uppercase tracking-tight">
                  Versions
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {sortedVersions.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setViewingVersionId(v.id)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${viewingVersionId === v.id
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    v{v.versionNumber || sortedVersions.length - idx}
                    {v.id === co.currentVersionId && " (Current)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {/* ================= LEFT: CO DETAILS ================= */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                    COR - {co.changeOrderNumber?.slice(-3)}
                  </h1>
                  {isClientRole && sortedVersions.length > 1 && (
                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-lg border border-yellow-300 uppercase tracking-widest shadow-sm">
                      Latest Update
                    </span>
                  )}
                </div>

                <span
                  className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-gray-100 text-black border border-gray-200"
                >
                  {co.isAproovedByAdmin === true
                    ? "Approved"
                    : co.isAproovedByAdmin === false
                      ? "Rejected"
                      : "Pending"}
                </span>
              </div>

              <Info
                label="Sender"
                value={
                  co.senders
                    ? `${co.senders.firstName ?? ""} ${co.senders.lastName ?? ""}`
                    : "—"
                }
              />

              <Info
                label="Recipient"
                value={
                  (co as any).Recipients || co.recipients
                    ? `${((co as any).Recipients || co.recipients).firstName ?? ""} ${((co as any).Recipients || co.recipients).lastName ?? ""}`.trim() || "—"
                    : "—"
                }
              />

              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Remarks</h4>
                <div
                  className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700 min-h-[50px]"
                  dangerouslySetInnerHTML={{ __html: co.currentVersion?.remarks || co.remarks || "—" }}
                />
              </div>
                <div className="pt-4 border-t flex items-center gap-5">
                  <h4 className="font-semibold text-gray-700 mb-1">Please click here to view the table</h4>
                {isViewingCurrent ? (
                  <button
                    onClick={() => {
                      const data = {
                        id: co.id,
                        changeOrderNumber: co.changeOrderNumber,
                        serialNo: co.serialNo,
                        CoRefersTo: currentVersion?.changeOrderTables || currentVersion?.CoRefersTo || co?.CoRefersTo || [],
                      };
                      sessionStorage.setItem(`coTableData_${co.id}`, JSON.stringify(data));
                      window.open(`/co-table?id=${co.id}`, "_blank");
                    }}
                    className="text-black text-md cursor-pointer font-bold uppercase tracking-tight bg-green-200 border border-green-600 px-2 py-1.5 hover:bg-green-300 transition-all text-sm"
                  >
                    View Change Order Reference Table
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Table view is only available for the current version.
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                <div
                  className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700 min-h-[50px]"
                  dangerouslySetInnerHTML={{ __html: co.currentVersion?.description || co.description || "—" }}
                />
              </div>

              <RenderFiles
                files={currentVersion?.files || co.files || []}
                table="changeOrders"
                parentId={co.id}
                versionId={currentVersion?.id || co.currentVersionId}
              />

            
            </div>

            {/* RESPONSES SECTION */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-black uppercase tracking-tight">
                  Responses
                </h2>

                {isClientRole && (
                  <button
                    type="button"
                    className="px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
                    onClick={() => setShowResponseModal(true)}
                  >
                    + ADD RESPONSE
                  </button>
                )}
              </div>

              {loadingResponses ? (
                <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                  <span className="text-sm font-medium">Loading responses...</span>
                </div>
              ) : responses.length > 0 ? (
                <DataTable
                  columns={responseColumns}
                  data={responses}
                  pageSizeOptions={[5, 10]}
                  onRowClick={(row) => setSelectedResponse(row)}
                />
              ) : (
                <p className="text-gray-700 italic">No responses yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ================= MODALS ================= */}
        {showResponseModal && (
          <CoResponseModal
            CoId={co?.id || id}
            projectId={effectiveProjectId}
            currentVersionId={co.currentVersionId}
            onClose={() => setShowResponseModal(false)}
            onSuccess={fetchCO}
          />
        )}

        {selectedResponse && (
          <COResponseDetailsModal
            response={selectedResponse}
            projectId={effectiveProjectId}
            onClose={() => setSelectedResponse(null)}
            onSuccess={fetchCO}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default GetCOByID;
