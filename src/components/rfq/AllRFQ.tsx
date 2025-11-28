import { useEffect, useState } from "react";
import Service from "../../api/Service";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { RFQItem } from "../../interface";
import GetRFQByID from "./GetRFQByID";

const AllRFQ = ({rfq}:any) => {

const [rfqID,setRfqID] = useState<string | null>(null);



 const handleRowClick = (row: RFQItem) => {
    setRfqID(row.id)
  };


  const columns: ColumnDef<RFQItem>[] = [
    {accessorKey:"projectName", header:"Project Name"},
    {accessorKey:"subject", header: "Subject"}
  ]



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