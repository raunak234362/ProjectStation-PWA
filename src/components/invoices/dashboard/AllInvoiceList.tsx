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
            <span className="px-2.5 py-0.5 rounded-full text-sm font-semibold uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
              Paid
            </span>
          );
        }

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
      <div className="group text-sm">
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
