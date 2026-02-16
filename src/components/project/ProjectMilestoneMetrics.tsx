import React, { useEffect, useMemo } from "react";
import { Calendar, CalendarCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setMilestonesForProject } from "../../store/milestoneSlice";
import { formatDate } from "../../utils/dateUtils";
import Service from "../../api/Service";

interface ProjectMilestoneMetricsProps {
  projectId: string;
  projectName?: string;
}

const ProjectMilestoneMetrics: React.FC<ProjectMilestoneMetricsProps> = ({
  projectId,
}) => {
  const dispatch = useDispatch();

  const milestonesByProject = useSelector(
    (state: any) => state.milestoneInfo?.milestonesByProject || {},
  );
  const milestones = milestonesByProject[projectId] || [];

  useEffect(() => {
    const fetchMileStone = async () => {
      try {
        const response = await Service.GetProjectMilestoneById(projectId);
        if (response && response.data) {
          dispatch(
            setMilestonesForProject({
              projectId,
              milestones: response.data,
            }),
          );
        }
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    };

    if (!milestonesByProject[projectId]) {
      fetchMileStone();
    }
  }, [projectId, milestonesByProject, dispatch]);

  const milestoneStats = useMemo(() => {
    return milestones.map((ms: any) => {
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

      // Time Progress calculation
      let timeProgress = 0;
      const start = new Date(ms.startDate || ms.StartDate);
      const approval = new Date(ms.approvalDate || ms.ApprovalDate);

      if (!isNaN(start.getTime()) && !isNaN(approval.getTime())) {
        const totalDuration = approval.getTime() - start.getTime();
        const elapsed = Date.now() - start.getTime();

        if (totalDuration > 0) {
          timeProgress = Math.min(
            100,
            Math.max(0, Math.round((elapsed / totalDuration) * 100)),
          );
        } else if (Date.now() > approval.getTime()) {
          timeProgress = 100;
        }
      }

      const finalProgress =
        ms.percentage !== undefined &&
        ms.percentage !== null &&
        ms.percentage !== ""
          ? Number(ms.percentage)
          : taskProgress;

      return {
        ...ms,
        progress: finalProgress,
        taskPercentage: taskProgress,
        timePercent: timeProgress,
      };
    });
  }, [milestones]);

  return (
    <div className="space-y-8 p-1">
      {/* Project Status Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-teal-600" />
          Project Status
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
              Milestones
            </h4>
            {milestoneStats.length > 0 ? (
              <div className="space-y-4">
                {milestoneStats.map((ms: any) => (
                  <div key={ms.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-800 dark:text-slate-200 font-medium text-sm">
                        {ms.subject}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-500">
                        Completion % : {ms.taskPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 relative overflow-hidden">
                      {/* Time Progress (background shadow layer) */}
                      <div
                        className="absolute top-0 left-0 h-2 bg-gray-400 dark:bg-slate-500 opacity-40 transition-all duration-500"
                        style={{ width: `${ms.timePercent}%` }}
                      ></div>
                      {/* Task Completion (real progress) */}
                      <div
                        className="absolute top-0 left-0 h-2 rounded-full bg-teal-500 transition-all duration-500"
                        style={{ width: `${ms.taskPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-slate-500 text-sm italic">
                No milestones available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Approvals Section */}
      <div>
        <h4 className="text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-tight">
          <CalendarCheck size={20} className="text-green-600" />
          Approval Milestones
        </h4>
        {milestoneStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestoneStats.map((ms: any, index: number) => (
              <div
                key={ms.id || index}
                className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-slate-200 mb-1 line-clamp-1">
                    {ms.subject}
                  </h5>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-slate-500 mb-2">
                    <span>Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest ${
                        ms.status === "APPROVED" || ms.status === "COMPLETED"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {ms.status || "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-slate-500 mb-2">
                    <span>Stage:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest ${
                        ms.status === "APPROVED" || ms.status === "COMPLETED"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {ms.stage || "PENDING"}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-slate-800 pt-2 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-500 uppercase text-xs font-semibold">
                      Approval Date
                    </span>
                    <span className="font-bold text-gray-700 dark:text-slate-300">
                      {formatDate(ms.approvalDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 text-center text-gray-500 dark:text-slate-500 italic">
            No milestones found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMilestoneMetrics;
