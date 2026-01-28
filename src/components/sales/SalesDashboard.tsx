/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Service from "../../api/Service";
import { motion } from "framer-motion";
import SalesStatsCards from "./components/SalesStatsCards";
import SalesSecondaryStats from "./components/SalesSecondaryStats";
import SalesPerformanceChart from "./components/SalesPerformanceChart";
import { Download, Filter } from "lucide-react";

const SalesDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRfqs: 0,
        projectsAwarded: 0,
        winRate: 0,
        totalSalesValue: 0,
        activeProjects: 0,
        completed: 0,
        onHold: 0,
        delayed: 0,
        conversionRate: 0,
        totalClients: 0,
    });
    const [performanceData, setPerformanceData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projectsRes, rfqRes, clientsRes] = await Promise.all([
                    Service.GetAllProjects(),
                    Service.RFQRecieved(),
                    Service.GetAllFabricators(),
                ]);

                const projects = projectsRes?.data || [];
                const rfqs = rfqRes?.data || [];
                const clients = clientsRes?.data || clientsRes || [];

                // 1. Basic Counts
                const totalRfqs = rfqs.length;
                const awardedProjects = projects.filter((p: any) => p.status === "ACTIVE" || p.status === "COMPLETED" || p.status === "AWARDED").length;
                const activeProjects = projects.filter((p: any) => p.status === "ACTIVE" || p.status === "AWARDED").length;
                const completed = projects.filter((p: any) => p.status === "COMPLETED").length;
                const onHold = projects.filter((p: any) => p.status === "ON_HOLD").length;

                // 2. Delayed Projects (EndDate passed and not completed)
                const today = new Date();
                const delayed = projects.filter((p: any) => {
                    if (p.status === "COMPLETED") return false;
                    if (!p.endDate) return false;
                    return new Date(p.endDate) < today;
                }).length;

                // 3. Win Rate & Conversion
                const winRate = totalRfqs > 0 ? Math.round((awardedProjects / totalRfqs) * 100) : 0;
                const conversionRate = totalRfqs > 0 ? Math.round((awardedProjects / totalRfqs) * 100) : 0;

                // 4. Total Sales Value (Sum bidPrice of Awarded/Completed projects)
                const totalSalesValue = rfqs.reduce((acc: number, rfq: any) => {
                    const isAwarded = projects.some((p: any) => p.rfqId === rfq.id && (p.status === "ACTIVE" || p.status === "COMPLETED" || p.status === "AWARDED"));
                    if (isAwarded && rfq.bidPrice) {
                        const numericPrice = parseFloat(String(rfq.bidPrice).replace(/[^0-9.]/g, "")) || 0;
                        return acc + numericPrice;
                    }
                    return acc;
                }, 0);

                // 5. Monthly Performance Data (Last 12 Months)
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                // Use an array to maintain order and avoid collisions
                const performance = [];
                for (let i = 11; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(today.getMonth() - i);
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

                setStats({
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
                });
                setPerformanceData(performance);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching sales data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="h-full p-6 space-y-8 font-sans text-slate-900 bg-transparent">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sales Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor your sales performance and conversion rates.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-soft border border-slate-100">
                        <Filter size={18} />
                        All Time
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#6bbd45] text-white rounded-2xl font-bold hover:shadow-highlight transition-all shadow-medium">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 pb-1">
                {['Overview', 'Performance', 'Leads'].map((tab, i) => (
                    <button key={tab} className={`pb-3 text-base font-bold transition-all relative px-1 ${i === 0 ? 'text-[#6bbd45]' : 'text-slate-400 hover:text-slate-600'}`}>
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
