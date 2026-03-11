import React, { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setMilestonesForProject } from "../../store/milestoneSlice";
import { formatDate } from "../../utils/dateUtils";
import Service from "../../api/Service";
import UpdateCompletionPer from "./mileStone/UpdateCompletionPer";
import GetMilestoneByID from "./mileStone/GetMilestoneByID";

interface ProjectMilestoneMetricsProps {
  projectId: string;
  projectName?: string;
}

const ProjectMilestoneMetrics: React.FC<ProjectMilestoneMetricsProps> = ({
  projectId,
}) => {
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  const dispatch = useDispatch();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    null,
  );
  const [selectedMilestoneToView, setSelectedMilestoneToView] = useState<
    any | null
  >(null);

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

  const groupedMilestones = useMemo(() => {
    const groups: Record<string, any[]> = {};
    milestoneStats.forEach((ms: any) => {
      const stage = ms.stage || "PENDING";
      if (!groups[stage]) {
        groups[stage] = [];
      }
      groups[stage].push(ms);
    });

    // Sort milestones within each group, oldest first (latest on the right)
    Object.keys(groups).forEach((stage) => {
      groups[stage].sort((a, b) => {
        const dateA = new Date(
          a.approvalDate || a.ApprovalDate || a.createdAt || a.date || 0,
        ).getTime();
        const dateB = new Date(
          b.approvalDate || b.ApprovalDate || b.createdAt || b.date || 0,
        ).getTime();
        return dateA - dateB; // Ascending order
      });
    });

    // Optional: Sort stages alphabetically, or just return entries
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [milestoneStats]);

  return (
    <div className="space-y-8 p-1">
      {/* Project Status Section */}

      {/* Milestone Approvals Section */}
      <div>
        <h4 className="text-lg text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
          <CalendarCheck size={20} className="text-green-600" />
          Project Progress
        </h4>
        {groupedMilestones.length > 0 ? (
          <div className="space-y-8">
            {groupedMilestones.map(([stage, mStats]) => (
              <div key={stage} className="space-y-4">
                <h5 className="text-md font-bold text-gray-600 uppercase tracking-widest border-b bg-gray-50 px-4 py-2 rounded-t-xl border-gray-200">
                  {stage} Milestones
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mStats.map((ms: any, index: number) => (
                    <div
                      key={ms.id || index}
                      onClick={() => {
                        setSelectedMilestoneToView(ms);
                      }}
                      className={`p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between transition-colors cursor-pointer hover:bg-gray-50`}
                    >
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                          {ms.subject}
                        </h5>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                          <span>Status:</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-md uppercase font-bold tracking-widest ${
                              ms.status === "APPROVED" ||
                              ms.status === "COMPLETED"
                                ? " text-green-700"
                                : " text-yellow-700"
                            }`}
                          >
                            {ms.status || "PENDING"}
                          </span>
                        </div>
                        {/* <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                          <span>Stage:</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-md uppercase font-bold tracking-widest ${
                              ms.status === "APPROVED" ||
                              ms.status === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : " text-green-900"
                            }`}
                          >
                            {ms.stage || "PENDING"}
                          </span>
                        </div> */}
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                          <span>Completion Percentage :</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-md uppercase font-bold tracking-widest ${
                              ms.status === "APPROVED" ||
                              ms.status === "COMPLETED"
                                ? " text-green-700"
                                : " text-green-900"
                            }`}
                          >
                            {ms.completionPercentage ||
                              ms.taskPercentage ||
                              ms.percentage}
                            %
                          </span>
                          {userRole !== "client" &&
                            userRole !== "client_admin" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMilestoneId(ms.id || ms._id);
                                  setIsUpdateModalOpen(true);
                                }}
                                className="ml-2 text-gray-400 hover:text-blue-600"
                              >
                                <Pencil />
                              </button>
                            )}
                        </div>
                      </div>
                      <div className="w-full bg-red-500 rounded-full h-2 relative overflow-hidden">
                        {/* Time Progress (background shadow layer) */}
                        <div
                          className="absolute top-0 left-0 h-2 bg-gray-400 opacity-40 transition-all duration-500"
                          style={{ width: `${ms.timePercent}%` }}
                        ></div>
                        {/* Task Completion (real progress) */}
                        <div
                          className="absolute top-0 left-0 h-2 rounded-full bg-teal-500 transition-all duration-500"
                          style={{
                            width: `${ms.taskPercentage || ms.percentage}%`,
                          }}
                        ></div>
                      </div>
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 uppercase text-xs font-semibold">
                            Approval Date
                          </span>
                          <span className="font-bold text-gray-700">
                            {formatDate(ms.approvalDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center text-gray-500 italic">
            No milestones found.
          </div>
        )}
      </div>
      {isUpdateModalOpen && selectedMilestoneId && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg h-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <UpdateCompletionPer
              milestoneId={selectedMilestoneId}
              onClose={() => setIsUpdateModalOpen(false)}
              onSuccess={() => {
                const fetchMileStone = async () => {
                  try {
                    const response =
                      await Service.GetProjectMilestoneById(projectId);
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
                fetchMileStone();
                setIsUpdateModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {selectedMilestoneToView && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-5xl my-auto animate-in fade-in zoom-in duration-200">
            <GetMilestoneByID
              row={selectedMilestoneToView}
              close={() => {
                setSelectedMilestoneToView(null);
                const fetchMileStone = async () => {
                  try {
                    const response =
                      await Service.GetProjectMilestoneById(projectId);
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
                fetchMileStone();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMilestoneMetrics;
