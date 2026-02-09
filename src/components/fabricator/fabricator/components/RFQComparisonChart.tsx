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
import { useTheme } from "../../../../context/ThemeContext";
import { cn } from "../../../../lib/utils";

interface RFQComparisonChartProps {
    data: any[];
    timeRange: "weekly" | "monthly" | "yearly";
    setTimeRange: (range: "weekly" | "monthly" | "yearly") => void;
}

const RFQComparisonChart: React.FC<RFQComparisonChartProps> = ({ data, timeRange, setTimeRange }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-soft flex flex-col h-full border border-white/50 dark:border-slate-800/50 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6 shrink-0">
                <div>
                    <h2 className="text-2xl  text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                        RFQ vs Production Analysis
                    </h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500  uppercase tracking-[0.2em] mt-2">
                        Real-time status overview across <span className="text-[#6bbd45] dark:text-green-400">{timeRange}</span> periods
                    </p>
                </div>

                <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl shadow-inner backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                    {(["weekly", "monthly", "yearly"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-6 py-2 text-[10px]  uppercase tracking-widest transition-all",
                                timeRange === range
                                    ? "bg-white dark:bg-slate-700 text-[#6bbd45] dark:text-green-400 shadow-md rounded-xl"
                                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[380px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? "#64748b" : "#94a3b8", fontSize: 10, fontWeight: 900, textAnchor: 'middle' }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? "#64748b" : "#94a3b8", fontSize: 10, fontWeight: 900 }}
                        />
                        <Tooltip
                            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 text-[10px]">
                                            <p className=" text-slate-800 dark:text-white mb-3 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50 pb-2">
                                                {label}
                                            </p>
                                            <div className="space-y-2">
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                                            <span className="text-slate-500 dark:text-slate-400  uppercase tracking-wider">{entry.name}</span>
                                                        </div>
                                                        <span className=" text-slate-800 dark:text-white">{entry.value}</span>
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
                            wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        />
                        <Bar
                            dataKey="total"
                            name="Total RFQs"
                            fill={isDark ? "#334155" : "#e2e8f0"}
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                        />
                        <Bar
                            dataKey="production"
                            name="In Production"
                            fill="#fbbf24"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                        />
                        <Bar
                            dataKey="completed"
                            name="Completed"
                            fill="#6bbd45"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RFQComparisonChart;
