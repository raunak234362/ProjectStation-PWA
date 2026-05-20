import { useEffect, useState, useMemo } from "react";
import Service from "../../api/Service";
import DataTable, { type ExtendedColumnDef } from "../ui/table";
import GetInvoiceById from "./GetInvoiceById";
import { formatDate } from "../../utils/dateUtils";


const AllInvoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "MTO" | "DETAILING">("ALL");
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const isFabricatorRole = userRole === "client" || userRole === "client_admin" || userRole === "client_estimator" || userRole === "client_accountant";
        const res = (userRole === "client" || userRole === "client_estimator")
          ? await Service.GetAllInvoiceByClient()
          : (isFabricatorRole ? await Service.getFabricatorAllInvoice() : await Service.GetAllInvoice());
        setInvoices(Array.isArray(res) ? res : res?.data || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    if (typeFilter === "ALL") return invoices;
    return invoices.filter((inv) => {
      const t = (inv.type || inv.invoiceType || "").toUpperCase();
      if (typeFilter === "MTO") return t === "MTO";
      if (typeFilter === "DETAILING") return t !== "MTO" && t !== "";
      return true;
    });
  }, [invoices, typeFilter]);

  const mtoCount = useMemo(() => invoices.filter((inv) => (inv.type || inv.invoiceType || "").toUpperCase() === "MTO").length, [invoices]);
  const detailingCount = useMemo(() => invoices.filter((inv) => { const t = (inv.type || inv.invoiceType || "").toUpperCase(); return t !== "MTO" && t !== ""; }).length, [invoices]);

  const columns: ExtendedColumnDef<any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      enableColumnFilter: true,
      cell: ({ row }) => row.getValue("invoiceNumber") || "—",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      enableColumnFilter: true,
    },
    {
      accessorKey: "jobName",
      header: "Job Name",
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => {
        const t = (row.original.type || row.original.invoiceType || "").toUpperCase();
        const isMto = t === "MTO";
        if (!t) return <span className="text-gray-400 text-xs font-bold">—</span>;
        return (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${
            isMto
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-purple-50 text-purple-700 border-purple-200"
          }`}>
            {isMto ? "MTO" : "Detailing"}
          </span>
        );
      },
    },
    {
      accessorKey: "invoiceDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("invoiceDate")),
    },
    {
      accessorKey: "totalInvoiceValue",
      header: "Total",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalInvoiceValue"));
        const currency = row.original.currencyType || "USD";
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(amount);
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Status",
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: [
        { label: "Paid", value: "true" },
        { label: "Pending", value: "false" },
      ],
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus");
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            status
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }`}>
            {status ? "Paid" : "Pending"}
          </span>
        );
      },
    },
  ];

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const tabs: { label: string; value: "ALL" | "MTO" | "DETAILING"; count: number }[] = [
    { label: "All", value: "ALL", count: invoices.length },
    { label: "MTO", value: "MTO", count: mtoCount },
    { label: "Detailing", value: "DETAILING", count: detailingCount },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-black shadow-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-black uppercase tracking-tight">All Invoices</h2>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                typeFilter === tab.value
                  ? "bg-green-200/50 text-green-800 shadow-sm border border-green-300"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                typeFilter === tab.value ? "bg-green-300/50 text-green-800" : "bg-gray-200 text-gray-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredInvoices}
        onRowClick={(row: any) => setSelectedInvoiceId(row._id || row.id)}
        pageSizeOptions={[5, 10, 25]}
      />
      {selectedInvoiceId && (
        <GetInvoiceById
          id={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
};

export default AllInvoices;

