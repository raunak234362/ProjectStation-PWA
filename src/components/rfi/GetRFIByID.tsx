import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../api/Service";
import type { RFIItem } from "../../interface";
import { AlertCircle, Loader2, Download } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useSelector } from "react-redux";
import DataTable from "../ui/table";
import Button from "../fields/Button";
import RenderFiles from "../ui/RenderFiles";
import RFIResponseModal from "./RFIResponseModal";
import RFIResponseDetailsModal from "./RFIResponseDetailsModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

const formatDate = (dateStr: any) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr: any) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <h4 className="text-sm text-gray-700">{label}</h4>
    <div className="text-gray-700 font-medium">{value}</div>
  </div>
);

interface GetRFIByIDProps {
  id: string;
  onClose?: () => void;
}

const GetRFIByID = ({ id, onClose }: GetRFIByIDProps) => {
  const [loading, setLoading] = useState(true);
  const [rfi, setRfi] = useState<RFIItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  const users = useSelector((state: any) => state.userInfo?.staffData || []);

  const fetchRfi = async () => {
    try {
      setLoading(true);
      const response = await Service.GetRFIbyId(id);
      setRfi(response.data);
    } catch (err) {
      setError("Failed to load RFI");
    } finally {
      setLoading(false);
    }
  };

  console.log(rfi);
  useEffect(() => {
    if (id) fetchRfi();
  }, [id]);
  console.log(id);

  if (loading || error || !rfi) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md project-component-container">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span className="text-gray-700">Loading RFI details...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600">{error || "RFI not found"}</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-red-50 text-black border border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-xs uppercase tracking-tight shadow-sm"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>,
      document.body,
    );
  }

  const userRole = sessionStorage.getItem("userRole");

  const responseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "respondedBy",
      header: "Responded By",
      cell: ({ row }) => {
        if (row.original.userRole === "CLIENT" || row.original.userRole === "CLIENT_ADMIN") {
          return <span className="font-medium text-sm">Client</span>;
        }

        let name = "WBT Team";
        const rUser = row.original.user;

        if (rUser) {
           name = `${rUser.firstName || ""} ${rUser.lastName || ""}`.trim();
        } else {
            const responderId = row.original.userId;
            const user = users.find((u: any) => String(u.id) === String(responderId));
            if (user) {
                name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
            }
        }

        return <span className="font-medium text-sm uppercase">{name}</span>;
      },
    },
    {
      accessorKey: "description",
      header: "Message",
      cell: ({ row }) => (
        <div
          className="truncate max-w-[180px]"
          dangerouslySetInnerHTML={{
            __html: row.original.reason || row.original.description || "",
          }}
        />
      ),
    },
    
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const dateValue = row.original.createdAt || row.original.date;
        return (
          <span className="text-gray-700 text-sm">
            {dateValue ? new Date(dateValue).toLocaleString() : "—"}
          </span>
        );
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const rawStatus = row.original.wbtStatus || row.original.status;
        const status = (rawStatus === "COMPLETE" || rawStatus === "COMPLETED") ? "CLOSED" : rawStatus;
        return status ? (
          <span
            className={`px-3 py-1.5 rounded-md text-sm uppercase font-bold tracking-tight bg-gray-100 text-black border border-gray-200`}
          >
            {status}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        );
      },
    },
  ];

  const stripHtml = (html: string) => {
    if (!html) return "";
    let text = String(html)
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<\/p>|<\/div>|<\/li>/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]+>/g, "");
    if (typeof DOMParser !== "undefined") {
      try {
        const doc = new DOMParser().parseFromString(text, "text/html");
        text = doc.body.textContent || text;
      } catch {
        // fallback
      }
    }
    return text.trim();
  };

  const formatBreakableUrl = (url: string) => {
    if (!url) return "";
    return url.replace(/(https?:\/\/)|([\/._\-\?&=])/g, (_match, p1, p2) => {
      if (p1) return p1;
      return `${p2} `;
    });
  };

  const getFileShareUrl = async (
    table: string,
    parentId: string | number,
    fileId: string | number,
    fileObj?: any
  ): Promise<string> => {
    if (fileObj?.shareUrl) return fileObj.shareUrl;
    if (fileObj?.shareLink) return fileObj.shareLink;
    if (fileObj?.url) return fileObj.url;

    let mappedTable = table;
    if (table === "RFI" || table === "rFI") {
      mappedTable = "rFI";
    } else if (table === "rFIResponse" || table === "rfiresponse" || table === "RFIResponse") {
      mappedTable = "rFIResponse";
    }

    try {
      const res = await Service.createShareLink(mappedTable, String(parentId), String(fileId));
      if (res?.shareUrl) return res.shareUrl;
      if (res?.url) return res.url;
    } catch (err) {
      console.warn("Failed to generate share link via API:", err);
    }

    let baseURL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");
    if (baseURL && baseURL.startsWith("/")) {
      baseURL = `${window.location.origin}${baseURL}`;
    } else if (baseURL && !baseURL.startsWith("http")) {
      baseURL = `${window.location.origin}/${baseURL}`;
    } else if (!baseURL) {
      baseURL = window.location.origin;
    }

    return `${baseURL}/share/${mappedTable}/${parentId}/${fileId}`;
  };

  const handleDownloadPDF = async () => {
    if (!rfi) return;
    const rfiData: any = rfi;

    try {
      toast.info("Generating RFI PDF...");
      const doc = new jsPDF();
      const primaryColor: [number, number, number] = [107, 189, 69]; // #6bbd45 WBT Green
      const textColor: [number, number, number] = [30, 30, 30];
      const lightBg: [number, number, number] = [248, 250, 252];

      let currentY = 15;

      const projectName = rfiData.project?.name || rfiData.projectName || "N/A";
      const createdDateStr = formatDate(rfiData.createdAt || rfiData.date) || "N/A";
      const rawStatus = rfiData.wbtStatus || rfiData.status;
      const displayStatus = (rawStatus === true || rawStatus === "true") ? "PENDING" : (rawStatus === "COMPLETE" || rawStatus === "COMPLETED" ? "CLOSED" : String(rawStatus || "OPEN"));

      const headerTitle = projectName && projectName !== "N/A"
        ? `RFI DETAILS - ${projectName}`
        : "RFI DETAILS";

      // Title Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(14, currentY, 182, 16, "F");

      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(headerTitle, 20, currentY + 11);

      currentY += 22;

      // Section: General Information
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("GENERAL INFORMATION", 14, currentY);
      currentY += 4;

      const senderObj = rfiData.sender;
      const senderName = senderObj
        ? `${senderObj.firstName || ""} ${senderObj.middleName || ""} ${senderObj.lastName || ""}`.replace(/\s+/g, " ").trim() || senderObj.username || "—"
        : "—";
      const senderEmail = senderObj?.email || "—";

      let recipientNames = "—";
      if (rfiData.multipleRecipients && rfiData.multipleRecipients.length > 0) {
        recipientNames = rfiData.multipleRecipients
          .map((r: any) => {
            const name = `${r.firstName || ""} ${r.lastName || ""}`.trim();
            return name ? `${name} (${r.email || ""})` : r.email || "";
          })
          .filter(Boolean)
          .join("\n");
      } else if (rfiData.recepients || rfiData.recipient) {
        const r = rfiData.recepients || rfiData.recipient;
        const name = `${r.firstName || ""} ${r.lastName || ""}`.trim();
        recipientNames = name ? `${name} (${r.email || ""})` : r.email || "—";
      }

      const basicInfoData = [
        ["Subject:", rfiData.subject || "N/A", "Created At:", createdDateStr],
        ["Project Name:", projectName, "Status:", displayStatus],
        ["Sender:", `${senderName}\n(${senderEmail})`, "Recipient(s):", recipientNames]
      ];

      autoTable(doc, {
        body: basicInfoData,
        startY: currentY,
        theme: "grid",
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 8.5, cellPadding: 3, textColor: textColor },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 28, fillColor: lightBg },
          1: { cellWidth: 63 },
          2: { fontStyle: "bold", cellWidth: 25, fillColor: lightBg },
          3: { cellWidth: 66 }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;

      // Section: Description
      const cleanDesc = stripHtml(rfiData.description);
      if (cleanDesc && cleanDesc !== "No description provided") {
        if (currentY > 240) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text("DESCRIPTION", 14, currentY);
        currentY += 4;

        autoTable(doc, {
          body: [[cleanDesc]],
          startY: currentY,
          theme: "grid",
          styles: { fontSize: 8.5, cellPadding: 4, textColor: textColor },
          columnStyles: {
            0: { cellWidth: 182 }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Section: Attachments & Share Links
      const attachments = rfiData.files || [];
      if (attachments.length > 0) {
        if (currentY > 220) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(`ATTACHMENTS & SHARE LINKS (${attachments.length})`, 14, currentY);
        currentY += 4;

        const fileRows = await Promise.all(
          attachments.map(async (file: any, idx: number) => {
            const fileName = file.originalName || file.filename || `File ${idx + 1}`;
            const shareUrl = await getFileShareUrl("rFI", rfiData.id, file.id, file);
            return [
              idx + 1,
              { content: fileName, link: shareUrl },
              { content: `Open File Link:\n(${formatBreakableUrl(shareUrl)})`, link: shareUrl }
            ];
          })
        );

        autoTable(doc, {
          head: [["#", "File Name", "Share Link (Click to Open)"]],
          body: fileRows,
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, textColor: textColor, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 55, fontStyle: "bold", textColor: [0, 102, 204] },
            2: { cellWidth: 117, textColor: [0, 102, 204] }
          },
          didDrawCell: (data) => {
            if (data.section === "body") {
              const rawCell: any = data.cell.raw;
              if (rawCell && typeof rawCell === "object" && rawCell.link) {
                data.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: rawCell.link });
              }
            }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Section: Responses
      const responses = rfiData.rfiresponse || [];
      if (responses && responses.length > 0) {
        if (currentY > 220) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(`RESPONSES (${responses.length})`, 14, currentY);
        currentY += 4;

        const responseRows = await Promise.all(
          responses.map(async (r: any, idx: number) => {
            let userName = "WBT Team";
            if (r.userRole === "CLIENT" || r.userRole === "CLIENT_ADMIN") {
              userName = "Client";
            } else if (r.user) {
              userName = `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim();
            } else {
              const responderId = r.userId;
              const foundUser = users.find((u: any) => String(u.id) === String(responderId));
              if (foundUser) {
                userName = `${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim();
              }
            }

            const dateStr = formatDateTime(r.createdAt || r.date);
            const rRawStatus = r.wbtStatus || r.status || r.responseState;
            const rStatus = (rRawStatus === "COMPLETE" || rRawStatus === "COMPLETED") ? "CLOSED" : (rRawStatus || "OPEN");
            let desc = stripHtml(r.reason || r.description);
            const fileShareUrls: string[] = [];

            if (r.files && r.files.length > 0) {
              const fileShareList = await Promise.all(
                r.files.map(async (file: any) => {
                  const name = file.originalName || file.filename || "File";
                  const url = await getFileShareUrl("rFIResponse", r.id, file.id, file);
                  if (url) fileShareUrls.push(url);
                  return `• ${name}\n  Open Link: ${formatBreakableUrl(url)}`;
                })
              );
              desc += `\n\n[Attached Files]:\n${fileShareList.join("\n")}`;
            }

            return [
              idx + 1,
              userName,
              dateStr,
              rStatus,
              { content: desc, links: fileShareUrls }
            ];
          })
        );

        autoTable(doc, {
          head: [["#", "Responded By", "Date", "Status", "Description & Attached Files"]],
          body: responseRows,
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, textColor: textColor, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 35 },
            2: { cellWidth: 30 },
            3: { cellWidth: 22 },
            4: { cellWidth: 85 }
          },
          didDrawCell: (data) => {
            if (data.section === "body") {
              const rawCell: any = data.cell.raw;
              if (rawCell && typeof rawCell === "object") {
                if (rawCell.link) {
                  data.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: rawCell.link });
                } else if (rawCell.links && Array.isArray(rawCell.links)) {
                  rawCell.links.forEach((linkUrl: string) => {
                    if (linkUrl) {
                      data.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: linkUrl });
                    }
                  });
                }
              } else {
                const cellText = Array.isArray(data.cell.text) ? data.cell.text.join(" ") : String(data.cell.text || "");
                const foundUrls = cellText.match(/https?:\/\/[^\s\n\)\"\']+/g);
                if (foundUrls) {
                  foundUrls.forEach((urlWithSpaces) => {
                    const cleanUrl = urlWithSpaces.replace(/\s+/g, "");
                    data.doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: cleanUrl });
                  });
                }
              }
            }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Save Document
      const safeProjectName = (projectName || "RFI_Document").replace(/[^a-zA-Z0-9_\-]/g, "_");
      doc.save(`RFI_${safeProjectName}_${rfiData.serialNo || id}.pdf`);
      toast.success("RFI PDF downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate RFI PDF:", err);
      toast.error("Failed to generate PDF");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md project-component-container">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-black text-black flex items-center gap-2 uppercase tracking-tight">
              RFI Details
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#6bbd45] text-white rounded-lg hover:bg-[#5aa838] transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-6 bg-white">
          <div className="grid grid-cols-1 gap-6">

            {/* LEFT: RFI Details */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-5">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                  {rfi.subject}
                </h1>
                <span className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-gray-100 text-black border border-gray-200">
                  {rfi.status === true ? "Pending" : "Responded"}
                </span>
              </div>

              {/* Basic Info */}
              <Info label="Project" value={rfi.project?.name || "—"} />
              {userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN" && (
                <Info
                  label="Fabricator"
                  value={rfi?.fabricator?.fabName || "—"}
                />
              )}
              <Info
                label="Created On"
                value={new Date(rfi?.date).toLocaleString()}
              />

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">
                  Description
                </h4>
                <div
                  className="text-gray-700 bg-gray-50 p-3 rounded-lg border prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: rfi.description || "No description provided",
                  }}
                />
              </div>

              {/* Files */}
              <RenderFiles files={rfi.files} table="rFI" parentId={rfi.id} />
            </div>

            {/* RESPONSES SECTION */}
            <div className="bg-[#fafffb] border border-green-100/50 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-black uppercase tracking-tight">
                  Responses
                </h2>

                {(userRole === "CLIENT" || userRole === "CLIENT_ADMIN" || userRole === "CONNECTION_DESIGNER_ENGINEER" || userRole === "CONNECTION_DESIGNER_ADMIN") && (
                  <Button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-green-50 text-black rounded-lg font-bold uppercase tracking-tight hover:bg-green-200 transition-all border border-black shadow-md"
                  >
                    + Add Response
                  </Button>
                )}
              </div>

              {rfi.rfiresponse?.length > 0 ? (
                <DataTable
                  columns={responseColumns}
                  data={rfi.rfiresponse}
                  pageSizeOptions={[5, 10]}
                  onRowClick={(row) => setSelectedResponse(row)}
                />
              ) : (
                <p className="text-gray-700 italic">No responses yet.</p>
              )}
            </div>



            {/* Response Modal */}
            {showModal && (
              <RFIResponseModal
                rfiId={id}
                projectId={rfi?.project_id || (rfi as any)?.projectId || (rfi as any)?.project?.id}
                onClose={() => setShowModal(false)}
                onSuccess={fetchRfi}
              />
            )}

            {/* Details Modal */}
            {selectedResponse && (
              <RFIResponseDetailsModal
                response={selectedResponse}
                onClose={() => setSelectedResponse(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default GetRFIByID;
