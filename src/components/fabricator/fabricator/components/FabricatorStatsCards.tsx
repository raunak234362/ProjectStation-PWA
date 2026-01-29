import React from "react";
import { FileText, Factory, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../../../lib/utils";

interface FabricatorStatsCardsProps {
    stats: {
        totalRFQs: number;
        inProduction: number;
        completed: number;
        pendingRejected: number;
        delayed: number;
    };
}

const FabricatorStatsCards: React.FC<FabricatorStatsCardsProps> = ({ stats }) => {
    const cards = [
        {
            label: "Total RFQs Raised",
            value: stats.totalRFQs,
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            trend: "up", // In a real app, calculate this based on previous period
        },
        {
            label: "In Production",
            value: stats.inProduction,
            icon: Factory,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            trend: "neutral",
        },
        {
            label: "RFQs Completed",
            value: stats.completed,
            icon: CheckCircle2,
            color: "text-[#6bbd45]",
            bgColor: "bg-green-50",
            trend: "up",
        },
        {
            label: "Delayed / SLA Breach",
            value: stats.delayed,
            icon: AlertCircle,
            color: "text-rose-600",
            bgColor: "bg-rose-50",
            trend: stats.delayed > 0 ? "down" : "neutral",
        },
    ];

    const getTrendIcon = (trend: string) => {
        if (trend === "up") return <TrendingUp size={14} className="text-green-600" />;
        if (trend === "down") return <TrendingDown size={14} className="text-rose-600" />;
        return <Minus size={14} className="text-slate-400" />;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-[#f9fdf7] p-5 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 group relative overflow-hidden flex flex-col gap-3 border border-slate-50"
                >
                    <div className="flex items-start justify-between">
                        <div className={cn("p-3 rounded-xl shadow-sm transition-colors", card.bgColor, card.color)}>
                            <card.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm text-xs font-bold">
                            {getTrendIcon(card.trend)}
                            <span className="text-slate-500">vs last week</span>
                        </div>
                    </div>

                    <div className="flex flex-col min-w-0 mt-1">
                        <span className={cn("text-3xl font-extrabold tracking-tight", card.color)}>
                            {card.value}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest truncate mt-1">
                            {card.label}
                        </span>
                    </div>

                    {/* Subtle Decorative Background Blob */}
                    <div className={cn("absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10 blur-xl", card.bgColor)} />
                </div>
            ))}
        </div>
    );
};

export default FabricatorStatsCards;
