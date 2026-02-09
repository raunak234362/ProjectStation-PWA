import React from "react";
import { Users, Globe, HardHat, FileText, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

interface CDSnapshotCardsProps {
    stats: {
        totalCDs: number;
        totalCountries: number;
        totalStates: number;
        totalEngineers: number;
        activeRFQs: number;
    };
}

const CDSnapshotCards: React.FC<CDSnapshotCardsProps> = ({ stats }) => {
    const cards = [
        {
            label: "Partner Network",
            value: stats.totalCDs,
            subText: "Registered Designers",
            icon: Users,
            color: "emerald",
            trend: "+2 this month"
        },
        {
            label: "Geographic Reach",
            value: `${stats.totalCountries} Countries`,
            subText: `${stats.totalStates} Operational States`,
            icon: Globe,
            color: "blue",
            trend: "Across 3 Regions"
        },
        {
            label: "Engineering Pool",
            value: stats.totalEngineers,
            subText: "Total Skilled workforce",
            icon: HardHat,
            color: "indigo",
            trend: "Avg 24/Designer"
        },
        {
            label: "Live Quotations",
            value: stats.activeRFQs,
            subText: "Active Engagements",
            icon: FileText,
            color: "amber",
            trend: "Response rate 94%"
        }
    ];

    const colorMap: Record<string, { shadow: string, icon: string, bg: string, accent: string }> = {
        emerald: { shadow: "shadow-emerald-100 dark:shadow-none", icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", accent: "from-emerald-500 to-teal-600" },
        blue: { shadow: "shadow-blue-100 dark:shadow-none", icon: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", accent: "from-blue-500 to-indigo-600" },
        indigo: { shadow: "shadow-indigo-100 dark:shadow-none", icon: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20", accent: "from-indigo-500 to-purple-600" },
        amber: { shadow: "shadow-amber-100 dark:shadow-none", icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", accent: "from-amber-500 to-orange-600" },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {cards.map((card, index) => (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={index}
                    className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-soft hover:shadow-medium transition-all group relative overflow-hidden"
                >
                    <div className="flex flex-col h-full relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3.5 rounded-2xl ${colorMap[card.color].bg} ${colorMap[card.color].icon} group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon size={22} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px]  text-gray-300 dark:text-slate-600 uppercase tracking-widest">{card.label}</span>
                                <div className="flex items-center gap-1 text-[9px]  text-green-500 dark:text-green-400 mt-1">
                                    <ArrowUpRight size={10} strokeWidth={3} />
                                    <span>{card.trend}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <h3 className="text-3xl  text-gray-800 dark:text-white tracking-tighter mb-1 leading-none">{card.value}</h3>
                            <p className="text-[10px]  text-gray-400 dark:text-slate-500 uppercase tracking-tight">{card.subText}</p>
                        </div>
                    </div>

                    {/* Subtle aesthetic blob */}
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity bg-linear-to-br ${colorMap[card.color].accent}`} />
                </motion.div>
            ))}
        </div>
    );
};

export default CDSnapshotCards;
