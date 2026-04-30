/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import RichTextEditor from '../../fields/RichTextEditor';
import Service from '../../../api/Service';

interface AddProgressReportResponseProps {
  reportId: string;
  parentResponseId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProgressReportResponse = ({ reportId, parentResponseId, onClose, onSuccess }: AddProgressReportResponseProps) => {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setLoading(true);
      const data = new FormData();
      data.append('reportId', reportId);
      data.append('description', message);
      if (parentResponseId) data.append('parentResponseId', parentResponseId);


      
      files.forEach((file) => {
        data.append('files', file);
      });

      await Service.createProjectProgressReportResponse(data);
      onSuccess();
    } catch (error) {
      console.error('Error adding response:', error);
      alert('Failed to submit response. Please try again.');
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-black uppercase tracking-tight">Add Response</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Message Field */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Message *
            </label>
            <div className="rounded-2xl border border-gray-200 overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500/30 transition-all">
              <RichTextEditor
                value={message}
                onChange={setMessage}
                placeholder="Type your response here..."
              />
            </div>
          </div>

          {/* Upload Files Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-4">Upload Files</p>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 shadow-sm">
                Choose files
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
              <span className="text-sm text-gray-500 font-medium">
                {files.length > 0 ? `${files.length} files selected` : 'No file chosen'}
              </span>
            </div>
            {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {files.map((file, i) => (
                        <div key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-600 flex items-center gap-2">
                            {file.name}
                            <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                                <X className="w-3 h-3 text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-black transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="px-8 py-3.5 bg-[#6bbd45] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-green-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Response
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProgressReportResponse;
