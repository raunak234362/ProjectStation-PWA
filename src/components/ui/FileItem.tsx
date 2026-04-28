import React from "react";
import { FileText, File } from "lucide-react";

interface FileItemProps {
    name: string;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    iconSize?: number;
}

const FileItem: React.FC<FileItemProps> = ({
    name,
    onClick,
    className = "",
    iconSize = 24, // increased to fit text
}) => {
    const isExcel = /\.(xlsx|xls|csv)$/i.test(name);
    const isPdf = /\.(pdf)$/i.test(name);

    const iconColor = isExcel ? "text-[#1D6F42]" : isPdf ? "text-red-600" : "text-gray-700";
    const bgColor = isExcel ? "bg-green-50" : isPdf ? "bg-red-50" : "bg-white";
    const borderColor = isExcel ? "border-green-300" : isPdf ? "border-red-300" : "border-gray-200";

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) onClick(e);
    };

    return (
        <div className={`relative group inline-block max-w-full ${className}`}>
            <div
                onClick={handleClick}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer shadow-sm ${bgColor} ${borderColor} hover:shadow-md ${isExcel ? 'hover:border-green-400' : isPdf ? 'hover:border-red-400' : 'hover:border-gray-400'}`}
            >
                <div className="relative flex items-center justify-center">
                    {isExcel || isPdf ? (
                        <>
                            <File size={iconSize} className={iconColor} strokeWidth={2} />
                            <span 
                                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold mt-[2px] ${isPdf ? 'text-red-600' : 'text-[#1D6F42]'}`}
                            >
                                {isExcel ? ".exe" : "pdf"}
                            </span>
                        </>
                    ) : (
                        <FileText size={iconSize} className={iconColor} strokeWidth={2} />
                    )}
                </div>
                <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]">
                    {name}
                </span>
            </div>

            {/* Custom Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-[9999] pointer-events-none">
                <div className={`bg-gray-100/95 border-2 ${isExcel ? 'border-green-500' : isPdf ? 'border-red-500' : 'border-gray-400'} text-black text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-sm`}>
                    {name}
                    {/* Arrow */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 ${isExcel ? 'border-t-green-500' : isPdf ? 'border-t-red-500' : 'border-t-gray-400'}`}></div>
                </div>
            </div>
        </div>
    );
};

export default FileItem;
