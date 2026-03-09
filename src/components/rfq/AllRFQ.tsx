import { useState } from "react";
import DataTable, { type ExtendedColumnDef } from "../ui/table";
import type { RFQItem } from "../../interface";
import GetRFQByID from "./GetRFQByID";
import { formatDate } from "../../utils/dateUtils";

const AllRFQ = ({ rfq }: any) => {
  const userRole = sessionStorage.getItem("userRole");

  const columns: ExtendedColumnDef<RFQItem>[] = [
    {
      accessorKey: "projectName",
      header: "Project Name",
      enableColumnFilter: true,
      filterType: "text",
    },
  ];

  if (userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN") {
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
          className="px-3 py-1 text-xs md:text-sm lg:text-base xl:text-lg uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200"
        >
          {row.original.status?.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "estimationDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.estimationDate),
    },
  );

  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <DataTable
        columns={columns}
        data={rfq || []}
        onRowClick={(row: any) => setSelectedRfqId(row.id)}
        pageSizeOptions={[25]}
      />
      {selectedRfqId && (
        <GetRFQByID id={selectedRfqId} onClose={() => setSelectedRfqId(null)} />
      )}
    </div>
  );
};

export default AllRFQ;
