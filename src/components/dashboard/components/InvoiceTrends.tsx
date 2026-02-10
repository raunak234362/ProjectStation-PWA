import React, { useState, useMemo } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Legend,
} from "recharts";
import { cn } from "../../../lib/utils";
import { useTheme } from "../../../context/ThemeContext";

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

const quarters = [
  { name: "Jan-Mar", label: "Q1", months: [0, 1, 2] },
  { name: "Apr-Jun", label: "Q2", months: [3, 4, 5] },
  { name: "Jul-Sep", label: "Q3", months: [6, 7, 8] },
  { name: "Oct-Dec", label: "Q4", months: [9, 10, 11] },
];

const InvoiceTrends: React.FC<InvoiceTrendsProps> = ({ invoices }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const processedChartData = useMemo(() => {
    const parseVal = (val: any) => {
      if (typeof val === "number") return val;
      if (typeof val === "string")
        return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
      return 0;
    };

    if (selectedMonth === null) {
      // Yearly view - Quarterly grouping
      return quarters.map((quarter) => {
        const quarterlyInvoices = invoices.filter((inv) => {
          const date = new Date(inv.invoiceDate);
          return (
            date.getFullYear() === selectedYear &&
            quarter.months.includes(date.getMonth())
          );
        });

        const raised = quarterlyInvoices.reduce(
          (sum, inv) => sum + parseVal(inv.totalInvoiceValue),
          0,
        );
        const received = quarterlyInvoices
          .filter(
            (inv) => inv.paymentStatus === "Paid" || inv.paymentStatus === true,
          )
          .reduce((sum, inv) => sum + parseVal(inv.totalInvoiceValue), 0);

        const pending = Math.max(0, raised - received);

        return {
          name: quarter.name,
          raised,
          received,
          pending,
          count: quarterlyInvoices.length,
        };
      });
    } else {
      // Monthly view - Daily grouping
      const daysInMonth = new Date(
        selectedYear,
        selectedMonth + 1,
        0,
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

        const raised = dailyInvoices.reduce(
          (sum, inv) => sum + parseVal(inv.totalInvoiceValue),
          0,
        );
        const received = dailyInvoices
          .filter(
            (inv) => inv.paymentStatus === "Paid" || inv.paymentStatus === true,
          )
          .reduce((sum, inv) => sum + parseVal(inv.totalInvoiceValue), 0);

        const pending = Math.max(0, raised - received);

        dailyData.push({
          name: i.toString(),
          raised,
          received,
          pending,
          count: dailyInvoices.length,
        });
      }
      return dailyData;
    }
  }, [invoices, selectedYear, selectedMonth]);

  const { totalRaisedAmount, totalReceivedAmount } = useMemo(() => {
    const raised = processedChartData.reduce(
      (sum, item) => sum + item.raised,
      0,
    );
    const received = processedChartData.reduce(
      (sum, item) => sum + item.received,
      0,
    );
    return { totalRaisedAmount: raised, totalReceivedAmount: received };
  }, [processedChartData]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const { theme } = useTheme();

  return (
    <div className="bg-[#f9fdf7] dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-lg md:text-2xl text-slate-800 dark:text-white flex items-center gap-2">
            INVOICE TRENDS
          </h2>
          <div className="flex flex-row items-center gap-5">
            <div className="text-md flex flex-col gap-0.5 mt-1">
              <p className=" text-slate-700 dark:text-slate-300 ">
                Total Raised:{" "}
                <span className="text-lg text-slate-900 dark:text-white">
                  ${totalRaisedAmount.toLocaleString()}
                </span>
              </p>
              <p className=" text-slate-700 dark:text-slate-300 ">
                Total Received:{" "}
                <span className="text-lg text-[#6bbd45] dark:text-green-400">
                  ${totalReceivedAmount.toLocaleString()}
                </span>
              </p>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="py-2 px-4 text-sm border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#6bbd45] bg-white dark:bg-slate-800 text-gray-900 dark:text-white  shadow-sm transition-all"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2"></div>
      </div>

      {/* Month Filter Row */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar shrink-0">
        <button
          onClick={() => setSelectedMonth(null)}
          className={cn(
            "px-4 py-2 rounded-xl text-md  transition-all whitespace-nowrap shadow-sm border",
            selectedMonth === null
              ? "bg-[#6bbd45] text-white border-[#6bbd45]"
              : "bg-white dark:bg-slate-800 text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-100 dark:border-slate-700",
          )}
        >
          All (Q1 - Q4)
        </button>
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(index)}
            className={cn(
              "px-4 py-2 rounded-xl text-md  transition-all whitespace-nowrap shadow-sm border",
              selectedMonth === index
                ? "bg-[#6bbd45] text-white border-[#6bbd45]"
                : "bg-white dark:bg-slate-800 text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-100 dark:border-slate-700",
            )}
          >
            {month}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 w-full px-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processedChartData}
            margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === "dark" ? "#1e293b" : "#f1f5f9"}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: theme === "dark" ? "#ffffff" : "#64748b",
                fontSize: 13,
                fontWeight: 700,
              }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: theme === "dark" ? "#6bbd45" : "#94a3b8",
                fontSize: 12,
                fontWeight: 600,
              }}
              tickFormatter={(value) =>
                `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
              }
              width={40}
            />
            <Tooltip
              cursor={{
                fill: theme === "dark" ? "#1e293b" : "#f8fafc",
                opacity: 0.4,
              }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 min-w-[140px]">
                      <p className=" text-slate-400 dark:text-green-400 mb-2 uppercase tracking-tight text-md">
                        {selectedMonth !== null
                          ? `${months[selectedMonth]} ${label}`
                          : label}{" "}
                        {selectedYear}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-md  text-slate-500 dark:text-slate-300">
                            RAISED
                          </span>
                          <span className="text-md  text-slate-700 dark:text-white">
                            ${(data.raised || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-md  text-emerald-500 dark:text-green-400">
                            RECEIVED
                          </span>
                          <span className="text-md  text-emerald-600 dark:text-green-400">
                            ${(data.received || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-md  text-slate-400 dark:text-slate-400">
                            INVOICES
                          </span>
                          <span className="text-md  text-slate-600 dark:text-white">
                            {data.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingTop: "0px",
                paddingBottom: "20px",
                fontSize: "14px",
                fontWeight: 700,
                color: theme === "dark" ? "#ffffff" : "#64748b",
              }}
            />
            <Bar
              dataKey="received"
              name="Received Amount"
              stackId="a"
              fill="#6bbd45"
              radius={[0, 0, 4, 4]}
              barSize={40}
            />
            <Bar
              dataKey="pending"
              name="Pending Amount"
              stackId="a"
              fill={theme === "dark" ? "#334155" : "#cbd5e1"}
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default InvoiceTrends;
