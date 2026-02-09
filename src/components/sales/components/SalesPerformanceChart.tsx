import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";

interface ChartData {
    name: string;
    RFQs: number;
    Awarded: number;
    Completed: number;
}

interface SalesPerformanceChartProps {
    data: ChartData[];
}

const SalesPerformanceChart: React.FC<SalesPerformanceChartProps> = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-green-50 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[400px] w-full">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl  text-gray-800 dark:text-white tracking-tight">Monthly Performance</h3>
                <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="w-2 h-2 rounded-full bg-teal-300"></span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="85%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorRFQs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={isDark ? 0.3 : 0.2} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAwarded" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={isDark ? 0.3 : 0.2} />
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#99f6e4" stopOpacity={isDark ? 0.3 : 0.2} />
                            <stop offset="95%" stopColor="#99f6e4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f0fdf4"} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? '#94a3b8' : '#9ca3af', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? '#94a3b8' : '#9ca3af', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#0f172a' : '#fff',
                            borderRadius: '16px',
                            border: isDark ? '1px solid #1e293b' : '1px solid #f0fdf4',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            color: isDark ? '#f8fafc' : '#1e293b'
                        }}
                        itemStyle={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                        cursor={{ stroke: isDark ? '#334155' : '#dcfce7', strokeWidth: 2 }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isDark ? '#cbd5e1' : '#4b5563'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="RFQs"
                        stroke="#16a34a"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRFQs)"
                    />
                    <Area
                        type="monotone"
                        dataKey="Awarded"
                        stroke="#34d399"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAwarded)"
                    />
                    <Area
                        type="monotone"
                        dataKey="Completed"
                        stroke="#99f6e4"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesPerformanceChart;
