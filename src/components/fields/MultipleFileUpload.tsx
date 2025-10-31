// src/components/FileUpload/MultipleFileUpload.tsx

import React, { useState } from "react";

// Define the props interface for type safety
interface MultipleFileUploadProps {
  /**
   * Callback function that is triggered whenever the list of files changes.
   * It provides the complete, updated list of files.
   */
  onFilesChange: (files: File[]) => void;
  /** Optional: Pass existing files to pre-populate the component */
  initialFiles?: File[];
}

/**
 * A reusable component for uploading multiple files.
 * It displays a list of selected files and allows removing individual files.
 */
function MultipleFileUpload({
  onFilesChange,
  initialFiles = [],
}: MultipleFileUploadProps) {
  // State to hold the list of File objects
  const [files, setFiles] = useState<File[]>(initialFiles);

  /**
   * Handles the file input change event.
   * Appends newly selected files to the existing file list.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return; // Exit if no files are selected
    }

    const selectedFiles: File[] = Array.from(event.target.files);

    setFiles((prevFiles) => {
      // Combine previous files with new files
      const updatedFiles = [...prevFiles, ...selectedFiles];

      // Notify the parent component of the change
      onFilesChange(updatedFiles);
      return updatedFiles;
    });

    // Clear the input value to allow selecting the same file(s) again
    event.target.value = "";
  };

  /**
   * Removes a file from the list based on its index.
   */
  const removeFile = (indexToRemove: number) => {
    setFiles((prevFiles) => {
      // Filter out the file at the specified index
      const updatedFiles = prevFiles.filter(
        (_, index) => index !== indexToRemove
      );

      // Notify the parent component of the change
      onFilesChange(updatedFiles);
      return updatedFiles;
    });
  };

  /**
   * Formats file size for display.
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        Upload Files
      </label>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Selected Files:
          </p>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.lastModified}-${index}`} // More robust key
                className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <span
                    className="text-sm text-gray-800 font-medium block truncate"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  type="button" // Prevents form submission
                  onClick={() => removeFile(index)}
                  className="ml-3 text-red-500 hover:text-red-700 focus:outline-none flex-shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MultipleFileUpload;
