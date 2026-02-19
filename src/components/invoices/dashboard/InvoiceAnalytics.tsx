import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { CreditCard, Banknote, CheckCircle2, AlertCircle } from "lucide-react";

interface AnalyticsProps {
    invoices: any[];
}

const InvoiceAnalytics: React.FC<AnalyticsProps> = ({ invoices }) => {
    const userRole = sessionStorage.getItem("userRole")?.toLowerCase();
    const isClient = userRole === "client" || userRole === "client_admin";

    // --- Data Processing for Admin/PMO ---
    const processTrendData = () => {
        const months: Record<string, { raised: number; received: number; order: number }> = {};
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = { raised: 0, received: 0, order: i };
        }

        invoices.forEach(inv => {
            if (!inv.invoiceDate) return;
            const d = new Date(inv.invoiceDate);
            if ((today.getTime() - d.getTime()) > 180 * 24 * 60 * 60 * 1000) return;

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
            .sort((a, b) => b[1].order - a[1].order)
            .map(([name, data]) => ({ name, raised: data.raised, received: data.received }))
            .reverse();
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

    const paymentMethods = [
        { method: "Bank Transfer", count: 45, percentage: 60, icon: Banknote, color: "bg-blue-100 text-blue-600" },
        { method: "Card Payment", count: 20, percentage: 25, icon: CreditCard, color: "bg-purple-100 text-purple-600" },
    ];

    // --- Data processing for Client ---
    const totalInvoiced = invoices.reduce((acc, inv) => acc + (parseFloat(inv.totalInvoiceValue) || 0), 0);
    const totalPaid = invoices
        .filter((inv) => inv.paymentStatus === true || inv.paymentStatus === "Paid")
        .reduce((acc, inv) => acc + (parseFloat(inv.totalInvoiceValue) || 0), 0);
    const balanceDue = totalInvoiced - totalPaid;

    if (isClient) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45] flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-blue-50 rounded-xl mb-3">
                        <Banknote className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Invoiced</span>
                    <span className="text-3xl  text-gray-800 mt-1">${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45] flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-green-50 rounded-xl mb-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Paid</span>
                    <span className="text-3xl  text-green-600 mt-1">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45] flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-red-50 rounded-xl mb-3">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Balance Due</span>
                    <span className="text-3xl  text-red-600 mt-1">${balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 1. Trends Line Chart */}
            <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg  text-gray-800">Invoices & Payments Trend</h3>
                    <select className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1 focus:ring-1 focus:ring-green-500 text-gray-600 outline-hidden cursor-pointer">
                        <option>Last 6 Months</option>
                        <option>This Year</option>
                    </select>
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

            {/* 2. Status Donut Chart & Payment Breakdown */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45] flex flex-col h-[280px]">
                    <h3 className="text-lg  text-gray-800 mb-2">Invoice Status</h3>
                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
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
                                    <tspan x="50%" dy="-0.5em" fontSize="20" fontWeight="bold" fill="#374151">
                                        {invoices.length}
                                    </tspan>
                                    <tspan x="50%" dy="1.5em" fontSize="12" fill="#9ca3af">
                                        Total
                                    </tspan>
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45]">
                    <h3 className="text-lg  text-gray-800 mb-4">Payment Methods</h3>
                    <div className="space-y-4">
                        {paymentMethods.map((pm, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${pm.color}`}>
                                        <pm.icon size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{pm.method}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm  text-gray-800">{pm.percentage}%</span>
                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pm.percentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceAnalytics;
