/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import Service from "../../api/Service";
import { motion, AnimatePresence } from "framer-motion";
import SalesStatsCards from "./components/SalesStatsCards";
import SalesSecondaryStats from "./components/SalesSecondaryStats";
import SalesPerformanceChart from "./components/SalesPerformanceChart";
import { Download, Filter, ChevronDown, Check } from "lucide-react";
import { subDays, isAfter, startOfDay } from "date-fns";
import { cn } from "../../lib/utils";

const SalesDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState<"All Time" | "Last 7 Days" | "Last 30 Days" | "Last 12 Months">("All Time");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [allData, setAllData] = useState<{ projects: any[], rfqs: any[], clients: any[] }>({
        projects: [],
        rfqs: [],
        clients: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projectsRes, rfqRes, clientsRes] = await Promise.all([
                    Service.GetAllProjects(),
                    Service.RFQRecieved(),
                    Service.GetAllFabricators(),
                ]);

                setAllData({
                    projects: projectsRes?.data || [],
                    rfqs: rfqRes?.data || [],
                    clients: clientsRes?.data || clientsRes || [],
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching sales data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const computedData = useMemo(() => {
        const { projects, rfqs, clients } = allData;
        const now = new Date();
        const today = startOfDay(now);

        let filteredRfqs = rfqs;
        let filteredProjects = projects;

        if (timeFilter !== "All Time") {
            let days = 0;
            if (timeFilter === "Last 7 Days") days = 7;
            else if (timeFilter === "Last 30 Days") days = 30;
            else if (timeFilter === "Last 12 Months") days = 365;

            const cutoff = subDays(today, days);
            filteredRfqs = rfqs.filter((r: any) => isAfter(new Date(r.createdAt), cutoff));
            filteredProjects = projects.filter((p: any) => isAfter(new Date(p.startDate), cutoff));
        }

        // 1. Basic Counts
        const totalRfqs = filteredRfqs.length;
        const awardedProjects = filteredProjects.filter((p: any) => ["ACTIVE", "COMPLETED", "AWARDED"].includes(p.status)).length;
        const activeProjects = filteredProjects.filter((p: any) => ["ACTIVE", "AWARDED"].includes(p.status)).length;
        const completed = filteredProjects.filter((p: any) => p.status === "COMPLETED").length;
        const onHold = filteredProjects.filter((p: any) => p.status === "ON_HOLD").length;

        // 2. Delayed Projects
        const delayed = filteredProjects.filter((p: any) => {
            if (p.status === "COMPLETED") return false;
            if (!p.endDate) return false;
            return new Date(p.endDate) < today;
        }).length;

        // 3. Win Rate
        const winRate = totalRfqs > 0 ? Math.round((awardedProjects / totalRfqs) * 100) : 0;
        const conversionRate = totalRfqs > 0 ? Math.round((awardedProjects / totalRfqs) * 100) : 0;

        // 4. Total Sales Value
        const totalSalesValue = filteredRfqs.reduce((acc: number, rfq: any) => {
            const isAwarded = projects.some((p: any) => p.rfqId === rfq.id && ["ACTIVE", "COMPLETED", "AWARDED"].includes(p.status));
            if (isAwarded && rfq.bidPrice) {
                const numericPrice = parseFloat(String(rfq.bidPrice).replace(/[^0-9.]/g, "")) || 0;
                return acc + numericPrice;
            }
            return acc;
        }, 0);

        // 5. Monthly Performance Data
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const performance = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            const m = d.getMonth();
            const y = d.getFullYear();

            const rfqsInMonth = rfqs.filter((r: any) => {
                const rd = new Date(r.createdAt);
                return rd.getMonth() === m && rd.getFullYear() === y;
            }).length;

            const awardedInMonth = projects.filter((p: any) => {
                if (!["ACTIVE", "COMPLETED", "AWARDED"].includes(p.status)) return false;
                const pd = new Date(p.startDate);
                return pd.getMonth() === m && pd.getFullYear() === y;
            }).length;

            const completedInMonth = projects.filter((p: any) => {
                if (p.status !== "COMPLETED" || !p.endDate) return false;
                const pd = new Date(p.endDate);
                return pd.getMonth() === m && pd.getFullYear() === y;
            }).length;

            performance.push({
                name: months[m],
                RFQs: rfqsInMonth,
                Awarded: awardedInMonth,
                Completed: completedInMonth
            });
        }

        return {
            stats: {
                totalRfqs,
                projectsAwarded: awardedProjects,
                winRate,
                totalSalesValue,
                activeProjects,
                completed,
                onHold,
                delayed,
                conversionRate,
                totalClients: clients.length,
            },
            performance
        };
    }, [allData, timeFilter]);

    const { stats, performance: performanceData } = computedData;

    const handleExport = () => {
        const headers = ["Metric", "Value"];
        const rows = [
            ["Report Period", timeFilter],
            ["Total RFQs Received", stats.totalRfqs],
            ["Projects Awarded", stats.projectsAwarded],
            ["Win Rate", `${stats.winRate}%`],
            ["Total Sales Value", `$${stats.totalSalesValue}`],
            ["Active Projects", stats.activeProjects],
            ["Completed Projects", stats.completed],
            ["On Hold", stats.onHold],
            ["Delayed Projects", stats.delayed],
            ["Conversion Rate", `${stats.conversionRate}%`],
            ["Total Clients", stats.totalClients]
        ];

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Sales_Report_${timeFilter.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="h-full p-6 space-y-8 font-sans text-slate-900 dark:text-white bg-transparent">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Sales Funnel</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor your sales performance and conversion rates.</p>
                </div>

                <div className="flex gap-3 relative">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200  rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-soft border border-slate-100 dark:border-slate-700 min-w-[140px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Filter size={18} className="text-slate-400 dark:text-slate-500" />
                                {timeFilter}
                            </div>
                            <ChevronDown size={16} className={cn("transition-transform", showFilterDropdown ? "rotate-180" : "")} />
                        </button>

                        <AnimatePresence>
                            {showFilterDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-20"
                                    >
                                        {(["All Time", "Last 7 Days", "Last 30 Days", "Last 12 Months"] as const).map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setTimeFilter(option);
                                                    setShowFilterDropdown(false);
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm  text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                {option}
                                                {timeFilter === option && <Check size={16} className="text-[#6bbd45]" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#6bbd45] text-white rounded-2xl  hover:shadow-highlight transition-all shadow-medium"
                    >
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 pb-1 border-b border-transparent dark:border-slate-800">
                {['Overview', 'Performance', 'Leads'].map((tab, i) => (
                    <button key={tab} className={`pb-3 text-base  transition-all relative px-1 ${i === 0 ? 'text-[#6bbd45]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        {tab}
                        {i === 0 && <motion.div layoutId="activeTab" className="absolute -bottom-0 left-0 right-0 h-1 bg-[#6bbd45] rounded-full" />}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <SalesStatsCards stats={stats} />

            {/* Secondary Stats */}
            <div className="pt-2">
                <SalesSecondaryStats stats={stats} />
            </div>

            {/* Charts & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 pt-4">
                <SalesPerformanceChart data={performanceData} />
            </div>
        </div>
    );
};

export default SalesDashboard;
