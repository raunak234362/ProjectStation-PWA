import React from "react";
import { AlertCircle, MapPin, UserPlus, ChevronRight } from "lucide-react";

interface InsightData {
    noEngineers: string[];
    limitedCoverage: string[];
    recentlyAdded: string[];
}

const CDInsightsList: React.FC<{ insights: InsightData }> = ({ insights }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* Designers without Engineers */}
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle size={20} className="text-red-500" />
                    <h3 className="text-md font-bold text-red-800">No Engineers Assigned</h3>
                </div>
                <div className="space-y-2">
                    {insights.noEngineers.slice(0, 4).map((name, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-red-100 shadow-sm">
                            <span className="text-sm font-medium text-gray-700">{name}</span>
                            <button className="text-xs text-red-600 font-semibold hover:underline flex items-center">
                                Add <ChevronRight size={12} />
                            </button>
                        </div>
                    ))}
                    {insights.noEngineers.length === 0 && <p className="text-xs text-green-600 italic">All designers have engineers.</p>}
                </div>
            </div>

            {/* Limited Coverage */}
            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin size={20} className="text-yellow-600" />
                    <h3 className="text-md font-bold text-yellow-800">Single State Coverage</h3>
                </div>
                <div className="space-y-2">
                    {insights.limitedCoverage.slice(0, 4).map((name, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-yellow-100 shadow-sm">
                            <span className="text-sm font-medium text-gray-700">{name}</span>
                            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Expand</span>
                        </div>
                    ))}
                    {insights.limitedCoverage.length === 0 && <p className="text-xs text-gray-500 italic">Good coverage distribution.</p>}
                </div>
            </div>

            {/* Recently Added */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                    <UserPlus size={20} className="text-blue-500" />
                    <h3 className="text-md font-bold text-blue-800">Recently Onboarded</h3>
                </div>
                <div className="space-y-2">
                    {insights.recentlyAdded.slice(0, 4).map((name, i) => (
                        <div key={i} className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
                            <span className="text-sm font-medium text-gray-700">{name}</span>
                        </div>
                    ))}
                    {insights.recentlyAdded.length === 0 && <p className="text-xs text-gray-500 italic">No recent additions.</p>}
                </div>
            </div>

        </div>
    );
};

export default CDInsightsList;
