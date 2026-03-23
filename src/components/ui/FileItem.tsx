import React from "react";
import { FileText, FileSpreadsheet } from "lucide-react";

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
    iconSize = 16,
}) => {
    const isExcel = /\.(xlsx|xls|csv)$/i.test(name);

    const Icon = isExcel ? FileSpreadsheet : FileText;
    const iconColor = isExcel ? "text-[#1D6F42]" : "text-gray-700";
    const bgColor = isExcel ? "bg-green-50" : "bg-white";
    const borderColor = isExcel ? "border-green-300" : "border-gray-200";

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) onClick(e);
    };

    return (
        <div className={`relative group inline-block max-w-full ${className}`}>
            <div
                onClick={handleClick}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer shadow-sm ${bgColor} ${borderColor} hover:shadow-md hover:border-green-400`}
            >
                <Icon size={iconSize} className={iconColor} strokeWidth={2.5} />
                <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]">
                    {name}
                </span>
            </div>

            {/* Custom Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-[9999] pointer-events-none">
                <div className="bg-gray-100/95 border-2 border-green-500 text-black text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-sm">
                    {name}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-green-500"></div>
                </div>
            </div>
        </div>
    );
};

export default FileItem;
