import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../../../lib/utils";

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

  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  const processedChartData = useMemo(() => {
    if (selectedMonth === null) {
      // Quarterly view
      return quarters.map((q, index) => {
        const quarterlyInvoices = invoices.filter((inv) => {
          const date = new Date(inv.invoiceDate);
          const month = date.getMonth();
          const quarterIndex = Math.floor(month / 3);
          return date.getFullYear() === selectedYear && quarterIndex === index;
        });

        const totalAmount = quarterlyInvoices.reduce(
          (sum, inv) => sum + (inv.totalInvoiceValue || 0),
          0
        );
        return {
          name: q,
          amount: totalAmount,
          count: quarterlyInvoices.length,
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

  const { totalPeriodAmount } = useMemo(() => {
    const amount = processedChartData.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );
    const count = processedChartData.reduce((sum: number, item: any) => sum + item.count, 0);
    return { totalPeriodAmount: amount, totalPeriodCount: count };
  }, [processedChartData]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  return (
    <div className="bg-[#f9fdf7] p-6 rounded-3xl shadow-soft flex flex-col h-full border border-slate-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            Invoice Trends (Quarterly)
          </h2>
          <p className="text-sm text-slate-500 font-bold mt-1">
            Total Revenue: <span className="text-[#6bbd45]">${totalPeriodAmount.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="py-2 px-4 text-sm border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#6bbd45] bg-slate-50 font-bold shadow-soft transition-all"
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
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar shrink-0">
        <button
          onClick={() => setSelectedMonth(null)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-soft border",
            selectedMonth === null
              ? "bg-[#6bbd45] text-white border-[#6bbd45] shadow-highlight"
              : "bg-white text-slate-500 hover:bg-slate-50 border-slate-100"
          )}
        >
          Quarterly View
        </button>
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(index)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-soft border",
              selectedMonth === index
                ? "bg-[#6bbd45] text-white border-[#6bbd45] shadow-highlight"
                : "bg-white text-slate-500 hover:bg-slate-50 border-slate-100"
            )}
          >
            {month}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 w-full px-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
              tickFormatter={(value: number) =>
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
            <Bar
              dataKey="amount"
              name="Total Amount"
              fill="#6bbd45"
              radius={[4, 4, 0, 0]}
              barSize={selectedMonth === null ? 60 : 20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default InvoiceTrends;
