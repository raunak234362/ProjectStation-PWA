import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../api/Service";
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Download,
} from "lucide-react";
import Button from "../fields/Button";
import DataTable from "../ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

import SubmittalResponseModal from "./SubmittalResponseModal";
import SubmittalResponseDetailsModal from "./SubmittalResponseDetailsModal";
import UpdateSubmittalById from "./UpdateSubmittalById";
import RenderFiles from "../ui/RenderFiles";
import BfaManager from "./BfaManager";
import { truncateWords } from "../../utils/stringUtils";

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

const Info = ({ label, value }: any) => (
  <div className="mb-2">
    <h4 className="text-sm text-gray-700">{label}</h4>
    <div className="font-medium text-gray-700">{value}</div>
  </div>
);

// ── Version History Row ──────────────────────────────────────────────────────
const VersionRow = ({ version, index, total, isCurrent }: any) => {
  const [open, setOpen] = useState(false);

  const uploadedAt = version.createdAt || version.updatedAt || version.date;
  const uploader = version.user || version.sender;
  const uploaderName = uploader
    ? `${uploader.firstName || uploader.f_name || ""} ${uploader.lastName || uploader.l_name || ""}`.trim()
    : null;

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${isCurrent
        ? "border-[#6bbd45] bg-[#6bbd45]/5"
        : "border-gray-200 bg-white"
        }`}
    >
      {/* Row Header — always visible */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left gap-3 hover:bg-black/5 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Version badge */}
          <span
            className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isCurrent
              ? "bg-[#6bbd45] text-white"
              : "bg-gray-100 text-gray-500"
              }`}
          >
            v{total - index}
            {isCurrent && " · Current"}
          </span>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {uploadedAt ? new Date(uploadedAt).toLocaleString() : "—"}
            </span>
            {uploaderName && (
              <span className="truncate text-gray-500">
                · by {uploaderName}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <span className="shrink-0 text-gray-400">
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Expanded Content */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          {/* Description */}
          {version.description && (
            <div className="pt-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Description
              </p>
              <div
                className="p-3 bg-white border border-gray-200 rounded-lg prose prose-sm max-w-none text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: version.description }}
              />
            </div>
          )}

          {/* Attached files for this version */}
          {(version.files?.length > 0 || version.file) && (
            <div className="pt-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Attachments
              </p>
              {isCurrent ? (
                <RenderFiles
                  files={[version]}
                  table="submittals"
                  parentId={version.submittalId || version.submittalsId}
                  versionId={version.id}
                  hideHeader
                />
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Attachments are only available for the current version.
                </p>
              )}
            </div>
          )}

          {/* Nothing to show */}
          {!version.description && !version.files?.length && !version.file && (
            <p className="pt-3 text-xs text-gray-400 italic">
              No details available for this version.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const GetSubmittalByID = ({ id, onClose }: any) => {
  const [loading, setLoading] = useState(true);
  const [submittal, setSubmittal] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const userRole = sessionStorage.getItem("userRole")?.toUpperCase();
  const isConnectionDesigner = userRole === "CONNECTION_DESIGNER" ||
                               userRole === "CONNECTION_DESIGNER_ENGINEER" ||
                               userRole === "CONNECTION_DESIGNER_ADMIN";

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await Service.GetSubmittalbyId(id);
      setSubmittal(res.data);
    } catch {
      setError("Failed to load submittal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return createPortal(
      <div className="fixed inset-0 z-10001 flex items-center justify-center p-2 bg-black/60 backdrop-blur-md project-component-container">
        <div className="bg-white dark:bg-slate-900 w-[95%] max-w-[90vw] h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-transparent dark:border-slate-800 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-center h-full text-gray-700">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading submittal details...
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  if (!submittal || error) {
    return createPortal(
      <div className="fixed inset-0 z-10001 flex items-center justify-center p-2 bg-black/60 backdrop-blur-md project-component-container">
        <div className="bg-white dark:bg-slate-900 w-[95%] max-w-[90vw] h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-transparent dark:border-slate-800 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-center h-full text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error || "Submittal not found"}
            <button
              onClick={onClose}
              className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  // Sort versions newest → oldest
  const sortedVersions = [...(submittal.versions || [])].sort(
    (a, b) =>
      new Date(b.createdAt || b.updatedAt || b.date || 0).getTime() -
      new Date(a.createdAt || a.updatedAt || a.date || 0).getTime(),
  );
  const hasMultipleVersions = sortedVersions.length > 1;

  const responseColumns = [
    {
      accessorKey: "description",
      header: "Message",
      cell: ({ row }: any) => (
        <div
          className="prose prose-sm text-gray-700"
          style={{
            marginLeft: row.original.parentResponseId ? "10px" : "0px",
          }}
          dangerouslySetInnerHTML={{
            __html: truncateWords(row.original.description || "—", 10),
          }}
        />
      ),
    },

    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleString(),
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
    versionId?: string | number,
    fileObj?: any
  ): Promise<string> => {
    if (fileObj?.shareUrl) return fileObj.shareUrl;
    if (fileObj?.shareLink) return fileObj.shareLink;
    if (fileObj?.url) return fileObj.url;

    let mappedTable = table;
    let effectiveParentId = String(parentId);

    if (table === "submittals" || table === "submittal") {
      mappedTable = "submittalVersion";
      if (versionId) {
        effectiveParentId = String(versionId);
      }
    } else if (table === "submittalsResponse" || table === "submittal/response") {
      mappedTable = "submittalsResponse";
    }

    try {
      const res = await Service.createShareLink(mappedTable, effectiveParentId, String(fileId));
      if (res?.shareUrl) {
        return res.shareUrl;
      }
      if (res?.url) {
        return res.url;
      }
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

    return `${baseURL}/share/${mappedTable}/${effectiveParentId}/${fileId}`;
  };

  const handleDownloadPDF = async () => {
    if (!submittal) return;
    const subData: any = submittal;

    try {
      toast.info("Generating Submittal PDF...");
      const doc = new jsPDF();
      const primaryColor: [number, number, number] = [107, 189, 69]; // #6bbd45 WBT Green
      const textColor: [number, number, number] = [30, 30, 30];
      const lightBg: [number, number, number] = [248, 250, 252];

      let currentY = 15;

      const projectName = subData.project?.name || subData.projectName || "N/A";
      const createdDateStr = formatDate(subData.createdAt || subData.date) || "N/A";
      const stageName = subData.stage || "N/A";

      const headerTitle = projectName && projectName !== "N/A"
        ? `SUBMITTAL DETAILS - ${projectName}`
        : "SUBMITTAL DETAILS";

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

      const senderObj = subData.sender;
      const senderName = senderObj
        ? `${senderObj.firstName || ""} ${senderObj.middleName || ""} ${senderObj.lastName || ""}`.replace(/\s+/g, " ").trim() || senderObj.username || "—"
        : "—";
      const senderEmail = senderObj?.email || "—";

      let recipientNames = "—";
      if (subData.multipleRecipients && subData.multipleRecipients.length > 0) {
        recipientNames = subData.multipleRecipients
          .map((r: any) => {
            const name = `${r.firstName || ""} ${r.lastName || ""}`.trim();
            return name ? `${name} (${r.email || ""})` : r.email || "";
          })
          .filter(Boolean)
          .join("\n");
      } else if (subData.recepients || subData.recipient) {
        const r = subData.recepients || subData.recipient;
        const name = `${r.firstName || ""} ${r.lastName || ""}`.trim();
        recipientNames = name ? `${name} (${r.email || ""})` : r.email || "—";
      }

      const basicInfoData = [
        ["Subject:", subData.subject || "N/A", "Created At:", createdDateStr],
        ["Project Name:", projectName, "Stage:", stageName],
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
      const rawDesc = subData.description || (sortedVersions.length === 1 && sortedVersions[0]?.description);
      const cleanDesc = stripHtml(rawDesc);
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
      const currentVer = sortedVersions[0] || subData.currentVersion;
      const attachments = currentVer?.files || currentVer?.file || subData.files || [];
      const fileList = Array.isArray(attachments) ? attachments : (attachments ? [attachments] : []);

      if (fileList.length > 0) {
        if (currentY > 220) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(`ATTACHMENTS & SHARE LINKS (${fileList.length})`, 14, currentY);
        currentY += 4;

        const fileRows = await Promise.all(
          fileList.map(async (file: any, idx: number) => {
            const fileName = file.originalName || file.filename || `File ${idx + 1}`;
            const shareUrl = await getFileShareUrl(
              "submittals",
              subData.id,
              file.id,
              currentVer?.id,
              file
            );
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

      // Section: Version History (if > 1 version)
      if (hasMultipleVersions) {
        if (currentY > 220) {
          doc.addPage();
          currentY = 15;
        }

        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(`VERSION HISTORY (${sortedVersions.length})`, 14, currentY);
        currentY += 4;

        const versionRows = await Promise.all(
          sortedVersions.map(async (v: any, index: number) => {
            const vNum = `v${sortedVersions.length - index}${v.id === subData.currentVersionId || index === 0 ? " (Current)" : ""}`;
            const uploadedAt = formatDateTime(v.createdAt || v.updatedAt || v.date);
            const uploader = v.user || v.sender;
            const uploaderName = uploader
              ? `${uploader.firstName || uploader.f_name || ""} ${uploader.lastName || uploader.l_name || ""}`.trim()
              : "—";
            const vDesc = stripHtml(v.description);

            let vFileDetails = "—";
            const vFiles = v.files || (v.file ? [v.file] : []);
            if (vFiles.length > 0 && index === 0) {
              const vShareList = await Promise.all(
                vFiles.map(async (file: any) => {
                  const name = file.originalName || file.filename || "File";
                  const url = await getFileShareUrl("submittals", subData.id, file.id, v.id, file);
                  return `${name}\nOpen Link: ${formatBreakableUrl(url)}`;
                })
              );
              vFileDetails = vShareList.join("\n\n");
            } else if (vFiles.length > 0) {
              vFileDetails = `${vFiles.length} file(s) (Attachments in Current Version)`;
            }

            return [vNum, uploadedAt, uploaderName, vDesc, vFileDetails];
          })
        );

        autoTable(doc, {
          head: [["Version", "Date", "Uploaded By", "Description", "Files & Share Links"]],
          body: versionRows,
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, textColor: textColor, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 20, fontStyle: "bold" },
            1: { cellWidth: 30 },
            2: { cellWidth: 32 },
            3: { cellWidth: 45 },
            4: { cellWidth: 55, textColor: [0, 102, 204] }
          },
          didDrawCell: (data) => {
            if (data.section === "body") {
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
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      }

      // Section: Responses
      const responses = subData.submittalsResponse || subData.responses || [];
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
            const u = r.user || r.createdBy;
            const userName = u
              ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "Team Member"
              : "Team Member";
            const dateStr = formatDateTime(r.createdAt);
            let desc = stripHtml(r.description);
            const fileShareUrls: string[] = [];

            if (r.files && r.files.length > 0) {
              const fileShareList = await Promise.all(
                r.files.map(async (file: any) => {
                  const name = file.originalName || file.filename || "File";
                  const url = await getFileShareUrl("submittalsResponse", r.id, file.id, undefined, file);
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
              { content: desc, links: fileShareUrls }
            ];
          })
        );

        autoTable(doc, {
          head: [["#", "User", "Date", "Description & Attached Files"]],
          body: responseRows,
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 3, textColor: textColor, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 40 },
            2: { cellWidth: 32 },
            3: { cellWidth: 100 }
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
      const safeProjectName = (projectName || "Submittal_Document").replace(/[^a-zA-Z0-9_\-]/g, "_");
      doc.save(`Submittal_${safeProjectName}_${subData.serialNo || id}.pdf`);
      toast.success("Submittal PDF downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate Submittal PDF:", err);
      toast.error("Failed to generate PDF");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-10001 flex items-center justify-center p-2 bg-black/60 backdrop-blur-md project-component-container">
      <div className="bg-white dark:bg-slate-900 w-[95%] max-w-[90vw] h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-transparent dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50/50">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <span className="w-2 h-6 bg-[#6bbd45] rounded-full"></span>
            Submittal Details
          </h2>
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
              CLOSE
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* LEFT PANEL */}
            <div className="bg-gray-100 p-6 rounded-xl shadow-none border border-gray-100 space-y-5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl text-black font-semibold">
                    {submittal.subject}
                  </h1>
                </div>
                {userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN" && !isConnectionDesigner && (
                  <Button
                    className="bg-[#6bbd45]/20 text-black border border-black hover:bg-[#6bbd45]/30 mt-1"
                    onClick={() => setShowUpdateModal(true)}
                  >
                    Update Submittal
                  </Button>
                )}
              </div>

              <Info label="Project" value={submittal.project?.name || "—"} />
              <Info label="Stage" value={
                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 font-bold uppercase text-[10px] tracking-widest rounded-md border border-blue-200 mt-1">
                  {submittal.stage || "—"}
                </span>
              } />
              <Info
                label="Submitted By"
                value={submittal.sender?.firstName || "—"}
              />
              <Info
                label="Created On"
                value={new Date(submittal.date).toLocaleString()}
              />

              {/* Description */}
              {(submittal.description ||
                (sortedVersions.length === 1 &&
                  sortedVersions[0].description)) && (
                  <div className="space-y-3 mt-6">
                    <h4 className="text-black text-sm bg-white p-4 rounded-xl border border-black/5 font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-[#6bbd45] rounded-full"></span>
                      Description
                    </h4>
                    <div className="bg-white rounded-2xl border border-black/5 border-l-4 shadow-sm overflow-hidden w-full">
                      <style>{`
                      .submittal-description * {
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                      }
                      .submittal-description table {
                        width: 100% !important;
                        table-layout: fixed !important;
                        border-collapse: collapse !important;
                      }
                      .submittal-description td, .submittal-description th {
                        word-break: break-word !important;
                        padding: 8px !important;
                        border: 1px solid #f3f4f6 !important;
                      }
                      .submittal-description img {
                        max-width: 100% !important;
                        height: auto !important;
                        border-radius: 8px !important;
                      }
                      .submittal-description a {
                        color: #2563eb !important;
                        word-break: break-all !important;
                        text-decoration: underline !important;
                      }
                      .submittal-description p { margin-bottom: 1rem !important; }
                      .submittal-description ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1rem !important; }
                      .submittal-description ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1rem !important; }
                      .submittal-description li { margin-bottom: 0.5rem !important; }
                    `}</style>
                      <div
                        className="submittal-description text-gray-800 p-6 text-sm wrap-break-word leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            submittal.description ||
                            sortedVersions[0]?.description ||
                            "No description provided",
                        }}
                      />
                    </div>
                  </div>
                )}

              {/* Single Version File Display */}
              {!hasMultipleVersions && sortedVersions.length === 1 && (
                <div className="bg-gray-100 p-6 rounded-xl shadow-none border border-gray-100 space-y-5 mt-6">
                  <RenderFiles
                    files={sortedVersions}
                    table="submittals"
                    parentId={submittal.id}
                    versionId={sortedVersions[0]?.id}
                    hideHeader
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── VERSION HISTORY (only when > 1 versions) ── */}
          {hasMultipleVersions && (
            <div className="bg-gray-100 border border-gray-100 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#6bbd45]" />
                <h2 className="text-lg font-black text-black uppercase tracking-tight">
                  Version History
                </h2>
                <span className="ml-auto text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-200 px-2 py-1 rounded-md">
                  {sortedVersions.length} versions
                </span>
              </div>

              <div className="space-y-2">
                {sortedVersions.map((version, index) => (
                  <VersionRow
                    key={version.id || index}
                    version={version}
                    index={index}
                    total={sortedVersions.length}
                    isCurrent={
                      version.id === submittal.currentVersionId || index === 0
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* BFA Manager */}
          {!isConnectionDesigner && String(submittal.stage || "").toUpperCase() !== "IFC" && (
            <BfaManager submittalId={submittal.id} />
          )}

          {/* RESPONSES SECTION */}
          <div className="bg-gray-100 p-6 rounded-xl shadow-none border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-black">
                Responses
              </h2>
              {(userRole === "CLIENT_ADMIN" ||
                userRole === "CLIENT" ||
                userRole === "CONNECTION_DESIGNER_ENGINEER" ||
                userRole === "CONNECTION_DESIGNER_ADMIN") && (
                  <button
                    type="button"
                    className="px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
                    onClick={() => setShowResponseModal(true)}
                  >
                    + ADD RESPONSE
                  </button>
                )}
            </div>

            {submittal.submittalsResponse?.length > 0 ? (
              <DataTable
                columns={responseColumns}
                data={submittal.submittalsResponse}
                onRowClick={(row) => setSelectedResponse(row)}
              />
            ) : (
              <p className="text-gray-700 italic">No responses yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ADD RESPONSE MODAL */}
      {showResponseModal && (
        <SubmittalResponseModal
          submittal={submittal}
          onClose={() => setShowResponseModal(false)}
          onSuccess={() => {
            setShowResponseModal(false);
            fetchData();
          }}
        />
      )}

      {/* RESPONSE DETAILS MODAL */}
      {selectedResponse && (
        <SubmittalResponseDetailsModal
          response={selectedResponse}
          onClose={() => {
            setSelectedResponse(null);
            fetchData();
          }}
        />
      )}

      {/* UPDATE SUBMITTAL MODAL */}
      {showUpdateModal && (
        <UpdateSubmittalById
          submittal={submittal}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={() => {
            setShowUpdateModal(false);
            fetchData();
          }}
        />
      )}
    </div>,
    document.body,
  );
};

export default GetSubmittalByID;
