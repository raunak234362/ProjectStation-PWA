import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { cn } from "../../../../lib/utils";

interface RFQComparisonChartProps {
    data: any[];
    timeRange: "weekly" | "monthly" | "yearly";
    setTimeRange: (range: "weekly" | "monthly" | "yearly") => void;
}

const RFQComparisonChart: React.FC<RFQComparisonChartProps> = ({ data, timeRange, setTimeRange }) => {
    return (
        <div className="bg-[#f9fdf7] p-6 rounded-3xl shadow-soft flex flex-col h-full border border-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 shrink-0">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        RFQ vs Production Analysis
                    </h2>
                    <p className="text-sm text-slate-500 font-bold mt-1">
                        Real-time status overview across <span className="text-[#6bbd45]">{timeRange}</span> periods
                    </p>
                </div>

                <div className="flex bg-slate-100/50 p-1 rounded-xl shadow-inner divide-x divide-slate-200">
                    {(["weekly", "monthly", "yearly"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold transition-all capitalize",
                                timeRange === range
                                    ? "bg-white text-[#6bbd45] shadow-sm rounded-lg"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[350px] w-full px-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-50 text-xs">
                                            <p className="font-extrabold text-slate-800 mb-2 uppercase tracking-wider border-b border-slate-50 pb-1">
                                                {label}
                                            </p>
                                            <div className="space-y-1.5">
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                            <span className="text-slate-500 font-bold">{entry.name}:</span>
                                                        </div>
                                                        <span className="font-extrabold text-slate-800">{entry.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 700 }}
                        />
                        <Bar
                            dataKey="total"
                            name="Total RFQs"
                            fill="#e2e8f0"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                        <Bar
                            dataKey="production"
                            name="In Production"
                            fill="#fbbf24"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                        <Bar
                            dataKey="completed"
                            name="Completed"
                            fill="#6bbd45"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RFQComparisonChart;
