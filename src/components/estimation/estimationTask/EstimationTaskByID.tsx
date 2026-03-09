"use client";

import React, { useEffect, useState } from "react";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import {
  Pause,
  Play,
  Square,
  Loader2,
  Calendar,
  User,
  FileText,
  Clock4,
  ChevronDown,
  ChevronUp,
  Building2,
  Hash,
  FolderOpen,
  Timer,
  Users,
} from "lucide-react";
import CreateLineItemGroup from "../estimationLineItem/CreateLineItemGroup";
import LineItemGroup from "../estimationLineItem/LineItemGroup";
import type { EstimationTaskPayload } from "../../../interface";
import { useDispatch } from "react-redux";
import { incrementModalCount, decrementModalCount } from "../../../store/uiSlice";

interface EstimationTaskByIDProps {
  id: string;
  onClose: () => void;
  refresh?: () => void;
}

interface EstimationTask extends EstimationTaskPayload {
  id: string;
  workinghours?: { id: string; ended_at: string | null }[];
  estimation?: {
    projectName: string;
    estimationNumber: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    username: string;
  };
}

interface SummaryData {
  totalHours: number;
}

export default function EstimationTaskByID({
  id,
  onClose,
  refresh,
}: EstimationTaskByIDProps) {
  const [task, setTask] = useState<EstimationTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [showWorkSummary, setShowWorkSummary] = useState(true);
  const [refreshGroups, setRefreshGroups] = useState(0);
  const dispatch = useDispatch();
  const fetchTask = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const taskRes = await Service.GetEstimationTaskById(id);
      const taskData = taskRes.data;
      setTask(taskData);

      const summaryRes = await Service.SummaryEstimationTaskById(id);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Error fetching task:", error);
      toast.error("Failed to load estimation task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(incrementModalCount());
    fetchTask();
    return () => {
      dispatch(decrementModalCount());
    };
  }, [id, dispatch]);

  const getActiveWorkID = () => {
    return task?.workinghours?.find((wh) => wh.ended_at === null)?.id || null;
  };

  const formatDecimalHours = (decimalHours: number | undefined) => {
    const num = Number(decimalHours);
    if (isNaN(num)) return "0h 0m";
    const hours = Math.floor(num);
    const minutes = Math.round((num - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const activeWorkID = getActiveWorkID();

  const toIST = (dateString: string | Date | undefined) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString as string));
  };

  const handleAction = async (action: string) => {
    if (!task?.id) return;
    try {
      setProcessing(true);
      switch (action) {
        case "start":
          await Service.StartEstimationTaskById(task.id);
          toast.success("Task started");
          break;
        case "pause":
          if (!activeWorkID) return toast.warning("No active session to pause");
          await Service.PauseEstimationTaskById(task.id, {
            whId: activeWorkID,
          });
          toast.info("Task paused");
          break;
        case "resume":
          await Service.ResumeEstimationTaskById(task.id);
          toast.success("Task resumed");
          break;
        case "end":
          if (!activeWorkID) return toast.warning("No active session to end");
          await Service.EndEstimationTaskById(task.id, { whId: activeWorkID });
          toast.success("Task completed");
          break;
      }
      await fetchTask();
      if (refresh) refresh();
    } catch (error) {
      toast.error("Action failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusConfig = (status: string | undefined) => {
    const configs: {
      [key: string]: {
        label: string;
        bg: string;
        text: string;
        border: string;
      };
    } = {
      ASSIGNED: {
        label: "Assigned",
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-300",
      },
      IN_PROGRESS: {
        label: "In Progress",
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-300",
      },
      BREAK: {
        label: "On Break",
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-300",
      },
      COMPLETED: {
        label: "Completed",
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
      },
    };
    return (
      configs[status || ""] || {
        label: status || "Unknown",
        bg: "bg-gray-100",
        text: "text-black",
        border: "border-black/10",
      }
    );
  };

  const statusConfig = getStatusConfig(task?.status);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading task details...
          </p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Task Not Found</p>
          <p className="text-gray-700 mt-2">
            This task may have been deleted or is inaccessible.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-black/10 px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl border border-black/5">
              <FileText className="w-7 h-7 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight">
                Estimation Task Details
              </h2>
              <p className="text-sm text-black/60 font-bold">ID: #{task.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-black/20 hover:bg-gray-50 text-black font-bold rounded-xl transition shadow-sm"
          >
            Close
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Task Info Card */}
          <div className="bg-green-50/30 rounded-3xl p-8 border border-black/10">
            <h3 className="text-2xl font-black text-black mb-6 flex items-center gap-3 uppercase tracking-tight">
              <FileText className="w-7 h-7 text-black" />
              Task Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoItem
                icon={<Building2 />}
                label="Project"
                value={task.estimation?.projectName || "—"}
              />
              <InfoItem
                icon={<Hash />}
                label="Estimation No."
                value={task.estimation?.estimationNumber || "—"}
              />
              <InfoItem
                icon={<User />}
                label="Assigned To"
                value={
                  task.assignedTo?.firstName || task.assignedTo?.username || "—"
                }
              />
              <InfoItem
                icon={<Calendar />}
                label="Start Date"
                value={toIST(task.startDate)}
              />
              <InfoItem
                icon={<Calendar />}
                label="End Date"
                value={toIST(task.endDate)}
              />
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-black uppercase tracking-widest text-black/40 mb-1">Status</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest border border-black/10 shadow-sm ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {task.notes && (
              <div className="mt-8 p-6 bg-white/70 backdrop-blur rounded-xl border border-green-100">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Notes
                </h4>
                <div
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: task.notes }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-black/10">
              <h4 className="text-lg font-black text-black uppercase tracking-widest mb-4">
                Task Controls
              </h4>
              <div className="flex flex-wrap items-center gap-4">
                {task.status === "ASSIGNED" && (
                  <ActionButton
                    icon={<Play />}
                    color="emerald"
                    onClick={() => handleAction("start")}
                    disabled={processing}
                  >
                    Start Task
                  </ActionButton>
                )}
                {task.status === "IN_PROGRESS" && (
                  <>
                    <ActionButton
                      icon={<Pause />}
                      color="amber"
                      onClick={() => handleAction("pause")}
                      disabled={processing}
                    >
                      Pause
                    </ActionButton>
                    <ActionButton
                      icon={<Square />}
                      color="red"
                      onClick={() => handleAction("end")}
                      disabled={processing}
                    >
                      End Task
                    </ActionButton>
                  </>
                )}
                {task.status === "BREAK" && (
                  <ActionButton
                    icon={<Play />}
                    color="green"
                    onClick={() => handleAction("resume")}
                    disabled={processing}
                  >
                    Resume Task
                  </ActionButton>
                )}
                {processing && (
                  <div className="flex items-center gap-2 text-black font-bold">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Work Summary */}
          {summary && (
            <div className="bg-white rounded-3xl p-6 border border-black/10 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-3">
                  <Timer className="w-6 h-6" />
                  Work Summary
                </h3>
                <button
                  onClick={() => setShowWorkSummary(!showWorkSummary)}
                  className="text-black hover:text-green-600 transition-colors"
                >
                  {showWorkSummary ? (
                    <ChevronUp size={24} />
                  ) : (
                    <ChevronDown size={24} />
                  )}
                </button>
              </div>
              {showWorkSummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SummaryCard
                    icon={<Clock4 />}
                    label="Total Time"
                    value={formatDecimalHours(summary?.totalHours)}
                  />
                  <SummaryCard
                    icon={<Users />}
                    label="Sessions"
                    value={task?.workinghours?.length || 0}
                  />
                  <SummaryCard
                    icon={<Timer />}
                    label="Status"
                    value={statusConfig.label}
                    color="text-black"
                  />
                </div>
              )}
            </div>
          )}

          {/* Line Item Groups Section */}
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl  text-gray-700 flex items-center gap-3">
                <FolderOpen className="w-7 h-7 text-green-600" />
                Line Item Groups
              </h3>
            </div>
            <div className="flex flex-col gap-6">
              <CreateLineItemGroup
                estimationId={task?.estimationId}
                onGroupCreated={() => setRefreshGroups((prev) => prev + 1)}
              />
              <LineItemGroup
                estimationId={task?.estimationId}
                refreshTrigger={refreshGroups}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-4">
    <div className="p-3 bg-white rounded-2xl shadow-sm shrink-0 border border-black/5">
      {icon && <div className="w-6 h-6 text-black/60">{icon}</div>}
    </div>
    <div>
      <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{label}</p>
      <p className="font-bold text-black mt-1">{value}</p>
    </div>
  </div>
);

const ActionButton = ({
  children,
  icon,
  color,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  color: "emerald" | "amber" | "red" | "green";
  onClick: () => void;
  disabled: boolean;
}) => {
  const colors = {
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    amber: "bg-amber-600 hover:bg-amber-700",
    red: "bg-red-600 hover:bg-red-700",
    green: "bg-green-600 hover:bg-green-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-6 py-3 ${colors[color]} text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed border border-black/10`}
    >
      {icon}
      {children}
    </button>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
  color = "text-black",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) => (
  <div className="bg-gray-50 flex flex-row gap-5 items-center justify-center p-4 rounded-2xl border border-black/10 text-center">
    <div className="w-12 h-12 mx-auto bg-white border border-black/5 rounded-full flex items-center justify-center text-black/60 shadow-sm">
      {icon}
    </div>
    <div className="text-left">
      <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{label}</p>
      <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
    </div>
  </div>
);
