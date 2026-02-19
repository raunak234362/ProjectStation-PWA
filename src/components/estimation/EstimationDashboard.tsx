import { useEffect, useState } from "react";
import Service from "../../api/Service";
import EstimationStats from "./components/EstimationStats";

import FabricatorProjectChart from "./components/FabricatorProjectChart";
import AllEstimation from "./AllEstimation";

const EstimationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [estimations, setEstimations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEstimated: 0,
    totalAwarded: 0,
    totalHours: 0,
  });

  // Chart Data State
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartFabricators, setChartFabricators] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await Service.AllEstimation();
      // Ensure we treat the response correctly based on API structure
      const allEstimations = Array.isArray(response)
        ? response
        : response?.data || [];

      setEstimations(allEstimations);
      calculateStats(allEstimations);
    } catch (error) {
      console.error("Failed to fetch estimation data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (estimations.length > 0) {
      processChartData(estimations, selectedYear);
    }
  }, [estimations, selectedYear]);

  const calculateStats = (data: any[]) => {
    if (!data) return;

    // 1. Total Estimated Projects
    const totalEstimated = data.length;

    // 2. Total Awarded Projects
    const totalAwarded = data.filter(
      (e: any) =>
        e.status?.toUpperCase() === "AWARDED" ||
        e.status?.toUpperCase() === "COMPLETED",
    ).length;

    // 3. Total Hours
    const totalHours = data.reduce((sum: number, e: any) => {
      const hours =
        e.estimatedHours || e.finalHours || e.totalAgreatedHours || 0;
      return sum + Number(hours);
    }, 0);

    setStats({
      totalEstimated,
      totalAwarded,
      totalHours,
    });
  };

  const processChartData = (data: any[], year: number) => {
    if (!data) return;

    // Initialize all 12 months for the selected year
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData: Record<string, any> = {};
    months.forEach((month, index) => {
      const key = `${year}-${String(index + 1).padStart(2, "0")}`;
      monthlyData[key] = { name: month, sortKey: key };
    });

    const allFabricators = new Set<string>();

    data.forEach((e: any) => {
      const dateStr = e.estimateDate || e.createdAt;
      if (!dateStr) return;

      const date = new Date(dateStr);
      if (date.getFullYear() !== year) return;

      const sortKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (!monthlyData[sortKey]) return; // Should not happen with Jan-Dec init

      // Get Fabricator
      const fabName = e.fabricator?.fabName || e.fabricatorName || "Unknown";
      allFabricators.add(fabName);

      if (!monthlyData[sortKey][fabName]) {
        monthlyData[sortKey][fabName] = 0;
      }
      monthlyData[sortKey][fabName] += 1;
    });

    // Convert to Array and Sort
    const sortedData = Object.values(monthlyData).sort((a: any, b: any) =>
      a.sortKey.localeCompare(b.sortKey),
    );

    setChartData(sortedData);
    setChartFabricators(Array.from(allFabricators));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full shadow-inner"></div>
          </div>
        </div>
        <p className="mt-6 text-[10px] font-bold text-black uppercase tracking-[0.3em] animate-pulse">
          Synchronizing Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-6 lg:p-8 space-y-8 bg-white overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        {/* <h2 className="text-3xl font-black text-black tracking-tight uppercase">
          Estimation Engineering
        </h2>
        <p className="text-[10px] font-bold text-black uppercase tracking-[0.2em]">
          Project Quantification & Fabricator Analysis
        </p> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-3">
          <EstimationStats
            stats={{
              ...stats,
              totalHours: Number(stats.totalHours).toFixed(2),
            }}
          />
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="w-full">
        <FabricatorProjectChart
          data={chartData}
          fabricators={chartFabricators}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      </div>

      {/* List of Estimations */}
      <div className="space-y-6">
        <div className="bg-white overflow-hidden">
          <AllEstimation estimations={estimations} onRefresh={fetchData} />
        </div>
      </div>
    </div>
  );
};

export default EstimationDashboard;
