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
  "COMPLETED",
  "VALIDATE_COMPLETE",
  "VALIDATE_COMPLETED",
]);

const EXCLUDED_TASK_STATUSES = new Set([
  "USER_FAULT",
  "COMPLETE_OTHER",
  "ABSENT",
  "WRONG_ALLOCATION",
  "IN_REVIEW",
  "IN REVIEW",
  "IN-REVIEW",
]);

function isExcludedFromCompletion(task: any): boolean {
  const status = String(task?.status || "").trim().toUpperCase();
  const title = String(task?.name || task?.title || "").trim().toUpperCase();
  return (
    EXCLUDED_TASK_STATUSES.has(status) ||
    title.includes("ABSENT") ||
    title.includes("WRONG ALLOCATION") ||
    title.includes("WRONG_ALLOCATION")
  );
}

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

function pickPositiveProgressValue(...values: unknown[]): number | null {
  for (const v of values) {
    if (v === undefined || v === null || v === "") continue;
    const num = typeof v === "number" ? v : parseFloat(String(v).trim());
    if (Number.isFinite(num) && num > 0 && num < 100) {
      return num;
    }
  }
  return null;
}

function pickAnyPositiveProgressValue(...values: unknown[]): number | null {
  for (const v of values) {
    if (v === undefined || v === null || v === "") continue;
    const num = typeof v === "number" ? v : parseFloat(String(v).trim());
    if (Number.isFinite(num) && num > 0) {
      return num;
    }
  }
  return null;
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
    const completedCount = tasks.filter(
      (t: any) =>
        !isExcludedFromCompletion(t) &&
        COMPLETED_TASK_STATUSES.has(String(t?.status || "").trim().toUpperCase()),
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

  const hasValidDates =
    isValidDateInput(startRaw) && isValidDateInput(approvalRaw);

  if (isSubmitted) {
    const schedule = hasValidDates
      ? calculateTaskSchedule({
          createdAt: startRaw,
          approvalDate: approvalRaw,
          isSubmitted: true,
          currentDate,
        })
      : {
          totalDays: 1,
          elapsedDays: 0,
        };

    return {
      totalDays: schedule.totalDays,
      elapsedDays: schedule.elapsedDays,
      plusDays: 0,
      scheduleLabel: "Completed",
      taskPercent: 100,
      isOverdue: false,
      taskProgress,
      isSubmitted: true,
      hasValidScheduleDates: hasValidDates,
    };
  }

  const schedule = hasValidDates
    ? calculateTaskSchedule({
        createdAt: startRaw,
        approvalDate: approvalRaw,
        isSubmitted: false,
        currentDate,
      })
    : {
        totalDays: 1,
        elapsedDays: 0,
        plusDays: 0,
        scheduleLabel: "On Schedule",
        taskPercent: 0,
        isOverdue: false,
      };

  // Match TaskMatrix field priority while skipping 0/empty values and stale 100% on active milestones:
  // 1. completeionPercentage / completionPercentage (> 0 and < 100)
  // 2. taskProgress (> 0)
  // 3. percentage (> 0 and < 100)
  // 4. Time-based schedule progress (0-80%)
  // 5. Fallback for any stored value (e.g. 100 when no dates exist), capped at 80%
  const explicitCompletion = pickPositiveProgressValue(
    milestone?.completeionPercentage,
    milestone?.completionPercentage,
  );
  const explicitPercentage = pickPositiveProgressValue(milestone?.percentage);
  const anyStored = pickAnyPositiveProgressValue(
    milestone?.completeionPercentage,
    milestone?.completionPercentage,
    milestone?.percentage,
  );

  let resolvedPercent: number;
  if (explicitCompletion !== null) {
    resolvedPercent = Math.min(OVERDUE_PROGRESS_CAP, Math.round(explicitCompletion));
  } else if (taskProgress > 0) {
    resolvedPercent = Math.min(OVERDUE_PROGRESS_CAP, taskProgress);
  } else if (explicitPercentage !== null) {
    resolvedPercent = Math.min(OVERDUE_PROGRESS_CAP, Math.round(explicitPercentage));
  } else if (hasValidDates) {
    resolvedPercent = schedule.taskPercent;
  } else if (anyStored !== null) {
    resolvedPercent = Math.min(OVERDUE_PROGRESS_CAP, Math.round(anyStored));
  } else {
    resolvedPercent = 0;
  }

  return {
    ...schedule,
    taskPercent: resolvedPercent,
    taskProgress,
    isSubmitted: false,
    hasValidScheduleDates: hasValidDates,
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
