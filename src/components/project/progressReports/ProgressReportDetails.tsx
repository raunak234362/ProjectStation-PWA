/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Download, User, MessageCircle, Send, Loader2, Share2, FileText, ChevronRight } from 'lucide-react';
import Service from '../../../api/Service';
import { formatDate } from '../../../utils/dateUtils';
import { openFileSecurely, downloadFileSecurely, shareFileSecurely } from '../../../utils/openFileSecurely';
import AddProgressReportResponse from './AddProgressReportResponse';
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
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);


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

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    try {
      setSendingReply(true);
      const data = new FormData();
      data.append('projectProgressReportId', reportId);
      data.append('message', reply);
      
      await Service.createProjectProgressReportResponse(data);
      setReply('');
      fetchDetails();
      onUpdate();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send response');
    } finally {
      setSendingReply(false);
    }
  };

  const handleOpenFile = (file: any) => {
    openFileSecurely('projectProgressReport', reportId, file.id);
  };

  const handleDownloadFile = (file: any) => {
    downloadFileSecurely('projectProgressReport', reportId, file.id, file.originalName);
  };

  const handleShareFile = (file: any) => {
    shareFileSecurely('projectProgressReport', reportId, file.id);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-500 my-8">
        
        {/* Modern Header (Matching Image) */}
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
            onClick={() => setIsResponseModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#6bbd45] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Add Response
          </button>

        </div>

        {/* Content Layout (Grid) */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar bg-gray-50/20">
          
          {/* Left Column: Details & Responses */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Card: Message / Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Message / Details</p>
              </div>
              <div className="p-8">
                <div 
                  className="text-md text-gray-700 leading-relaxed font-medium prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.message }}
                />

              </div>
            </div>

            {/* Responses Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Responses ({responses.length})
                </h4>
              </div>
              
              {responses.length === 0 ? (
                <div className="py-12 px-8 bg-white/50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <p className="text-sm font-medium text-gray-400 italic">No responses yet. Be the first to respond.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map((res) => (
                    <div key={res.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-black uppercase">
                            {res.user?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-black uppercase tracking-widest">
                              {res.user?.firstName} {res.user?.lastName}
                            </p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                              {formatDate(res.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div 
                        className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-11 prose prose-xs max-w-none"
                        dangerouslySetInnerHTML={{ __html: res.message }}
                      />

                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>


          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card: Creator Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-50 bg-white flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Creator Details</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Created By:</span>
                  <span className="text-black">{report.user?.firstName} {report.user?.lastName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Username:</span>
                  <span className="text-black">{report.user?.username || 'ADMIN'}</span>
                </div>
              </div>
            </div>

            {/* Card: Attachments */}
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
          onClose={() => setIsResponseModalOpen(false)}
          onSuccess={() => {
            setIsResponseModalOpen(false);
            fetchDetails();
          }}
        />
      )}
    </div>
  );
};


export default ProgressReportDetails;
