import React, { useState, useMemo } from "react";
import DataTable, { type ExtendedColumnDef } from "../../ui/table";
import GetInvoiceById from "../GetInvoiceById";
import { formatDate } from "../../../utils/dateUtils";

interface AllListProps {
  invoices: any[];
}

const AllInvoiceList: React.FC<AllListProps> = ({ invoices }) => {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING" | "OVERDUE">("ALL");

  const getInvoiceStatus = (invoice: any) => {
    const rawStatus = invoice.paymentStatus || invoice.status || "Pending";
    const status = String(rawStatus).toLowerCase();

    if (invoice.paymentStatus === true || status === "paid" || status === "completed" || status === "true") {
      return "PAID";
    }

    let date = invoice.dueDate;
    const terms = invoice.paymenTDueDate ?? invoice.fabricator?.paymenTDueDate;
    if (!date && invoice.invoiceDate && terms !== undefined && terms !== null) {
      const invDate = new Date(invoice.invoiceDate);
      const days = parseInt(terms);
      if (!isNaN(days)) {
        invDate.setDate(invDate.getDate() + days);
        date = invDate;
      } else {
        date = invoice.invoiceDate;
      }
    } else if (!date) {
      date = invoice.invoiceDate;
    }

    const isOverdue = date && new Date(date) < new Date();
    if (isOverdue) return "OVERDUE";

    return "PENDING";
  };

  const stats = useMemo(() => {
    return {
      total: invoices.length,
      paid: invoices.filter(inv => getInvoiceStatus(inv) === "PAID").length,
      pending: invoices.filter(inv => getInvoiceStatus(inv) === "PENDING").length,
      overdue: invoices.filter(inv => getInvoiceStatus(inv) === "OVERDUE").length,
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === "ALL") return invoices;
    return invoices.filter(inv => getInvoiceStatus(inv) === statusFilter);
  }, [invoices, statusFilter]);

  const columns: ExtendedColumnDef<any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      enableColumnFilter: true,
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <span className="font-black text-black">
            {inv.invoiceNumber || "—"}
          </span>
        );
      },
    },
    // {
    //   accessorKey: "customerName",
    //   header: "Client",
    //   enableColumnFilter: true,
    // },
    {
      accessorKey: "jobName",
      header: "Project",
      enableColumnFilter: true,
      cell: ({ row }) => row.original.jobName || "—",
    },
    {
      id: "pm",
      header: "PM",
      cell: ({ row }) => {
        const poc = row.original.pointOfContact;
        if (Array.isArray(poc) && poc.length > 0 && poc[0]) {
          const pm = poc[0];
          const name = `${pm.firstName || ""} ${pm.lastName || ""}`.trim();
          return name || "—";
        }
        return "—";
      },
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
      header: "Invoice Date",
      cell: ({ row }) => formatDate(row.getValue("invoiceDate")),
    },
    {
      accessorKey: "dueDate",
      header: "Invoice Due",
      cell: ({ row }) => {
        let date = row.original.dueDate;
        const terms = row.original.paymenTDueDate ?? row.original.fabricator?.paymenTDueDate;
        if (!date && row.original.invoiceDate && terms !== undefined && terms !== null) {
          const invDate = new Date(row.original.invoiceDate);
          const days = parseInt(terms);
          if (!isNaN(days)) {
            invDate.setDate(invDate.getDate() + days);
            date = invDate;
          } else {
            date = row.original.invoiceDate;
          }
        } else if (!date) {
          date = row.original.invoiceDate;
        }

        const isPaid = row.original.paymentStatus === true || String(row.original.paymentStatus).toLowerCase() === "true" || String(row.original.paymentStatus).toLowerCase() === "paid" || String(row.original.status).toLowerCase() === "paid" || String(row.original.status).toLowerCase() === "completed";
        const isOverdue = date && new Date(date) < new Date() && !isPaid;

        return (
          <span
            className={isOverdue ? "text-red-500 font-medium" : "text-gray-600"}
          >
            {formatDate(date)}
          </span>
        );
      },
    },
    {
      id: "overdueDays",
      header: "Due FOR",
      cell: ({ row }) => {
        let date = row.original.dueDate;
        const terms = row.original.paymenTDueDate ?? row.original.fabricator?.paymenTDueDate;
        if (!date && row.original.invoiceDate && terms !== undefined && terms !== null) {
          const invDate = new Date(row.original.invoiceDate);
          const days = parseInt(terms);
          if (!isNaN(days)) {
            invDate.setDate(invDate.getDate() + days);
            date = invDate;
          } else {
            date = row.original.invoiceDate;
          }
        } else if (!date) {
          date = row.original.invoiceDate;
        }

        const isPaid = row.original.paymentStatus === true || String(row.original.paymentStatus).toLowerCase() === "true" || String(row.original.paymentStatus).toLowerCase() === "paid" || String(row.original.status).toLowerCase() === "paid" || String(row.original.status).toLowerCase() === "completed";
        const isOverdue = date && new Date(date) < new Date() && !isPaid;
        
        if (isOverdue && date) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDateObj = new Date(date);
          dueDateObj.setHours(0, 0, 0, 0);
          const diffTime = today.getTime() - dueDateObj.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            return <span className="text-red-500 font-medium">{diffDays} Days</span>;
          }
        }
        return <span className="text-gray-400">—</span>;
      },
    },
    {
      accessorKey: "totalInvoiceValue",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalInvoiceValue") || "0");
        const currency = row.original.currencyType || "USD";
        return (
          <span className="font-semibold text-gray-800">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currency,
            }).format(amount)}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = getInvoiceStatus(row.original);

        if (status === "PAID") {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-sm font-semibold uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
              Paid
            </span>
          );
        }

        if (status === "OVERDUE") {
          return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">
              Overdue
            </span>
          );
        }

        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-600 border border-yellow-100">
            Pending
          </span>
        );
      },
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45] h-full mt-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h3 className="text-md font-black text-black uppercase tracking-widest shrink-0">
          All Invoices
        </h3>
        
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto max-w-full">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              statusFilter === "ALL"
                ? "bg-green-200/50 text-black shadow-sm border border-green-300"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
          >
            Total
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${
              statusFilter === "ALL" ? "bg-green-300/50 text-green-800" : "bg-gray-200 text-gray-600"
            }`}>
              {stats.total}
            </span>
          </button>
          
          <button
            onClick={() => setStatusFilter("PAID")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              statusFilter === "PAID"
                ? "bg-green-200/50 text-black shadow-sm border border-green-300"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
          >
            Paid
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${
              statusFilter === "PAID" ? "bg-green-300/50 text-green-800" : "bg-gray-200 text-gray-600"
            }`}>
              {stats.paid}
            </span>
          </button>
          
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              statusFilter === "PENDING"
                ? "bg-green-200/50 text-black shadow-sm border border-green-300"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
          >
            Pending
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${
              statusFilter === "PENDING" ? "bg-green-300/50 text-green-800" : "bg-gray-200 text-gray-600"
            }`}>
              {stats.pending}
            </span>
          </button>
          
          <button
            onClick={() => setStatusFilter("OVERDUE")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              statusFilter === "OVERDUE"
                ? "bg-green-200/50 text-black shadow-sm border border-green-300"
                : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
          >
            Overdue
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${
              statusFilter === "OVERDUE" ? "bg-green-300/50 text-green-800" : "bg-gray-200 text-gray-600"
            }`}>
              {stats.overdue}
            </span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="group text-sm">
        <DataTable
          columns={columns}
          data={filteredInvoices}
          detailComponent={({ row, close }) => (
            <GetInvoiceById id={row.id} close={close} />
          )}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>
    </div>
  );
};

export default AllInvoiceList;
