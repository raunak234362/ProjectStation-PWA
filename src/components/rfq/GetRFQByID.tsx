/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Service from "../../api/Service";
import type { RFQItem } from "../../interface";
import { Loader2, AlertCircle } from "lucide-react";
import ResponseModal from "./ResponseModal";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import ResponseDetailsModal from "./ResponseDetailsModal";
import Button from "../fields/Button";
import AddEstimation from "../estimation/AddEstimation";
import RenderFiles from "../ui/RenderFiles";
import QuotationRaise from "../connectionDesigner/QuotationRaise";

interface GetRfqByIDProps {
  id: string;
}

const GetRFQByID = ({ id }: GetRfqByIDProps) => {
  const [rfq, setRfq] = useState<RFQItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [showCDQuotationModal, setShowCDQuotationModal] = useState(false);
  const fetchRfq = async () => {
    try {
      setLoading(true);
      const response = await Service.GetRFQbyId(id);
      setRfq(response.data || null);
    } catch {
      setError("Failed to load RFQ");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-700">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading RFQ details...
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "RFQ not found"}
      </div>
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
    // {
    //   accessorKey: "description",
    //   header: "Message",
    //   cell: ({ row }) => (
    //     <p className="truncate max-w-[180px]">{row.original.description}</p>
    //   ),
    // },

    {
      accessorKey: "description",
      header: "Message",
      cell: ({ row }) => (
        <p className="truncate max-w-[180px]">{row.original.description}</p>
      ),
    },
    {
      accessorKey: "files",
      header: "Files",
      cell: ({ row }) => {
        const count = row.original.files?.length ?? 0;
        return count > 0 ? (
          <span className="text-green-700 font-medium">{count} file(s)</span>
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
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.status === "OPEN"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {row.original.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="p-0 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* ---------------- LEFT COLUMN — RFQ DETAILS ---------------- */}
          <div className="bg-white sm:bg-linear-to-br sm:from-green-50 sm:to-white p-4 sm:p-6 rounded-xl shadow-sm sm:shadow-md space-y-5 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="text-xl sm:text-2xl font-bold text-green-700 wrap-break-word max-w-full">
                  {rfq.projectName}
                </h3>

                {/* Status tag */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium shrink-0 ${rfq.status === "RECEIVED"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                    }`}
                >
                  {rfq.status}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* EDIT RFQ */}
                <Button
                  onClick={() => alert("Coming soon: Edit RFQ modal")}
                  className="flex-1 sm:flex-none px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                >
                  Edit
                </Button>

                {/* DELETE RFQ */}
                <Button
                  className="flex-1 sm:flex-none px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                >
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Info label="Subject" value={rfq.subject || ""} />
              <Info label="Project Number" value={rfq.projectNumber || ""} />
              <Info label="Status" value={rfq.status || ""} />
              <Info label="Tools" value={rfq.tools} />
              <Info
                label="Due Date"
                value={new Date(rfq.estimationDate).toLocaleDateString()}
              />
              <Info label="Bid Amount (USD)" value={rfq.bidPrice ?? "—"} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-700 text-sm">Description</h4>
              <div
                className="text-gray-700 bg-white p-3 rounded-lg border prose prose-sm max-w-none text-xs sm:text-sm"
                dangerouslySetInnerHTML={{
                  __html: rfq.description || "No description provided",
                }}
              />
            </div>

            {/* Scopes */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-700 text-sm">Scope Summary</h4>
              <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 sm:gap-4 text-[10px] sm:text-xs">
                <Scope label="Main Design" enabled={rfq.connectionDesign} />
                <Scope label="Misc Design" enabled={rfq.miscDesign} />
                <Scope label="Customer Design" enabled={rfq.customerDesign} />
                <Scope label="Main Steel" enabled={rfq.detailingMain} />
                <Scope label="Misc Steel" enabled={rfq.detailingMisc} />
              </div>
            </div>

            {/* Files */}
            <RenderFiles
              files={rfq.files || []}
              table="rFQ"
              parentId={rfq.id}
              formatDate={(date: string) => new Date(date).toLocaleDateString()}
            />
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => setShowEstimationModal(true)} className="w-full sm:w-auto h-auto py-2.5 px-4 text-sm font-bold bg-green-500 text-white shadow-xs">
                Raise For Estimation
              </Button>
              <Button
                onClick={() => handleCDQuotationModal()}
                className="w-full sm:w-auto h-auto py-2.5 px-4 text-[11px] sm:text-sm bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 whitespace-normal leading-tight font-bold"
              >
                Raise for Connection Designer Quotation
              </Button>
            </div>
          </div>

          {/* ---------------- RIGHT COLUMN — RESPONSES ---------------- */}
          <div className="bg-white sm:bg-linear-to-br sm:from-green-50 sm:to-white p-4 sm:p-6 rounded-xl shadow-sm sm:shadow-md space-y-5 sm:space-y-6">
            {/* Header + Add Response Button */}
            <div className="flex justify-between items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-green-700">
                Responses
              </h1>

              {(userRole === "ADMIN" ||
                userRole === "STAFF" ||
                userRole === "USER") && (
                  <Button
                    onClick={() => setShowResponseModal(true)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition text-sm"
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

            {/* ---- RESPONSE TABLE ---- */}
            {rfq.responses?.length ? (
              <DataTable
                columns={responseColumns}
                data={rfq.responses}
                searchPlaceholder="Search responses..."
                pageSizeOptions={[5, 10]}
                onRowClick={(row: any) => setSelectedResponse(row)} // 👈 open modal
              />
            ) : (
              <p className="text-gray-700 italic">No responses yet.</p>
            )}
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
                // Optionally refresh RFQ or show success message
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const Info = ({ label, value }: { label: string; value: string | number }) => (
  <div className="space-y-0.5 sm:space-y-1">
    <p className="text-gray-500 text-[10px] sm:text-xs uppercase font-medium tracking-wider">{label}</p>
    <p className="font-bold text-gray-800 text-sm sm:text-base">{value}</p>
  </div>
);

const Scope = ({ label, enabled }: { label: string; enabled: boolean }) => (
  <div
    className={`px-3 py-2 rounded-md border ${enabled
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-gray-100 border-gray-300 text-gray-700"
      }`}
  >
    {label}
  </div>
);

export default GetRFQByID;
