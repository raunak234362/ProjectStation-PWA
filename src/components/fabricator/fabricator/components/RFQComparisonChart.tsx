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

interface RFQData {
  name: string;
  total: number;
  production: number;
  completed: number;
  // Add other properties if needed
}

interface RFQComparisonChartProps {
  data: RFQData[];
  timeRange: "weekly" | "monthly" | "yearly";
  setTimeRange: (range: "weekly" | "monthly" | "yearly") => void;
}

const RFQComparisonChart: React.FC<RFQComparisonChartProps> = ({
  data,
  timeRange,
  setTimeRange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-soft flex flex-col h-full border border-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-black flex items-center gap-2 tracking-tight uppercase">
            RFQ vs Production Analysis
          </h2>
          {/* <p className="text-[10px] text-black font-bold uppercase tracking-[0.2em] mt-2">
            Real-time status overview across{" "}
            <span className="text-green-600">
              {timeRange}
            </span>{" "}
            periods
          </p> */}
        </div>

        <div className="flex items-center gap-2">
          {(["weekly", "monthly", "yearly"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all border rounded-xl",
                timeRange === range
                  ? "bg-green-200 text-black border-black shadow-sm"
                  : "bg-white border-black/20 text-black/50 hover:bg-gray-50 hover:border-black/40 hover:text-black"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[380px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? "#1e293b" : "#f1f5f9"}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#000",
                fontSize: 10,
                fontWeight: 900,
                textAnchor: "middle",
                opacity: 0.4
              }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#000",
                fontSize: 10,
                fontWeight: 900,
                opacity: 0.4
              }}
            />
            <Tooltip
              cursor={{
                fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 text-[10px]">
                      <p className=" text-slate-800 dark:text-white mb-3 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50 pb-2">
                        {label}
                      </p>
                      <div className="space-y-2">
                        {payload.map((entry: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-6"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-slate-500 dark:text-slate-400  uppercase tracking-wider">
                                {entry.name}
                              </span>
                            </div>
                            <span className=" text-slate-800 dark:text-white">
                              {entry.value}
                            </span>
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
              wrapperStyle={{
                paddingBottom: "30px",
                fontSize: "10px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
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
