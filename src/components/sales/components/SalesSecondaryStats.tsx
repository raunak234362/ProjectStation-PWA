import React from "react";
import { motion } from "framer-motion";

interface SalesSecondaryStatsProps {
    stats: {
        totalProjects: number;
        activeProjects: number;
        completed: number;
        onHold: number;
        delayed: number;
        conversionRate: number;
        totalClients: number;
        inPipelineRFQs?: number;
        quotedRFQs?: number;
        invoiceAnalytics?: any;
        rawProjects?: any[];
        rawRfqs?: any[];
        rawInvoices?: any[];
        rawClients?: any[];
        [key: string]: any;
    };
    onCardClick?: (type: "PROJECTS" | "RFQS" | "INVOICES" | "CLIENTS", title: string, data: any[]) => void;
}

const SalesSecondaryStats: React.FC<SalesSecondaryStatsProps> = ({ stats, onCardClick }) => {
    const items = [
        { label: "Total Projects", value: stats.totalProjects, type: "PROJECTS" as const, data: stats.rawProjects || [] },
        { label: "Active Projects", value: stats.activeProjects, type: "PROJECTS" as const, data: stats.rawProjects?.filter((p: any) => p.status === 'ACTIVE') || [] },
        { label: "Completed", value: stats.completed, type: "PROJECTS" as const, data: stats.rawProjects?.filter((p: any) => p.status === 'COMPLETED') || [] },
        { label: "In Pipeline", value: stats.inPipelineRFQs || 0, type: "RFQS" as const, data: stats.rawRfqs || [] },
        { label: "Quoted", value: stats.quotedRFQs || 0, type: "RFQS" as const, data: stats.rawRfqs || [] },
        { label: "Conversion Rate", value: `${stats.conversionRate}%`, type: "PROJECTS" as const, data: stats.rawProjects || [] },
        { label: "Total Clients", value: stats.totalClients, type: "CLIENTS" as const, data: stats.rawClients || [] },
        { label: "Pending Invoices", value: stats.invoiceAnalytics?.pendingInvoices || 0, type: "INVOICES" as const, data: stats.rawInvoices?.filter((i: any) => i.status === 'PENDING') || stats.rawInvoices || [] },
        { label: "Invoiced Value", value: `$${(stats.invoiceAnalytics?.totalInvoicedValue || 0).toLocaleString()}`, type: "INVOICES" as const, data: stats.rawInvoices || [] },
        { label: "Paid Invoices", value: stats.invoiceAnalytics?.paidInvoices || 0, type: "INVOICES" as const, data: stats.rawInvoices?.filter((i: any) => i.status === 'PAID') || [] },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    onClick={() => onCardClick?.(item.type, item.label, item.data)}
                    className="cursor-pointer bg-white dark:bg-slate-900 py-5 px-4 rounded-[1.5rem] border border-black/10 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center text-center hover:bg-green-50/50 dark:hover:bg-slate-800 transition-all duration-300 group"
                >
                    <span className="text-3xl font-extrabold text-black dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">{item.value}</span>
                    <span className="text-black dark:text-slate-500 text-[10px] font-bold tracking-widest uppercase">{item.label}</span>
                </motion.div>
            ))}
        </div>
    );
};

export default SalesSecondaryStats;
