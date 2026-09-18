/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Compass, Loader2, X } from 'lucide-react';
import Service from '../../../api/Service';
import AddCoordinationDrawing from './AddCoordinationDrawing.tsx';
import CoordinationDrawingDetails from './CoordinationDrawingDetails.tsx';
import DataTable, { type ExtendedColumnDef } from '../../ui/table';

const CoordinationDrawings = ({ projectId }: { projectId: string }) => {
  const [drawings, setDrawings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      const data = await Service.getCoordinationDrawingsByProjectId(projectId);
      setDrawings(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Error fetching coordination drawings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchDrawings();
  }, [projectId]);

  const formatDateCustom = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const columns = useMemo<ExtendedColumnDef<any>[]>(() => [
    {
      header: 'Drawing Name',
      accessorKey: 'title',
      enableColumnFilter: true,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-black text-black uppercase tracking-tight text-sm">
            {row.original.title}
          </span>
          {row.original.stage && (
            <span className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {row.original.stage}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      enableColumnFilter: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest border border-black/20 bg-gray-50/50 text-black">
            {row.original.status || 'IN REVIEW'}
          </div>
        </div>
      ),
    },
    {
      header: 'Date Created',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <div className="text-center text-sm text-black font-black uppercase tracking-tight">
          {formatDateCustom(row.original.createdAt)}
        </div>
      ),
    },
    {
      header: 'Created By',
      accessorKey: 'createdBy.firstName',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-black/10 bg-gray-50 flex items-center justify-center text-sm font-black uppercase text-black shrink-0">
            {row.original.createdBy?.firstName?.[0] || 'A'}
          </div>
          <span className="text-sm font-black text-black uppercase tracking-widest truncate max-w-[150px]">
            {row.original.createdBy?.firstName} {row.original.createdBy?.lastName}
          </span>
        </div>
      ),
    }

  ], []);

  const filteredDrawings = drawings.filter((drawing) =>
    drawing.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-black/5">
            <Compass className="w-5 h-5 text-black" />
          </div>
          <h2 className="text-lg font-black text-black uppercase tracking-tight">Coordination Drawings</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 max-w-sm min-w-[200px]">
            <div className="absolute -inset-1  from-green-100 to-emerald-100 rounded-xl blur-sm opacity-25 group-hover:opacity-40 transition-all duration-1000"></div>
            <div className="relative bg-white border border-gray-400 rounded-xl flex items-center shadow-sm hover:border-green-500 transition-colors h-10">
              <Search className="ml-3 w-4 h-4 text-gray-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH DRAWINGS..."
                className="flex-1 px-3 py-1 bg-transparent text-black placeholder-gray-600 font-bold focus:outline-none text-sm uppercase w-full"
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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 border-2 border-[#6bbd45] text-black bg-green-200/50 hover:bg-green-200/50 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Coordination Drawing
          </button>
        </div>
      </div>


      {/* DataTable Body */}
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-black/5">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Loading Repository...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredDrawings}
            onRowClick={(row) => setSelectedDrawingId(row.id)}
            pageSizeOptions={[10, 20, 50]}
            disableMaxHeight={true}
          />
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddCoordinationDrawing
          projectId={projectId}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchDrawings();
          }}
        />
      )}

      {selectedDrawingId && (
        <CoordinationDrawingDetails
          drawingId={selectedDrawingId}
          onClose={() => setSelectedDrawingId(null)}
          onUpdate={fetchDrawings}
        />
      )}
    </div>
  );
};

export default CoordinationDrawings;
