import React from "react";
import { CalendarCheck, ArrowRight } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";

interface ProjectUpcomingMilestonesProps {
  milestones: any[];
  onViewAll?: () => void;
  onMilestoneClick?: (milestone: any) => void;
}

const ProjectUpcomingMilestones: React.FC<ProjectUpcomingMilestonesProps> = ({
  milestones,
  onViewAll,
  onMilestoneClick,
}) => {
  // Filter for pending milestones (not approved or completed)
  const upcomingMilestones = milestones.filter(
    (ms) => ms.status !== "APPROVED" && ms.status !== "COMPLETED",
  );

  return (
    <div className="bg-white rounded-[24px] border border-black/5 shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-semibold text-black uppercase tracking-tight flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-green-600" />
          Milestones Pending Submittal
        </h4>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-green-600 hover:underline uppercase tracking-widest flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {upcomingMilestones.length > 0 ? (
          upcomingMilestones.slice(0, 5).map((ms, index) => {
            const msTasks = ms.Tasks || ms.tasks || [];
            const totalTasks = msTasks.length;
            let taskProgress = 0;
            if (totalTasks > 0) {
              const completedStatuses = [
                "COMPLETE",
                "VALIDATE_COMPLETE",
                "COMPLETE_OTHER",
                "USER_FAULT",
                "COMPLETED",
              ];
              const completedCount = msTasks.filter((t: any) =>
                completedStatuses.includes(t.status),
              ).length;
              taskProgress = Math.round((completedCount / totalTasks) * 100);
            }

            const startDateRaw = ms.startDate || ms.StartDate || ms.date || ms.createdAt;
            const start = startDateRaw ? new Date(startDateRaw) : null;
            const approvalDateRaw = ms.approvalDate || ms.ApprovalDate;
            const approval = approvalDateRaw ? new Date(approvalDateRaw) : null;

            let timeProgress = 0;
            if (start && approval && !isNaN(start.getTime()) && !isNaN(approval.getTime())) {
              const totalDuration = approval.getTime() - start.getTime();
              const elapsed = Date.now() - start.getTime();

              if (totalDuration > 0) {
                timeProgress = Math.min(
                  100,
                  Math.max(0, Math.round((elapsed / totalDuration) * 100)),
                );
              } else if (Date.now() >= approval.getTime()) {
                timeProgress = 100;
              }
            } else if (approval && !isNaN(approval.getTime())) {
              if (Date.now() >= approval.getTime()) {
                timeProgress = 100;
              }
            }

            const isCompleted = ms.status === "APPROVED" || ms.status === "COMPLETED";
            const finalProgress = isCompleted
              ? 100
              : (approval && !isNaN(approval.getTime()))
              ? timeProgress
              : (ms.completeionPercentage || 
                ms.completionPercentage || 
                taskProgress || 
                ms.percentage || 
                0);

            return (
              <div
                key={ms.id || index}
                onClick={() => onMilestoneClick?.(ms)}
                className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-green-200 hover:bg-white transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black truncate uppercase tracking-tight group-hover:text-green-700">
                    {ms.subject}{ms.subSubject ? ` - ${ms.subSubject}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                      {ms.stage || "PENDING"}
                    </span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] text-gray-500 font-bold">
                      {finalProgress}% Complete
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Submission Date
                  </p>
                  <p className="text-xs font-black text-black whitespace-nowrap">
                    {formatDate(ms.approvalDate)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No upcoming milestones found.
          </div>
        )}

        {upcomingMilestones.length > 5 && (
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
            And {upcomingMilestones.length - 5} more pending milestones
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectUpcomingMilestones;
