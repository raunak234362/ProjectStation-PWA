import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import InvoiceStatsCards from "./InvoiceStatsCards";
import InvoiceAnalytics from "./InvoiceAnalytics";
import PendingInvoiceList from "./PendingInvoiceList";
import RecentInvoiceActivity from "./RecentInvoiceActivity";
import AllInvoiceList from "./AllInvoiceList";

interface InvoiceDashboardProps {
  navigateToCreate: () => void;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({
}) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();
  const isFabricatorRole = userRole === "client" || userRole === "client_admin" || userRole === "client_estimator";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">


      {/* 1. Stats Cards */}
      <InvoiceStatsCards invoices={invoices} />

      {/* Analytics (Charts) */}
      <InvoiceAnalytics invoices={invoices} />

      {/* Bottom Section: List + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        <div className="xl:col-span-2 h-full">
          <PendingInvoiceList invoices={invoices} />
        </div>
        <div className="xl:col-span-1 h-full">
          <RecentInvoiceActivity invoices={invoices} />
        </div>
      </div>

      {/* All Invoices */}
      <div className="w-full mt-6">
        <AllInvoiceList invoices={invoices} />
      </div>
    </div>
  );
};

export default InvoiceDashboard;
