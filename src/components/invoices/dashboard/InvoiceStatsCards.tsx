import React from "react";
import { DollarSign, FileText, AlertCircle, Clock } from "lucide-react";

interface StatsProps {
    invoices: any[];
}

const InvoiceStatsCards: React.FC<StatsProps> = ({ invoices }) => {
    // Calculate Stats
    const totalInvoices = invoices.length;
    const totalReceived = invoices
        .filter((inv) => inv.paymentStatus === "Paid" || inv.paymentStatus === true) // Assuming 'Paid' or true based on legacy
        .reduce((sum, inv) => sum + (parseFloat(inv.totalInvoiceValue) || 0), 0);

    const pendingInvoices = invoices.filter((inv) => !inv.paymentStatus || inv.paymentStatus === "Pending");
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (parseFloat(inv.totalInvoiceValue) || 0), 0);

    // Simple Overdue Logic: If pending and dueDate < now
    const overdueInvoices = pendingInvoices.filter((inv) => {
        if (!inv.dueDate) return false;
        return new Date(inv.dueDate) < new Date();
    });

    const overdueCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (parseFloat(inv.totalInvoiceValue) || 0), 0);

    const stats = [
        {
            title: "Total Invoices Raised",
            value: totalInvoices,
            amount: null, // Just count? User asked for "Total invoice count and total value"
            subValue: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                invoices.reduce((sum, inv) => sum + (parseFloat(inv.totalInvoiceValue) || 0), 0)
            ),
            icon: FileText,
            color: "bg-blue-50 text-blue-600",
            trend: "+12% from last month", // Mock trend for now
            trendUp: true,
        },
        {
            title: "Total Amount Received",
            value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalReceived),
            subValue: `${invoices.filter(i => i.paymentStatus).length} Paid Invoices`,
            icon: DollarSign,
            color: "bg-green-50 text-green-600",
            trend: "+8% from last month",
            trendUp: true,
        },
        {
            title: "Pending Amount",
            value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(pendingAmount),
            subValue: `${pendingInvoices.length} Pending Invoices`,
            icon: Clock,
            color: "bg-yellow-50 text-yellow-600",
            trend: "-2% from last month",
            trendUp: false,
        },
        {
            title: "Overdue Invoices",
            value: overdueCount,
            subValue: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(overdueAmount),
            icon: AlertCircle,
            color: "bg-red-50 text-red-600",
            trend: "+5% from last month",
            trendUp: false, // Increasing overdue is bad
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white p-5 h-[100px] rounded-xl flex items-center justify-between border border-black border-l-[6px] border-l-[#6bbd45] shadow-md hover:shadow-lg transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${stat.color} bg-opacity-20`}>
                            <stat.icon size={24} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wide leading-tight max-w-[120px]">
                            {stat.title}
                        </span>
                    </div>
                    <div>
                        <span className="text-2xl font-black text-gray-900 tracking-tight">
                            {stat.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InvoiceStatsCards;
