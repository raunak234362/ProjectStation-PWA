import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import type { ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import Button from "../fields/Button";
import Service from "../../api/Service";
import RenderFiles from "../ui/RenderFiles";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED"];

const COResponseDetailsModal = ({ response, onClose, onSuccess, projectId }: any) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replyStatus, setReplyStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [fullResponse, setFullResponse] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const userId = sessionStorage.getItem("userId") || "";
  const userRole = sessionStorage.getItem("userRole") || "";

  const coId = response?.CoId || response?.coId || response?.changeOrderId || "";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoadingDetails(true);
        const data = await Service.GetChangeOrderResponseByResponseId(response.id);
        setFullResponse(data?.data || data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch response details");
      } finally {
        setLoadingDetails(false);
      }
    };
    if (response?.id) {
      fetchDetails();
    } else {
      setLoadingDetails(false);
    }
  }, [response?.id]);

  const handleReply = async () => {
    if (!replyMessage.trim() || loading) return;

    const formData = new FormData();
    formData.append("CoId", coId);
    formData.append("description", replyMessage);
    formData.append("status", replyStatus);
    formData.append("userId", userId);
    formData.append("userRole", userRole);

    // ✅ IMPORTANT — reply points to parent response
    formData.append("parentResponseId", response.id);

    replyFiles.forEach((f) => formData.append("files", f));

    try {
      setLoading(true);
      let fabricatorName = "";
      let projectName = "";
      if (projectId) {
        const projectRes = await Service.GetProjectById(projectId);
        const project = projectRes?.data || projectRes;
        fabricatorName = project?.fabricator?.fabName || project?.fabricatorName || "";
        projectName = project?.projectName || project?.name || "";
      } else {
        const coDetails = await Service.GetChangeOrderById(coId);
        const coObj = coDetails?.data || coDetails;
        const projectObj = coObj?.project;
        if (projectObj) {
          fabricatorName = projectObj.fabricator?.fabName || projectObj.fabricatorName || "";
          projectName = projectObj.projectName || projectObj.name || "";
        } else {
          const pid = coObj?.projectId || coObj?.project_id;
          if (pid) {
            const projectRes = await Service.GetProjectById(pid);
            const project = projectRes?.data || projectRes;
            fabricatorName = project?.fabricator?.fabName || project?.fabricatorName || "";
            projectName = project?.projectName || project?.name || "";
          }
        }
      }

      await Service.addCOResponse(formData, response.id, fabricatorName, projectName);
      toast.success("Reply sent successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  const senderUser = response?.user;
  const senderName = senderUser
    ? [senderUser.firstName, senderUser.middleName, senderUser.lastName].filter(Boolean).join(" ").trim() ||
      [senderUser.firstName, senderUser.lastName].filter(Boolean).join(" ").trim() ||
      senderUser.username ||
      senderUser.name
    : response?.userName || response?.username || (response?.createdByRole === "CLIENT" ? "Client" : response?.createdByRole ? "WBT Team" : "");

  if (loadingDetails) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="project-component-container fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#fafffb] p-8 w-full max-w-2xl rounded-3xl shadow-2xl relative border border-green-100/50 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-tight">
              Response Details
            </h2>
            {senderName && (
              <p className="text-xs text-gray-500 font-medium mt-1">
                From: <span className="text-black font-semibold">{senderName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 space-y-4 min-h-[300px]">
          <div
            className="bg-gray-100 p-3 rounded border text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: fullResponse?.description || response.description || "—" }}
          />

          {(fullResponse?.files?.length > 0 || response.files?.length > 0) && (
            <RenderFiles
              files={fullResponse?.files || response.files}
              table="changeOrders"
              parentId={coId}
            />
          )}

          {/* Child Responses Thread */}
          {fullResponse?.childResponses?.length > 0 && (
            <div className="space-y-3 mt-6 border-t pt-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Thread</h3>
              {fullResponse.childResponses.map((child: any) => {
                const childUser = child.user;
                const childName = childUser
                  ? [childUser.firstName, childUser.middleName, childUser.lastName].filter(Boolean).join(" ").trim() ||
                    [childUser.firstName, childUser.lastName].filter(Boolean).join(" ").trim() ||
                    childUser.username
                  : child.userName || child.username || "User";
                return (
                  <div key={child.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-black uppercase">{childName}</span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {child.createdAt ? new Date(child.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: child.description || "—" }} />
                    {child.files?.length > 0 && (
                      <div className="mt-2">
                         <RenderFiles files={child.files} table="changeOrders" parentId={coId} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t pt-4 mt-6 space-y-3">
            <h3 className="text-xs font-black text-black uppercase tracking-tight">Reply</h3>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={3}
              disabled={loading}
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="Type your reply here..."
            />

            <select
              value={replyStatus}
              onChange={(e) => setReplyStatus(e.target.value)}
              disabled={loading}
              className="w-full border rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              type="file"
              multiple
              disabled={loading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setReplyFiles(e.target.files ? Array.from(e.target.files) : [])
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-black rounded-lg font-bold uppercase tracking-tight hover:bg-gray-200 transition-all border border-gray-200"
          >
            Cancel
          </Button>
          <Button
            className="px-6 py-2 rounded-lg font-bold bg-primary/20 text-black uppercase tracking-tight border border-black shadow-md flex items-center gap-2"
            onClick={handleReply}
            disabled={loading || !replyMessage.trim()}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Sending..." : "Send Reply"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default COResponseDetailsModal;
