import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface TimeTrendAnalysisProps {
    data: any[];
}

const TimeTrendAnalysis: React.FC<TimeTrendAnalysisProps> = ({ data }) => {
    return (
        <div className="bg-[#f9fdf7] p-6 rounded-3xl shadow-soft flex flex-col h-full border border-slate-50">
            <div className="mb-6 shrink-0">
                <h3 className="text-lg font-extrabold text-slate-800">Time Trend & Delays</h3>
                <p className="text-xs  text-slate-400 mt-1 uppercase tracking-widest">
                    Production velocity vs Delays
                </p>
            </div>

            <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            labelStyle={{ color: "#64748b", fontWeight: "bold", fontSize: "12px" }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 700, paddingTop: "10px" }} />
                        <Line
                            type="monotone"
                            dataKey="avgDelay"
                            name="Avg Delay (Days)"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#f43f5e" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="productionTime"
                            name="Avg Prod. Time"
                            stroke="#6bbd45"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#6bbd45" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TimeTrendAnalysis;
