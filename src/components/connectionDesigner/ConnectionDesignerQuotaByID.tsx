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
import RichTextEditor from "../fields/RichTextEditor";

interface Props {
    id: string;
    close?: () => void;
    onSuccess?: () => void;
}

const ConnectionDesignerQuotaByID = ({ id, close, onSuccess }: Props) => {
    const [quotation, setQuotation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [replies, setReplies] = useState<any[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(true);
    const [replyMode, setReplyMode] = useState(false);
    const [replyMessage, setReplyMessage] = useState("");
    const [replyStatus, setReplyStatus] = useState("IN_REVIEW");
    const [mainSteelPriceInput, setMainSteelPriceInput] = useState("0");
    const [miscSteelPriceInput, setMiscSteelPriceInput] = useState("0");
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const userRole = sessionStorage.getItem("userRole");
    const userRoleLower = userRole?.toLowerCase() || "";
    const isAdmin =
        userRole === "ADMIN" ||
        userRole === "DEPUTY_MANAGER" ||
        userRole === "OPERATION_EXECUTIVE";

    const isCDRole =
        userRoleLower === "connection_designer" ||
        userRoleLower === "connection_designer_engineer" ||
        userRoleLower === "connection_designer_admin";

    const fetchReplies = async (quotationId: string) => {
        try {
            setLoadingReplies(true);
            const res = await Service.getCDQuotaResponsesByQuotaId(quotationId);
            const data = res?.data || res || [];
            setReplies(data);
        } catch (err) {
            console.error("Error fetching replies:", err);
        } finally {
            setLoadingReplies(false);
        }
    };

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

            const data = res?.data || res;
            if (data) {
                setQuotation(data);
                setMainSteelPriceInput(data.mainSteelPrice || "0");
                setMiscSteelPriceInput(data.miscSteelPrice || "0");
                fetchReplies(data.id);
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

    const buildTree = (list: any[]) => {
        const map: { [key: string]: any } = {};
        const roots: any[] = [];
        list.forEach((item) => {
            map[item.id] = { ...item, childResponses: [] };
        });
        list.forEach((item) => {
            const mappedItem = map[item.id];
            if (item.parentId && map[item.parentId]) {
                map[item.parentId].childResponses.push(mappedItem);
            } else {
                roots.push(mappedItem);
            }
        });
        const sortTree = (nodes: any[]) => {
            nodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            nodes.forEach(node => {
                if (node.childResponses) sortTree(node.childResponses);
            });
        };
        sortTree(roots);
        return roots;
    };

    const renderThread = (res: any) => {
        return (
            <div className="ml-4 sm:ml-6 mt-4 border-l-2 border-black/10 pl-4 sm:pl-6 space-y-6">
                {res.childResponses?.map((child: any) => (
                    <div
                        key={child.id}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-black/5 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-semibold text-black uppercase tracking-tight">
                                {child.userRole?.replace("_", " ") || "User"}
                            </span>
                            <div className="flex items-center gap-2">
                                {child.status && (
                                    <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-100">
                                        {child.status}
                                    </span>
                                )}
                                <span className="text-[9px] font-semibold bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    {formatDateTime(child.createdAt)}
                                </span>
                            </div>
                        </div>
                        <div
                            className="prose prose-sm max-w-none text-black/80 font-medium rich-text-content"
                            dangerouslySetInnerHTML={{ __html: child.description || child.message }}
                        />
                        
                        {/* Display prices if any */}
                        {(child.mainSteelPrice > 0 || child.miscSteelPrice > 0) && (
                            <div className="flex flex-wrap gap-2 mt-3 text-xs">
                                {child.mainSteelPrice > 0 && (
                                    <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                                        Main Steel: ${child.mainSteelPrice}
                                    </span>
                                )}
                                {child.miscSteelPrice > 0 && (
                                    <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                                        Misc Steel: ${child.miscSteelPrice}
                                    </span>
                                )}
                                <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100 font-bold uppercase tracking-wider">
                                    Total Bid: ${(parseFloat(child.mainSteelPrice || "0") + parseFloat(child.miscSteelPrice || "0")).toFixed(2)}
                                </span>
                            </div>
                        )}

                        {child.files && child.files.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-black/5">
                                <RenderFiles
                                    files={child.files}
                                    table="CDQuotaResponse"
                                    parentId={child.id}
                                    hideHeader
                                />
                            </div>
                        )}
                        
                        {/* Reply action inside thread */}
                        {(isAdmin || isCDRole) && (
                            <div className="mt-2 flex justify-end">
                                <button
                                    onClick={() => {
                                        setSelectedParentId(child.id);
                                        setMainSteelPriceInput(child.mainSteelPrice || quotation.mainSteelPrice || "0");
                                        setMiscSteelPriceInput(child.miscSteelPrice || quotation.miscSteelPrice || "0");
                                        setReplyStatus(child.status || "IN_REVIEW");
                                        setReplyMode(true);
                                    }}
                                    className="px-3 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-md hover:bg-blue-100 transition-all uppercase tracking-wider cursor-pointer"
                                >
                                    Reply to this
                                </button>
                            </div>
                        )}

                        {child.childResponses?.length > 0 && renderThread(child)}
                    </div>
                ))}
            </div>
        );
    };

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
            formData.append("quotaId", quotation.id || id);
            formData.append("parentId", selectedParentId || quotation.id || id);
            formData.append("description", replyMessage);
            formData.append("status", replyStatus);
            formData.append("mainSteelPrice", mainSteelPriceInput || "0");
            formData.append("miscSteelPrice", miscSteelPriceInput || "0");
            formData.append("userId", userId);
            formData.append("userRole", userRoleStr);

            if (replyFiles?.length) {
                replyFiles.forEach((file) => {
                    formData.append("files", file);
                });
            }

            await Service.addCDQuotaResponse(formData);
            toast.success("Reply sent successfully!");
            setReplyMessage("");
            setReplyFiles([]);
            setReplyMode(false);

            await fetchReplies(quotation.id || id);

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
                <div className="px-6 py-5 border-b border-black/10 flex justify-between items-center bg-[#fafffb] shrink-0 sticky top-0 z-10">
                    <h2 className="text-xl sm:text-2xl font-semibold text-black uppercase tracking-tight">
                        Quotation Details
                    </h2>
                    <div className="flex items-center gap-3">
                        {(isAdmin || isCDRole) && (
                            <button
                                onClick={() => {
                                    setSelectedParentId(quotation.id);
                                    setMainSteelPriceInput(quotation.mainSteelPrice || "0");
                                    setMiscSteelPriceInput(quotation.miscSteelPrice || "0");
                                    setReplyStatus("IN_REVIEW");
                                    setReplyMode(true);
                                }}
                                className="px-4 sm:px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer"
                            >
                                Reply
                            </button>
                        )}
                        {close && (
                            <button
                                onClick={close}
                                className="px-4 sm:px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-xs sm:text-sm uppercase tracking-tight shadow-sm cursor-pointer"
                            >
                                Close
                            </button>
                        )}
                    </div>
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

                    {/* Threaded Replies Section */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-black text-black mb-4 uppercase tracking-tight">
                            Threaded Communications ({replies.length})
                        </h3>
                        {loadingReplies ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                            </div>
                        ) : buildTree(replies).length > 0 ? (
                            <div className="space-y-4">
                                {buildTree(replies).map((reply: any) => (
                                    <div
                                        key={reply.id}
                                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-xs"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-semibold text-gray-700">
                                                {reply.userRole?.replace("_", " ") || "User"}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {reply.status && (
                                                    <span className="text-[9px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-100">
                                                        {reply.status}
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    {formatDateTime(reply.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div
                                            className="text-sm text-gray-800 leading-relaxed rich-text-content prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: reply.description || reply.message }}
                                        />

                                        {/* Display prices if any */}
                                        {(reply.mainSteelPrice > 0 || reply.miscSteelPrice > 0) && (
                                            <div className="flex flex-wrap gap-2 mt-3 text-xs">
                                                {reply.mainSteelPrice > 0 && (
                                                    <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                                                        Main Steel: ${reply.mainSteelPrice}
                                                    </span>
                                                )}
                                                {reply.miscSteelPrice > 0 && (
                                                    <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                                                        Misc Steel: ${reply.miscSteelPrice}
                                                    </span>
                                                )}
                                                <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100 font-bold uppercase tracking-wider">
                                                    Total Bid: ${(parseFloat(reply.mainSteelPrice || "0") + parseFloat(reply.miscSteelPrice || "0")).toFixed(2)}
                                                </span>
                                            </div>
                                        )}

                                        {reply.files && reply.files.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <RenderFiles
                                                    files={reply.files}
                                                    table="CDQuotaResponse"
                                                    parentId={reply.id}
                                                    hideHeader
                                                />
                                            </div>
                                        )}

                                        {/* Reply Action */}
                                        {(isAdmin || isCDRole) && (
                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        setSelectedParentId(reply.id);
                                                        setMainSteelPriceInput(reply.mainSteelPrice || quotation.mainSteelPrice || "0");
                                                        setMiscSteelPriceInput(reply.miscSteelPrice || quotation.miscSteelPrice || "0");
                                                        setReplyStatus(reply.status || "IN_REVIEW");
                                                        setReplyMode(true);
                                                    }}
                                                    className="px-4 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-xs uppercase tracking-tight shadow-sm cursor-pointer"
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        )}

                                        {reply.childResponses && reply.childResponses.length > 0 && renderThread(reply)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-700 italic text-center py-4">No replies yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply Popup Modal */}
            {replyMode && (
                <div className="project-component-container fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-black/10 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Reply Modal Header */}
                        <div className="px-6 py-4 border-b border-black/10 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <h2 className="text-base font-black text-black uppercase tracking-widest">
                                    Reply {selectedParentId && selectedParentId !== quotation.id ? "(Threaded)" : ""}
                                </h2>
                            </div>
                            <button
                                onClick={() => setReplyMode(false)}
                                className="px-4 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-xs uppercase tracking-tight cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Reply Modal Body */}
                        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                            <div className="border border-black/10 rounded-xl overflow-hidden focus-within:border-green-400 transition-all">
                                <RichTextEditor
                                    value={replyMessage}
                                    onChange={setReplyMessage}
                                    placeholder="Draft your reply..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black uppercase tracking-widest block">
                                        Main Steel Price (USD)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={mainSteelPriceInput}
                                        onChange={(e) => setMainSteelPriceInput(e.target.value)}
                                        className="w-full h-11 px-4 border border-black/10 rounded-xl outline-none font-bold"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black uppercase tracking-widest block">
                                        Misc Steel Price (USD)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={miscSteelPriceInput}
                                        onChange={(e) => setMiscSteelPriceInput(e.target.value)}
                                        className="w-full h-11 px-4 border border-black/10 rounded-xl outline-none font-bold"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black uppercase tracking-widest block">
                                        Status
                                    </label>
                                    <select
                                        value={replyStatus}
                                        onChange={(e) => setReplyStatus(e.target.value)}
                                        className="w-full h-11 px-4 border border-black/10 rounded-xl bg-white focus:ring-2 focus:ring-green-100 outline-none font-semibold uppercase text-xs tracking-widest appearance-none cursor-pointer text-black"
                                    >
                                        <option value="IN_REVIEW">In Review</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black uppercase tracking-widest block">
                                        Documents
                                    </label>
                                    <MultipleFileUpload onFilesChange={setReplyFiles} />
                                </div>
                            </div>
                        </div>

                        {/* Reply Modal Footer */}
                        <div className="px-6 py-4 border-t border-black/10 bg-gray-50/50 flex justify-end">
                            <Button
                                className="px-8 py-2.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg font-bold text-xs uppercase tracking-tight hover:bg-green-100 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                                onClick={handleReplySubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin" />
                                        Sending...
                                    </div>
                                ) : (
                                    "Send Reply"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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
