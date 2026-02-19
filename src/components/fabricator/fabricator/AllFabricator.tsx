import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import GetFabricatorByID from "./GetFabricatorByID";
import type { Fabricator } from "../../../interface";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";

const AllFabricator = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fabricators = useSelector(
    (state: any) => state.fabricatorInfo?.fabricatorData,
  );

  console.log(fabricators);

  // Filter fabricators based on search query
  const filteredFabricators = useMemo(() => {
    if (!searchQuery.trim()) return fabricators || [];

    const query = searchQuery.toLowerCase();
    return (fabricators || []).filter((fabricator: Fabricator) =>
      fabricator.fabName?.toLowerCase().includes(query),
    );
  }, [fabricators, searchQuery]);

  // Define columns for DataTable
  const columns: ColumnDef<Fabricator>[] = [
    {
      accessorKey: "fabName",
      header: "Fabricator Name",
      cell: ({ row }) => (
        <div className="text-black font-black tracking-tight uppercase text-sm">
          {row.original.fabName}
        </div>
      ),
    },
    {
      accessorKey: "fabStage",
      header: "Stage",
      cell: ({ row }) => (
        <span
          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-black/10 shadow-sm ${row.original.fabStage === "PRODUCTION"
            ? "bg-blue-50 text-blue-800"
            : "bg-orange-50 text-orange-800"
            }`}
        >
          {row.original.fabStage || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Working Since",
      cell: ({ row }) => {
        const date = row.original.createdAt ? new Date(row.original.createdAt) : null;
        const formattedDate = date
          ? `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
            .getDate()
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`
          : "N/A";
        return (
          <div className="text-black font-black tracking-tight text-xs uppercase">
            {formattedDate}
          </div>
        );
      },
    },
  ];

  const [selectedFabId, setSelectedFabId] = useState<string | null>(null);

  const handleRowClick = (row: any) => {
    setSelectedFabId(row.id);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-black animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black group-focus-within:text-green-600 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter engineering partners..."
            className="pl-11 pr-4 py-3.5 w-full border border-black rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all bg-white text-black placeholder:text-black/30 shadow-sm"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredFabricators}
        onRowClick={handleRowClick}
        pageSizeOptions={[25]}
      />

      {selectedFabId &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setSelectedFabId(null)}
            />
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
              <GetFabricatorByID
                id={selectedFabId}
                close={() => setSelectedFabId(null)}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AllFabricator;
