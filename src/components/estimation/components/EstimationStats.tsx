import React from "react";
import { CopyPlus, Trophy, Clock } from "lucide-react";

interface EstimationStatsProps {
    stats: {
        totalEstimated: number;
        totalAwarded: number;
        totalHours: string; // Formatted string or number
    };
}

const EstimationStats: React.FC<EstimationStatsProps> = ({ stats }) => {
    const cards = [
        {
            label: "Total Projects Estimated",
            value: stats.totalEstimated,
            icon: CopyPlus,
            color: "blue",
        },
        {
            label: "Total Projects Awarded",
            value: stats.totalAwarded,
            icon: Trophy,
            color: "green",
        },
        {
            label: "Aggregate Engineering Hours",
            value: stats.totalHours,
            icon: Clock,
            color: "purple",
        },
    ];

    const colorClasses: Record<string, { shadow: string, icon: string, bg: string }> = {
        blue: {
            shadow: "shadow-blue-100 dark:shadow-none",
            icon: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        green: {
            shadow: "shadow-emerald-100 dark:shadow-none",
            icon: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        purple: {
            shadow: "shadow-purple-100 dark:shadow-none",
            icon: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-900/20"
        },
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-soft h-full border border-black/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {cards.map((card, index) => {
                    const colors = colorClasses[card.color];

                    return (
                        <div
                            key={index}
                            className="flex flex-row items-center justify-between p-3 sm:p-4 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800/30 border border-black/10 transition-all duration-300 hover:shadow-md hover:bg-slate-50 group min-w-0"
                        >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                <div className={`p-2.5 sm:p-3 rounded-lg md:rounded-xl ${colors.bg} group-hover:scale-105 transition-transform duration-300 shadow-sm border border-black/5 shrink-0`}>
                                    <card.icon size={18} strokeWidth={2.5} className={colors.icon} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] sm:text-xs font-black text-black/40 dark:text-slate-400 uppercase tracking-[0.1em] leading-tight break-words">
                                        {card.label}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center ml-2 shrink-0">
                                <span className="text-[10px] sm:text-xs font-black text-black dark:text-white uppercase tracking-widest">
                                    {card.value}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EstimationStats;
