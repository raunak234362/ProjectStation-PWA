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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full transition-colors duration-300 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
            INVOICE TRENDS
          </h2>
          <div className="flex flex-row items-center gap-5">
            <div className="text-xs font-medium flex flex-col gap-1 mt-1">
              <p className=" text-gray-500 uppercase tracking-wider">
                Total Raised:{" "}
                <span className="text-lg font-black text-gray-900 ml-1">
                  ${totalRaisedAmount.toLocaleString()}
                </span>
              </p>
              <p className=" text-gray-500 uppercase tracking-wider">
                Received:{" "}
                <span className="text-lg font-black text-[#6bbd45] ml-1">
                  ${totalReceivedAmount.toLocaleString()}
                </span>
              </p>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="py-1 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#6bbd45] bg-white text-gray-900 shadow-sm transition-all cursor-pointer hover:border-gray-300 uppercase tracking-wider font-bold"
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
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar shrink-0">
        <button
          onClick={() => setSelectedMonth(null)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-sm border",
            selectedMonth === null
              ? "bg-[#6bbd45] text-white border-[#6bbd45]"
              : "bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 border-gray-200",
          )}
        >
          All
        </button>
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(index)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-sm border",
              selectedMonth === index
                ? "bg-[#6bbd45] text-white border-[#6bbd45]"
                : "bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 border-gray-200",
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
              stroke={"#f1f5f9"}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: theme === "dark" ? "#111827" : "#6b7280", // Using dark text for light mode as per request (black/grey)
                fontSize: 12,
                fontWeight: 700,
              }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: theme === "dark" ? "#6bbd45" : "#9ca3af",
                fontSize: 11,
                fontWeight: 600,
              }}
              tickFormatter={(value) =>
                `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
              }
              width={40}
            />
            <Tooltip
              cursor={{
                fill: "#f8fafc",
                opacity: 0.6,
              }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 min-w-[160px]">
                      <p className=" text-gray-400 mb-2 uppercase tracking-tight text-xs font-black">
                        {selectedMonth !== null
                          ? `${months[selectedMonth]} ${label}`
                          : label}{" "}
                        {selectedYear}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            RAISED
                          </span>
                          <span className="text-sm font-black text-gray-900">
                            ${(data.raised || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-[#6bbd45] uppercase tracking-wider">
                            RECEIVED
                          </span>
                          <span className="text-sm font-black text-[#6bbd45]">
                            ${(data.received || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            INVOICES
                          </span>
                          <span className="text-xs font-bold text-gray-600">
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
                fontSize: "12px",
                fontWeight: 700,
                color: theme === "dark" ? "#111827" : "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            />
            <Bar
              dataKey="received"
              name="Received"
              stackId="a"
              fill="#6bbd45"
              radius={[0, 0, 4, 4]}
              barSize={40}
            />
            <Bar
              dataKey="pending"
              name="Pending"
              stackId="a"
              fill={"#e2e8f0"} // Light grey for pending
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
