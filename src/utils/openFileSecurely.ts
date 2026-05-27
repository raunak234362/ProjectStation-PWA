import Service from "../api/Service";
import { toast } from "react-toastify";

const getDownloadUrl = (
  table: string,
  parentId: string | number,
  fileId: string | number,
  versionId?: string | number,
) => {
  const baseURL = import.meta.env.VITE_BASE_URL?.replace(/\/$/, "");
  switch (table) {
    case "bfa":
      return `${baseURL}/bfa/viewFile/${parentId}/${fileId}`;
    case "project":
      return `${baseURL}/project/viewFile/${parentId}/${fileId}`;
    case "estimation":
      return `${baseURL}/estimation/viewFile/${parentId}/${fileId}`;
    case "rFI":
    case "RFI":
      return `${baseURL}/rfi/viewfile/${parentId}/${fileId}`;
    case "rFIResponse":
      return `${baseURL}/rfi/response/viewfile/${parentId}/${fileId}`;
    case "submittals":
      return `${baseURL}/submittal/${parentId}/versions/${versionId}/${fileId}`;
    case "submittalsResponse":
    case "submittal/response":
      return `${baseURL}/submittal/response/${parentId}/viewfile/${fileId}`;
    case "rFQ":
      return `${baseURL}/rfq/viewFile/${parentId}/${fileId}`;
    case "rfqResponse":
    case "rfq/response":
      return `${baseURL}/rfq/response/viewFile/${parentId}/${fileId}`;
    case "rfqFollowup":
    case "rfq/followup":
      return `${baseURL}/rfq/followups/viewFile/${parentId}/${fileId}`;
    case "changeOrders":
      return `${baseURL}/changeOrder/viewFile/${parentId}/${fileId}`;
    case "changeOrder/response":
    case "cOResponse":
      return `${baseURL}/changeOrder/viewFile/${parentId}/files/${fileId}`;
    case "projectNotes":
      return `${baseURL}/projectNotes/note/viewfile/${parentId}/${fileId}`;
    case "connection-designer":
      return `${baseURL}/connectionDesign/viewFile/${parentId}/${fileId}`;
    case "designDrawings":
      return `${baseURL}/${table}/viewfile/${parentId}/${fileId}`;
    case "teamMeetingNotes":
      return `${baseURL}/teamMeetingNotes/viewFile/${parentId}/${fileId}`;
    case "teamMeetingResponse":
      return `${baseURL}/teamMeetingNotes/responses/viewFile/${parentId}/${fileId}`;
    case "quotation":
      return `${baseURL}/connectionDesignerQuota/viewFile/${parentId}/${fileId}`;
    case "quotationResponse":
      return `${baseURL}/connectionDesignerQuota/replies/viewFile/${parentId}/${fileId}`;
    default:
      return `${baseURL}/${table}/viewFile/${parentId}/${fileId}`;
  }
};

export const openFileSecurely = async (
  type: string,
  id: string | number,
  fileId: string | number,
  versionId?: string | number,
) => {
  const downloadUrl = getDownloadUrl(type, id, fileId, versionId);
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token missing");
      return { success: false, error: "Authentication token missing" };
    }

    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorMsg =
        response.status === 404
          ? "File not found"
          : response.status === 403
            ? "Access denied"
            : "Server error";
      throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const fileURL = window.URL.createObjectURL(blob);
    window.open(fileURL, "_blank", "noopener,noreferrer");
    return { success: true };
  } catch (err: any) {
    console.error("File open failed:", err);
    // toast.error('Unable to open file')
    return { success: false, error: err.message || "Unable to open file" };
  }
};

export const downloadFileSecurely = async (
  type: string,
  id: string | number,
  fileId: string | number,
  originalName: string,
  versionId?: string | number,
) => {
  const downloadUrl = getDownloadUrl(type, id, fileId, versionId);
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token missing");
      return { success: false, error: "Authentication token missing" };
    }

    const response = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorMsg =
        response.status === 404
          ? "File not found"
          : response.status === 403
            ? "Access denied"
            : "Server error";
      throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = originalName || "download";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Download started");
    return { success: true };
  } catch (error: any) {
    console.error("Error downloading file:", error);
    // toast.error('Error downloading file')
    return { success: false, error: error.message || "Error downloading file" };
  }
};

export const shareFileSecurely = async (
  type: string,
  id: string | number,
  fileId: string | number,
  versionId?: string | number,
) => {
  try {
    const response =
      type === "submittals"
        ? await Service.createShareLink(
            "submittalVersion",
            String(versionId),
            String(fileId),
          )
        : type === "bfa"
          ? await Service.createShareLink(
              "bfa",
              String(id),
              String(fileId),
            )
          : await Service.createShareLink(
              type,
              String(id),
              String(fileId),
              versionId ? String(versionId) : undefined,
            );
    if (response?.shareUrl) {
      await navigator.clipboard.writeText(response.shareUrl);
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("Failed to generate link");
    }
  } catch (error) {
    console.error("Error sharing file:", error);
    toast.error("Error generating share link");
  }
};
