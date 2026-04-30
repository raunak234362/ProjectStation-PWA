/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, User, MessageCircle, Loader2, FileText, Download, Reply } from 'lucide-react';
import Service from '../../../api/Service';
import { formatDate } from '../../../utils/dateUtils';
import AddProgressReportResponse from './AddProgressReportResponse.tsx';
import RenderFiles from '../../ui/RenderFiles';

interface ProgressReportDetailsProps {
  reportId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const ProgressReportDetails = ({ reportId, onClose, onUpdate }: ProgressReportDetailsProps) => {
  const [report, setReport] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [reportData, responsesData] = await Promise.all([
        Service.getProjectProgressReportById(reportId),
        Service.getResponsesByReportId(reportId)
      ]);
      setReport(reportData?.data || reportData);
      setResponses(Array.isArray(responsesData) ? responsesData : responsesData?.data || []);
    } catch (error) {
      console.error('Error fetching report details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) fetchDetails();
  }, [reportId]);

  const handleReply = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsResponseModalOpen(true);
  };

  const ResponseItem = ({ response, depth = 0 }: { response: any, depth?: number }) => (
    <div className={`space-y-4 ${depth > 0 ? 'ml-8 mt-4 border-l-2 border-gray-100 pl-6' : ''}`}>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-black uppercase">
              {response.user?.firstName?.[0] || response.user?.username?.[0] || 'U'}
            </div>
            <div>
              <p className="text-[10px] font-black text-black uppercase tracking-widest">
                {response.user?.firstName ? `${response.user.firstName} ${response.user.lastName || ''}` : response.user?.username || 'Unknown User'}
              </p>

              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {formatDate(response.createdAt)}
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleReply(response.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
        </div>
        <div 
          className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-1 prose prose-xs max-w-none"
          dangerouslySetInnerHTML={{ __html: response.description || response.message }}
        />
        {response.files && response.files.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-50">
             <RenderFiles 
                files={response.files} 
                table="projectProgressReportResponse" 
                parentId={response.id} 
                hideHeader={true}
              />

          </div>
        )}
      </div>
      {response.childResponses && response.childResponses.length > 0 && (
        <div className="space-y-4">
          {response.childResponses.map((child: any) => (
            <ResponseItem key={child.id} response={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (!report) return null;

  const topLevelResponses = responses.filter(r => !r.parentResponseId);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-500 my-8">
        
        {/* Modern Header */}
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors" />
            </button>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight leading-tight">{report.title}</h3>
              <div className="flex items-center gap-4 mt-1.5">
                {report.stage && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    {report.stage}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(report.createdAt)}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setSelectedParentId(undefined);
              setIsResponseModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#6bbd45] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Add Response
          </button>
        </div>

        {/* Content Layout */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar bg-gray-50/20">
          
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Message / Details</p>
              </div>
              <div className="p-8">
                <div 
                  className="text-md text-gray-700 leading-relaxed font-medium prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.description || report.message }}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Responses ({responses.length})
                </h4>
              </div>
              
              {topLevelResponses.length === 0 ? (
                <div className="py-12 px-8 bg-white/50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <p className="text-sm font-medium text-gray-400 italic">No responses yet. Be the first to respond.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {topLevelResponses.map((res) => (
                    <ResponseItem key={res.id} response={res} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-50 bg-white flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Creator Details</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Created By:</span>
                  <span className="text-black">{report.createdBy?.firstName} {report.createdBy?.lastName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Username:</span>
                  <span className="text-black">{report.createdBy?.username || 'ADMIN'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-white flex items-center gap-2">
                <Download className="w-4 h-4 text-gray-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attachments</p>
              </div>
              <div className="p-6">
                <RenderFiles 
                  files={report.files || []} 
                  table="projectProgressReport" 
                  parentId={reportId} 
                  hideHeader={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isResponseModalOpen && (
        <AddProgressReportResponse
          reportId={reportId}
          parentResponseId={selectedParentId}
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

export default ProgressReportDetails;
