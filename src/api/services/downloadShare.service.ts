import { toast } from "react-toastify";
import api from "../api";

type FileId = string | number;

interface FileResult {
	success: boolean;
	error?: string;
}

const getErrorMessage = (status?: number) => {
	if (status === 404) return "File not found";
	if (status === 403) return "Access denied";
	return "Server error";
};

class downloadShareService {
	private static getViewPath(
		table: string,
		parentId: FileId,
		fileId: FileId,
		versionId?: FileId,
	) {
		switch (table) {
			case "bfa":
				return versionId
					? `bfa/viewFile/${parentId}/${versionId}/${fileId}`
					: `bfa/viewFile/${parentId}/${fileId}`;
			case "project":
				return `project/viewFile/${parentId}/${fileId}`;
			case "estimation":
				return `estimation/viewFile/${parentId}/${fileId}`;
			case "rFI":
			case "RFI":
				return `rfi/viewfile/${parentId}/${fileId}`;
			case "rFIResponse":
				return `rfi/response/viewfile/${parentId}/${fileId}`;
			case "submittals":
			case "submittal":
				return versionId
					? `submittal/${parentId}/versions/${versionId}/${fileId}`
					: `submittal/viewfile/${parentId}/${fileId}`;
			case "submittalsResponse":
			case "submittal/response":
				return `submittal/response/${parentId}/viewfile/${fileId}`;
			case "rFQ":
				return `rfq/viewFile/${parentId}/${fileId}`;
			case "rfqResponse":
			case "rFQResponse":
			case "rFQresponse":
			case "rfq/response":
				return `rfq/response/viewFile/${parentId}/${fileId}`;
			case "rfqFollowup":
			case "rfq/followup":
				return `rfq/followups/viewFile/${parentId}/${fileId}`;
			case "changeOrders":
				return `changeOrder/viewFile/${parentId}/${fileId}`;
			case "changeOrder/response":
			case "cOResponse":
				return `changeOrder/viewFile/${parentId}/files/${fileId}`;
			case "projectNotes":
				return `projectNotes/note/viewfile/${parentId}/${fileId}`;
			case "connection-designer":
				return `connectionDesign/viewFile/${parentId}/${fileId}`;
			case "designDrawings":
				return `designDrawings/viewfile/${parentId}/${fileId}`;
			case "teamMeetingNotes":
				return `teamMeetingNotes/viewFile/${parentId}/${fileId}`;
			case "teamMeetingResponse":
				return `teamMeetingNotes/responses/viewFile/${parentId}/${fileId}`;
			case "quotation":
				return `connectionDesignerQuota/viewFile/${parentId}/${fileId}`;
			case "quotationResponse":
				return `connectionDesignerQuota/replies/viewFile/${parentId}/${fileId}`;
			case "meetings":
				return `meetings/viewFile/${parentId}/${fileId}`;
			case "milestoneResponse":
				return `mileStone/response/${parentId}/viewFile/${fileId}`;
			default:
				return `${table}/viewFile/${parentId}/${fileId}`;
		}
	}

	static GetBFAFileViewUrl(bfaId: string, versionId: string, fileId: string) {
		const baseURL = api.defaults.baseURL || "";
		return `${baseURL}bfa/viewFile/${bfaId}/${versionId}/${fileId}`;
	}

	static async ViewFileNotesTeamMeetingResponse(noteId: string, fileId: string) {
		const response = await api.get(`teamMeetingNotes/responses/viewFile/${noteId}/${fileId}`);
		return response.data;
	}

	static async ViewFileNotesTeamMeeting(noteId: string, fileId: string) {
		const response = await api.get(`teamMeetingNotes/viewFile/${noteId}/${fileId}`);
		return response.data;
	}

	static async ViewMeetingFile(meetingId: string, fileId: string) {
		const response = await api.get(`meetings/viewFile/${meetingId}/${fileId}`);
		return response.data;
	}

	static async ViewDesignDrawingFile(designId: string, fileId: string) {
		const response = await api.get(`designDrawings/viewFile/${designId}/${fileId}`);
		return response.data;
	}

	static async ViewMilestoneResponseFile(responseId: string, fileId: string) {
		const response = await api.get(`mileStone/response/${responseId}/viewFile/${fileId}`);
		return response.data;
	}

	static async viewRfqFile(id: string, fileId: string) {
		const response = await api.get(`rfq/followups/viewFile/${id}/${fileId}`);
		return response.data;
	}

	static async viewFile(
		table: string,
		parentId: FileId,
		fileId: FileId,
		versionId?: FileId,
	) {
		const response = await api.get(
			this.getViewPath(table, parentId, fileId, versionId),
			{ responseType: "blob" },
		);
		return response.data;
	}

	static async openFile(
		table: string,
		parentId: FileId,
		fileId: FileId,
		versionId?: FileId,
	): Promise<FileResult> {
		try {
			const blob = await this.viewFile(table, parentId, fileId, versionId);
			const fileURL = window.URL.createObjectURL(blob);
			window.open(fileURL, "_blank", "noopener,noreferrer");
			return { success: true };
		} catch (error: any) {
			const message = getErrorMessage(error?.response?.status);
			console.error("File open failed:", error);
			return { success: false, error: message };
		}
	}

	static async downloadFile(
		table: string,
		parentId: FileId,
		fileId: FileId,
		originalName: string,
		versionId?: FileId,
	): Promise<FileResult> {
		try {
			const blob = await this.viewFile(table, parentId, fileId, versionId);
			const url = window.URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = originalName || "download";
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			window.URL.revokeObjectURL(url);
			toast.success("Download started");
			return { success: true };
		} catch (error: any) {
			const message = getErrorMessage(error?.response?.status);
			console.error("Error downloading file:", error);
			return { success: false, error: message };
		}
	}

	static async createShareLink(
		table: string,
		parentId: string | undefined,
		fileId: string | undefined,
		versionId?: string,
	) {
		const mappedTable = ["rfqResponse", "rFQResponse", "rFQresponse"].includes(table)
			? "rFQResponse"
			: table;
		const url = versionId
			? `share/${mappedTable}/${parentId}/versions/${versionId}/${fileId}`
			: `share/${mappedTable}/${parentId}/${fileId}`;
		const response = await api.post(url);
		return response.data;
	}

	static async shareFile(
		table: string,
		parentId: FileId,
		fileId: FileId,
		versionId?: FileId,
	): Promise<FileResult> {
		try {
			const effectiveParent =
				table === "submittals" || table === "submittal"
					? versionId || parentId
					: parentId;
			const response = await this.createShareLink(
				table === "submittals" || table === "submittal" ? "submittalVersion" : table,
				String(effectiveParent),
				String(fileId),
				table === "submittals" || table === "submittal" ? undefined : versionId ? String(versionId) : undefined,
			);
			if (!response?.shareUrl) return { success: false, error: "Failed to generate link" };
			await navigator.clipboard.writeText(response.shareUrl);
			toast.success("Link copied to clipboard!");
			return { success: true };
		} catch (error: any) {
			console.error("Error sharing file:", error);
			return { success: false, error: error?.message || "Error generating share link" };
		}
	}
}

export default downloadShareService;