import { useEffect, useState, useMemo } from "react";
import Service from "../../../api/Service";
import InvoiceStatsCards from "./InvoiceStatsCards";
import InvoiceAnalytics from "./InvoiceAnalytics";
import PendingInvoiceList from "./PendingInvoiceList";
import RecentInvoiceActivity from "./RecentInvoiceActivity";
import AllInvoiceList from "./AllInvoiceList";
import { Calendar, Filter, ChevronDown } from "lucide-react";

interface InvoiceDashboardProps {
  navigateToCreate: () => void;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({
}) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
  const [fromMonth, setFromMonth] = useState<number>(0); // Jan
  const [toMonth, setToMonth] = useState<number>(new Date().getMonth()); // Current month

  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();
  const isFabricatorRole = userRole === "client" || userRole === "client_admin" || userRole === "client_estimator";

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = isFabricatorRole
          ? await Service.getFabricatorAllInvoice()
          : await Service.GetAllInvoice();
        console.log("Fetched Invoices Data:", res);
        setInvoices(Array.isArray(res) ? res : res?.data || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [isFabricatorRole]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const dateStr = invoice.createdAt || invoice.invoiceDate || invoice.date;
      if (!dateStr) return true;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return true;

      const matchesYear = selectedYear === null || date.getFullYear() === selectedYear;
      
      const month = date.getMonth();
      const matchesRange = month >= fromMonth && month <= toMonth;

      return matchesYear && matchesRange;
    });
  }, [invoices, selectedYear, fromMonth, toMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-green-600" />
          <h2 className="text-sm font-black text-black uppercase tracking-widest">Filter Invoices</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Select */}
          <div className="relative min-w-[140px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedYear === null ? "all" : selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === "all" ? null : parseInt(e.target.value))}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-black/10 rounded-xl text-sm font-bold text-black focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-all"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="flex items-center bg-gray-50 border border-black/10 rounded-xl px-2 gap-2">
            {/* From Month */}
            <div className="relative min-w-[110px]">
              <select
                value={fromMonth}
                onChange={(e) => setFromMonth(parseInt(e.target.value))}
                className="w-full pl-3 pr-8 py-2 bg-transparent text-sm font-bold text-black focus:ring-0 outline-none appearance-none cursor-pointer"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
            </div>

            <span className="text-gray-400 font-bold">to</span>

            {/* To Month */}
            <div className="relative min-w-[110px]">
              <select
                value={toMonth}
                onChange={(e) => setToMonth(parseInt(e.target.value))}
                className="w-full pl-3 pr-8 py-2 bg-transparent text-sm font-bold text-black focus:ring-0 outline-none appearance-none cursor-pointer"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
            </div>
          </div>

          {(selectedYear !== null || fromMonth !== 0 || toMonth !== new Date().getMonth()) && (
            <button
              onClick={() => {
                setSelectedYear(new Date().getFullYear());
                setFromMonth(0);
                setToMonth(new Date().getMonth());
              }}
              className="px-4 py-2 text-xs font-black text-red-600 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 1. Stats Cards */}
      <InvoiceStatsCards invoices={filteredInvoices} />

      {/* Analytics (Charts) */}
      {/* <InvoiceAnalytics 
        invoices={filteredInvoices} 
        fromMonth={fromMonth}
        toMonth={toMonth}
      /> */}

      {/* Bottom Section: List + Activity */}
      {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        <div className="xl:col-span-2 h-full">
          <PendingInvoiceList invoices={filteredInvoices} />
        </div>
        <div className="xl:col-span-1 h-full">
          <RecentInvoiceActivity invoices={filteredInvoices} />
        </div>
      </div> */}

      {/* All Invoices */}
      <div className="w-full mt-6">
        <AllInvoiceList invoices={filteredInvoices} />
      </div>
    </div>
  );
};

export default InvoiceDashboard;
