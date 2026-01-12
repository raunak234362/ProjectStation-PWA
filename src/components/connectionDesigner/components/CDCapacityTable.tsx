import React from "react";
import { Clock } from "lucide-react";

interface DesignerCapacity {
    id: string;
    name: string;
    engineerCount: number;
    status: 'Balanced' | 'Lean' | 'Risk';
    updatedAt: string;
}

interface CDCapacityTableProps {
    capacityData: DesignerCapacity[];
    recentActivity: DesignerCapacity[];
}

const CDCapacityTable: React.FC<CDCapacityTableProps> = ({ capacityData, recentActivity }) => {

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Balanced': return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Balanced</span>;
            case 'Lean': return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">Lean</span>;
            case 'Risk': return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Risk</span>;
            default: return null;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Engineers per Designer */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Designer Capacity</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Designer Name</th>
                                <th className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Engineer Count</th>
                                <th className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {capacityData.slice(0, 5).map((designer) => (
                                <tr key={designer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 text-sm text-gray-700 font-medium">{designer.name}</td>
                                    <td className="py-3 text-sm text-gray-600">{designer.engineerCount}</td>
                                    <td className="py-3">{getStatusBadge(designer.status)}</td>
                                </tr>
                            ))}
                            {capacityData.length === 0 && (
                                <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-400">No data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recently Active Designers */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recently Active</h3>
                <div className="flex flex-col gap-3">
                    {recentActivity.slice(0, 5).map((designer) => (
                        <div key={designer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Clock size={16} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">{designer.name}</p>
                                    <p className="text-xs text-gray-400">Updated {new Date(designer.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                Active
                            </span>
                        </div>
                    ))}
                    {recentActivity.length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-4">No recent activity</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CDCapacityTable;
