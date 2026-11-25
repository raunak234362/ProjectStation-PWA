import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import {
  calculateTaskSchedule,
  isTaskSubmittedStatus,
  type DateInput,
  type TaskScheduleResult,
} from "../../utils/calculateTaskSchedule";

export interface TaskScheduleProgressProps {
  createdAt?: DateInput;
  approvalDate?: DateInput;
  isSubmitted?: boolean;
  status?: string | null;
  currentDate?: DateInput;
  schedule?: TaskScheduleResult & { isSubmitted?: boolean };
  showDayCounts?: boolean;
  className?: string;
}

export const TaskScheduleProgress: React.FC<TaskScheduleProgressProps> = ({
  createdAt,
  approvalDate,
  isSubmitted,
  status,
  currentDate,
  schedule: precomputedSchedule,
  showDayCounts = false,
  className = "",
}) => {
  const submitted =
    precomputedSchedule?.isSubmitted ??
    (isSubmitted !== undefined ? isSubmitted : isTaskSubmittedStatus(status));

  const schedule = useMemo(() => {
    if (precomputedSchedule) return precomputedSchedule;
    if (createdAt !== undefined && approvalDate !== undefined) {
      return calculateTaskSchedule({
        createdAt,
        approvalDate,
        isSubmitted: submitted,
        currentDate,
      });
    }
    return {
      totalDays: 1,
      elapsedDays: 0,
      plusDays: 0,
      scheduleLabel: submitted ? "Completed" : "On Schedule",
      taskPercent: submitted ? 100 : 0,
      isOverdue: false,
    };
  }, [precomputedSchedule, createdAt, approvalDate, submitted, currentDate]);

  const { taskPercent, plusDays, scheduleLabel, isOverdue, elapsedDays, totalDays } =
    schedule;

  const badgeStyle = submitted
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isOverdue
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  const barFillColor = submitted
    ? "bg-emerald-500"
    : isOverdue
      ? "bg-amber-500"
      : "bg-teal-500";

  const percentTextColor = submitted
    ? "text-emerald-700"
    : isOverdue
      ? "text-red-700"
      : "text-gray-800";

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-sm font-bold tabular-nums ${percentTextColor}`}>
            {taskPercent}%
          </span>
          {showDayCounts && (
            <span className="text-[11px] font-medium text-gray-500 tabular-nums">
              ({elapsedDays}/{totalDays}d)
            </span>
          )}
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${badgeStyle}`}
          title={
            isOverdue
              ? `Overdue by ${plusDays} days (capped at 80% until final submission)`
              : scheduleLabel
          }
        >
          {submitted ? (
            <CheckCircle2 className="w-3 h-3 shrink-0" />
          ) : isOverdue ? (
            <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
          ) : (
            <Clock className="w-3 h-3 shrink-0 text-slate-500" />
          )}
          <span>{scheduleLabel}</span>
        </span>
      </div>

      <div
        className={`w-full h-2 rounded-full overflow-hidden relative ${
          isOverdue ? "bg-red-100" : "bg-gray-100"
        }`}
        role="progressbar"
        aria-valuenow={taskPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barFillColor}`}
          style={{ width: `${taskPercent}%` }}
        />
      </div>
    </div>
  );
};

export default TaskScheduleProgress;
