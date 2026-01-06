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

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Invoice Trends
          </h2>
          <p className="text-xs text-gray-500">
            Showing amount and count for{" "}
            {selectedMonth !== null ? `${months[selectedMonth]} ` : ""}
            {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 font-medium"
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
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedMonth(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            selectedMonth === null
              ? "bg-teal-600 text-white shadow-md shadow-teal-100"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Months
        </button>
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(index)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              selectedMonth === index
                ? "bg-teal-600 text-white shadow-md shadow-teal-100"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickFormatter={(value) =>
                `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                padding: "12px",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={36}
              iconType="circle"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="amount"
              name="Total Amount"
              fill="#0d9488"
              fillOpacity={0.1}
              stroke="#0d9488"
              strokeWidth={3}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="count"
              name="Invoice Count"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#f59e0b",
                strokeWidth: 2,
                stroke: "#fff",
              }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvoiceTrends;
