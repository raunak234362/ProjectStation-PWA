-- PostgreSQL query / computed expressions for Task Schedule Tracking & Progress
-- Normalizes all timestamps to UTC start-of-day dates via (ts AT TIME ZONE 'UTC')::date.
-- Replace `tasks` and column names (`created_at`, `approval_date`, `status`) with your table/schema names.

WITH normalized_tasks AS (
  SELECT
    t.id,
    t.status,
    (LOWER(TRIM(COALESCE(t.status, ''))) IN ('completed', 'submitted')) AS is_submitted,
    (t.created_at AT TIME ZONE 'UTC')::date AS created_day,
    (t.approval_date AT TIME ZONE 'UTC')::date AS approval_day,
    (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date AS current_day
  FROM tasks t
),
schedule_metrics AS (
  SELECT
    id,
    status,
    is_submitted,
    created_day,
    approval_day,
    current_day,
    GREATEST(1, (approval_day - created_day)) AS total_days,
    GREATEST(0, (current_day - created_day)) AS elapsed_days
  FROM normalized_tasks
)
SELECT
  id,
  status,
  is_submitted,
  total_days,
  elapsed_days,
  -- Overdue counter: +X days when unsubmitted and current_day > approval_day (and not before created_day)
  CASE
    WHEN is_submitted THEN 0
    WHEN current_day < created_day THEN 0
    WHEN current_day > approval_day THEN (current_day - approval_day)
    ELSE 0
  END AS plus_days,
  -- Display label
  CASE
    WHEN is_submitted THEN 'Completed'
    WHEN current_day < created_day THEN 'On Schedule'
    WHEN current_day > approval_day THEN '+' || (current_day - approval_day)::text || ' days'
    ELSE 'On Schedule'
  END AS schedule_label,
  -- Completion percentage: 100 if submitted, capped at 80 if overdue, 0-80 linear otherwise
  CASE
    WHEN is_submitted THEN 100
    WHEN current_day < created_day THEN 0
    WHEN current_day > approval_day THEN 80
    ELSE LEAST(80, ROUND((elapsed_days::numeric / total_days) * 80))::int
  END AS task_percent,
  (NOT is_submitted AND current_day >= created_day AND current_day > approval_day) AS is_overdue
FROM schedule_metrics;
