import { useEffect, useState, useMemo } from "react";
import DataTable from "../../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { DesignDrawing } from "../../../interface";
import Service from "../../../api/Service";
import { Loader2, Plus, Search, X } from "lucide-react";
import DesignDrawingDetails from "./DesignDrawingDetails";
import AddDesignDrawing from "./AddDesignDrawing";
import { formatDate } from "../../../utils/dateUtils";

interface AllDesignDrawingsProps {
  projectId: string;
}

const AllDesignDrawings = ({ projectId }: AllDesignDrawingsProps) => {
  const [drawings, setDrawings] = useState<DesignDrawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      const response = await Service.GetDesignDrawingsByProjectId(projectId);
      setDrawings(response.data || []);
    } catch (error) {
      console.error("Error fetching design drawings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchDrawings();
  }, [projectId]);

  const columns = useMemo<ColumnDef<DesignDrawing>[]>(() => [
    { accessorKey: "stage", header: "Stage" },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <p className="truncate max-w-[300px]">{row.original.description}</p>
      ),
    },
    {
      accessorKey: "uploadedAt",
      header: "Created On",
      cell: ({ row }) => formatDate(row.original.uploadedAt || row.original.createdAt),
    },
  ], []);

  const filteredDrawings = drawings.filter((drawing) =>
    drawing.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    drawing.stage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Search Bar - Left */}
        <div className="relative group w-full max-w-md">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl blur-sm opacity-25 group-hover:opacity-40 transition-all duration-1000"></div>
          <div className="relative bg-white border border-gray-400 rounded-xl flex items-center shadow-sm hover:border-green-500 transition-colors h-10">
            <Search className="ml-3 w-4 h-4 text-gray-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH DRAWINGS..."
              className="flex-1 px-3 py-1 bg-transparent text-black placeholder-gray-600 font-semibold focus:outline-none text-sm uppercase w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 px-3 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Add Button - Right */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 border-2 border-[#6bbd45] text-black bg-green-200/50 hover:bg-green-300/50 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Design Drawing
        </button>
      </div>

      {/* DataTable Body */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Loading Repository...</p>
          </div>
        ) : (
          <div className="p-0 overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredDrawings}
              detailComponent={({ row }) => (
                <DesignDrawingDetails id={row.id} onUpdate={fetchDrawings} />
              )}
              pageSizeOptions={[5, 10, 25]}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddDesignDrawing
          projectId={projectId}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchDrawings();
          }}
        />
      )}
    </div>
  );
};

export default AllDesignDrawings;
