import { useState, useMemo } from "react";
import DataTable, { type ExtendedColumnDef } from "../ui/table";
import type { RFQItem } from "../../interface";
import GetRFQByID from "./GetRFQByID";
import { formatDate } from "../../utils/dateUtils";

const AllRFQ = ({ rfq }: any) => {
  const userRole = sessionStorage.getItem("userRole");
console.log(rfq,"..................");

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
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "estimationDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.estimationDate),
    },
    {
      accessorKey: "latestResponseDate",
      header: "WBT Submitted Date",
      cell: ({ row }) => {
        const responses = row.original.responses || [];
        if (responses.length === 0) return "—";
        const latest = [...responses].sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        return formatDate(latest.createdAt);
      },
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row: any) => {
        const status = row.status;
        const wbtStatus = row.wbtStatus;
        
        if (wbtStatus === "AWARDED") return "AWARDED";
        if (status === "IN_REVIEW") return "IN_REVIEW";
        
        return wbtStatus && wbtStatus !== "RECEIVED" ? wbtStatus : status;
      },
      enableColumnFilter: true,
      filterType: "select",
      filterFn: "equals",
      filterOptions: [
        { label: "WBT Reviewing", value: "IN_REVIEW" },
        { label: "Submitted By WBT", value: "AWARDED" },
        { label: "Pending", value: "PENDING" },
        { label: "Received", value: "RECEIVED" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Closed", value: "CLOSED" },
        { label: "Rejected", value: "REJECTED" },
        { label: "On Hold", value: "ON_HOLD" },
      ],
      cell: ({ getValue }) => {
        const val = getValue() as string;
        let label = "";
        
        if (val === "AWARDED") {
          label = "Submitted By WBT";
        } else if (val === "IN_REVIEW") {
          label = "WBT Reviewing";
        } else {
          label = val?.replace("_", " ") || "—";
        }

        return (
          <span className="px-3 py-1 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-lg bg-gray-50 text-black border border-black/10">
            {label}
          </span>
        );
      },
    },
    {
      id: "rfqType",
      header: "RFQ Type",
      accessorFn: (row: any) => {
        const isDetailing = row.detailingMain || row.detailingMisc || row.connectionDesign || row.customerDesign || row.miscDesign;
        const isMTO = row.MTOManual || row.mtoStickModelEnabled || row.MTOStickModel || row.MTOValue;
        if (isDetailing && isMTO) return "Detailing | MTO";
        if (isDetailing) return "Detailing";
        if (isMTO) return "MTO";
        return "—";
      },
      enableColumnFilter: true,
      filterType: "select",
      filterFn: "equalsString",
      filterOptions: [
        { label: "Detailing", value: "Detailing" },
        { label: "MTO", value: "MTO" },
        { label: "Detailing | MTO", value: "Detailing | MTO" },
      ],
      cell: ({ row }) => {
        const label = row.getValue("rfqType") as string;
        return (
          <span
            className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${label !== "—"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-gray-50 text-gray-400 border-gray-100"
              }`}
          >
            {label}
          </span>
        );
      },
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
