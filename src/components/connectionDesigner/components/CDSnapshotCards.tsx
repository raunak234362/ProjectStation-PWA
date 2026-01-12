import React from "react";
import { Users, Globe, HardHat, FileText } from "lucide-react";

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
            label: "Total Connection Designers",
            value: stats.totalCDs,
            subText: "Active vs Inactive", // Placeholder for now
            icon: Users,
            color: "green",
        },
        {
            label: "Geographic Coverage",
            value: `${stats.totalCountries} Countries`,
            subText: `${stats.totalStates} States`,
            icon: Globe,
            color: "blue",
        },
        {
            label: "Total Engineers",
            value: stats.totalEngineers,
            subText: "Avg engineers per CD", // Placeholder
            icon: HardHat,
            color: "orange",
        },
        {
            label: "Active RFQs",
            value: stats.activeRFQs,
            subText: "Designers involved",
            icon: FileText,
            color: "purple",
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                        <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
                        {card.subText && (
                            <p className="text-xs text-gray-400 mt-1">{card.subText}</p>
                        )}
                    </div>
                    <div className={`p-3 rounded-full bg-${card.color}-50 text-${card.color}-600`}>
                        <card.icon size={24} strokeWidth={1.5} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CDSnapshotCards;
