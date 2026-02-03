import { useEffect, useState, useMemo } from "react";
import Service from "../../../api/Service";
import { Loader2 } from "lucide-react";
import { type ProjectData, type RFQItem } from "../../../interface";
import FabricatorStatsCards from "./components/FabricatorStatsCards";
import RFQComparisonChart from "./components/RFQComparisonChart";
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
        const now = new Date();

        if (timeRange === "weekly") {
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(now.getDate() - (6 - i));
                return {
                    name: days[d.getDay()],
                    dateStr: d.toDateString(),
                    total: 0,
                    production: 0,
                    completed: 0
                };
            });

            rfqs.forEach(r => {
                const d = new Date(r.createdAt).toDateString();
                const day = last7Days.find(ld => ld.dateStr === d);
                if (day) day.total++;
            });

            projects.forEach(p => {
                const dateVal = (p as any).createdAt || p.startDate;
                if (!dateVal) return;
                const d = new Date(dateVal).toDateString();
                const day = last7Days.find(ld => ld.dateStr === d);
                if (day) {
                    if (p.status === "ACTIVE") day.production++;
                    if (p.status === "COMPLETED") day.completed++;
                }
            });

            return last7Days;
        }

        if (timeRange === "monthly") {
            // Group by weeks of the current month
            const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
            const monthlyData = weeks.map(w => ({ name: w, total: 0, production: 0, completed: 0 }));

            rfqs.forEach(r => {
                const date = new Date(r.createdAt);
                if (date.getMonth() === now.getMonth()) {
                    const weekIdx = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
                    monthlyData[weekIdx].total++;
                }
            });

            projects.forEach(p => {
                const dateVal = (p as any).createdAt || p.startDate;
                if (!dateVal) return;
                const date = new Date(dateVal);
                if (date.getMonth() === now.getMonth()) {
                    const weekIdx = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
                    if (p.status === "ACTIVE") monthlyData[weekIdx].production++;
                    if (p.status === "COMPLETED") monthlyData[weekIdx].completed++;
                }
            });

            return monthlyData;
        }

        // Yearly: group by months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const yearlyData = months.map(m => ({ name: m, total: 0, production: 0, completed: 0 }));

        rfqs.forEach(r => {
            const date = new Date(r.createdAt);
            if (date.getFullYear() === now.getFullYear()) {
                yearlyData[date.getMonth()].total++;
            }
        });

        projects.forEach(p => {
            const dateVal = (p as any).createdAt || p.startDate;
            if (!dateVal) return;
            const date = new Date(dateVal);
            if (date.getFullYear() === now.getFullYear()) {
                if (p.status === "ACTIVE") yearlyData[date.getMonth()].production++;
                if (p.status === "COMPLETED") yearlyData[date.getMonth()].completed++;
            }
        });

        return yearlyData;
    }, [timeRange, rfqs, projects]);


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

            <div className="w-full min-h-[400px]">
                <RFQComparisonChart
                    data={chartData}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                />
            </div>

        </motion.div>
    );
};

export default FabricatorOverview;
