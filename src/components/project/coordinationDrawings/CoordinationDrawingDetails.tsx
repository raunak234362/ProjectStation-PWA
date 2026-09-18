import { useEffect, useState, useMemo } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import Service from '../../../api/Service';
import { formatDate } from '../../../utils/dateUtils';
import AddCoordinationDrawingResponse from './AddCoordinationDrawingResponse';
import RenderFiles from '../../ui/RenderFiles';
import DataTable from '../../ui/table';
import type { ColumnDef } from '@tanstack/react-table';

interface CoordinationDrawingDetailsProps {
  drawingId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const CoordinationDrawingDetails = ({ drawingId, onClose, onUpdate }: CoordinationDrawingDetailsProps) => {
  const [drawing, setDrawing] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [drawingData, responsesData] = await Promise.all([
        Service.getCoordinationDrawingById(drawingId),
        Service.getResponsesByDrawingId(drawingId)
      ]);
      setDrawing(drawingData?.data || drawingData);
      setResponses(Array.isArray(responsesData) ? responsesData : responsesData?.data || []);
    } catch (error) {
      console.error('Error fetching drawing details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (drawingId) fetchDetails();
  }, [drawingId]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: "sno",
      header: "S.NO",
      cell: ({ row }) => <span className="text-sm text-black font-bold">{row.index + 1}</span>,
      size: 60,
    },
    {
      accessorKey: "message",
      header: "MESSAGE",
      cell: ({ row }) => (
        <div 
          className="text-sm text-gray-700 font-medium truncate max-w-md"
          dangerouslySetInnerHTML={{ __html: row.original.message }}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "CREATED",
      cell: ({ row }) => (
        <span className="text-sm text-black font-medium">{formatDate(row.original.createdAt)}</span>
      ),
    },
  ], []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (!drawing) return null;

  const topLevelResponses = responses.filter(r => !r.parentResponseId);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-50 w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col my-8 h-[90vh]">
        
        {/* Top Header */}
        <div className="px-8 py-6 bg-white shrink-0 flex items-center justify-between shadow-sm z-10 relative">
          <h3 className="text-2xl font-black text-black uppercase tracking-tight leading-tight">{drawing.title}</h3>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-1.5 bg-red-50 text-black border-2 border-red-700/80 rounded-lg hover:bg-red-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm"
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar bg-white flex-1">
          
          {/* Drawing Details Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-black text-black uppercase">
                {drawing.createdBy?.firstName?.toUpperCase()} {drawing.createdBy?.lastName?.toUpperCase()}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(drawing.createdAt)}
              </span>
            </div>

            <div className="bg-gray-50 rounded p-6 text-sm text-gray-800 font-medium leading-relaxed prose prose-sm max-w-none border border-gray-100">
              <div dangerouslySetInnerHTML={{ __html: drawing.description || drawing.message }} />
            </div>

            {drawing.files && drawing.files.length > 0 && (
              <div className="mt-6 border border-gray-100 rounded bg-white">
                <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-50">
                  <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-black text-black uppercase tracking-widest">
                    Attachments <span className="ml-2 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] rounded">{drawing.files.length} FILE</span>
                  </p>
                </div>
                <div className="p-6">
                  <RenderFiles 
                    files={drawing.files || []} 
                    table="coordinationDrawing" 
                    parentId={drawingId} 
                    hideHeader={true}
                    noAccordion={true}
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-t-2 border-gray-100 my-4" />

          {/* Responses Section */}
          <div className="bg-[#f8f9fa] -mx-8 -mb-8 p-8 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-black uppercase tracking-tight">Responses</h3>
              <button 
                onClick={() => setIsResponseModalOpen(true)}
                className="px-6 py-1.5 bg-green-50 text-black border-2 border-green-700/80 rounded-lg hover:bg-green-100 transition-all font-bold text-sm uppercase tracking-tight shadow-sm flex items-center gap-2"
              >
                + ADD RESPONSE
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
              <DataTable 
                columns={columns}
                data={topLevelResponses}
                pageSizeOptions={[5, 10, 20]}
                disableMaxHeight
              />
            </div>
          </div>
        </div>
      </div>
      {isResponseModalOpen && (
        <AddCoordinationDrawingResponse
          drawingId={drawingId}
          onClose={() => setIsResponseModalOpen(false)}
          onSuccess={() => {
            setIsResponseModalOpen(false);
            fetchDetails();
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default CoordinationDrawingDetails;
