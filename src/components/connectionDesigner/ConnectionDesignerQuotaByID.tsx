import { useEffect, useState } from "react";
import Service from "../../api/Service";
import {
    Loader2,
    AlertCircle,
    FileText,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
} from "lucide-react";
import Button from "../fields/Button";
import MultipleFileUpload from "../fields/MultipleFileUpload";
import { toast } from "react-toastify";
import RenderFiles from "../ui/RenderFiles";
import { formatDate, formatDateTime } from "../../utils/dateUtils";

interface Props {
    id: string;
    close?: () => void;
    onSuccess?: () => void;
}

const ConnectionDesignerQuotaByID = ({ id, close, onSuccess }: Props) => {
    const [quotation, setQuotation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyMessage, setReplyMessage] = useState("");
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const userRole = sessionStorage.getItem("userRole");
    const isAdmin =
        userRole === "ADMIN" ||
        userRole === "DEPUTY_MANAGER" ||
        userRole === "OPERATION_EXECUTIVE";

    const fetchQuotationData = async () => {
        if (!id) {
            setError("Invalid Quotation ID");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const res = await Service.GetConnectionDesignerQuotaByID(id);

            // Handle the case where the API might return data enveloped or plain
            const data = res?.data || res;
            if (data) {
                setQuotation(data);
            } else {
                setError("Quotation response is empty.");
            }
        } catch (err) {
            console.error("Error fetching quotation data:", err);
            setError("Failed to load quotation data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotationData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleReplySubmit = async () => {
        if (!replyMessage.trim()) {
            toast.error("Please enter a reply message");
            return;
        }

        try {
            setSubmitting(true);
            const userId = sessionStorage.getItem("userId") || "";
            const userRoleStr = sessionStorage.getItem("userRole") || "";

            const formData = new FormData();
            formData.append("message", replyMessage);
            formData.append("userId", userId);
            formData.append("userRole", userRoleStr);

            if (replyFiles?.length) {
                replyFiles.forEach((file) => {
                    formData.append("files", file);
                });
            }

            await Service.addQuotationReply(formData, quotation.id || id);
            toast.success("Reply sent successfully!");
            setReplyMessage("");
            setReplyFiles([]);
            setShowReplyForm(false);

            // Refresh the quotation data to show the new reply
            await fetchQuotationData();

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Reply submission error:", err);
            toast.error("Failed to send reply");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                <div className="bg-[#fafffb] w-full max-w-3xl rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center border border-green-100/50">
                    <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
                    <p className="text-sm font-medium text-gray-600 animate-pulse">
                        Loading Quotation Data...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                <div className="bg-[#fafffb] w-full max-w-3xl rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center border border-green-100/50">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="font-semibold text-gray-800 text-lg mb-6">
                        {error || "Quotation not found"}
                    </p>
                    {close && (
                        <button
                            onClick={close}
                            className="px-6 py-2 bg-gray-100 text-black border border-gray-300 rounded-lg font-bold text-sm uppercase tracking-tight hover:bg-gray-200 transition-all font-semibold"
                        >
                            Go Back
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-[#fafffb] w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-green-100/50 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-0 p-6 border-b border-gray-100 shrink-0 sticky top-0 bg-[#fafffb] z-10">
                    <h2 className="text-xl font-black text-black uppercase tracking-tight">
                        Quotation Details
                    </h2>
                    {close && (
                        <button
                            onClick={close}
                            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
                        >
                            Close
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 flex-1">
                    {/* Main Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailCard
                            icon={<DollarSign className="text-green-600" size={20} />}
                            label="Bid Price"
                            value={`$${quotation.bidprice || "N/A"}`}
                        />
                        <DetailCard
                            icon={<Clock className="text-blue-600" size={20} />}
                            label="Estimated Hours"
                            value={`${quotation.estimatedHours || "N/A"} hrs`}
                        />
                        <DetailCard
                            icon={<Calendar className="text-purple-600" size={20} />}
                            label="Duration"
                            value={`${quotation.weeks || "N/A"} weeks`}
                        />
                        <DetailCard
                            icon={
                                <CheckCircle
                                    className={
                                        quotation.approvalStatus
                                            ? "text-green-600"
                                            : "text-gray-400"
                                    }
                                    size={20}
                                />
                            }
                            label="Approval Status"
                            value={quotation.approvalStatus ? "Approved" : "Pending"}
                        />
                    </div>

                    {/* Approval Date */}
                    {quotation.approvalDate && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Approval Date</p>
                            <p className="font-semibold text-gray-800">
                                {formatDate(quotation.approvalDate)}
                            </p>
                        </div>
                    )}

                    {/* Submitted By */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Submitted By</p>
                        <p className="font-semibold text-gray-800">
                            {quotation.connectionDesignerName ||
                                quotation.connectionDesignerId ||
                                "Connection Designer"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(quotation.createdAt || Date.now())}
                        </p>
                    </div>

                    {/* Files */}
                    {quotation.files && quotation.files.length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-black text-black mb-3 flex items-center gap-2 uppercase tracking-tight">
                                <FileText size={18} />
                                Attachments ({quotation.files.length})
                            </h3>
                            <div className="mt-3">
                                <RenderFiles
                                    files={quotation.files}
                                    table="quotation"
                                    parentId={quotation.id}
                                    hideHeader
                                />
                            </div>
                        </div>
                    )}

                    {/* Replies Section */}
                    {quotation.replies && quotation.replies.length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-black text-black mb-4 uppercase tracking-tight">
                                Replies ({quotation.replies.length})
                            </h3>
                            <div className="space-y-3">
                                {quotation.replies.map((reply: any, index: number) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-medium text-gray-700">
                                                {reply.userRole || "User"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDateTime(reply.createdAt)}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-800">{reply.message}</p>
                                        {reply.files && reply.files.length > 0 && (
                                            <div className="mt-2">
                                                <RenderFiles
                                                    files={reply.files}
                                                    table="quotationResponse"
                                                    parentId={reply.id}
                                                    hideHeader
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reply Form */}
                    {(isAdmin || userRole === "CONNECTION_DESIGNER_ENGINEER") && (
                        <div className="border-t pt-4">
                            {!showReplyForm ? (
                                <Button
                                    onClick={() => setShowReplyForm(true)}
                                    className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition font-black tracking-tight"
                                >
                                    + Add Reply
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                        placeholder="Write your reply..."
                                    />
                                    <MultipleFileUpload onFilesChange={setReplyFiles} />
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => {
                                                setShowReplyForm(false);
                                                setReplyMessage("");
                                                setReplyFiles([]);
                                            }}
                                            className="flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition font-black tracking-tight"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleReplySubmit}
                                            disabled={submitting}
                                            className="flex-1 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:bg-gray-400 font-black tracking-tight"
                                        >
                                            {submitting ? "Sending..." : "Send Reply"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Component
const DetailCard = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) => (
    <div className="bg-linear-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
        <div className="mt-1">{icon}</div>
        <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-black">
                {label}
            </p>
            <p className="text-gray-800 text-lg font-semibold">{value}</p>
        </div>
    </div>
);

export default ConnectionDesignerQuotaByID;
