import { useState } from "react";
import { AddInvoice, AllInvoices, InvoiceDashboard } from "../components";
import AccountLayout from "./AccountLayout";

const InvoiceLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 flex flex-wrap items-center justify-center md:justify-end gap-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all border border-black ${activeTab === "dashboard"
              ? "bg-green-200 text-black shadow-medium"
              : "text-black hover:bg-green-50"
              }`}
          >
            Invoice Home
          </button>
          {userRole === "sales" || userRole === "sales_manager" || userRole === "admin" || userRole === "project_manager_officer" ? (
            <>
              <button
                onClick={() => setActiveTab("allInvoices")}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all border border-black ${activeTab === "allInvoices"
                  ? "bg-green-200 text-black shadow-medium"
                  : "text-black hover:bg-green-50"
                  }`}
              >
                All Invoices
              </button>

              <button
                onClick={() => setActiveTab("addInvoice")}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all border border-black ${activeTab === "addInvoice"
                  ? "bg-green-200 text-black shadow-medium"
                  : "text-black hover:bg-green-50"
                  }`}
              >
                Add Invoice
              </button>

              <button
                onClick={() => setActiveTab("accounts")}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all border border-black ${activeTab === "accounts"
                  ? "bg-green-200 text-black shadow-medium"
                  : "text-black hover:bg-green-50"
                  }`}
              >
                Accounts
              </button>
            </>
          ) : (null)}
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-[6px] overflow-y-auto laptop-fit">
        {activeTab === "dashboard" && (
          <InvoiceDashboard
            navigateToCreate={() => setActiveTab("addInvoice")}
          />
        )}
        {activeTab === "allInvoices" && (
          <div>
            <AllInvoices />
          </div>
        )}
        {activeTab === "addInvoice" && (
          <div>
            <AddInvoice />
          </div>
        )}
        {activeTab === "accounts" && (
          <AccountLayout />
        )}
      </div>
    </div>
  );
};

export default InvoiceLayout;
