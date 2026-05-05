/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Plus, FileText, Clock, ChevronRight, Loader2 } from 'lucide-react';
import Service from '../../../api/Service';
import { formatDate } from '../../../utils/dateUtils';
import AddProgressReport from './AddProgressReport.tsx';
import ProgressReportDetails from './ProgressReportDetails.tsx';


interface ProjectProgressProps {
  projectId: string;
}

const ProjectProgress = ({ projectId }: ProjectProgressProps) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await Service.getProjectProgressReportsByProjectId(projectId);
      setReports(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Error fetching progress reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchReports();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-black uppercase tracking-tight">Weekly Progress Reports</h3>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Recent project updates</p>
          </div>
        </div>
        {!['client', 'client_admin', 'client_estimator'].includes(sessionStorage.getItem('userRole')?.toLowerCase() || '') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6bbd45] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Report
          </button>
        )}
      </div>


      <div className="grid grid-cols-1 gap-3">
        {reports.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400 font-medium italic">No progress reports filed yet.</p>
          </div>
        ) : (
          reports.slice(0, 5).map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReportId(report.id)}
              className="group flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl hover:border-green-500/20 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <h4 className="text-sm font-bold text-black">{report.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {formatDate(report.createdAt)}
                    </span>
                    {report.stage && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] text-gray-500 font-black uppercase tracking-wider">
                        {report.stage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
            </div>
          ))
        )}
      </div>

      {isAddModalOpen && (
        <AddProgressReport
          projectId={projectId}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchReports();
          }}
        />
      )}

      {selectedReportId && (
        <ProgressReportDetails
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
          onUpdate={fetchReports}
        />
      )}
    </div>
  );
};

export default ProjectProgress;
