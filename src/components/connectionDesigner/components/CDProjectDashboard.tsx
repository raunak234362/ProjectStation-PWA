import React, { useMemo } from "react";
import ProjectStats from "../../dashboard/components/ProjectStats";
import PendingActions from "../../dashboard/components/PendingActions";
import UpcomingSubmittals from "../../dashboard/components/UpcomingSubmittals";
import { type ProjectData } from "../../../interface";

interface CDProjectDashboardProps {
    projects: ProjectData[];
    onProjectSelect: (project: ProjectData) => void;
}

const CDProjectDashboard: React.FC<CDProjectDashboardProps> = ({
    projects,
    onProjectSelect,
}) => {
    const stats = useMemo(() => {
        return {
            totalProjects: projects.length,
            activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
            completedProjects: projects.filter((p) => p.status === "COMPLETED").length,
            onHoldProjects: projects.filter((p) => p.status === "ON_HOLD").length,
        };
    }, [projects]);

    const dashboardStats = useMemo(() => {
        let pendingRFQ = 0;
        let pendingRFI = 0;
        let pendingSubmittals = 0;
        let pendingChangeOrders = 0;

        projects.forEach((p) => {
            // Pending RFI
            if (Array.isArray(p.rfi)) {
                pendingRFI += p.rfi.filter((r) => r.status === "PENDING" || r.status === false).length;
            }
            // Pending Submittals
            if (Array.isArray(p.submittals)) {
                pendingSubmittals += p.submittals.filter((s) => s.status === "PENDING").length;
            }
            // Pending Change Orders
            const cos = Array.isArray(p.changeOrders) ? p.changeOrders : [];
            pendingChangeOrders += cos.filter((co: any) => co.isAproovedByAdmin === "PENDING" || co.status === "PENDING").length;
        });

        return {
            activeEmployeeCount: 0,
            pendingChangeOrders,
            pendingRFI,
            pendingRFQ, // Not usually at project level for designers
            pendingSubmittals,
            totalActiveProjects: stats.activeProjects,
            totalCompleteProject: stats.completedProjects,
            totalOnHoldProject: stats.onHoldProjects,
            totalProjects: stats.totalProjects,
            newRFQ: 0,
            newRFI: 0,
            newChangeOrders: 0,
        };
    }, [projects, stats]);

    const allPendingSubmittals = useMemo(() => {
        const list: any[] = [];
        projects.forEach((p) => {
            if (Array.isArray(p.submittals)) {
                p.submittals.forEach((s) => {
                    if (s.status === "PENDING") {
                        list.push({ ...s, projectName: p.name });
                    }
                });
            }
        });
        return list;
    }, [projects]);

    const handleCardClick = (status: string) => {
        // Maybe filter the list or just notify
        console.log("Filter by status:", status);
    };

    return (
        <div className="flex flex-col w-full space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProjectStats stats={stats} onCardClick={handleCardClick} />
                <PendingActions dashboardStats={dashboardStats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Active Project Insights</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.filter(p => p.status === "ACTIVE").map(project => (
                                <div
                                    key={project.id}
                                    onClick={() => onProjectSelect(project)}
                                    className="p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900/40 hover:bg-green-50/20 dark:hover:bg-green-900/10 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="min-w-0">
                                            <h4 className="font-black text-gray-800 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors truncate">{project.name}</h4>
                                            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">#{project.projectNumber}</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest border border-green-100 dark:border-green-900/30">
                                            {project.stage || "Design"}
                                        </span>
                                    </div>
                                    <div className="flex gap-6 mt-4 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">RFIs</span>
                                            <span className="text-sm font-black text-gray-700 dark:text-slate-300">{project.rfi?.length || 0}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">COs</span>
                                            <span className="text-sm font-black text-gray-700 dark:text-slate-300">{Array.isArray(project.changeOrders) ? project.changeOrders.length : 0}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Submittals</span>
                                            <span className="text-sm font-black text-gray-700 dark:text-slate-300">{project.submittals?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <UpcomingSubmittals pendingSubmittals={allPendingSubmittals} hideTabs={true} />
                </div>
            </div>
        </div>
    );
};

export default CDProjectDashboard;
