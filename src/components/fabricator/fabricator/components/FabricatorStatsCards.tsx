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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/30 border border-black/10 dark:border-slate-700/50 group transition-all duration-300 hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 border border-black/5",
                            card.label === "Total RFQs Raised" ? "bg-blue-50 text-blue-600" :
                                card.label === "In Production" ? "bg-amber-50 text-amber-600" :
                                    card.label === "RFQs Completed" ? "bg-green-50 text-[#6bbd45]" :
                                        "bg-rose-50 text-rose-600"
                        )}>
                            <card.icon size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-black text-black dark:text-slate-400 uppercase tracking-widest leading-tight">
                                {card.label}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                                {getTrendIcon(card.trend)}
                                <span className="text-[9px] font-bold text-black/50 uppercase tracking-tighter">vs last week</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <span className="text-xl font-black text-black dark:text-white tracking-tighter">
                            {card.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FabricatorStatsCards;
