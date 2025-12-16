import { useEffect, useState } from "react";
import Service from "../../../api/Service";
import DataTable from "../../ui/table";
import LineItemList from "./LineItemList";

const LineItemGroup = ({ estimationId }) => {
  const [lineItem, setLineItem] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchGroups = async () => {
    const response = await Service.FetchLineItemGroup(estimationId);
    setLineItem(response.data);
    console.log(groupData);
  }

  useEffect(() => {
    fetchGroups();
  }, []);

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
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleRowClick = (row) => {
    setSelectedGroupId(row.id);
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={lineItem}
        onRowClick={handleRowClick}
        searchPlaceholder="Search groups..."
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
