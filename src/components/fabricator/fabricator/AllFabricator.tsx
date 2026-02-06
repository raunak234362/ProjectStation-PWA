import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import GetFabricatorByID from "./GetFabricatorByID";
import type { Fabricator } from "../../../interface";
import { useSelector } from "react-redux";

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
        <div className="font-bold text-slate-800 tracking-tight">
          {row.original.fabName}
        </div>
      ),
    },
    {
      accessorKey: "fabStage",
      header: "Stage",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${
            row.original.fabStage === "PRODUCTION"
              ? "bg-blue-50 text-blue-600"
              : "bg-orange-50 text-orange-600"
          }`}
        >
          {row.original.fabStage || "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white/40 backdrop-blur-md p-4 sm:p-6 rounded-[32px] shadow-soft border border-white/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter engineering partners..."
            className="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all bg-white"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredFabricators}
        detailComponent={GetFabricatorByID}
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default AllFabricator;
