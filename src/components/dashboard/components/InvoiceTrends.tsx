import React, { useState, useMemo } from "react";
import {
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";

interface InvoiceTrendsProps {
  invoices: any[];
}

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

const InvoiceTrends: React.FC<InvoiceTrendsProps> = ({ invoices }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const processedChartData = useMemo(() => {
    if (selectedMonth === null) {
      // Yearly view - Monthly grouping
      return months.map((month, index) => {
        const monthlyInvoices = invoices.filter((inv) => {
          const date = new Date(inv.invoiceDate);
          return (
            date.getFullYear() === selectedYear && date.getMonth() === index
          );
        });

        const totalAmount = monthlyInvoices.reduce(
          (sum, inv) => sum + (inv.totalInvoiceValue || 0),
          0
        );
        return {
          name: month,
          amount: totalAmount,
          count: monthlyInvoices.length,
        };
      });
    } else {
      // Monthly view - Daily grouping
      const daysInMonth = new Date(
        selectedYear,
        selectedMonth + 1,
        0
      ).getDate();
      const dailyData = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const dailyInvoices = invoices.filter((inv) => {
          const date = new Date(inv.invoiceDate);
          return (
            date.getFullYear() === selectedYear &&
            date.getMonth() === selectedMonth &&
            date.getDate() === i
          );
        });

        const totalAmount = dailyInvoices.reduce(
          (sum, inv) => sum + (inv.totalInvoiceValue || 0),
          0
        );
        dailyData.push({
          name: i.toString(),
          amount: totalAmount,
          count: dailyInvoices.length,
        });
      }
      return dailyData;
    }
  }, [invoices, selectedYear, selectedMonth]);

  const { totalPeriodAmount, totalPeriodCount } = useMemo(() => {
    const amount = processedChartData.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const count = processedChartData.reduce((sum, item) => sum + item.count, 0);
    return { totalPeriodAmount: amount, totalPeriodCount: count };
  }, [processedChartData]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  return (
    <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 shrink-0">
        <div>
          <h2 className="text-md font-semibold text-gray-700 flex items-center gap-2">
            Invoice Trends
            <span className="text-xs font-normal text-gray-700">
              | Total: ${totalPeriodAmount.toLocaleString()} ({totalPeriodCount}{" "}
              Invoices)
            </span>
          </h2>
          <p className="text-[10px] text-gray-500">
            Showing trends for{" "}
            {selectedMonth !== null ? `${months[selectedMonth]} ` : ""}
            {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="py-1 px-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-white font-medium shadow-sm"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Filter Row */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
        <button
          onClick={() => setSelectedMonth(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shadow-sm ${selectedMonth === null
            ? "bg-green-500 text-white shadow-green-200"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
            }`}
        >
          All Months
        </button>
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(index)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shadow-sm ${selectedMonth === index
              ? "bg-green-500 text-white shadow-green-200"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
              }`}
          >
            {month}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickFormatter={(value) =>
                `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
              }
              width={35}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded-lg shadow-xl border border-gray-100 text-xs">
                      <p className="font-bold text-gray-400 mb-1 uppercase tracking-wider">
                        {selectedMonth !== null
                          ? `${months[selectedMonth]} ${label}`
                          : label}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        <p className="font-bold text-green-700">
                          Amount: ${data.amount.toLocaleString()}
                        </p>
                        <p className="font-medium text-gray-700">
                          Invoices: {data.count}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              name="Total Amount"
              fill="#0d9488"
              fillOpacity={0.1}
              stroke="#6bbd45"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default InvoiceTrends;
