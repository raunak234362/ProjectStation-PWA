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
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-soft border border-gray-100 dark:border-slate-800 h-full">
            <h2 className="text-lg  text-slate-800 dark:text-white mb-8 uppercase tracking-tight">
                Quantification Intelligence
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => {
                    const colors = colorClasses[card.color];

                    return (
                        <div
                            key={index}
                            className="flex flex-col gap-6 p-6 rounded-[24px] bg-slate-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/50 group transition-all duration-300 hover:shadow-md hover:bg-white dark:hover:bg-slate-800"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`p-3.5 rounded-2xl ${colors.bg} group-hover:scale-110 transition-transform duration-300`}>
                                    <card.icon size={22} strokeWidth={2.5} className={colors.icon} />
                                </div>
                                <span className={`text-[10px]  uppercase tracking-widest ${colors.icon}`}>
                                    Metric {index + 1}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[10px]  text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">
                                    {card.label}
                                </span>
                                <span className="text-3xl  text-slate-800 dark:text-white tracking-tighter">
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
