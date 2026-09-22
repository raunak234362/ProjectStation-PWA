import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { showFileError } from "../../store/uiSlice"
import { FileText, Share2, Download, ChevronRight, Plus, ChevronDown, Clock } from 'lucide-react'
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
    // 1. If curr.files is provided (e.g. pre-extracted and classified files)
    if (curr.files && Array.isArray(curr.files)) {
      let desc = curr.description && curr.description !== '<p>&nbsp;<br></p>'
        ? curr.description
        : (curr.subject || curr.title || (curr.versionNumber ? `Version ${curr.versionNumber}` : 'Attachments'));

      if (table === 'submittals' && !String(desc).toLowerCase().startsWith('submittal')) {
        desc = `Submittal: ${desc}`;
      } else if (table === 'bfa' && !String(desc).toLowerCase().startsWith('bfa')) {
        desc = `BFA: ${desc}`;
      }

      if (!acc[desc]) acc[desc] = [];
      curr.files.forEach((f: any) => {
        acc[desc].push({
          ...f,
          id: f.id,
          uploadedAt: f.uploadedAt || curr.uploadedAt || curr.createdAt || curr.date,
          user: f.user || curr.user || curr.sender,
          documentID: f.documentID || f.overrideDocumentID || (table === 'submittals' ? curr.id : ((table === 'bfa' && parentId) ? parentId : curr.id || parentId)),
          versionId: f.versionId || (table === 'submittals' ? undefined : (table === 'bfa' ? curr.id : versionId)),
          stage: f.stage || curr.stage,
          overrideTable: f.overrideTable || (table === 'submittals' ? 'submittals' : (table === 'bfa' ? 'bfa' : undefined)),
          originType: f.originType || (table === 'submittals' ? 'SUBMITTAL' : (table === 'bfa' ? 'BFA' : undefined)),
          fileCategory: f.fileCategory || (table === 'submittals' ? 'submittal' : (table === 'bfa' ? 'bfa' : undefined)),
          fileType: f.fileType || (table === 'submittals' ? 'Submittal File' : (table === 'bfa' ? 'BFA File' : undefined)),
          responseReason: f.responseReason,
          responseStatus: f.responseStatus,
        });
      });
    }
    // 2. Handle Submittal Versions if curr.versions is present and curr.files was not passed
    else if (curr.versions && Array.isArray(curr.versions) && curr.versions.length > 0) {
      if (curr.versions.length === 1) {
        const version = curr.versions[0];
        let desc = curr.description && curr.description !== '<p>&nbsp;<br></p>'
          ? curr.description
          : (curr.subject || curr.title || 'Attachments');
        if (table === 'submittals' && !String(desc).toLowerCase().startsWith('submittal')) {
          desc = `Submittal: ${desc}`;
        }
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
            overrideTable: 'submittals',
            originType: 'SUBMITTAL',
            fileCategory: 'submittal',
            fileType: `Submittal (v${version.versionNumber || 1})`,
          });
        });
      } else {
        const baseDesc = curr.description && curr.description !== '<p>&nbsp;<br></p>'
          ? curr.description
          : (curr.subject || 'Submittal');
        const formattedBaseDesc = (table === 'submittals' && !String(baseDesc).toLowerCase().startsWith('submittal'))
          ? `Submittal: ${baseDesc}`
          : baseDesc;

        curr.versions.forEach((version: any, idx: number) => {
          const vNum = version.versionNumber || (curr.versions.length - idx);
          const desc = `${formattedBaseDesc} (Version ${vNum})`;
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
              overrideTable: 'submittals',
              originType: 'SUBMITTAL',
              fileCategory: 'submittal',
              fileType: `Submittal (v${vNum})`,
            });
          });
        });
      }
    } else {
      // 3. Flat File structure
      let desc = curr.description && curr.description !== '<p>&nbsp;<br></p>'
        ? curr.description
        : (curr.subject || curr.title || 'Attachments');
      if (!acc[desc]) acc[desc] = [];
      acc[desc].push({
        ...curr,
        id: curr.id,
        documentID: curr.documentID || parentId,
        versionId: curr.versionId || versionId,
        overrideTable: curr.overrideTable,
      });
    }
    return acc;
  }, {});

  const handleShare = async (e: React.MouseEvent, file: any) => {
    e.preventDefault();
    e.stopPropagation();
    const finalTable = file.overrideTable || file.table || table;
    const finalParentId = file.documentID || parentId;
    const finalVersionId = file.versionId || versionId;
    await shareFileSecurely(finalTable, finalParentId, file.id, finalVersionId);
  };

  const handleDownload = async (e: React.MouseEvent, file: any) => {
    e.preventDefault();
    e.stopPropagation();
    const finalTable = file.overrideTable || file.table || table;
    const finalParentId = file.documentID || parentId;
    const finalVersionId = file.versionId || versionId;
    const fileName = file.originalName || file.name || "download";
    const result = await downloadFileSecurely(finalTable, finalParentId, file.id, fileName, finalVersionId);
    if (result && !result.success) {
      dispatch(showFileError({
        reason: result.error || "Unable to download file",
        retryAction: () => downloadFileSecurely(finalTable, finalParentId, file.id, fileName, finalVersionId)
      }));
    }
  };

  const handleOpen = async (e: React.MouseEvent, file: any) => {
    e.preventDefault();
    const finalTable = file.overrideTable || file.table || table;
    const finalParentId = file.documentID || parentId;
    const finalVersionId = file.versionId || versionId;
    const result = await openFileSecurely(finalTable, finalParentId, file.id, finalVersionId);
    if (result && !result.success) {
      dispatch(showFileError({
        reason: result.error || "Unable to open file",
        retryAction: () => openFileSecurely(finalTable, finalParentId, file.id, finalVersionId)
      }));
    }
  };

  const renderFileRow = (file: any, index: number) => {
    const fileUploader = file.user || file.sender;
    const fileUploaderName = fileUploader
      ? `${fileUploader.firstName || fileUploader.f_name || ''} ${fileUploader.lastName || fileUploader.l_name || ''}`.trim()
      : '';
    const fileDate = file.uploadedAt || file.createdAt || file.date;

    const isSubmittal = file.originType === 'SUBMITTAL' || file.fileCategory === 'submittal' || (table === 'submittals' && !file.originType && !file.fileCategory);
    const isResponse = file.originType === 'RESPONSE' || file.fileCategory === 'response' || file.overrideTable === 'submittalsResponse';
    const isBfa = file.originType === 'BFA' || file.fileCategory === 'bfa' || file.overrideTable === 'bfa';

    return (
      <div
        key={file.id || `file-${index}`}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/80 hover:border-black/10 transition-all group/file shadow-xs"
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <FileItem
            name={file.originalName || file.name || `File ${index + 1}`}
            onClick={(e: React.MouseEvent) => handleOpen(e as any, file)}
            className="w-full"
          />

          {/* Badges & Meta Row */}
          <div className="flex flex-wrap items-center gap-2 pl-1">
            {/* SUBMITTAL BADGE */}
            {isSubmittal && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {file.fileType && file.fileType.toLowerCase().includes('submittal')
                  ? file.fileType.toUpperCase()
                  : `SUBMITTAL ${file.versionNumber ? `v${file.versionNumber}` : (file.versionId ? `v${file.versionId}` : 'v1')}`}
              </span>
            )}


            {/* RESPONSE BADGE */}
            {isResponse && (
              <>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                  RESPONSE FILE
                </span>
                {file.responseReason && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100/70 text-purple-800 border border-purple-200/60 max-w-xs truncate"
                    title={file.responseReason}
                  >
                    Reason: {file.responseReason}
                  </span>
                )}
                {file.responseStatus && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      file.responseStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : file.responseStatus === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {file.responseStatus.replace(/_/g, ' ')}
                  </span>
                )}
              </>
            )}

            {/* BFA BADGE */}
            {isBfa && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                BFA FILE {file.versionNumber ? `v${file.versionNumber}` : ''}
              </span>
            )}

            {/* Stage */}
            {file.stage && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                {file.stage}
              </span>
            )}

            {/* Date */}
            {fileDate && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium whitespace-nowrap">
                <Clock size={11} />
                {formatDate ? formatDate(fileDate) : new Date(fileDate).toLocaleString()}
              </span>
            )}

            {/* Uploader */}
            {fileUploaderName && (
              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                by <span className="font-semibold text-gray-600">{fileUploaderName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-1 shrink-0 self-end sm:self-center">
          <button
            onClick={(e) => handleShare(e, file)}
            className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 shadow-xs"
            title="Share Link"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={(e) => handleDownload(e, file)}
            className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 shadow-xs"
            title="Download"
          >
            <Download size={16} />
          </button>
          <button
            onClick={(e) => handleOpen(e, file)}
            className="p-2 text-gray-300 hover:text-black transition-colors"
            title="Open File"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderFileList = (filesArray: any[]) => {
    const isSubmittalCard =
      table === 'submittals' ||
      filesArray.some((f: any) => f.originType || f.fileCategory || f.overrideTable === 'submittalsResponse' || f.overrideTable === 'bfa');

    if (!isSubmittalCard) {
      return (
        <div className="grid grid-cols-1 gap-2 mt-4">
          {filesArray.length > 0 ? (
            filesArray.map((file: any, index: number) => renderFileRow(file, index))
          ) : (
            <p className="text-xs text-gray-400 font-medium py-2 px-1">No files attached to this item</p>
          )}
        </div>
      );
    }

    const submittalFiles = filesArray.filter(
      (f: any) =>
        f.originType === 'SUBMITTAL' ||
        f.fileCategory === 'submittal' ||
        (!f.originType && !f.fileCategory && table === 'submittals' && f.overrideTable !== 'submittalsResponse' && f.overrideTable !== 'bfa')
    );

    const responseFiles = filesArray.filter(
      (f: any) =>
        f.originType === 'RESPONSE' ||
        f.fileCategory === 'response' ||
        f.overrideTable === 'submittalsResponse'
    );

    const bfaFiles = filesArray.filter(
      (f: any) =>
        f.originType === 'BFA' ||
        f.fileCategory === 'bfa' ||
        f.overrideTable === 'bfa'
    );

    const coordinationFiles = filesArray.filter(
      (f: any) =>
        f.originType === 'COORDINATION_DRAWING' ||
        f.fileCategory === 'coordinationDrawing' ||
        (table === 'coordinationDrawing' && !f.originType && !f.fileCategory && f.overrideTable !== 'coordinationDrawingResponse')
    );

    const otherFiles = filesArray.filter(
      (f: any) =>
        !submittalFiles.includes(f) &&
        !responseFiles.includes(f) &&
        !bfaFiles.includes(f) &&
        !coordinationFiles.includes(f)
    );

    return (
      <div className="space-y-4 mt-4">
        {submittalFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-wider bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-100">
              <span>📁</span>
              <span>SUBMITTAL FILES</span>
              <span className="bg-blue-200/80 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {submittalFiles.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {submittalFiles.map((file: any, idx: number) => renderFileRow(file, idx))}
            </div>
          </div>
        )}

        {coordinationFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-wider bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-100">
              <span>📁</span>
              <span>COORDINATION DRAWING FILES</span>
              <span className="bg-blue-200/80 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {coordinationFiles.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {coordinationFiles.map((file: any, idx: number) => renderFileRow(file, idx))}
            </div>
          </div>
        )}

        {responseFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-purple-900 uppercase tracking-wider bg-purple-50/80 px-3 py-1.5 rounded-lg border border-purple-100">
              <span>💬</span>
              <span>RESPONSE FILES</span>
              <span className="bg-purple-200/80 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {responseFiles.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {responseFiles.map((file: any, idx: number) => renderFileRow(file, idx))}
            </div>
          </div>
        )}

        {bfaFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wider bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-100">
              <span>📥</span>
              <span>BFA FILES</span>
              <span className="bg-emerald-200/80 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {bfaFiles.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {bfaFiles.map((file: any, idx: number) => renderFileRow(file, idx))}
            </div>
          </div>
        )}

        {otherFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span>📄</span>
              <span>OTHER FILES</span>
              <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {otherFiles.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {otherFiles.map((file: any, idx: number) => renderFileRow(file, idx))}
            </div>
          </div>
        )}

        {filesArray.length === 0 && (
          <p className="text-xs text-gray-400 font-medium py-2 px-1">No files attached to this item</p>
        )}
      </div>
    );
  };

  // Step 3: Render grouped sections
  return (
    <div className="space-y-4">
      {/* Header */}
      {!hideHeader && (
        <div className="flex justify-between items-center mb-2">
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
          const filesArray = groupedFilesList as any[];
          const firstFile = filesArray[0];
          const uploaderName = firstFile?.user
            ? `${firstFile.user.firstName || firstFile.user.f_name || ''} ${firstFile.user.lastName || firstFile.user.l_name || ''}`.trim()
            : 'Unknown User';

          if (noAccordion) {
            return (
              <div key={description}>
                {renderFileList(filesArray)}
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
                  {renderFileList(filesArray)}
                </div>
              )}
            </div>
          );
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
