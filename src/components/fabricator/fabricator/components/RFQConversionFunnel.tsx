import React from "react";
import {
    FunnelChart,
    Funnel,
    LabelList,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface RFQConversionFunnelProps {
    data: {
        raised: number;
        inProduction: number;
        completed: number;
    };
}

const RFQConversionFunnel: React.FC<RFQConversionFunnelProps> = ({ data }) => {
    const chartData = [
        {
            value: data.raised,
            name: "Raised",
            fill: "#e2e8f0",
        },
        {
            value: data.inProduction,
            name: "Production",
            fill: "#fbbf24",
        },
        {
            value: data.completed,
            name: "Completed",
            fill: "#6bbd45",
        },
    ];

    return (
        <div className="bg-[#f9fdf7] p-6 rounded-3xl shadow-soft flex flex-col h-full border border-slate-50">
            <div className="mb-6 shrink-0">
                <h3 className="text-lg font-extrabold text-slate-800">Conversion Funnel</h3>
                <p className="text-xs  text-slate-400 mt-1 uppercase tracking-widest">
                    Pipeline Efficiency
                </p>
            </div>

            <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white p-2 rounded-lg shadow-xl border border-slate-50 text-xs">
                                            <span className=" text-slate-600">{data.name}:</span> <span className="font-extrabold">{data.value} RFQs</span>
                                        </div>
                                    )
                                }
                                return null;
                            }}
                        />
                        <Funnel
                            dataKey="value"
                            data={chartData}
                            isAnimationActive
                        >
                            <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" fontSize={11} fontWeight={700} />
                        </Funnel>
                    </FunnelChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RFQConversionFunnel;
