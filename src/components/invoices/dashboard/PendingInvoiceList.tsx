import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../ui/table";
import GetInvoiceById from "../GetInvoiceById";
import { formatDate } from "../../../utils/dateUtils";

interface PendingListProps {
  invoices: any[];
}

const PendingInvoiceList: React.FC<PendingListProps> = ({ invoices }) => {
  const pendingInvoices = invoices.filter(
    (inv) => !inv.paymentStatus || inv.paymentStatus === "Pending",
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <span className="font-medium text-gray-800">
            {inv.invoiceNumber || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: "Client",
    },
    {
      accessorKey: "projectName",
      header: "Project",
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
      header: "Overdue",
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

        const isOverdue = date && new Date(date) < new Date();
        
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
        const amount = parseFloat(row.getValue("totalInvoiceValue"));
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
        // Logic for overdue based on date if status is pending
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
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
              Overdue
            </span>
          );
        }

        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-100">
            Pending
          </span>
        );
      },
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-black border-l-[6px] border-l-[#6bbd45] h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg  text-gray-800">Pending Invoices</h3>
      </div>

      {/* Table Container */}
      <div className="group">
        <DataTable
          columns={columns}
          data={pendingInvoices}
          detailComponent={({ row, close }) => (
            <GetInvoiceById id={row.id} close={close} />
          )}
          pageSizeOptions={[5, 10]}
        />
      </div>
    </div>
  );
};

export default PendingInvoiceList;
