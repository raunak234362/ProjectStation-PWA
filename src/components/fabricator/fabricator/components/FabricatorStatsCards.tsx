import React from "react";
import { Factory, CheckCircle2 } from "lucide-react";
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
       
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/30 border border-black/10 dark:border-slate-700/50 group transition-all duration-300 hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 border border-black/5",
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
