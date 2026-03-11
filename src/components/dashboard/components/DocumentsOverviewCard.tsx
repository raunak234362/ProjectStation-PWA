import React from "react";
import { Search, FileText, Activity, RefreshCw, FileStack } from "lucide-react";
import { cn } from "../../../lib/utils";

export type DocType = "ALL_RFQ" | "ALL_RFI" | "ALL_SUBMITTALS" | "ALL_COR";

interface DocumentsOverviewCardProps {
    counts: {
        rfq: number;
        rfi: number;
        submittals: number;
        cor: number;
    };
    onCardClick: (type: DocType) => void;
}

const DocumentsOverviewCard: React.FC<DocumentsOverviewCardProps> = ({
    counts,
    onCardClick,
}) => {
    const cards: {
        label: string;
        value: number;
        icon: React.ElementType;
        type: DocType;
    }[] = [
            {
                label: "Total RFQs",
                value: counts.rfq,
                icon: Search,
                type: "ALL_RFQ",
            },
            {
                label: "Total RFIs",
                value: counts.rfi,
                icon: FileText,
                type: "ALL_RFI",
            },
            {
                label: "Submittals",
                value: counts.submittals,
                icon: RefreshCw,
                type: "ALL_SUBMITTALS",
            },
            {
                label: "Change Orders",
                value: counts.cor,
                icon: Activity,
                type: "ALL_COR",
            },
        ];

    return (
        <div className="flex flex-col justify-start h-full p-2 transition-all duration-300 relative overflow-hidden">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-6 flex items-center gap-3 tracking-tight ml-1">
                <FileStack size={24} strokeWidth={2.5} className="text-[#6bbd45]" />
                DOCUMENTS OVERVIEW
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card) => (
                    <div
                        key={card.type}
                        onClick={() => onCardClick(card.type)}
                        className={cn(
                            "p-4 rounded-xl flex items-center justify-between group transition-all duration-300 bg-white relative overflow-hidden",
                            "border border-black border-l-[6px] border-l-[#6bbd45] shadow-sm",
                            "hover:shadow-md cursor-pointer"
                        )}
                    >
                        <div className="flex items-center gap-3 z-10 min-w-0 flex-1">
                            <div className="p-2 sm:p-2.5 rounded-full transition-colors bg-gray-50 group-hover:bg-[#f4f6f8] shrink-0 text-black">
                                <card.icon size={18} className="sm:w-5 sm:h-5" strokeWidth={2} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs sm:text-sm font-black text-black uppercase tracking-widest leading-tight whitespace-normal break-words">
                                    {card.label}
                                </span>
                            </div>
                        </div>

                        <div className="z-10 text-right ml-3 shrink-0">
                            <span className="text-lg sm:text-2xl md:text-3xl font-black text-black tracking-tight">
                                {card.value}
                            </span>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentsOverviewCard;
