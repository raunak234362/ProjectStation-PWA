import React, { useEffect, useState } from 'react'
import GetRFQByID from './GetRFQByID';
import DataTable from '../ui/table';
import Service from '../../api/Service';

const AllRFQ = () => {
  const [rfq, setRfq] = useState([]);
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";
  

   const fetchInboxRFQ = async () => {
     try {
       let rfqDetail;
       if (userRole === "client") {
         rfqDetail = await Service.RfqSent();
       } else {
         rfqDetail = await Service.RFQRecieved();
       }
       setRfq(rfqDetail);
       
     } catch (error) {
       console.error("Error fetching RFQ:", error);
     }
   };
  console.log(rfq);
 useEffect(() => {
    fetchInboxRFQ();
 }, []);
  
  return (
    <div className=" bg-white p-4 rounded-2xl shadow-sm">
      {/* <DataTable
        columns={columns}
        data={fabricators}
        onRowClick={handleRowClick}
        detailComponent={({ row }) => {
          const fabricatorUniqueId =
            (row as any).id ?? (row as any).fabId ?? "";
          // return <GetRFQByID id={fabricatorUniqueId} />;
        }}
        searchPlaceholder="Search fabricators..."
        pageSizeOptions={[5, 10, 25]}
      /> */}
    </div>
  );
}

export default AllRFQ