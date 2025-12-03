import { useEffect, useState } from "react";
import Service from "../../api/Service";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { RFQItem } from "../../interface";
import GetRFQByID from "./GetRFQByID";

const AllRFQ = ({rfq}:any) => {

const [rfqID,setRfqID] = useState<string | null>(null);
const userType = localStorage.getItem("userType");
 const handleRowClick = (row: RFQItem) => {
    setRfqID(row.id)
  };


 

let columns: ColumnDef<RFQItem>[] = [
  { accessorKey: "projectName", header: "Project Name" },
  { accessorKey: "projectNumber", header: "RFQ #" },
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
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          row.original.status === "IN_REVIEW"
            ? "bg-yellow-100 text-yellow-700"
            : row.original.status === "COMPLETED"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {row.original.status}
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
  }
);


  return (
    <div className="bg-white p-2 rounded-2xl">
      <DataTable
        columns={columns}
        data={rfq}
        onRowClick={handleRowClick}
         detailComponent={({ row }) => <GetRFQByID id={row.id} />}
        // onDelete={handleDelete}
        searchPlaceholder="Search employees..."
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
    
  
};

export default AllRFQ;