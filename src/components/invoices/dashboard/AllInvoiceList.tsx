import DataTable, { type ExtendedColumnDef } from "../../ui/table";
import GetInvoiceById from "../GetInvoiceById";
import { formatDate } from "../../../utils/dateUtils";

interface AllListProps {
  invoices: any[];
}

const AllInvoiceList: React.FC<AllListProps> = ({ invoices }) => {
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
    {
      accessorKey: "customerName",
      header: "Client",
      enableColumnFilter: true,
    },
    {
      accessorKey: "projectName",
      header: "Project",
      enableColumnFilter: true,
      cell: ({ row }) => (
        <span className="text-gray-600 italic">
          {row.original.project?.name || row.original.projectName || "—"}
        </span>
      ),
    },
    {
      accessorKey: "invoiceDate",
      header: "Issued Date",
      cell: ({ row }) => formatDate(row.getValue("invoiceDate")),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.original.dueDate || row.original.invoiceDate; // Fallback
        const isOverdue = date && new Date(date) < new Date() && row.original.paymentStatus !== "Paid";
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
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: [
        { label: "Paid", value: "true" },
        { label: "Pending", value: "false" },
      ],
      cell: ({ row }) => {
        const rawStatus = row.original.paymentStatus || row.original.status || "Pending";
        const status = String(rawStatus).toLowerCase();
        
        if (row.original.paymentStatus === true || status === "paid" || status === "completed" || status === "true") {
          return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
              Paid
            </span>
          );
        }

        const date = row.original.dueDate || row.original.invoiceDate;
        const isOverdue = date && new Date(date) < new Date();

        if (isOverdue) {
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg text-gray-800">All Invoices</h3>
      </div>

      {/* Table Container */}
      <div className="group">
        <DataTable
          columns={columns}
          data={invoices}
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
