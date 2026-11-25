export type DateInput = Date | string | number;

export interface TaskScheduleInput {
  createdAt: DateInput;
  approvalDate: DateInput;
  isSubmitted: boolean;
  currentDate?: DateInput;
}

export interface TaskScheduleResult {
  totalDays: number;
  elapsedDays: number;
  plusDays: number;
  scheduleLabel: string;
  taskPercent: number;
  isOverdue: boolean;
}

const MS_PER_DAY = 86_400_000;
const OVERDUE_PROGRESS_CAP = 80;

/**
 * Normalizes a date input to the UTC start of day (00:00:00.000 UTC)
 * so partial hours and local timezone offsets do not skew day counts.
 */
export function toUtcStartOfDayMs(input: DateInput): number {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date input: ${String(input)}`);
  }
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Computes whole calendar days between two UTC start-of-day timestamps.
 */
function differenceInUtcDays(laterUtcMs: number, earlierUtcMs: number): number {
  return Math.round((laterUtcMs - earlierUtcMs) / MS_PER_DAY);
}

/**
 * Helper to derive `isSubmitted` from a task status string.
 */
export function isTaskSubmittedStatus(status?: string | null): boolean {
  if (!status) return false;
  const normalized = status.trim().toLowerCase();
  return normalized === "completed" || normalized === "submitted";
}

/**
 * Helper to determine if a milestone's status represents completed/approved submission.
 */
export function isMilestoneSubmittedStatus(status?: string | null): boolean {
  if (!status) return false;
  const normalized = status.trim().toLowerCase();
  return (
    normalized === "completed" ||
    normalized === "complete" ||
    normalized === "submitted" ||
    normalized === "approved"
  );
}

const COMPLETED_TASK_STATUSES = new Set([
  "COMPLETE",
  "VALIDATE_COMPLETE",
  "COMPLETE_OTHER",
  "USER_FAULT",
  "COMPLETED",
]);

function isValidDateInput(value: unknown): value is DateInput {
  if (value === null || value === undefined || value === "") return false;
  const d = value instanceof Date ? value : new Date(value as string | number);
  return !Number.isNaN(d.getTime());
}

export interface MilestoneScheduleResolution extends TaskScheduleResult {
  taskProgress: number;
  isSubmitted: boolean;
  hasValidScheduleDates: boolean;
}

/**
 * Computes schedule progress for a milestone object using `calculateTaskSchedule`.
 * - Safely guards against null/missing `approvalDate` (prevents `new Date(null)` -> 1970-01-01 bug).
 * - Never returns 100% unless submission/completion is actually finished (`isSubmitted`).
 */
export function resolveMilestoneSchedule(
  milestone: Record<string, any> | null | undefined,
  currentDate: DateInput = new Date(),
): MilestoneScheduleResolution {
  const tasks = milestone?.Tasks || milestone?.tasks || [];
  let taskProgress = 0;
  if (Array.isArray(tasks) && tasks.length > 0) {
    const completedCount = tasks.filter((t: any) =>
      COMPLETED_TASK_STATUSES.has(String(t?.status || "").toUpperCase()),
    ).length;
    taskProgress = Math.round((completedCount / tasks.length) * 100);
  }

  const isSubmitted =
    Boolean(milestone?.isSubmitted) ||
    isMilestoneSubmittedStatus(milestone?.status);

  const startRaw =
    milestone?.startDate ??
    milestone?.StartDate ??
    milestone?.date ??
    milestone?.createdAt;
  const approvalRaw = milestone?.approvalDate ?? milestone?.ApprovalDate;

  if (isValidDateInput(startRaw) && isValidDateInput(approvalRaw)) {
    const schedule = calculateTaskSchedule({
      createdAt: startRaw,
      approvalDate: approvalRaw,
      isSubmitted,
      currentDate,
    });
    return {
      ...schedule,
      taskProgress,
      isSubmitted,
      hasValidScheduleDates: true,
    };
  }

  if (isSubmitted) {
    return {
      totalDays: 1,
      elapsedDays: 0,
      plusDays: 0,
      scheduleLabel: "Completed",
      taskPercent: 100,
      isOverdue: false,
      taskProgress,
      isSubmitted: true,
      hasValidScheduleDates: false,
    };
  }

  // Without a valid submittal date, fall back to stored percentage or task progress, capped at 80%
  const rawManual =
    milestone?.completeionPercentage ??
    milestone?.completionPercentage ??
    milestone?.percentage;
  const parsedManual =
    rawManual !== undefined &&
    rawManual !== null &&
    rawManual !== "" &&
    Number(rawManual) > 0
      ? Number(rawManual)
      : null;

  const fallbackPercent = Math.min(
    OVERDUE_PROGRESS_CAP,
    Math.max(0, Math.round(parsedManual ?? taskProgress)),
  );

  return {
    totalDays: 1,
    elapsedDays: 0,
    plusDays: 0,
    scheduleLabel: "On Schedule",
    taskPercent: fallbackPercent,
    isOverdue: false,
    taskProgress,
    isSubmitted: false,
    hasValidScheduleDates: false,
  };
}

/**
 * Calculates task schedule tracking metrics and completion percentage:
 * - 100% when submitted
 * - Capped at 80% when unsubmitted and past approvalDate (20% reserved for final submission)
 * - Scaled linearly 0–80% otherwise based on UTC day progress
 */
export function calculateTaskSchedule({
  createdAt,
  approvalDate,
  isSubmitted,
  currentDate = new Date(),
}: TaskScheduleInput): TaskScheduleResult {
  const createdDay = toUtcStartOfDayMs(createdAt);
  const approvalDay = toUtcStartOfDayMs(approvalDate);
  const currentDay = toUtcStartOfDayMs(currentDate);

  const totalDays = Math.max(1, differenceInUtcDays(approvalDay, createdDay));
  const elapsedDays = Math.max(0, differenceInUtcDays(currentDay, createdDay));

  if (isSubmitted) {
    return {
      totalDays,
      elapsedDays,
      plusDays: 0,
      scheduleLabel: "Completed",
      taskPercent: 100,
      isOverdue: false,
    };
  }

  // Clamp progress and overdue state to 0 if currentDate precedes creation
  if (currentDay < createdDay) {
    return {
      totalDays,
      elapsedDays: 0,
      plusDays: 0,
      scheduleLabel: "On Schedule",
      taskPercent: 0,
      isOverdue: false,
    };
  }

  if (currentDay > approvalDay) {
    const plusDays = differenceInUtcDays(currentDay, approvalDay);
    return {
      totalDays,
      elapsedDays,
      plusDays,
      scheduleLabel: `+${plusDays} days`,
      taskPercent: OVERDUE_PROGRESS_CAP,
      isOverdue: true,
    };
  }

  const taskPercent = Math.min(
    OVERDUE_PROGRESS_CAP,
    Math.round((elapsedDays / totalDays) * OVERDUE_PROGRESS_CAP),
  );

  return {
    totalDays,
    elapsedDays,
    plusDays: 0,
    scheduleLabel: "On Schedule",
    taskPercent,
    isOverdue: false,
  };
}
