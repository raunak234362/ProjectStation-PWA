/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import Service from "../../api/Service";
import { motion, AnimatePresence } from "framer-motion";
import SalesStatsCards from "./components/SalesStatsCards";
import SalesSecondaryStats from "./components/SalesSecondaryStats";
import SalesPerformanceChart from "./components/SalesPerformanceChart";
import { Download, Filter, ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

import SalesDetailModal from "./components/SalesDetailModal";

const SalesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<
    "All Time" | "Last 7 Days" | "Last 30 Days" | "Last 12 Months"
  >("All Time");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [allData, setAllData] = useState<any>({});

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"PROJECTS" | "RFQS" | "INVOICES" | "CLIENTS">("PROJECTS");
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const salesData = await Service.SalesDashboard();
        console.log("Fetched Sales Dashboard Data from dashBoardData/sales:", salesData);

        // Map the backend structure correctly
        // salesData might be { data: { ... }, activeProjectsFromSales: ... }
        setAllData(salesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sales data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openDetailModal = (type: any, title: string, data: any[]) => {
    setModalType(type);
    setModalTitle(title);
    setModalData(data || []);
    setModalOpen(true);
  };

  const computedData = useMemo(() => {
    const rawData = allData?.data || allData || {};
    const {
      projects = [],
      rfqs = [],
      clients = [],
      invoices = []
    } = allData;

    // Use backend provided stats if available, fallback to local calculation
    return {
      stats: {
        totalRfqs: allData?.totalRFQs ?? rawData?.totalRFQs ?? rfqs.length,
        totalProjects: allData?.totalProjectsFromSales ?? rawData?.totalProjectsFromSales ?? projects.length,
        projectsAwarded: allData?.awardedRFQs ?? rawData?.awardedRFQs ?? 0,
        winRate: allData?.winRate ?? rawData?.winRate ?? 0,
        totalSalesValue: allData?.totalBidPrice ?? rawData?.totalBidPrice ?? 0,
        activeProjects: allData?.activeProjectsFromSales ?? rawData?.activeProjectsFromSales ?? 0,
        completed: allData?.completedProjectsFromSales ?? rawData?.completedProjectsFromSales ?? 0,
        onHold: projects.filter((p: any) => p.status === "ON_HOLD").length,
        delayed: projects.filter((p: any) => {
          if (p.status === "COMPLETED") return false;
          if (!p.endDate) return false;
          return new Date(p.endDate) < new Date();
        }).length,
        conversionRate: allData?.projectConversionRate ?? rawData?.projectConversionRate ?? 0,
        totalClients: allData?.totalClients ?? rawData?.totalClients ?? clients.length,

        // New Backend Fields
        inPipelineRFQs: allData?.inPipelineRFQs ?? rawData?.inPipelineRFQs ?? 0,
        quotedRFQs: allData?.quotedRFQs ?? rawData?.quotedRFQs ?? 0,
        respondedRFQs: allData?.respondedRFQs ?? rawData?.respondedRFQs ?? 0,
        rejectedRFQs: allData?.rejectedRFQs ?? rawData?.rejectedRFQs ?? 0,

        // Invoice Analytics
        invoiceAnalytics: allData?.invoiceAnalytics || rawData?.invoiceAnalytics || {},

        // Raw Arrays for Modals
        rawProjects: projects,
        rawRfqs: rfqs,
        rawClients: clients,
        rawInvoices: invoices || allData?.invoices || [],
      },
      performance: allData?.performance || [],
    };
  }, [allData]);

  const { stats, performance: performanceData } = computedData;

  const handleExport = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Report Period", timeFilter],
      ["Total RFQs Received", stats.totalRfqs],
      ["Total Projects", stats.totalProjects],
      ["Projects Awarded", stats.projectsAwarded],
      ["Win Rate", `${stats.winRate}%`],
      ["Total Sales Value", `$${stats.totalSalesValue}`],
      ["Active Projects", stats.activeProjects],
      ["Completed Projects", stats.completed],
      ["Conversion Rate", `${stats.conversionRate}%`],
      ["Total Clients", stats.totalClients],
    ];

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Sales_Report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-8 font-sans text-gray-900 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          {/* <h1 className="text-3xl font-extrabold tracking-tight text-black">
            Sales Funnel
          </h1>
          <p className="text-black font-bold text-sm mt-1">
            Monitor your sales performance and conversion rates.
          </p> */}
        </div>

        <div className="flex gap-3 relative">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-black font-bold rounded-2xl hover:bg-green-100 transition-all shadow-soft border border-black/10 min-w-[140px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-black" />
                {timeFilter}
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform",
                  showFilterDropdown ? "rotate-180" : "",
                )}
              />
            </button>

            <AnimatePresence>
              {showFilterDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-green-500/10 py-2 z-20"
                  >
                    {(
                      [
                        "All Time",
                        "Last 7 Days",
                        "Last 30 Days",
                        "Last 12 Months",
                      ] as const
                    ).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setTimeFilter(option);
                          setShowFilterDropdown(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm  text-slate-600 hover:bg-green-50 transition-colors"
                      >
                        {option}
                        {timeFilter === option && (
                          <Check size={16} className="text-[#6bbd45]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-200 text-black font-bold border border-black/10 rounded-2xl hover:bg-green-300 transition-all shadow-medium"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 pb-1 border-b border-black/10">
        {["Overview"].map((tab, i) => (
          <button
            key={tab}
            className={`pb-3 text-base transition-all relative px-1 font-bold ${i === 0 ? "text-black" : "text-black/60 hover:text-black"}`}
          >
            {tab}
            {i === 0 && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <SalesStatsCards
        stats={stats}
        onCardClick={(type, title, data) => openDetailModal(type, title, data)}
      />

      {/* Secondary Stats */}
      <div className="pt-2">
        <SalesSecondaryStats
          stats={stats}
          onCardClick={(type, title, data) => openDetailModal(type, title, data)}
        />
      </div>

      {/* Charts & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 pt-4">
        <SalesPerformanceChart data={performanceData} />
      </div>

      {/* Detail Modal */}
      <SalesDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        title={modalTitle}
        data={modalData}
      />
    </div>
  );
};

export default SalesDashboard;
