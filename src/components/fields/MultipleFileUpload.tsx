import React, { useState, useRef, useEffect } from "react";
import { Upload, X, FileText } from "lucide-react";

/**
 * A reusable component for uploading multiple files.
 * It displays a list of selected files and allows removing individual files.
 */
interface MultipleFileUploadProps {
  onFilesChange: (files: File[]) => void;
  initialFiles?: File[];
}

const EMPTY_ARRAY: File[] = [];

function MultipleFileUpload({
  onFilesChange,
  initialFiles = EMPTY_ARRAY,
}: MultipleFileUploadProps) {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only sync if initialFiles was actually provided and changed.
    // We check initialFiles.length to avoid clearing state when 
    // the component first mounts with an empty default array.
    if (initialFiles && initialFiles.length > 0 && initialFiles !== files) {
      setFiles(initialFiles);
    } else if (initialFiles && initialFiles.length === 0 && files.length > 0 && initialFiles !== files) {
      // This part handles the case where the parent explicitly resets the form
      setFiles([]);
    }
  }, [initialFiles]);

  // Handle global drag events
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current++;
      if (dragCounter.current === 1) {
        setIsDraggingGlobal(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDraggingGlobal(false);
      }
    };


    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    // Note: Window drop is handled by the overlay to capture the files

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files);
    const updatedFiles = [...files, ...selectedFiles];

    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    event.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGlobal(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const updatedFiles = [...files, ...droppedFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="w-full space-y-3 relative">
      {/* Global Drop Overlay */}
      {isDraggingGlobal && (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="fixed inset-0 z-[9999] bg-[#6bbd45]/5 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300"
        >
          <div className="w-full h-full border-4 border-dashed border-[#6bbd45] rounded-[3rem] bg-white/90 flex flex-col items-center justify-center shadow-2xl animate-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-[#6bbd45]/10 flex items-center justify-center mb-6 animate-bounce">
              <Upload className="w-12 h-12 text-[#6bbd45]" />
            </div>
            <h2 className="text-4xl font-black text-black uppercase tracking-tight mb-2">Drop files here</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Release to add to your attachments</p>
          </div>
        </div>
      )}

      {/* Main Upload Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isDraggingGlobal) setIsDraggingGlobal(true);
        }}
        onDrop={handleDrop}
        className="group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50 hover:bg-[#ebf5ea]/30 hover:border-[#6bbd45]/50 transition-all duration-200 flex flex-col items-center justify-center gap-3"
      >
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-gray-100">
          <Upload className="w-6 h-6 text-[#6bbd45]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-black uppercase tracking-tight">Click or drag files here</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">PDF, Image, Excel, etc.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* File List Display */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Files ({files.length})</p>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white shadow-sm group hover:border-[#6bbd45]/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#6bbd45]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-black truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultipleFileUpload;
