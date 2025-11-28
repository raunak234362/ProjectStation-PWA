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

  useEffect(() => {
    if (id) fetchRfq();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
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

  const responseColumns: ColumnDef<any>[] = [
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
          <span className="text-teal-700 font-medium">{count} file(s)</span>
        ) : (
          <span className="text-gray-400">—</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.status === "OPEN"
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
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---------------- LEFT COLUMN — RFQ DETAILS ---------------- */}
          <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl shadow-md space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-teal-700">
                  {rfq.projectName}
                </h3>

                {/* Status tag */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rfq.status === "RECEIVED"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {rfq.status}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {/* EDIT RFQ */}
                <button
                  onClick={() => alert("Coming soon: Edit RFQ modal")}
                  className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition text-sm"
                >
                  Edit
                </button>
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
            <div>
              <h4 className="font-semibold text-gray-600 mb-1">Description</h4>
              <p className="text-gray-800 bg-white p-3 rounded-md border">
                {rfq.description || "No description provided"}
              </p>
            </div>

            {/* Scopes */}
            <h4 className="font-semibold text-gray-600">Scope Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Scope label="Main Design" enabled={rfq.connectionDesign} />
              <Scope label="Misc Design" enabled={rfq.miscDesign} />
              <Scope label="Customer Design" enabled={rfq.customerDesign} />
              <Scope label="Main Steel" enabled={rfq.detailingMain} />
              <Scope label="Misc Steel" enabled={rfq.detailingMisc} />
            </div>

            {/* Files */}
            {rfq.files?.length ? (
              <div>
                <h4 className="font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  Files Attached
                </h4>
                <ul className="text-gray-800 bg-white p-4 rounded-md shadow">
                  {rfq.files.map((file: any, i) => (
                    <li key={i} className="border-b py-2 last:border-none">
                      📄 {file.originalName || `File ${i + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 italic">No files uploaded</p>
            )}

            <Button onClick={() => setShowEstimationModal(true)}>Raise For Estimation</Button>
          </div>

          {/* ---------------- RIGHT COLUMN — RESPONSES ---------------- */}
          <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl shadow-md space-y-6">
            {/* Header + Add Response Button */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-teal-700">
                Responses
              </h1>

              <button
                onClick={() => setShowResponseModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition"
              >
                + Add Response
              </button>
            </div>

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
              <p className="text-gray-500 italic">No responses yet.</p>
            )}

            {/* ---- MODAL ---- */}
            {showResponseModal && (
              <ResponseModal
                rfqId={id}
                onClose={() => setShowResponseModal(false)}
                onSuccess={fetchRfq} // refresh after submit
              />
            )}
          </div>
        </div>
      </div>

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
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
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
  <div className="space-y-1">
    <p className="text-gray-500 text-xs uppercase">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const Scope = ({ label, enabled }: { label: string; enabled: boolean }) => (
  <div
    className={`px-3 py-2 rounded-md border ${
      enabled
        ? "bg-green-100 border-green-400 text-green-700"
        : "bg-gray-100 border-gray-300 text-gray-500"
    }`}
  >
    {label}
  </div>
);

export default GetRFQByID;
