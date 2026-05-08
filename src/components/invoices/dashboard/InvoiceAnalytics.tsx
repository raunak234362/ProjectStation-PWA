import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface AnalyticsProps {
    invoices: any[];
    fromMonth: number;
    toMonth: number;
}

const InvoiceAnalytics: React.FC<AnalyticsProps> = ({ invoices, fromMonth, toMonth }) => {

    // --- Data Processing for Admin/PMO ---
    const processTrendData = () => {
        const months: Record<string, { raised: number; received: number; order: number }> = {};
        const today = new Date();
        const currentYear = today.getFullYear();

        // Generate months in the range [fromMonth, toMonth]
        for (let i = fromMonth; i <= toMonth; i++) {
            const d = new Date(currentYear, i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = { raised: 0, received: 0, order: i };
        }

        invoices.forEach(inv => {
            const dateStr = inv.invoiceDate || inv.createdAt || inv.date;
            if (!dateStr) return;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return;

            const key = d.toLocaleString('default', { month: 'short' });
            
            if (months[key]) {
                const amount = parseFloat(inv.totalInvoiceValue) || 0;
                months[key].raised += amount;
                if (inv.paymentStatus === true || inv.paymentStatus === "Paid") {
                    months[key].received += amount;
                }
            }
        });

        return Object.entries(months)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([name, data]) => ({ name, raised: data.raised, received: data.received }));
    };

    const lineData = processTrendData();
    const paidCount = invoices.filter((i) => i.paymentStatus === true || i.paymentStatus === "Paid").length;
    const overdueCount = invoices.filter(i => {
        const isPaid = i.paymentStatus === true || i.paymentStatus === "Paid";
        if (isPaid) return false;
        const date = i.dueDate || i.invoiceDate;
        const dueDate = date ? new Date(date) : new Date();
        return dueDate < new Date();
    }).length;

    const pendingCount = invoices.length - paidCount - overdueCount;
    const pieData = [
        { name: "Paid", value: paidCount, color: "#22c55e" },
        { name: "Pending", value: Math.max(0, pendingCount), color: "#eab308" },
        { name: "Overdue", value: overdueCount, color: "#ef4444" },
    ].filter(d => d.value > 0);


    // --- End of Data Processing ---

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 1. Trends Line Chart */}
            <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg text-gray-800">Invoices & Payments Trend</h3>
                </div>
                <div className="h-[200px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRaised" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                                cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                            />
                            <CartesianGrid vertical={false} stroke="#f3f4f6" />
                            <Area type="monotone" dataKey="raised" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorRaised)" name="Invoices Raised" />
                            <Area type="monotone" dataKey="received" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorReceived)" name="Payment Received" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Status Donut Chart */}
            <div className="lg:col-span-1">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45] flex flex-col h-full">
                    <h3 className="text-lg  text-gray-800 mb-2">Invoice Status</h3>
                    <div className="flex-1 relative min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                    <tspan x="50%" dy="-0.5em" fontSize="24" fontWeight="bold" fill="#374151">
                                        {invoices.length}
                                    </tspan>
                                    <tspan x="50%" dy="1.5em" fontSize="14" fill="#9ca3af">
                                        Total
                                    </tspan>
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceAnalytics;
