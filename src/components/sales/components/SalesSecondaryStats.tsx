import React from "react";
import { motion } from "framer-motion";

interface SalesSecondaryStatsProps {
    stats: {
        activeProjects: number;
        completed: number;
        onHold: number;
        delayed: number;
        conversionRate: number;
        totalClients: number;
    }
}

const SalesSecondaryStats: React.FC<SalesSecondaryStatsProps> = ({ stats }) => {
    const items = [
        { label: "Active Projects", value: stats.activeProjects },
        { label: "Completed", value: stats.completed },
        { label: "On Hold", value: stats.onHold },
        { label: "Delayed", value: stats.delayed },
        { label: "Conversion Rate", value: `${stats.conversionRate}%` },
        { label: "Total Clients", value: stats.totalClients },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="bg-white dark:bg-slate-900 py-5 px-4 rounded-[1.5rem] border border-black/10 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center text-center hover:bg-green-50/50 dark:hover:bg-slate-800 transition-all duration-300 group"
                >
                    <span className="text-3xl font-extrabold text-black dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">{item.value}</span>
                    <span className="text-black dark:text-slate-500 text-[10px] font-bold tracking-widest uppercase">{item.label}</span>
                </motion.div>
            ))}
        </div>
    );
};

export default SalesSecondaryStats;
