/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { X, Send, Upload, Loader2 } from 'lucide-react';
import Service from '../../../api/Service';
import RichTextEditor from '../../fields/RichTextEditor';

interface AddCoordinationDrawingProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCoordinationDrawing = ({ projectId, onClose, onSuccess }: AddCoordinationDrawingProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    stage: 'IFA',
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

      let fabricatorName = "";
      let projectName = "";
      if (projectId) {
        const project = await Service.GetProjectById(projectId);
        fabricatorName = project?.fabricator?.fabName || "";
        projectName = project?.projectName || project?.name || "";
      }

      await Service.createCoordinationDrawing(data, fabricatorName, projectName);
      onSuccess();
    } catch (error) {
      console.error('Error creating drawing:', error);
      alert('Failed to submit drawing. Please try again.');
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
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 bg-[#f8f9fa] border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#334155] uppercase tracking-widest">
            Add Coordination Drawing
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-all">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-1.5">
              Title <span className="text-blue-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter drawing title"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-1.5">
              Stage
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
            >
              <option value="IFA">IFA</option>
              <option value="IFC">IFC</option>
              <option value="RE-IFA">RE-IFA</option>
              <option value="RIFC">RIFC</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-1.5">
              Description <span className="text-blue-500">*</span>
            </label>
            <div className="rounded-xl overflow-hidden border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
              <RichTextEditor
                value={formData.message}
                onChange={(val) => setFormData({ ...formData, message: val })}
                height={200}
                className="border-0"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="drawing-files"
              />
              <label
                htmlFor="drawing-files"
                className="flex flex-col items-center justify-center py-8 bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all"
              >
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm font-black text-black uppercase tracking-tight">
                  {files.length > 0 ? `${files.length} FILES SELECTED` : 'CLICK OR DRAG FILES HERE'}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  PDF, IMAGE, EXCEL, ETC.
                </p>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-[#334155] hover:bg-gray-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#6bbd45] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#5da33b] transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Drawing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoordinationDrawing;
