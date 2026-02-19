import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Service from "../../api/Service";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
import Button from "../fields/Button";
import AllEstimationTask from "./estimationTask/AllEstimationTask";
import LineItemGroup from "./estimationLineItem/LineItemGroup";
import EditEstimation from "./EditEstimation";

import RenderFiles from "../ui/RenderFiles";
import type { EstimationTask } from "../../interface";
import InclusionExclusion from "./InclusionExclusion";
import EditInclusionExclusion from "./EditInclusionExclusion";

// Utility to remove HTML tags for simple display if needed
const stripHtml = (text: string) => text.replace(/<[^>]*>?/gm, '');

interface GetEstimationByIDProps {
  id: string;
  onRefresh?: () => void;
}

const GetEstimationByID: React.FC<GetEstimationByIDProps> = ({
  id,
  onRefresh,
}) => {
  const [estimation, setEstimation] = useState<EstimationTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEstimationTaskOpen, setIsEstimationTaskOpen] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isInclusionOpen, setIsInclusionOpen] = useState(false);
  const [isEditingInclusion, setIsEditingInclusion] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const fetchEstimation = async () => {
    if (!id) {
      setError("Invalid Estimation ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await Service.GetEstimationById(id);
      setEstimation(response?.data || null);
    } catch (err) {
      console.error("Error fetching estimation:", err);
      setError("Failed to load estimation details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimation();
  }, [id]);

  const formatHours = (hours: number | string | undefined) => {
    if (hours == null || hours === "") return "N/A";
    const numHours = typeof hours === "string" ? parseFloat(hours) : hours;
    if (isNaN(numHours)) return "N/A";
    const h = Math.floor(numHours);
    const m = Math.round((numHours - h) * 60);
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-700">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading estimation details...
      </div>
    );
  }

  if (error || !estimation) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error || "Estimation not found"}
      </div>
    );
  }

  const {
    estimationNumber,
    projectName,
    status,
    description,
    tools,
    fabricatorName,
    fabricators,
    rfq,
    estimateDate,
    startDate,
    createdAt,
    updatedAt,
    finalHours,
    finalWeeks,
    finalPrice,
    createdBy,
    totalAgreatedHours,
    files,
  } = estimation;

  const statusColor =
    status === "DRAFT"
      ? "bg-yellow-100 text-yellow-800"
      : status === "COMPLETED"
        ? "bg-green-100 text-green-800"
        : "bg-blue-100 text-blue-800";

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-black shadow-medium transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 border-b border-black pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-black wrap-break-word uppercase tracking-tight">
            Estimation #{estimationNumber}
          </h3>
          <p className="text-black font-black mt-1 text-sm sm:text-base">
            Project: <span className="uppercase">{projectName}</span>
          </p>
        </div>
        <span
          className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shrink-0 shadow-sm border border-black ${statusColor}`}
        >
          {status}
        </span>
      </div>

      {/* Top Grid */}
      <div className="grid max-sm:grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Fabricator */}
          {(fabricators?.fabName || fabricatorName) && (
            <InfoRow
              label="Fabricator"
              value={fabricators?.fabName || fabricatorName || "N/A"}
            />
          )}

          {/* RFQ */}
          {rfq && (
            <InfoRow
              label="RFQ"
              value={
                <div className="flex flex-col text-right">
                  <span className="font-bold text-black uppercase">
                    {rfq?.projectName || "RFQ Linked"}
                  </span>
                  <span className="text-xs text-black/60 font-medium">
                    Project No: {rfq?.projectNumber || "N/A"} · Bid:{" "}
                    {rfq?.bidPrice || "-"}
                  </span>
                </div>
              }
            />
          )}

          {/* Tools */}
          {tools && <InfoRow label="Tools" value={tools} />}

          {/* Description */}
          {description && (
            <div className="flex flex-col gap-2 border-b border-black/5 pb-3">
              <span className="text-black/40 text-[10px] sm:text-xs uppercase font-black tracking-widest">
                Description:
              </span>
              <div
                className={`text-black font-medium text-xs sm:text-sm overflow-hidden transition-all duration-300 ${!isDescExpanded ? "max-h-24 relative" : "max-h-none"
                  }`}
              >
                <div
                  className="description-html prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                {!isDescExpanded && description.length > 200 && (
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-white to-transparent" />
                )}
              </div>
              {description.length > 200 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-[10px] font-black uppercase text-green-600 hover:text-green-700 tracking-wider text-left mt-1"
                >
                  {isDescExpanded ? "Read Less" : "Read Full Description"}
                </button>
              )}
            </div>
          )}

          {/* Created By */}
          {createdBy && (
            <InfoRow
              label="Created By"
              value={
                <span>
                  {createdBy?.firstName} {createdBy?.lastName} (
                  {createdBy?.username || createdBy?.email || "N/A"})
                </span>
              }
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <InfoRow label="Estimate Date" value={formatDate(estimateDate)} />
          <InfoRow
            label="Start Date"
            value={startDate ? formatDate(startDate) : "N/A"}
          />
          <InfoRow label="Created" value={formatDateTime(createdAt)} />
          <InfoRow label="Updated" value={formatDateTime(updatedAt)} />
          <InfoRow
            label="Total Agreed Hours"
            value={formatHours(totalAgreatedHours)}
          />
          <InfoRow label="Final Hours" value={formatHours(finalHours)} />
          <InfoRow
            label="Final Weeks"
            value={finalWeeks != null ? finalWeeks : "N/A"}
          />
          <InfoRow
            label="Final Price"
            value={
              finalPrice != null ? `$${finalPrice.toLocaleString()}` : "N/A"
            }
          />
        </div>
      </div>

      {/* Files Section */}
      <RenderFiles
        files={files || []}
        table="estimation"
        parentId={id}
        formatDate={formatDate}
      />

      {/* Action Buttons */}
      <div className="py-6 flex flex-wrap items-center gap-3 border-t border-black mt-8">
        <Button
          className="py-2.5 px-5 text-sm font-black bg-green-200 text-black border border-black rounded-xl hover:bg-green-300 transition-all shadow-sm"
          onClick={() => setIsEstimationTaskOpen(!isEstimationTaskOpen)}
        >
          Estimation Task
        </Button>
        <Button
          className="py-2.5 px-5 text-sm font-black bg-green-50 text-black border border-black rounded-xl hover:bg-green-100 transition-all shadow-sm"
          onClick={() => setIsHoursOpen(!isHoursOpen)}
        >
          Estimated Hours/Weeks
        </Button>
        <Button
          className="py-2.5 px-5 text-sm font-black bg-green-50 text-black border border-black rounded-xl hover:bg-green-100 transition-all shadow-sm"
          onClick={() => setIsInclusionOpen(!isInclusionOpen)}
        >
          Inclusion/Exclusion
        </Button>
        <Button
          className="py-2.5 px-5 text-sm font-black bg-white text-black border border-black rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          Edit Estimation
        </Button>
      </div>
      {isEstimationTaskOpen && (
        <AllEstimationTask
          estimationId={estimation?.id || ""}
          onRefresh={fetchEstimation}
          // Many APIs return tasks either nested under `tasks` or `estimationTasks`
          // Fallback to an empty array to avoid runtime errors.
          estimations={
            Array.isArray(estimation?.tasks)
              ? estimation.tasks
              : Array.isArray(estimation?.estimationTasks)
                ? estimation.estimationTasks
                : []
          }
          onClose={() => setIsEstimationTaskOpen(false)}
        />
      )}
      {isHoursOpen && (
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg  text-gray-700">Estimated Hours/Weeks</h3>
            <button
              onClick={() => setIsHoursOpen(false)}
              className="text-gray-700 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm transition-colors"
            >
              Close
            </button>
          </div>
          <LineItemGroup estimationId={estimation?.id} />
        </div>
      )}
      {isInclusionOpen && (
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-black uppercase">Inclusion/Exclusion</h3>
            <button
              onClick={() => setIsInclusionOpen(false)}
              className="px-4 py-2 text-xs rounded-xl bg-white border border-black/20 hover:bg-gray-50 text-black font-bold transition-all shadow-sm"
            >
              Close
            </button>
          </div>
          {isEditingInclusion ? (
            <EditInclusionExclusion
              estimationId={estimation?.id || ""}
              onCancel={() => setIsEditingInclusion(false)}
              onSuccess={() => {
                setIsEditingInclusion(false);
                fetchEstimation();
              }}
            />
          ) : (
            <InclusionExclusion
              estimationId={estimation?.id || ""}
              onEdit={() => setIsEditingInclusion(true)}
            />
          )}
        </div>
      )}
      {isEditing && (
        <EditEstimation
          id={id}
          onSuccess={() => {
            setIsEditing(false);
            fetchEstimation();
            onRefresh?.();
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

// ✅ Reusable Info Row
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-row items-start gap-4 border-b border-black/5 pb-2">
    <span className="text-black/40 text-[10px] sm:text-xs uppercase font-black tracking-widest shrink-0 w-24 sm:w-32">
      {label}:
    </span>
    <span className="text-black font-black text-left flex-1 break-words text-xs sm:text-sm">
      {value}
    </span>
  </div>
);

export default GetEstimationByID;
