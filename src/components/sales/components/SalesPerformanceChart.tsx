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

const data = [
    { name: "Jan", RFQs: 40, Awarded: 24, Completed: 24 },
    { name: "Feb", RFQs: 30, Awarded: 13, Completed: 22 },
    { name: "Mar", RFQs: 20, Awarded: 58, Completed: 22 },
    { name: "Apr", RFQs: 27, Awarded: 39, Completed: 20 },
    { name: "May", RFQs: 18, Awarded: 48, Completed: 21 },
    { name: "Jun", RFQs: 23, Awarded: 38, Completed: 25 },
    { name: "Jul", RFQs: 34, Awarded: 43, Completed: 21 },
    { name: "Aug", RFQs: 40, Awarded: 24, Completed: 24 },
    { name: "Sep", RFQs: 30, Awarded: 13, Completed: 22 },
    { name: "Oct", RFQs: 20, Awarded: 58, Completed: 22 },
    { name: "Nov", RFQs: 27, Awarded: 39, Completed: 20 },
    { name: "Dec", RFQs: 18, Awarded: 48, Completed: 21 },
];

const SalesPerformanceChart = () => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[400px] w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Performance</h3>
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
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAwarded" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#F3F4F6', strokeWidth: 2 }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="RFQs"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRFQs)"
                    />
                    <Area
                        type="monotone"
                        dataKey="Awarded"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAwarded)"
                    />
                    <Area
                        type="monotone"
                        dataKey="Completed"
                        stroke="#8b5cf6"
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
