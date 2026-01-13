import React from "react";
import { DollarSign, FileText, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface SalesStatsCardsProps {
    stats: {
        totalRfqs: number;
        projectsAwarded: number;
        winRate: number;
        totalSalesValue: number;
    }
}

const SalesStatsCards: React.FC<SalesStatsCardsProps> = ({ stats }) => {
    const cards = [
        {
            title: "Total RFQs Received",
            value: stats.totalRfqs,
            change: "+12% from last period",
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-600",
            iconBg: "bg-blue-100",
        },
        {
            title: "Projects Awarded",
            value: stats.projectsAwarded,
            change: "+8% from last period",
            icon: Trophy,
            color: "text-green-600",
            iconBg: "bg-green-100",
            bg: "bg-green-600"
        },
        {
            title: "Win Rate",
            value: `${stats.winRate}%`,
            change: "+2.3% from last period",
            icon: Target,
            color: "text-purple-600",
            iconBg: "bg-purple-100",
            bg: "bg-purple-600"
        },
        {
            title: "Total Sales Value",
            value: `$${stats.totalSalesValue.toLocaleString()}`,
            change: "+15% from last period",
            icon: DollarSign,
            color: "text-yellow-600",
            iconBg: "bg-yellow-100",
            bg: "bg-yellow-500" // darker for text contrast usually
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
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow"
                    >
                        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <Icon size={80} className={card.color} />
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
                                <h3 className="text-3xl font-bold text-gray-800">{formatValue(card.value)}</h3>
                            </div>
                            <div className={`p-3 rounded-2xl ${card.bg} text-white shadow-lg shadow-${card.bg}/30`}>
                                <Icon size={24} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                {card.change.split(' ')[0]}
                            </span>
                            <span className="text-gray-400 text-xs text-nowrap">from last period</span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default SalesStatsCards;
