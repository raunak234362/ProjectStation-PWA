import { useState, useMemo } from "react";
import DataTable, { type ExtendedColumnDef } from "../ui/table";
import type { RFQItem } from "../../interface";
import GetRFQByID from "./GetRFQByID";
import { formatDate } from "../../utils/dateUtils";

const AllRFQ = ({ rfq }: any) => {
  const userRole = sessionStorage.getItem("userRole");

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        (rfq || [])
          .map((item: any) => {
            const date = new Date(item.estimationDate);
            return isNaN(date.getTime()) ? null : date.getFullYear().toString();
          })
          .filter(Boolean)
      )
    ) as string[];
    return years.sort((a, b) => b.localeCompare(a)).map((y) => ({ label: y, value: y }));
  }, [rfq]);

  const monthOptions = [
    { label: "January", value: "0" },
    { label: "February", value: "1" },
    { label: "March", value: "2" },
    { label: "April", value: "3" },
    { label: "May", value: "4" },
    { label: "June", value: "5" },
    { label: "July", value: "6" },
    { label: "August", value: "7" },
    { label: "September", value: "8" },
    { label: "October", value: "9" },
    { label: "November", value: "10" },
    { label: "December", value: "11" },
  ];

  const columns: ExtendedColumnDef<RFQItem>[] = [
    {
      accessorKey: "projectName",
      header: "Project Name",
      enableColumnFilter: true,
      filterType: "text",
      filterFn: "includesString",
    },
    {
      id: "month",
      header: "Month",
      accessorFn: (row) => {
        const date = new Date(row.estimationDate);
        return isNaN(date.getTime()) ? "" : date.getMonth().toString();
      },
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: monthOptions,
      filterFn: "equalsString",
    },
    {
      id: "year",
      header: "Year",
      accessorFn: (row) => {
        const date = new Date(row.estimationDate);
        return isNaN(date.getTime()) ? "" : date.getFullYear().toString();
      },
      enableColumnFilter: true,
      filterType: "select",
      filterOptions: yearOptions,
      filterFn: "equalsString",
    },
  ];

  if (userRole !== "CLIENT" && userRole !== "CLIENT_ADMIN" && userRole !== "CLIENT_ESTIMATOR") {
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
      id: "mto",
      header: "MTO Status",
      accessorFn: (row: any) =>
        row.MTOManual || (row.MTOStickModel && row.MTOStickModel !== "")
          ? "Required"
          : "Not Required",
      enableColumnFilter: true,
      filterType: "select",
      filterFn: "equalsString",
      filterOptions: [
        { label: "Required", value: "Required" },
        { label: "Not Required", value: "Not Required" },
      ],
      cell: ({ row }) => {
        const r = row.original as any;
        const isRequired =
          r.MTOManual || (r.MTOStickModel && r.MTOStickModel !== "");
        return (
          <span
            className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${isRequired
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-100"
              }`}
          >
            {isRequired ? "Required" : "Not Required"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableColumnFilter: true,
      filterType: "select",
      filterFn: "equals",
      filterOptions: [
        { label: "In Review", value: "IN_REVIEW" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Pending", value: "PENDING" },
      ],
      cell: ({ row }) => {
        const status = row.original.status;
        const wbtStatus = (row.original as any).wbtStatus;
        const displayStatus =
          wbtStatus && wbtStatus !== "RECEIVED" ? wbtStatus : status;

        return (
          <span className="px-3 py-1 text-xs md:text-sm uppercase tracking-widest rounded-lg bg-gray-100 text-black border border-gray-200">
            {displayStatus?.replace("_", " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "estimationDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.estimationDate),
    },
    {
      accessorKey: "estimationDate",
      header: "WBT Submitted Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
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
        initialColumnVisibility={{
          month: false,
          year: false,
        }}
      />
      {selectedRfqId && (
        <GetRFQByID id={selectedRfqId} onClose={() => setSelectedRfqId(null)} />
      )}
    </div>
  );
};

export default AllRFQ;
