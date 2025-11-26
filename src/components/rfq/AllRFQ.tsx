import { useEffect, useState } from "react";
import Service from "../../api/Service";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { RFQItem } from "../../interface";

const AllRFQ = () => {

const [rfq, setRfq] = useState([]);
const userType = sessionStorage.getItem("userRole");
 const fetchInboxRFQ = async () => {
    try {
      let rfqDetail;
      if (userType === "CLIENT")
         {
        rfqDetail = await Service.RfqSent();
      } else {
        rfqDetail = await Service.RFQRecieved();
      }
      setRfq(rfqDetail.data);
     console.log(rfqDetail.data);
     
    } catch (error) {
      console.error("Error fetching RFQ:", error);
    }
  };

   useEffect(() => {
    fetchInboxRFQ();
  }, []);
console.log(rfq);


  const columns: ColumnDef<RFQItem>[] = [
    {accessorKey:"projectName", header:"Project Name"},
    {accessorKey:"subject", header: "Subject"}
  ]



  return (
    <div className="bg-white p-2 rounded-2xl">
      <DataTable
        columns={columns}
        data={rfq}
        // onRowClick={handleRowClick}
        // detailComponent={({ row }) => <GetEmployeeByID id={row.id} />}
        // onDelete={handleDelete}
        searchPlaceholder="Search employees..."
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
    
  
};

export default AllRFQ;