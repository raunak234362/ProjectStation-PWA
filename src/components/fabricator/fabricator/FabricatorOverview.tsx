import { useEffect, useState, useMemo } from "react";
import Service from "../../../api/Service";
import { Loader2 } from "lucide-react";
import { type ProjectData, type RFQItem } from "../../../interface";
import FabricatorStatsCards from "./components/FabricatorStatsCards";
import RFQComparisonChart from "./components/RFQComparisonChart";
import RFQConversionFunnel from "./components/RFQConversionFunnel";
import TimeTrendAnalysis from "./components/TimeTrendAnalysis";
import LiveRFQStatusTable from "./components/LiveRFQStatusTable";
import { motion } from "motion/react";

const FabricatorOverview = () => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [rfqs, setRfqs] = useState<RFQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "yearly">("monthly");

    useEffect(() => {
        const fetchGlobalData = async () => {
            try {
                setLoading(true);
                const [allProjectsResponse, rfqReceived] = await Promise.all([
                    Service.GetAllProjects(),
                    Service.RFQRecieved()
                ]);

                setProjects(Array.isArray(allProjectsResponse) ? allProjectsResponse : allProjectsResponse?.data || []);
                setRfqs(Array.isArray(rfqReceived) ? rfqReceived : rfqReceived?.data || []);
            } catch (error) {
                console.error("Error fetching global fabricator overview data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalData();
    }, []);

    const aggregateStats = useMemo(() => {
        const totalRFQs = rfqs?.length || 0;
        const inProduction = projects?.filter(p => p.status === "ACTIVE").length || 0;
        const completed = projects?.filter(p => p.status === "COMPLETED").length || 0;
        const pendingRejected = rfqs?.filter(r => r.status === "PENDING" || r.status === "REJECTED").length || 0;

        // Delayed Logic: If status is not completed and created > 30 days ago (mock rule)
        const delayed = rfqs?.filter(r => {
            if (r.status === "COMPLETED") return false;
            const createdDate = new Date(r.createdAt);
            const now = new Date();
            const diffDays = Math.ceil(Math.abs(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays > 30;
        }).length || 0;

        return { totalRFQs, inProduction, completed, pendingRejected, delayed };
    }, [rfqs, projects]);

    const chartData = useMemo(() => {
        if (timeRange === "weekly") {
            return [
                { name: "Mon", total: 14, production: 8, completed: 4 },
                { name: "Tue", total: 18, production: 10, completed: 6 },
                { name: "Wed", total: 22, production: 15, completed: 10 },
                { name: "Thu", total: 12, production: 5, completed: 3 },
                { name: "Fri", total: 20, production: 12, completed: 8 },
            ];
        }
        if (timeRange === "monthly") {
            return [
                { name: "Week 1", total: 60, production: 40, completed: 25 },
                { name: "Week 2", total: 75, production: 50, completed: 35 },
                { name: "Week 3", total: 45, production: 30, completed: 20 },
                { name: "Week 4", total: 90, production: 65, completed: 45 },
            ];
        }
        return [
            { name: "Jan", total: 245, production: 180, completed: 120 },
            { name: "Feb", total: 282, production: 210, completed: 145 },
            { name: "Mar", total: 198, production: 135, completed: 90 },
            { name: "Apr", total: 320, production: 250, completed: 180 },
            { name: "May", total: 260, production: 190, completed: 130 },
            { name: "Jun", total: 295, production: 220, completed: 160 },
        ];
    }, [timeRange]);

    const funnelData = useMemo(() => ({
        raised: aggregateStats.totalRFQs,
        inProduction: aggregateStats.inProduction,
        completed: aggregateStats.completed
    }), [aggregateStats]);

    const trendData = useMemo(() => ([
        { name: "Week 1", avgDelay: 2, productionTime: 12 },
        { name: "Week 2", avgDelay: 4, productionTime: 14 },
        { name: "Week 3", avgDelay: 1, productionTime: 10 },
        { name: "Week 4", avgDelay: 5, productionTime: 18 },
    ]), []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#6bbd45]" />
            </div>
        );
    }
   
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 lg:p-2"
        >
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Fabricator Insights</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global RFQ & Production Operations</p>
            </div>

            <FabricatorStatsCards stats={aggregateStats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 min-h-[400px]">
                    <RFQComparisonChart
                        data={chartData}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                    />
                </div>
                <div className="lg:col-span-1 min-h-[400px]">
                    <RFQConversionFunnel data={funnelData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 min-h-[300px]">
                    <TimeTrendAnalysis data={trendData} />
                </div>
                <div className="lg:col-span-2 min-h-[300px]">
                    <LiveRFQStatusTable rfqs={rfqs} />
                </div>
            </div>
        </motion.div>
    );
};

export default FabricatorOverview;
