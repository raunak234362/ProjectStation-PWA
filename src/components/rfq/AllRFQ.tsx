import DataTable, { type ExtendedColumnDef } from "../ui/table";
import type { RFQItem } from "../../interface";
import GetRFQByID from "./GetRFQByID";

const AllRFQ = ({ rfq }: any) => {
  const userType = localStorage.getItem("userType");

  const columns: ExtendedColumnDef<RFQItem>[] = [
    {
      accessorKey: "projectName",
      header: "Project Name",
      enableColumnFilter: true,
      filterType: "text",
    },
    {
      accessorKey: "projectNumber",
      header: "RFQ #",
      enableColumnFilter: true,
      filterType: "text",
    },
  ];

  // ➕ Only Admin / Staff see Fabricator
  if (userType !== "CLIENT") {
    columns.push({
      accessorKey: "fabricator",
      header: "Fabricator",
      cell: ({ row }) => (row.original as any).fabricator?.fabName || "—",
    });
  }

  columns.push(
    {
      accessorKey: "sender",
      header: "Requested By",
      cell: ({ row }) => {
        const sender = row.original.sender;
        const s = sender as any;
        return sender
          ? `${s.firstName ?? ""} ${s.middleName ?? ""} ${s.lastName ?? ""}`
          : "—";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: [
        { label: "In Review", value: "IN_REVIEW" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Pending", value: "PENDING" },
      ],
      cell: ({ row }) => (
        <span
          className={`px-3 py-1 text-[10px]  uppercase tracking-widest rounded-lg ${row.original.status === "IN_REVIEW"
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
            : row.original.status === "COMPLETED"
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
              : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
            }`}
        >
          {row.original.status?.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "estimationDate",
      header: "Due Date",
      cell: ({ row }) =>
        row.original.estimationDate
          ? new Date(row.original.estimationDate).toLocaleDateString()
          : "—",
    },
  );

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[32px] shadow-soft border border-white/50 dark:border-slate-800/50">
      <DataTable
        columns={columns}
        data={rfq || []}
        onRowClick={() => { }}
        detailComponent={({ row }) => <GetRFQByID id={row.id} />}
        pageSizeOptions={[25]}
      />
    </div>
  );
};

export default AllRFQ;
