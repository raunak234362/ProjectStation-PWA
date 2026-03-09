import { useEffect, useState } from "react";
import AddAccount from "../components/accounts/AddAccount";
import AllAccounts from "../components/accounts/AllAccounts";
import Service from "../api/Service";

const AccountLayout = () => {
  const [activeTab, setActiveTab] = useState("allAccounts");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await Service.GetBankAccounts();
      const data = response?.data || response || [];
      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching accounts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const btnClass = (tab: string) =>
    `flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all border border-black ${activeTab === tab
      ? "bg-green-200 text-black shadow-medium"
      : "text-black hover:bg-green-50"
    }`;

  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 rounded-t-[6px] flex flex-wrap items-center justify-center md:justify-end gap-3">
          <button onClick={() => setActiveTab("allAccounts")} className={btnClass("allAccounts")}>
            All Accounts
          </button>
          <button onClick={() => setActiveTab("addAccount")} className={btnClass("addAccount")}>
            Add Account
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white p-2 rounded-b-[6px] overflow-y-auto">
        {activeTab === "allAccounts" && (
          <div>
            <AllAccounts accounts={accounts} loading={loading} />
          </div>
        )}
        {activeTab === "addAccount" && (
          <div>
            <AddAccount
              onSuccess={() => {
                fetchAccounts();
                setActiveTab("allAccounts");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountLayout;
