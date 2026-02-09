import React from "react";
import DataTable from "../ui/table";
import GetEstimationByID from "./GetEstimationByID";

interface Estimation {
  id: string;
  estimationNumber: string;
  projectName: string;
  fabricator?: {
    fabName: string;
  };
  fabId?: string;
  status: string;
  estimateDate: string;
  [key: string]: any;
}

interface AllEstimationProps {
  estimations: Estimation[];
  onRefresh?: () => void;
}

const AllEstimation: React.FC<AllEstimationProps> = ({ estimations, onRefresh }) => {
  console.log(estimations);



  const handleRowClick = (row: any) => {
    // setSelectedEstimationId(row.id); // Assuming id exists in payload or response
    console.log("Clicked row:", row);
  };

  const columns = [
    { accessorKey: "estimationNumber", header: "Est. Number" },
    { accessorKey: "projectName", header: "Project Name" },
    { accessorKey: "fabricator.fabName", header: "Fabricator" }, // Assuming fabricator is populated
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "estimateDate",
      header: "Date",
      cell: ({ row }: { row: { original: Estimation } }) => row.original.estimateDate ? new Date(row.original.estimateDate).toLocaleDateString() : "-"
    }
  ];

  return (
    <div className="bg-white p-2 rounded-2xl">
      <DataTable
        columns={columns}
        data={estimations || []}
        onRowClick={handleRowClick}
        detailComponent={({ row, close }: { row: Estimation; close: () => void }) => {
          const estimationUniqueId =
            row.id ?? row.fabId ?? "";
          return <GetEstimationByID id={estimationUniqueId} onRefresh={() => { onRefresh?.(); close(); }} />;
        }}
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default AllEstimation;
