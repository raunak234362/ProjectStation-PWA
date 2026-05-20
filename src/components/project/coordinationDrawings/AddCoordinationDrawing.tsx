/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { X, Send, Paperclip, Loader2, Compass } from 'lucide-react';
import Service from '../../../api/Service';

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

      await Service.createCoordinationDrawing(data);
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
      <div className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="px-10 py-8 bg-green-50/50 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#6bbd45] flex items-center justify-center shadow-lg shadow-green-500/30">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">Initiate Coordination</h3>
              <p className="text-xs text-green-700 font-bold uppercase tracking-widest mt-1">New drawing review cycle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-black/5 shadow-sm">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-600 transition-colors">Drawing Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="E.g., Structural vs HVAC Level 2"
                className="w-full px-5 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white focus:border-green-500/30 transition-all"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-600 transition-colors">Project Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white focus:border-green-500/30 transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2rem' }}
              >
                <option value="" disabled>Select a stage</option>
                <option value="IFA">IFA</option>
                <option value="IFC">IFC</option>
                <option value="COORDINATION">COORDINATION</option>
              </select>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-600 transition-colors">Coordination Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Detail the coordination requirements..."
                className="w-full px-5 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white focus:border-green-500/30 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Upload Drawings</label>
              <div className="relative group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="drawing-files"
                />
                <label
                  htmlFor="drawing-files"
                  className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] cursor-pointer group-hover:bg-green-50 group-hover:border-green-500/30 transition-all"
                >
                  <Paperclip className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-bold uppercase tracking-tight">
                      {files.length > 0 ? `${files.length} drawings selected` : 'Select Drawing Files'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">PDF, DWG, or Image formats</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-black/5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 hover:text-black transition-all text-gray-400"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-[#6bbd45] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-green-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Create Drawing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoordinationDrawing;
