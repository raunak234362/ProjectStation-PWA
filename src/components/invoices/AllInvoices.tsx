import { useEffect, useState } from "react";
import Service from "../../api/Service";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../ui/table";
import GetInvoiceById from "./GetInvoiceById";
import { formatDate } from "../../utils/dateUtils";

const AllInvoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "jobName",
      header: "Job Name",
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
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus");
        return (
          <span
            className="px-2 py-1 rounded-full text-md md:text-lg bg-gray-100 text-black border border-gray-200"
          >
            {status ? "Paid" : "Pending"}
          </span>
        );
      },
    },
  ];

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl border border-black shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-black uppercase tracking-tight">All Invoices</h2>
      </div>
      <DataTable
        columns={columns}
        data={invoices}
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
