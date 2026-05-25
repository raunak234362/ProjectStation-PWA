import React, { useState, useEffect } from "react";
import {
  Loader2,
  Trash2,
  Plus,
  X,
  Calendar,
  DollarSign,
  Building,
  ArrowLeftRight,
  Upload,
  Info,
  Clock,
  ShieldCheck,
  XOctagon
} from "lucide-react";
import { toast } from "react-toastify";
import Service from "../../api/Service";
import RenderFiles from "../ui/RenderFiles";
import { formatDate } from "../../utils/dateUtils";

interface InvoiceWireTransferProps {
  invoiceId?: string;
  onClose?: () => void;
}

interface WireTransfer {
  id: string;
  _id?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  transactionId: string;
  amount: number;
  transferDate: string;
  bankName: string;
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  files?: any[];
  createdBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  createdAt?: string;
}

const InvoiceWireTransfer: React.FC<InvoiceWireTransferProps> = ({ invoiceId }) => {
  const [wireTransfers, setWireTransfers] = useState<WireTransfer[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<WireTransfer | null>(null);

  // Form states
  const [formInvoiceId, setFormInvoiceId] = useState(invoiceId || "");
  const [formTransactionId, setFormTransactionId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formBankName, setFormBankName] = useState("");
  const [formTransferDate, setFormTransferDate] = useState(new Date().toISOString().split("T")[0]);
  const [formNotes, setFormNotes] = useState("");
  const [formFiles, setFormFiles] = useState<File[]>([]);

  // User details
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  const isAdminOrPMO = ["admin", "project_manager_officer"].includes(userRole);
  const isClientOrFabricator = ["client", "client_admin", "client_estimator", "client_accountant"].includes(userRole);

  const fetchInvoices = async () => {
    try {
      const isFabricatorRole = userRole === "client" || userRole === "client_admin" || userRole === "client_estimator" || userRole === "client_accountant";
      const res = (userRole === "client" || userRole === "client_estimator")
        ? await Service.GetAllInvoiceByClient()
        : (isFabricatorRole ? await Service.getFabricatorAllInvoice() : await Service.GetAllInvoice());
      setInvoices(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error("Error loading invoices list:", err);
    }
  };

  const fetchWireTransfers = async () => {
    try {
      setLoading(true);
      let data: any;
      if (invoiceId) {
        // Fetch scoped transfers
        data = await Service.GetWireTransfersByInvoiceId(invoiceId);
      } else {
        // Fetch all transfers
        if (isClientOrFabricator) {
          data = await Service.GetMyWireTransfers();
        } else {
          data = await Service.GetAllInvoiceWireTransfers();
        }
      }
      const list = Array.isArray(data) ? data : data?.data || [];
      setWireTransfers(list);
    } catch (err) {
      console.error("Error fetching wire transfers:", err);
      toast.error("Failed to load wire transfer notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWireTransfers();
    if (!invoiceId) {
      fetchInvoices();
    }
  }, [invoiceId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormFiles(Array.from(e.target.files));
    }
  };

  const handleResetForm = () => {
    setFormInvoiceId(invoiceId || "");
    setFormTransactionId("");
    setFormAmount("");
    setFormBankName("");
    setFormTransferDate(new Date().toISOString().split("T")[0]);
    setFormNotes("");
    setFormFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTransactionId.trim()) return toast.error("Transaction Reference is required");
    if (!formAmount || parseFloat(formAmount) <= 0) return toast.error("Please enter a valid amount");
    if (!formBankName.trim()) return toast.error("Bank name is required");

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (formInvoiceId) {
        formData.append("invoiceId", formInvoiceId);
      }
      formData.append("transactionId", formTransactionId.trim());
      formData.append("amount", formAmount);
      formData.append("bankName", formBankName.trim());
      formData.append("transferDate", formTransferDate);
      formData.append("notes", formNotes.trim());

      formFiles.forEach((file) => {
        formData.append("files", file);
      });

      await Service.CreateInvoiceWireTransfer(formData);
      toast.success("Wire transfer notification created successfully");
      setShowAddModal(false);
      handleResetForm();
      fetchWireTransfers();
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Failed to submit wire transfer notification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this wire transfer notification?")) return;
    try {
      await Service.DeleteWireTransfer(id);
      toast.success("Wire transfer notification deleted successfully");
      setSelectedTransfer(null);
      fetchWireTransfers();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete wire transfer notification");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "PENDING" | "CONFIRMED" | "REJECTED") => {
    try {
      await Service.UpdateWireTransfer(id, { status: newStatus });
      toast.success(`Wire transfer marked as ${newStatus}`);
      fetchWireTransfers();
      if (selectedTransfer && (selectedTransfer.id === id || selectedTransfer._id === id)) {
        setSelectedTransfer((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update wire transfer status");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-50 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <ShieldCheck className="w-4 h-4 text-green-600 mr-1" />;
      case "REJECTED":
        return <XOctagon className="w-4 h-4 text-red-600 mr-1" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600 mr-1" />;
    }
  };

  return (
    <div className="flex flex-col w-full h-full space-y-6 bg-white animate-in fade-in duration-300">
      {/* Header section (only if global view, inside layout) */}
      {!invoiceId && (
        <div className="border-b border-black/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

          <button
            onClick={() => {
              handleResetForm();
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6bbd45]/20 border border-black font-black text-black rounded-xl text-xs uppercase shadow-sm hover:bg-[#6bbd45]/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Notify Wire Transfer
          </button>
        </div>
      )}

      {/* Embedded Invoice Header info card if invoiceId passed */}
      {invoiceId && wireTransfers.length > 0 && (
        <div className="flex justify-between items-center bg-[#6bbd45]/5 border border-[#6bbd45]/20 p-4 rounded-2xl no-print">
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-tight">Wire Transfers</h3>
            <p className="text-xs text-gray-500 mt-0.5">Wire transfer payment logs associated with this invoice</p>
          </div>
          <button
            onClick={() => {
              handleResetForm();
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-300 font-bold text-green-700 rounded-lg text-xs hover:bg-green-100 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Wire Notification
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-700">
          <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-2" />
          <p className="text-xs font-black text-black uppercase tracking-widest">Fetching Transfers...</p>
        </div>
      ) : wireTransfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-gray-200/50">
          <ArrowLeftRight className="w-12 h-12 mb-3 text-gray-300" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">
            No Wire Transfers Recorded
          </p>
          {invoiceId && (
            <button
              onClick={() => {
                handleResetForm();
                setShowAddModal(true);
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all"
            >
              Add First Notification
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List panel */}
          <div className={`${selectedTransfer ? "md:col-span-2" : "md:col-span-3"} space-y-4`}>
            <div className="border border-black rounded-2xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">
                      Transaction Ref / Date
                    </th>
                    {!invoiceId && (
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Invoice
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">
                      Bank Name
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-xs">
                  {wireTransfers.map((item) => {
                    const idVal = item.id || item._id || "";
                    const isSelected = selectedTransfer?.id === idVal || selectedTransfer?._id === idVal;
                    return (
                      <tr
                        key={idVal}
                        onClick={() => setSelectedTransfer(item)}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? "bg-green-50/40 font-semibold" : ""
                          }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-gray-900">{item.transactionId}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {formatDate(item.transferDate)}
                          </div>
                        </td>
                        {!invoiceId && (
                          <td className="px-4 py-3">
                            {item.invoiceNumber ? (
                              <span className="font-bold text-gray-700">Inv #{item.invoiceNumber}</span>
                            ) : (
                              <span className="text-gray-400 italic">No linked invoice</span>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-gray-400" />
                            {item.bankName}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-900">
                          ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedTransfer(item)}
                              className="text-green-600 hover:text-green-800 uppercase tracking-wider font-bold text-[10px]"
                            >
                              View
                            </button>
                            {isAdminOrPMO && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(idVal, "CONFIRMED")}
                                  className="text-blue-600 hover:text-blue-800 uppercase tracking-wider font-bold text-[10px]"
                                  title="Confirm Payment"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleDelete(idVal)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Sidebar panel */}
          {selectedTransfer && (
            <div className="md:col-span-1 border border-black rounded-2xl bg-white p-5 space-y-6 shadow-md animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                <h3 className="font-black text-black uppercase tracking-wider text-xs">Wire Transfer Details</h3>
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Transaction Ref</span>
                  <p className="font-bold text-sm text-gray-900">{selectedTransfer.transactionId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount</span>
                    <p className="font-black text-sm text-gray-900">
                      ${Number(selectedTransfer.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date Transferred</span>
                    <p className="font-bold text-sm text-gray-900">{formatDate(selectedTransfer.transferDate)}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sender Bank</span>
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-gray-400" />
                    {selectedTransfer.bankName}
                  </p>
                </div>

                {selectedTransfer.invoiceNumber && (
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Linked Invoice</span>
                    <p className="font-bold text-gray-900">Invoice #{selectedTransfer.invoiceNumber}</p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Submitted By</span>
                  <p className="font-semibold text-gray-700">
                    {selectedTransfer.createdBy
                      ? `${selectedTransfer.createdBy.firstName || ""} ${selectedTransfer.createdBy.lastName || ""}`
                      : "Unknown User"}
                  </p>
                </div>

                {selectedTransfer.notes && (
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Notes / Remarks</span>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed mt-1">
                      {selectedTransfer.notes}
                    </p>
                  </div>
                )}

                {/* Attachments Section */}
                <div className="border-t pt-4 border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                    Proof of Wire Transfer
                  </span>
                  {selectedTransfer.files && selectedTransfer.files.length > 0 ? (
                    <RenderFiles
                      files={selectedTransfer.files}
                      table="invoiceWireTransfer"
                      parentId={selectedTransfer.id || selectedTransfer._id || ""}
                      hideHeader={true}
                    />
                  ) : (
                    <p className="text-gray-400 italic">No receipt document attached</p>
                  )}
                </div>

                {/* Status confirmation box for Admins */}
                <div className="border-t pt-4 border-gray-100 space-y-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Verification Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusStyle(selectedTransfer.status)}`}>
                      {getStatusIcon(selectedTransfer.status)}
                      {selectedTransfer.status}
                    </span>
                  </div>

                  {isAdminOrPMO && (
                    <div className="flex gap-2 mt-2 pt-2">
                      <button
                        onClick={() => handleStatusUpdate(selectedTransfer.id || selectedTransfer._id || "", "CONFIRMED")}
                        disabled={selectedTransfer.status === "CONFIRMED"}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedTransfer.id || selectedTransfer._id || "", "REJECTED")}
                        disabled={selectedTransfer.status === "REJECTED"}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Wire Transfer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-black rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-green-600" />
                <h2 className="text-sm font-black text-black uppercase tracking-widest">Record Wire Transfer</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {!invoiceId && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Select Invoice (Optional)
                  </label>
                  <select
                    value={formInvoiceId}
                    onChange={(e) => setFormInvoiceId(e.target.value)}
                    className="w-full p-2.5 border border-black/10 rounded-xl bg-gray-50 text-xs font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <option value="">-- No linked invoice --</option>
                    {invoices.map((inv) => (
                      <option key={inv.id || inv._id} value={inv.id || inv._id}>
                        {inv.customerName || "Customer"} - {inv.jobName} (Inv #{inv.invoiceNumber}) [${inv.totalInvoiceValue}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {invoiceId && (
                <div className="bg-green-50/50 border border-green-200/50 p-3 rounded-2xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-green-800 font-bold uppercase tracking-wider">Scoped Invoice</span>
                    <p className="text-[11px] text-green-900 font-semibold mt-0.5">
                      This transaction will be associated with the currently viewed invoice automatically.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Transaction ID / Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTransactionId}
                    onChange={(e) => setFormTransactionId(e.target.value)}
                    placeholder="e.g. W10238491823"
                    className="w-full p-2.5 border border-black/10 rounded-xl bg-gray-50 font-semibold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Amount Transferred (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      required
                      step="any"
                      min="0.01"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 p-2.5 border border-black/10 rounded-xl bg-gray-50 font-semibold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Date of Transfer *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={formTransferDate}
                      onChange={(e) => setFormTransferDate(e.target.value)}
                      className="w-full pl-9 pr-3 p-2.5 border border-black/10 rounded-xl bg-gray-50 font-semibold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Origin Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    placeholder="e.g. Chase Bank"
                    className="w-full p-2.5 border border-black/10 rounded-xl bg-gray-50 font-semibold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Notes / Remarks
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add details like beneficiary branch, routing notes etc."
                  rows={3}
                  className="w-full p-2.5 border border-black/10 rounded-xl bg-gray-50 font-semibold focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Upload Receipt */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Upload Proof of Transfer (PDF, Image)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-400 text-center mb-2">Select files or drag and drop</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="wire-file-upload"
                  />
                  <label
                    htmlFor="wire-file-upload"
                    className="px-4 py-1.5 bg-white border border-black text-black font-bold rounded-lg cursor-pointer hover:bg-gray-100 shadow-sm transition-all"
                  >
                    Browse Files
                  </label>
                </div>
                {formFiles.length > 0 && (
                  <div className="mt-2.5 space-y-1 bg-gray-50 border p-2.5 rounded-xl border-gray-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Selected Files:</span>
                    {formFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setFormFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit footer */}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 border border-black/10 font-bold text-gray-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Notification"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceWireTransfer;
