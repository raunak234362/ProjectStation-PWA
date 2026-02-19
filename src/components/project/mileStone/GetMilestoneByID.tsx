import React, { useEffect, useState } from "react";
import {
  Loader2,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ClipboardList,
  User,
  Tag,
  Edit,
} from "lucide-react";
import Service from "../../../api/Service";
import { toast } from "react-toastify";
import { Button } from "../../ui/button";
import EditMileStone from "./EditMileStone";
import UpdateCompletionPer from "./UpdateCompletionPer";

interface Milestone {
  id: string | number;
  subject: string;
  description: string;
  approvalDate: string;
  status: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  project?: {
    name: string;
  };
  Tasks?: Array<{
    id: string | number;
    name: string;
    status: string;
    user?: {
      firstName: string;
      lastName: string;
    };
  }>;
  tasks?: Array<{
    id: string | number;
    name: string;
    status: string;
    user?: {
      firstName: string;
      lastName: string;
    };
  }>;
  percentage?: string | number;
  completionPercentage?: string | number;
  completeionPercentage?: string | number;
}

interface GetMilestoneByIDProps {
  row: any;
  close: () => void;
}

const GetMilestoneByID: React.FC<GetMilestoneByIDProps> = ({ row, close }) => {
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdateProgressModalOpen, setIsUpdateProgressModalOpen] =
    useState(false);
  const id = row?.id;
  const userRole = sessionStorage.getItem("userRole");

  const fetchMilestone = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await Service.GetMilestoneById(id.toString());
      setMilestone(response?.data || null);
    } catch (error) {
      console.error("Error fetching milestone:", error);
      toast.error("Failed to load milestone details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestone();
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const getStatusConfig = (status?: string) => {
    const configs: Record<
      string,
      { label: string; bg: string; text: string; border: string }
    > = {
      APPROVED: {
        label: "Approved",
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-300",
      },
      PENDING: {
        label: "Pending",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300",
      },
      REJECTED: {
        label: "Rejected",
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
      },
    };
    return (
      configs[status?.toUpperCase() || ""] || {
        label: status || "Unknown",
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-300",
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          <p className="mt-4 text-sm font-medium text-gray-700">
            Loading milestone details...
          </p>
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-semibold text-gray-700">
          Milestone Not Found
        </p>
        <p className="text-gray-700 mt-1">
          This milestone may have been removed.
        </p>
        <Button
          onClick={close}
          className="mt-6 px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(milestone.status);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className=" px-6 py-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl  text-black leading-tight">
              {milestone.subject}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUpdateProgressModalOpen(true)}
                className="text-black border border-black bg-green-50 hover:bg-white/20 flex items-center gap-2 "
              >
                <CheckCircle2 className="w-4 h-4" />
                Update Progress
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="text-black border border-black bg-green-50 hover:bg-white/20 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </>
          )}
          <button
            onClick={close}
            className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
          >
            Close
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoCard
            icon={<Calendar className="w-5 h-5" />}
            label="Approval Date"
            value={formatDate(milestone.approvalDate)}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <InfoCard
            icon={<Clock className="w-5 h-5" />}
            label="Created At"
            value={formatDate(milestone.date)}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </span>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs  border-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} w-fit mt-1`}
            >
              {statusConfig.label}
            </div>
          </div>
          <InfoCard
            icon={<Tag className="w-5 h-5" />}
            label="Project"
            value={milestone.project?.name || "—"}
            color="text-green-600"
            bg="bg-green-50"
          />
          <div className="flex flex-col gap-1 w-full col-span-1 md:col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Progress
            </span>
            <div className="mt-2 w-full">
              {(() => {
                const msTasks = milestone.Tasks || milestone.tasks || [];
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
                  taskProgress = Math.round(
                    (completedCount / totalTasks) * 100,
                  );
                }

                const finalProgress =
                  milestone.percentage !== undefined &&
                  milestone.percentage !== null &&
                  milestone.percentage !== ""
                    ? Number(milestone.percentage)
                    : milestone.completionPercentage !== undefined &&
                        milestone.completionPercentage !== null
                      ? Number(milestone.completionPercentage)
                      : milestone.completeionPercentage !== undefined &&
                          milestone.completeionPercentage !== null
                        ? Number(milestone.completeionPercentage)
                        : taskProgress;

                return (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{finalProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, finalProgress))}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-sm  text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            Description
          </h3>
          <div
            className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                milestone.description ||
                "No description provided for this milestone.",
            }}
          />
        </div>

        {/* Tasks Section (Optional - if the API returns tasks) */}
        {milestone.tasks && milestone.tasks.length > 0 && (
          <div>
            <h3 className="text-sm  text-gray-700 mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-green-600" />
              Associated Tasks ({milestone.tasks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestone.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {task.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-700">
                          {task.user
                            ? `${task.user.firstName} ${task.user.lastName}`
                            : "Unassigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px]  px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <EditMileStone
              milestoneId={id.toString()}
              onClose={() => setIsEditModalOpen(false)}
              onSuccess={() => {
                fetchMilestone();
                setIsEditModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {isUpdateProgressModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg h-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <UpdateCompletionPer
              milestoneId={id.toString()}
              onClose={() => setIsUpdateProgressModalOpen(false)}
              onSuccess={() => {
                fetchMilestone();
                setIsUpdateProgressModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {label}
    </span>
    <div className="flex items-center gap-2 mt-1">
      <div className={`p-1.5 ${bg} ${color} rounded-lg`}>{icon}</div>
      <span className="text-sm  text-gray-700">{value}</span>
    </div>
  </div>
);

export default GetMilestoneByID;
