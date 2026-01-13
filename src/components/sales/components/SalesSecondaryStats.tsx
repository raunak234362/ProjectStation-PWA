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
        { label: "Active Projects", value: stats.activeProjects, color: "text-blue-600" },
        { label: "Completed", value: stats.completed, color: "text-green-600" },
        { label: "On Hold", value: stats.onHold, color: "text-yellow-600" },
        { label: "Delayed", value: stats.delayed, color: "text-red-500" },
        { label: "Conversion Rate", value: `${stats.conversionRate}%`, color: "text-purple-600" },
        { label: "Total Clients", value: stats.totalClients, color: "text-cyan-600" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="bg-white py-4 px-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors"
                >
                    <span className={`text-2xl font-bold ${item.color} mb-1`}>{item.value}</span>
                    <span className="text-gray-500 text-xs font-medium">{item.label}</span>
                </motion.div>
            ))}
        </div>
    );
};

export default SalesSecondaryStats;
