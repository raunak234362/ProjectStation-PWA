/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Service from "../../api/Service";
import type { RFQItem } from "../../interface";
import { Loader2, AlertCircle, Settings, Settings2 } from "lucide-react";
import ResponseModal from "./ResponseModal";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import ResponseDetailsModal from "./ResponseDetailsModal";
import Button from "../fields/Button";
import AddEstimation from "../estimation/AddEstimation";
import RenderFiles from "../ui/RenderFiles";
import QuotationRaise from "../connectionDesigner/QuotationRaise";
import QuotationResponseModal from "../connectionDesigner/QuotationResponseModal";
import QuotationResponseDetailsModal from "../connectionDesigner/QuotationResponseDetailsModal";
import { Trash2, X } from "lucide-react";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
import { useDispatch } from "react-redux";
import { deleteRFQ, updateRFQ } from "../../store/rfqSlice";
import { toast } from "react-toastify";

interface GetRfqByIDProps {
  id: string;
  onClose?: () => void;
}

const GetRFQByID = ({ id, onClose }: GetRfqByIDProps) => {
  console.log("GetRFQByID initialized with ID:", id);
  const [rfq, setRfq] = useState<RFQItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [showCDQuotationModal, setShowCDQuotationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New states for quotation responses
  const [showQuotationResponseModal, setShowQuotationResponseModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);

  const dispatch = useDispatch();
  const fetchRfq = async () => {
    try {
      if (!rfq) setLoading(true);
      const rfqRes = await Service.GetRFQbyId(id);

      const rfqData = rfqRes?.data || rfqRes;
      if (rfqData) {
        setRfq(rfqData);
        dispatch(updateRFQ(rfqData));
      }
    } catch (err) {
      console.error("Error fetching RFQ:", err);
      if (!rfq) setError("Failed to load RFQ");
    } finally {
      setLoading(false);
    }
  };

  const handleCDQuotationModal = () => {
    setShowCDQuotationModal(true);
  };
  const handleCDQuotationModalClose = () => {
    setShowCDQuotationModal(false);
  };

  useEffect(() => {
    if (id) fetchRfq();
  }, [id]);

  const handleDelete = async () => {
    console.log(
      "handleDelete called with text:",
      deleteConfirmText,
      "and ID:",
      id,
    );
    if (deleteConfirmText !== "DELETE") {
      console.log("Confirmation text mismatch");
      return;
    }

    try {
      setIsDeleting(true);
      console.log("Calling Service.DeleteRFQById...");
      const res = await Service.DeleteRFQById(id);
      console.log("Service.DeleteRFQById response:", res);
      dispatch(deleteRFQ(id));
      toast.success("RFQ deleted successfully");
      // Redirect or close view - assuming we want to close/go back
      // Since this is a detail view, we might need a way to tell the parent to refresh or close
      // For now, let's just show success and maybe the parent handles the state sync via Redux
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete RFQ");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText("");
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }
    if (!statusReason) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const payload = {
        wbtStatus: newStatus,
        reason: statusReason,
      };
      await Service.UpdateRFQById(id, payload);
      toast.success("RFQ status updated successfully");
      setShowStatusModal(false);
      setNewStatus("");
      setStatusReason("");
      fetchRfq(); // Refresh data
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update RFQ status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading || error || !rfq) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span className="text-gray-700">Loading RFQ details...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-600">{error || "RFQ not found"}</span>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full ml-2">
                <X size={20} />
              </button>
            </>
          )}
        </div>
      </div>,
      document.body
    );
  }

  const userRole = sessionStorage.getItem("userRole");

  const responseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "createdByRole",
      header: "From",
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {row.original.createdByRole === "CLIENT" ? "Client" : "WBT Team"}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Message",
      cell: ({ row }) => {
        const plainText =
          row.original.description?.replace(/<[^>]*>?/gm, "") || "";
        return <p className="truncate max-w-[180px]">{plainText}</p>;
      },
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
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-tight ${row.original.status === "OPEN"
            ? "bg-gray-100 text-black border border-gray-200"
            : "bg-gray-100 text-black border border-gray-200"
            }`}
        >
          {row.original.status}
        </span>
      ),
    },
  ];

  /* ---------------- QUOTATION COLUMNS ---------------- */
  const quotationColumns: ColumnDef<any>[] = [
    {
      accessorKey: "connectionDesignerName",
      header: "Designer",
      cell: ({ row }) => {
        const name =
          row.original.connectionDesignerName ||
          row.original.connectionDesignerId ||
          "Unknown";
        return <span className="font-medium text-sm">{name}</span>;
      },
    },
    {
      accessorKey: "bidprice",
      header: "Bid Price",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-700">
          ${row.original.bidprice}
        </span>
      ),
    },
    {
      accessorKey: "estimatedHours",
      header: "Est. Hours",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.estimatedHours} hrs
        </span>
      ),
    },
    {
      accessorKey: "weeks",
      header: "Weeks",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.weeks} wks</span>
      ),
    },
    {
      accessorKey: "approvalStatus",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-tight  ${row.original.approvalStatus
            ? "bg-gray-100 text-black border border-gray-200"
            : "bg-gray-100 text-black border border-gray-200"
            }`}
        >
          {row.original.approvalStatus ? "Approved" : "Pending"}
        </span>
      ),
    },
    {
      accessorKey: "files",
      header: "Files",
      cell: ({ row }) => {
        const count = row.original.files?.length ?? 0;
        return count > 0 ? (
          <span className="text-blue-600 font-medium">{count}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "approvalDate",
      header: "Approved Date",
      cell: ({ row }) => (
        <span className="text-gray-500 text-xs">
          {formatDate(row.original.approvalDate)}
        </span>
      ),
    },
  ];

  /* ---------------- TABLE STATE ---------------- */
  // Removed redundant useDataTable hook

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-[98%] max-w-[95vw] h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-end bg-white">
  
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-6 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* ---------------- LEFT COLUMN — RFQ DETAILS ---------------- */}
            <div className="bg-[#fafffb] border border-green-100/50 p-4 sm:p-6 rounded-3xl shadow-sm space-y-5 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="text-xl sm:text-2xl text-black wrap-break-word max-w-full uppercase tracking-tight">
                    {rfq?.projectName}
                  </h3>

                  {/* Status tag */}
                  <span
                    className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-gray-100 text-black border border-gray-200"
                  >
                    {rfq?.status}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* EDIT RFQ */}
                  {userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN" && (
                    <>
                      <Button
                        onClick={() => alert("Coming soon: Edit RFQ modal")}
                        className="flex-1 sm:flex-none px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                      >
                        Edit
                      </Button>

                      <Button
                        onClick={() => setShowStatusModal(true)}
                        className="flex-1 sm:flex-none px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                      >
                        Change Status
                      </Button>
                    </>
                  )}

                  {/* DELETE RFQ */}
                  {/* <Button
                  type="button"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 sm:flex-none px-3 py-1 text-white rounded-md transition text-sm"
                >
                  Delete
                </Button> */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Info label="Subject" value={rfq?.subject || ""} />
                <Info label="Project Number" value={rfq?.projectNumber || ""} />
                <Info label="Status" value={rfq?.status || ""} />
                <Info label="Tools" value={rfq?.tools || "N/A"} />
                <Info label="Due Date" value={formatDate(rfq?.estimationDate)} />
                <Info label="Bid Amount (USD)" value={rfq?.bidPrice ?? "—"} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className=" text-gray-700 text-sm">Description</h4>
                <div
                  className="text-gray-700 bg-white p-3 rounded-lg border prose prose-sm max-w-none text-xs sm:text-sm overflow-x-auto break-words"
                  dangerouslySetInnerHTML={{
                    __html: rfq?.description || "No description provided",
                  }}
                />
              </div>

              {/* Scopes */}
              <div className="space-y-3">
                <div className="p-4 bg-white/60 rounded-2xl border border-green-100/50 text-sm">
                  <h4 className="text-sm font-black text-black mb-3 flex items-center gap-1 uppercase tracking-tight">
                    <Settings className="w-4 h-4" /> Connection Design Scope
                  </h4>
                  <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
                    <Scope
                      label="Connection Design"
                      enabled={rfq?.connectionDesign || false}
                    />
                    <Scope
                      label="Misc Design"
                      enabled={rfq?.miscDesign || false}
                    />
                    <Scope
                      label={
                        !rfq?.customerDesign && rfq?.sender?.fabricator?.fabName
                          ? `Connection design by ${rfq.sender.fabricator.fabName}`
                          : "Connection Design by WBT"
                      }
                      enabled={true}
                    />
                  </div>
                </div>
                <div className="p-4 bg-white/60 rounded-2xl border border-green-100/50 text-sm">
                  <h4 className="text-sm font-black text-black mb-3 flex items-center gap-1 uppercase tracking-tight">
                    <Settings2 className="w-4 h-4" /> Detailing Scope
                  </h4>
                  <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
                    <Scope
                      label="Detailing Main"
                      enabled={rfq?.detailingMain || false}
                    />
                    <Scope
                      label="Detailing Misc"
                      enabled={rfq?.detailingMisc || false}
                    />
                  </div>
                </div>
              </div>

              {/* Files */}
              <RenderFiles
                files={rfq?.files || []}
                table="rFQ"
                parentId={rfq?.id}
                formatDate={formatDate}
              />
              {userRole !== "CLIENT_ADMIN" &&
                userRole !== "CLIENT" &&
                userRole !== "CONNECTION_DESIGNER_ENGINEER" && (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      onClick={() => setShowEstimationModal(true)}
                      className="w-full sm:w-auto h-auto py-2.5 px-4 text-sm  bg-green-200 text-black border border-black shadow-xs"
                    >
                      Raise For Estimation
                    </Button>
                    <Button
                      onClick={() => handleCDQuotationModal()}
                      className="w-full sm:w-auto h-auto py-2.5 px-4 text-[11px] sm:text-sm bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 whitespace-normal leading-tight "
                    >
                      Raise for Connection Designer Quotation
                    </Button>
                  </div>
                )}
            </div>

            {/* ---------------- RIGHT COLUMN — RESPONSES ---------------- */}
            <div className="bg-[#fafffb] border border-green-100/50 p-4 sm:p-6 rounded-3xl shadow-sm space-y-5 sm:space-y-6">
              {/* Header + Add Response Button */}
              <div className="flex justify-between items-center gap-4">
                <h1 className="text-xl sm:text-2xl text-black uppercase tracking-tight">
                  Responses
                </h1>

                {(userRole === "ADMIN" ||
                  userRole === "DEPUTY_MANAGER" ||
                  userRole === "OPERATION_EXECUTIVE" ||
                  userRole === "USER") && (
                    <Button
                      onClick={() => setShowResponseModal(true)}
                      className="px-4 py-2 bg-green-50 text-black rounded-lg font-bold uppercase tracking-tight hover:bg-black/90 transition-all border border-black shadow-md"
                    >
                      + Add Response
                    </Button>
                  )}
              </div>
              {showResponseModal && (
                <ResponseModal
                  rfqId={id}
                  onClose={() => setShowResponseModal(false)}
                  onSuccess={fetchRfq}
                />
              )}
              {/* ---- RESPONSE TABLE (HIDDEN FOR CONNECTION DESIGNERS) ---- */}
              {userRole !== "CONNECTION_DESIGNER_ENGINEER" &&
                (rfq?.responses?.length ? (
                  <DataTable
                    columns={responseColumns}
                    data={rfq.responses} // Ensure rfq.responses is an array
                    pageSizeOptions={[5, 10]}
                    onRowClick={(row: any) => setSelectedResponse(row)} // 👈 open modal
                  />
                ) : (
                  <p className="text-gray-700 italic">No responses yet.</p>
                ))}
              <div className="mt-4">
                {(rfq?.CDQuotas?.length ?? 0) > 0 ? (
                  <>
                    <p className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                      CD Quotation
                    </p>
                  // Show their quotation if submitted
                    <DataTable
                      columns={quotationColumns}
                      data={rfq?.CDQuotas || []}
                      pageSizeOptions={[5]}
                      onRowClick={(row: any) => setSelectedQuotation(row)}
                    />
                  </>
                ) : (
                  // Show Submit Button if not submitted
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    {userRole === "CONNECTION_DESIGNER_ENGINEER" ? (
                      <>
                        <p className="text-gray-500 mb-4 text-center">
                          You haven't submitted a quotation yet.
                        </p>
                        <Button
                          onClick={() => setShowQuotationResponseModal(true)}
                          className="px-6 py-2.5 bg-green-600 text-white  rounded-lg shadow-md hover:bg-green-700 transition"
                        >
                          Submit Quotation Response
                        </Button>
                      </>
                    ) : null}
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
        {showCDQuotationModal && (
          <QuotationRaise
            rfqId={id}
            onClose={() => handleCDQuotationModalClose()}
            onSuccess={fetchRfq} // refresh after submit
          />
        )}

        {selectedResponse && (
          <ResponseDetailsModal
            response={selectedResponse}
            onClose={() => setSelectedResponse(null)}
          />
        )}

        {/* Quotation Submission Modal */}
        {showQuotationResponseModal && (
          <QuotationResponseModal
            rfqId={id}
            onClose={() => setShowQuotationResponseModal(false)}
            onSuccess={fetchRfq}
          />
        )}

        {/* Quotation Details Modal */}
        {selectedQuotation && (
          <QuotationResponseDetailsModal
            quotation={selectedQuotation}
            onClose={() => setSelectedQuotation(null)}
            onSuccess={fetchRfq}
          />
        )}

        {/* Estimation Modal */}
        {showEstimationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowEstimationModal(false)}
                className="absolute top-4 right-4 text-gray-700 hover:text-gray-700 z-10"
              >
                ✕
              </button>
              <AddEstimation
                initialRfqId={id}
                onSuccess={() => {
                  setShowEstimationModal(false);
                  fetchRfq();
                }}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl  text-red-600 flex items-center gap-2">
                  <Trash2 size={24} /> Delete RFQ
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this RFQ? This action cannot be
                undone.
                <br />
                <span className="font-semibold text-sm mt-2 block">
                  Please type <span className="text-red-600">DELETE</span> to
                  confirm:
                </span>
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full px-4 py-2 border rounded-lg mb-6 focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  className={`flex-1 ${deleteConfirmText === "DELETE"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                    } text-white`}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl  text-blue-600 flex items-center gap-2">
                  Change RFQ Status
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">Select Status</option>
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="AWARDED">AWARDED</option>
                    <option value="RE_APPROVED">RE_APPROVED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Change
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

const Info = ({ label, value }: { label: string; value: string | number }) => (
  <div className="space-y-0.5 sm:space-y-1">
    <p className="text-gray-500 text-md sm:text-md uppercase font-medium tracking-wider">
      {label}
    </p>
    <p className=" text-gray-800 text-sm sm:text-base">{value}</p>
  </div>
);

const Scope = ({ label, enabled }: { label: string; enabled: boolean }) => (
  <div
    className={`px-3 py-2 rounded-lg border font-bold uppercase tracking-tighter ${enabled
      ? "bg-green-100/50 border-green-200 text-black"
      : "bg-gray-50 border-gray-200 text-gray-500"
      }`}
  >
    {label}
  </div>
);

export default GetRFQByID;
