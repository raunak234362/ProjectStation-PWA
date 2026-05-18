import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { showFileError } from "../../store/uiSlice"
import { FileText, Share2, Download, ChevronRight, Plus, ChevronDown } from 'lucide-react'
import {
  openFileSecurely,
  downloadFileSecurely,
  shareFileSecurely
} from '../../utils/openFileSecurely'
import Button from '../fields/Button'
import FileItem from './FileItem'

interface RenderFilesProps {
  files: any;
  onAddFilesClick?: () => void;
  formatDate?: (date: string | number | Date) => string;
  table: string;
  parentId: string | number;
  versionId?: string | number;
  hideHeader?: boolean;
  noAccordion?: boolean;
}

const RenderFiles: React.FC<RenderFilesProps> = ({
  files,
  onAddFilesClick,
  formatDate,
  table,
  parentId,
  versionId,
  hideHeader = false,
  noAccordion = false
}) => {
  const dispatch = useDispatch();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (description: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [description]: !prev[description]
    }));
  };

  // Step 1: Normalize and flatten files
  const projectFiles = Array.isArray(files)
    ? files.map((doc: any) => {
      const fileData = doc.file ? { ...doc.file, ...doc } : { ...doc }
      if (fileData.file) delete fileData.file
      return fileData
    })
    : []

  // Step 2: Group files by description
  const groupedFiles = projectFiles.reduce((acc: Record<string, any[]>, curr: any) => {
    // Handle Submittal Versions (if present on the object)
    if (curr.versions && Array.isArray(curr.versions) && curr.versions.length > 0) {
      if (curr.versions.length === 1) {
        // Single version: show files under the main description
        const version = curr.versions[0];
        const desc = curr.description && curr.description !== '<p>&nbsp;<br></p>' ? curr.description : 'Attachments';
        if (!acc[desc]) acc[desc] = [];
        const filesToMap = version.files || curr.files || [];
        filesToMap.forEach((f: any) => {
          acc[desc].push({
            ...f,
            id: f.id,
            uploadedAt: version.createdAt || curr.createdAt || curr.date,
            user: version.user || version.sender || curr.sender,
            documentID: version.submittalId || curr.id,
            versionId: version.id,
            stage: version.stage || curr.stage,
            overrideTable: (curr.serialNo?.startsWith('SUB') || curr.versions) ? 'submittals' : undefined
          });
        });
      } else {
        // Multiple versions
        curr.versions.forEach((version: any, idx: number) => {
          const vNum = version.versionNumber || (curr.versions.length - idx);
          const baseDesc = curr.description && curr.description !== '<p>&nbsp;<br></p>' ? curr.description : 'Submittal';
          const hiddenDesc = hideHeader ? 'Attachments' : `Version ${vNum}`;
          const desc = hideHeader ? hiddenDesc : `${baseDesc} (Version ${vNum})`;
          if (!acc[desc]) acc[desc] = [];
          const filesToMap = version.files || [];
          filesToMap.forEach((f: any) => {
            acc[desc].push({
              ...f,
              id: f.id,
              uploadedAt: version.createdAt || curr.createdAt || curr.date,
              user: version.user || version.sender || curr.sender,
              documentID: version.submittalId || curr.id,
              versionId: version.id,
              stage: version.stage || curr.stage,
              overrideTable: (curr.serialNo?.startsWith('SUB') || curr.versions) ? 'submittals' : undefined
            });
          });
        });
      }
    }
    // Handle "Document" structure (nested files)
    else if (curr.files && Array.isArray(curr.files)) {
      const desc = curr.versionNumber
        ? hideHeader
          ? 'Attachments'
          : `Version ${curr.versionNumber}`
        : curr.description && curr.description !== '<p>&nbsp;<br></p>'
          ? curr.description
          : 'Attachments';
      if (!acc[desc]) acc[desc] = []
      curr.files.forEach((f: any) => {
        acc[desc].push({
          ...f,
          id: f.id, // Ensure we preserve the file id for nested too
          uploadedAt: curr.uploadedAt || curr.createdAt || curr.date,
          user: curr.user || curr.sender,
          documentID: table === 'submittals' && parentId ? parentId : curr.id,
          versionId: table === 'submittals' ? curr.id : (f.versionId || versionId),
          stage: curr.stage
        })
      })
    } else {
      // Handle "Flat File" structure (e.g., RFI, Submittals, rFQ)
      const desc = 'Attachments'
      if (!acc[desc]) acc[desc] = []
      acc[desc].push({
        ...curr,
        id: curr.id, // Ensure we preserve the file id!
        documentID: parentId, // Use passed parentId for flat files
        versionId: curr.versionId || versionId
      })
    }
    return acc
  }, {})

  const handleShare = async (e: React.MouseEvent, file: any) => {
    e.preventDefault()
    e.stopPropagation()
    const finalTable = file.overrideTable || table;
    await shareFileSecurely(finalTable, file.documentID, file.id, file.versionId || versionId)
  }

  const handleDownload = async (e: React.MouseEvent, file: any) => {
    e.preventDefault()
    e.stopPropagation()
    const finalTable = file.overrideTable || table;
    const result = await downloadFileSecurely(finalTable, file.documentID, file.id, file.originalName, file.versionId || versionId)
    if (result && !result.success) {
        dispatch(showFileError({
            reason: result.error || "Unable to download file",
            retryAction: () => downloadFileSecurely(finalTable, file.documentID, file.id, file.originalName, file.versionId || versionId)
        }));
    }
  }

  const handleOpen = async (e: React.MouseEvent, file: any) => {
    e.preventDefault()
    const finalTable = file.overrideTable || table;
    const result = await openFileSecurely(finalTable, file.documentID, file.id, file.versionId || versionId)
    if (result && !result.success) {
        dispatch(showFileError({
            reason: result.error || "Unable to open file",
            retryAction: () => openFileSecurely(finalTable, file.documentID, file.id, file.versionId || versionId)
        }));
    }
  }

  // Step 3: Render grouped sections
  return (
    <div className="space-y-4">
      {/* Header */}
      {!hideHeader && (
        <div className="flex justify-between items-center mb-2">
          {/* <h4 className="text-sm font-black text-black uppercase tracking-tight">Project Files</h4> */}
          {onAddFilesClick && (
            <Button onClick={onAddFilesClick} className="scale-90 origin-right">
              <Plus size={14} className="mr-1" /> Add Document
            </Button>
          )}
        </div>
      )}

      {/* Files grouped by description */}
      {Object.keys(groupedFiles).length > 0 ? (
        Object.entries(groupedFiles).map(([description, groupedFilesList]) => {
          const filesArray = groupedFilesList as any[]
          const firstFile = filesArray[0]
          const uploaderName = firstFile?.user
            ? `${firstFile.user.firstName || firstFile.user.f_name || ''} ${firstFile.user.lastName || firstFile.user.l_name || ''
            }`
            : 'Unknown User'

          if (noAccordion) {
            return (
              <div key={description} className="grid grid-cols-1 gap-2">
                {filesArray.map((file: any, index: number) => (
                  <div
                    key={file.id || `file-${index}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-black/10 transition-all group/file shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover/file:bg-black group-hover/file:text-white transition-colors">
                      <FileText size={16} />
                    </div>

                    <FileItem
                      name={file.originalName || `File ${index + 1}`}
                      onClick={(e: React.MouseEvent) => handleOpen(e as any, file)}
                      className="flex-1 min-w-0"
                    />

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleShare(e, file)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all"
                        title="Share Link"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDownload(e, file)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <ChevronRight size={16} className="text-gray-300 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div
              key={description}
              className={`border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 ${expandedSections[description] ? 'ring-2 ring-black/5' : ''}`}
            >
              {/* Header Section (Toggle Button) */}
              <div 
                onClick={() => toggleSection(description)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h5
                      className="text-sm border-l-4 border-[#6bbd45] pl-3 sm:text-base text-gray-800 font-bold uppercase tracking-tight truncate"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                    <span className="text-[10px] font-black text-[#4a8a1a] bg-green-50 border border-green-100 px-2 py-0.5 rounded-full shrink-0">
                      {filesArray.length} file{filesArray.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 ml-4">
                    {firstFile?.stage && (
                      <p className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {firstFile.stage}
                      </p>
                    )}
                    {firstFile?.uploadedAt && (
                      <p className="text-[10px] text-gray-400 font-medium">
                        {formatDate ? formatDate(firstFile.uploadedAt) : new Date(firstFile.uploadedAt).toLocaleString()}
                      </p>
                    )}
                    {uploaderName !== 'Unknown User' && (
                      <p className="text-[10px] text-gray-400">
                        by <span className="font-semibold text-gray-600">{uploaderName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                   <div className={`p-2 rounded-lg transition-all ${expandedSections[description] ? 'bg-[#6bbd45] text-white' : 'bg-gray-100 text-gray-400 group-hover:text-black group-hover:bg-gray-200'}`}>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${expandedSections[description] ? 'rotate-180' : ''}`} />
                   </div>
                </div>
              </div>

              {/* Collapsible File List */}
              {expandedSections[description] && (
                <div className="p-4 pt-0 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {filesArray.map((file: any, index: number) => (
                      <div
                        key={file.id || `file-${index}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-black/10 transition-all group/file"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover/file:bg-black group-hover/file:text-white transition-colors">
                          <FileText size={16} />
                        </div>

                        <FileItem
                          name={file.originalName || `File ${index + 1}`}
                          onClick={(e: React.MouseEvent) => handleOpen(e as any, file)}
                          className="flex-1 min-w-0"
                        />

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleShare(e, file)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all"
                            title="Share Link"
                          >
                            <Share2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDownload(e, file)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <ChevronRight size={16} className="text-gray-300 ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })
      ) : (
        // Empty State
        <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">No files available</p>
          {onAddFilesClick && (
            <Button onClick={onAddFilesClick} className="mt-4 bg-green-600 text-white">
              <Plus size={14} className="mr-2" /> Upload Files
            </Button>
          )}
        </div>
      )}
    </div >
  )
}

export default RenderFiles
