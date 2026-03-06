import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, X } from "lucide-react";
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
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-8 border border-black/10 shadow-medium transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-black/5 pb-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl sm:text-3xl font-black text-black uppercase tracking-tight leading-none">
              Estimation #{estimationNumber}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-black/40 uppercase tracking-widest whitespace-nowrap">Source Manifest</span>
              <div className="h-px w-10 bg-black/10"></div>
            </div>
          </div>
          <div className="text-black font-black mt-4 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-black/40 uppercase tracking-widest text-[10px]">Project Identifier:</span>
            <span className="uppercase text-black/80 break-words">{projectName}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-black/10 text-center ${statusColor}`}
          >
            {status}
          </span>
          <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest">System Status Active</span>
        </div>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Left Column */}
        <div className="space-y-4">
          {(fabricators?.fabName || fabricatorName) && (
            <InfoRow
              label="Fabricator"
              value={fabricators?.fabName || fabricatorName || "N/A"}
            />
          )}

          {rfq && (
            <InfoRow
              label="RFQ Link"
              value={
                <div className="flex flex-col">
                  <span className="font-black text-black uppercase text-xs sm:text-sm">
                    {rfq?.projectName || "RFQ Linked"}
                  </span>
                  <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">
                    JOB# {rfq?.projectNumber || "N/A"} · BID: {rfq?.bidPrice || "-"}
                  </span>
                </div>
              }
            />
          )}

          {tools && <InfoRow label="Modeling Tools" value={tools} />}

          {description && (
            <div className="flex flex-col gap-2 border-b border-black/5 pb-4">
              <span className="text-black/40 text-[10px] sm:text-xs uppercase font-black tracking-[0.2em]">
                Project Scope Detail:
              </span>
              <div
                className={`text-black font-medium text-xs sm:text-sm overflow-hidden transition-all duration-300 ${!isDescExpanded ? "max-h-24 relative" : "max-h-none"
                  }`}
              >
                <div
                  className="description-html prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                {!isDescExpanded && description.length > 200 && (
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              {description.length > 200 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-[10px] font-black uppercase text-green-600 hover:text-green-700 tracking-[0.2em] text-left mt-1 underline decoration-2 underline-offset-4"
                >
                  {isDescExpanded ? "Collapse Specs" : "Expand Full Specs"}
                </button>
              )}
            </div>
          )}

          {createdBy && (
            <InfoRow
              label="Originator"
              value={
                <span className="flex flex-col sm:flex-row sm:gap-1">
                  <span>{createdBy?.firstName} {createdBy?.lastName}</span>
                  <span className="text-[10px] text-black/40 font-bold">({createdBy?.username || createdBy?.email || "N/A"})</span>
                </span>
              }
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <InfoRow label="Release Date" value={formatDate(estimateDate)} />
          <InfoRow
            label="Target Startup"
            value={startDate ? formatDate(startDate) : "N/A"}
          />
          <InfoRow label="Ingested On" value={formatDateTime(createdAt)} />
          <InfoRow label="Last Synthesis" value={formatDateTime(updatedAt)} />
          <div className="h-px w-full bg-black/5 my-2"></div>
          <InfoRow
            label="Agreed Engineering"
            value={formatHours(totalAgreatedHours)}
          />
          <InfoRow label="Final Capacity" value={formatHours(finalHours)} />
          <InfoRow
            label="Scheduling Weeks"
            value={finalWeeks != null ? finalWeeks : "N/A"}
          />
          <InfoRow
            label="Monetary Value"
            value={
              finalPrice != null ? (
                <span className="text-green-600 font-black">${finalPrice.toLocaleString()}</span>
              ) : (
                "N/A"
              )
            }
          />
        </div>
      </div>

      {/* Files Section */}
      <div className="mt-8">
        <RenderFiles
          files={files || []}
          table="estimation"
          parentId={id}
          formatDate={formatDate}
        />
      </div>

      {/* Action Buttons */}
      <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-4 border-t border-black/10 mt-10">
        <Button
          className="w-full lg:w-auto py-4 px-8 text-[10px] font-black bg-white text-black border border-black/10 rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all shadow-sm uppercase tracking-[0.2em]"
          onClick={() => setIsEstimationTaskOpen(!isEstimationTaskOpen)}
        >
          Estimation Task
        </Button>
        <Button
          className="w-full lg:w-auto py-4 px-8 text-[10px] font-black bg-white text-black border border-black/10 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm uppercase tracking-[0.2em]"
          onClick={() => setIsHoursOpen(!isHoursOpen)}
        >
          Engineering Hours
        </Button>
        <Button
          className="w-full lg:w-auto py-4 px-8 text-[10px] font-black bg-white text-black border border-black/10 rounded-2xl hover:bg-purple-50 hover:border-purple-200 transition-all shadow-sm uppercase tracking-[0.2em]"
          onClick={() => setIsInclusionOpen(!isInclusionOpen)}
        >
          Compliance Matrix
        </Button>
        <Button
          className="w-full lg:w-auto py-4 px-8 text-[10px] font-black bg-black text-white border border-black rounded-2xl hover:bg-black/90 transition-all shadow-xl uppercase tracking-[0.2em] lg:ml-auto"
          onClick={() => setIsEditing(!isEditing)}
        >
          Modify Manifesto
        </Button>
      </div>

      {isEstimationTaskOpen && (
        <AllEstimationTask
          estimationId={estimation?.id || ""}
          onRefresh={fetchEstimation}
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
        <div className="mt-8 border border-black/10 rounded-3xl p-5 sm:p-10 bg-gray-50/30 shadow-inner overflow-hidden">
          <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-6">
            <div className="flex flex-col">
              <h3 className="text-xs font-black text-black uppercase tracking-[0.3em]">Engineering Analysis</h3>
              <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-1">Detailed Time Allocation</span>
            </div>
            <button
              onClick={() => setIsHoursOpen(false)}
              className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <LineItemGroup estimationId={estimation?.id} />
        </div>
      )}
      {isInclusionOpen && (
        <div className="mt-8 border border-black/10 rounded-3xl p-5 sm:p-10 bg-gray-50/30 shadow-inner">
          <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-6">
            <div className="flex flex-col">
              <h3 className="text-xs font-black text-black uppercase tracking-[0.3em]">Compliance Matrix</h3>
              <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-1">Inclusion & Exclusion Protocols</span>
            </div>
            <button
              onClick={() => setIsInclusionOpen(false)}
              className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all"
            >
              <X size={20} />
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

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row items-baseline sm:items-center gap-1 sm:gap-4 border-b border-black/5 pb-3">
    <span className="text-black/30 text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] shrink-0 w-full sm:w-32 lg:w-40">
      {label}
    </span>
    <span className="text-black font-black text-left flex-1 break-words text-xs sm:text-sm uppercase tracking-tight">
      {value}
    </span>
  </div>
);

export default GetEstimationByID;
