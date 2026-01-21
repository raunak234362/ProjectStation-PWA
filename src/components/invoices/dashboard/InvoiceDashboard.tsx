import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import InvoiceStatsCards from "./InvoiceStatsCards";
import InvoiceAnalytics from "./InvoiceAnalytics";
import PendingInvoiceList from "./PendingInvoiceList";
import RecentInvoiceActivity from "./RecentInvoiceActivity";
import QuickActionsPanel from "./QuickActionsPanel";

interface InvoiceDashboardProps {
    navigateToCreate: () => void;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ navigateToCreate }) => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState("This Month");

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await Service.GetAllInvoice();
                setInvoices(Array.isArray(res) ? res : res?.data || []);
            } catch (error) {
                console.error("Error fetching invoices:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header & Filter */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    {/* <div>
                        <h2 className="text-2xl font-bold text-gray-800">Invoice Dashboard</h2>
                        <p className="text-gray-500">Welcome back! Here's your financial overview.</p>
                    </div> */}
                </div>

                {/* Date Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {["All Months", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setDateFilter(filter)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${dateFilter === filter
                                ? "bg-green-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* 1. Stats Cards */}
            <InvoiceStatsCards invoices={invoices} />

            {/* 2. Quick Actions */}
            <QuickActionsPanel
                onRaiseInvoice={navigateToCreate}
                onDownloadReport={() => alert("Report download feature coming soon!")}
                onSendReminders={() => alert("Reminders sent successfully!")}
            />

            {/* 3. Analytics (Charts) */}
            <InvoiceAnalytics invoices={invoices} />

            {/* 4. Bottom Section: List + Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <PendingInvoiceList invoices={invoices} />
                </div>
                <div className="xl:col-span-1">
                    <RecentInvoiceActivity invoices={invoices} />
                </div>
            </div>
        </div>
    );
};

export default InvoiceDashboard;
