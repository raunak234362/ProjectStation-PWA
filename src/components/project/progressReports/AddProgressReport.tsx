/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { X, Send, Paperclip, Loader2 } from 'lucide-react';
import Service from '../../../api/Service';

interface AddProgressReportProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProgressReport = ({ projectId, onClose, onSuccess }: AddProgressReportProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    stage: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    try {
      setLoading(true);
      const data = new FormData();
      data.append('projectId', projectId);
      data.append('title', formData.title);
      data.append('message', formData.message);
      if (formData.stage) data.append('stage', formData.stage);
      
      files.forEach((file) => {
        data.append('files', file);
      });

      await Service.createProjectProgressReport(data);
      onSuccess();
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Failed to create report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 bg-green-50 border-b border-green-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight">New Progress Report</h3>
            <p className="text-xs text-green-700 font-bold uppercase tracking-widest mt-1">Submit project update</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Report Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="E.g., Weekly Site Update"
                className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Project Stage (Optional)</label>
              <input
                type="text"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                placeholder="E.g., IFA, IFC, PRODUCTION"
                className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Update Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe the progress..."
                className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Attachments</label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="report-files"
                />
                <label
                  htmlFor="report-files"
                  className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all"
                >
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 font-medium">
                    {files.length > 0 ? `${files.length} files selected` : 'Drop files here or click to upload'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-black/5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#6bbd45] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProgressReport;
