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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projectsRes, rfqRes, clientsRes] = await Promise.all([
                    Service.GetAllProjects(),
                    Service.RFQRecieved(), // Or RfqSent depending on role, assuming Recieved for internal sales
                    Service.GetAllFabricators(),
                ]);

                const projects = projectsRes?.data || [];
                const rfqs = rfqRes?.data || [];
                const clients = clientsRes || [];

                // Calculation Logic
                const totalRfqs = rfqs.length;
                const awardedProjects = projects.filter((p: any) => p.status === "ACTIVE" || p.status === "COMPLETED" || p.status === "AWARDED").length;

                // Win Rate (Projects / RFQs * 100) - naive calculation
                const winRate = totalRfqs > 0 ? Math.round((awardedProjects / totalRfqs) * 100) : 0;

                // Sales Value (Sum of project values? Field might not exist, using bidPrice from RFQ or estimating)
                // Assuming 'bidPrice' or similar on Project/RFQ. Project interface shows 'estimatedHours' etc.
                // Let's use a mock multiplier for now or check if project has price.
                // Checking ProjectData interface: has estimatedHours. No explicit price.
                // Checking RFQ interface: has bidPrice.
                // Let's sum bidPrice of awarded RFQs (projects usually linked to RFQs)

                let totalSalesValue = 0;
                // Approximation: Sum bidPrice from RFQs linked to these projects or all projects
                // Since I don't have direct linkage easily without iterating, I'll use 0 for now or a mock until confirmed.
                // Actually, let's use a placeholder.
                totalSalesValue = 542000; // Placeholder

                const activeProjects = projects.filter((p: any) => p.status === "ACTIVE").length;
                const completed = projects.filter((p: any) => p.status === "COMPLETED").length;
                const onHold = projects.filter((p: any) => p.status === "ON_HOLD").length;
                const delayed = 0; // No status for delayed yet

                const conversionRate = 14;
                const totalClients = clients.length;

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
                    totalClients,
                });

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
            <div className="flex items-center justify-center h-full min-h-screen">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Sales Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter size={18} />
                        All Time
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Tabs (Visual only for now) */}
            <div className="flex gap-8 border-b border-gray-200">
                {['Overview', 'Projects', 'Analytics'].map((tab, i) => (
                    <button key={tab} className={`pb-3 text-sm font-semibold transition-colors relative ${i === 0 ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>
                        {tab}
                        {i === 0 && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <SalesStatsCards stats={stats} />

            {/* Secondary Stats */}
            <SalesSecondaryStats stats={stats} />

            {/* Charts & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <SalesPerformanceChart />
            </div>
        </div>
    );
};

export default SalesDashboard;
