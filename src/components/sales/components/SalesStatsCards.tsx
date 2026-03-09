import React from "react";
import { DollarSign, FileText, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface SalesStatsCardsProps {
    stats: {
        totalRfqs: number;
        projectsAwarded: number;
        winRate: number;
        totalSalesValue: number;
        rawRfqs?: any[];
        rawProjects?: any[];
        [key: string]: any;
    };
    onCardClick?: (type: "PROJECTS" | "RFQS" | "INVOICES" | "CLIENTS", title: string, data: any[]) => void;
}

const SalesStatsCards: React.FC<SalesStatsCardsProps> = ({ stats, onCardClick }) => {
    // Unified Green Theme Palette
    // Primary: green-600 (#16a34a)
    // Light: green-50 (#f0fdf4)
    // Accents: green-100, green-200

    const cards = [
        {
            title: "Total RFQs Received",
            value: stats.totalRfqs,
            change: "+12% from last period",
            icon: FileText,
            type: "RFQS" as const,
            data: stats.rawRfqs || [],
        },
        {
            title: "Projects Awarded",
            value: stats.projectsAwarded,
            change: "+8% from last period",
            icon: Trophy,
            type: "PROJECTS" as const,
            data: stats.rawProjects?.filter((p: any) => ["ACTIVE", "COMPLETED", "AWARDED"].includes(p.status)) || [],
        },
        {
            title: "Win Rate",
            value: `${stats.winRate}%`,
            change: "+2.3% from last period",
            icon: Target,
            type: "RFQS" as const,
            data: stats.rawRfqs || [],
        },
        {
            title: "Total Sales Value",
            value: `$${stats.totalSalesValue.toLocaleString()}`,
            change: "+15% from last period",
            icon: DollarSign,
            type: "RFQS" as const,
            data: stats.rawRfqs || [],
        },
    ];

    const formatValue = (val: string | number) => val;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onCardClick?.(card.type, card.title, card.data)}
                        className="cursor-pointer bg-[#f9fdf7] dark:bg-slate-900 p-6 rounded-3xl shadow-soft hover:shadow-medium transition-all duration-300 relative overflow-hidden group border border-black/10 dark:border-slate-800"
                    >
                        {/* Decorative Background Blob */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 dark:bg-green-950 rounded-full opacity-50 dark:opacity-20 group-hover:scale-110 transition-transform duration-500" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <p className="text-black dark:text-slate-400 text-sm font-bold mb-2 tracking-wide uppercase">{card.title}</p>
                                <h3 className="text-3xl font-extrabold text-black dark:text-white tracking-tight">{formatValue(card.value)}</h3>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-green-50 dark:bg-green-950/40 text-black dark:text-green-400 shadow-sm border border-black/10 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                <Icon size={24} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 relative z-10">
                            <div className="flex items-center gap-1 bg-green-100/80 dark:bg-green-900/30 px-2.5 py-1 rounded-full border border-black/10">
                                <span className="text-black dark:text-green-400 text-xs font-bold">
                                    {card.change}
                                </span>
                            </div>
                            <span className="text-black dark:text-slate-500 text-xs font-bold uppercase tracking-tight">from last period</span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default SalesStatsCards;
