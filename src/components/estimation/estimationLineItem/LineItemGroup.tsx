 
import React, { useEffect, useState } from "react";
import Service from "../../../api/Service";
import DataTable from "../../ui/table";
import LineItemList from "./LineItemList";

interface LineItemGroupProps {
  estimationId: string;
  refreshTrigger?: number;
}

interface LineItemGroupData {
  id: string;
  name: string;
  description: string;
}

const LineItemGroup: React.FC<LineItemGroupProps> = ({ estimationId, refreshTrigger }) => {
  const [lineItem, setLineItem] = useState<LineItemGroupData[]>([]);
   
  const [, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await Service.FetchLineItemGroup(estimationId);
      setLineItem(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (estimationId) {
      fetchGroups();
    }
  }, [estimationId, refreshTrigger]);

  const columns = [

    {
      header: "Group Name",
      accessorKey: "name"
    },
    {
      header: "Group Description",
      accessorKey: "description"
    },

  ];
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleRowClick = (row: LineItemGroupData) => {
    setSelectedGroupId(row.id);
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={lineItem}
        onRowClick={handleRowClick}
        pageSizeOptions={[5, 10, 25]}
      />
      {selectedGroupId && (
        <LineItemList
          id={selectedGroupId}
          onClose={() => setSelectedGroupId(null)}
        />
      )}
    </div>
  );
};

export default LineItemGroup;
