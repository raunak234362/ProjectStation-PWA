import React from "react";
import { ListTodo, ArrowRight } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";

interface ProjectUpcomingSubmittalsProps {
  submittals: any[];
  onViewAll?: () => void;
  onSubmittalClick?: (id: string) => void;
}

const ProjectUpcomingSubmittals: React.FC<ProjectUpcomingSubmittalsProps> = ({
  submittals,
  onViewAll,
  onSubmittalClick,
}) => {
  // Filter for "Upcoming" (Pending) submittals
  const upcomingSubmittals = submittals.filter(s => s.status !== true);

  return (
    <div className="bg-white rounded-[24px] border border-black/5 shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-green-600" />
          Upcoming Submittals
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
        {upcomingSubmittals.length > 0 ? (
          upcomingSubmittals.slice(0, 5).map((submittal) => (
            <div
              key={submittal.id}
              onClick={() => onSubmittalClick?.(submittal.id)}
              className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-green-200 hover:bg-white transition-all cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-black truncate uppercase tracking-tight group-hover:text-green-700">
                  {submittal.subject}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">
                  From: {submittal.sender?.firstName || ""} {submittal.sender?.lastName || ""}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Created
                </p>
                <p className="text-xs font-black text-black whitespace-nowrap">
                  {formatDate(submittal.date || submittal.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No upcoming submittals found.
          </div>
        )}
        
        {upcomingSubmittals.length > 5 && (
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
                And {upcomingSubmittals.length - 5} more pending items
            </p>
        )}
      </div>
    </div>
  );
};

export default ProjectUpcomingSubmittals;
