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
        <div className=" text-slate-800 dark:text-white tracking-tight">
          {row.original.fabName}
        </div>
      ),
    },
    {
      accessorKey: "fabStage",
      header: "Stage",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs  uppercase tracking-widest ${row.original.fabStage === "PRODUCTION"
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
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
          <div className=" text-slate-800 dark:text-white tracking-tight">
            {formattedDate}
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4 sm:p-6 rounded-[32px] shadow-soft border border-white/50 dark:border-slate-800/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter engineering partners..."
            className="pl-11 pr-4 py-3 w-full border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredFabricators}
        detailComponent={GetFabricatorByID}
        pageSizeOptions={[25]}
      />
    </div>
  );
};

export default AllFabricator;
