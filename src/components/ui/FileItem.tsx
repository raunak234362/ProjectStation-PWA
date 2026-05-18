import React from "react";

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
}) => {
    const isExcel = /\.(xlsx|xls|csv)$/i.test(name);
    const isPdf = /\.(pdf)$/i.test(name);
    const isZip = /\.(zip|rar|7z|tar|gz)$/i.test(name);
    const isExe = /\.(exe|bat|sh|msi|dmg)$/i.test(name);

    // Get file extension uppercase
    const getFileExtension = (filename: string): string => {
        const parts = filename.split('.');
        if (parts.length > 1) {
            return parts.pop()?.toUpperCase() || "";
        }
        return "FILE";
    };

    const ext = getFileExtension(name);

    let theme = {
        bg: "bg-gray-50/50",
        border: "border-gray-200",
        hoverBorder: "hover:border-gray-400 hover:bg-gray-50",
        iconColor: "border-gray-400 bg-gray-50",
        foldColor: "bg-gray-100 border-gray-400",
        barColor: "bg-gray-500",
        textColor: "text-gray-700",
        ext: ext || "FILE"
    };

    if (isExcel) {
        theme = {
            bg: "bg-green-50/40",
            border: "border-green-200/80",
            hoverBorder: "hover:border-green-400 hover:bg-green-50",
            iconColor: "border-green-600 bg-green-50/80",
            foldColor: "bg-green-100 border-green-600",
            barColor: "bg-green-600",
            textColor: "text-green-800",
            ext: "XLSX"
        };
    } else if (isPdf) {
        theme = {
            bg: "bg-red-50/40",
            border: "border-red-200/80",
            hoverBorder: "hover:border-red-400 hover:bg-red-50",
            iconColor: "border-red-600 bg-red-50/80",
            foldColor: "bg-red-100 border-red-600",
            barColor: "bg-red-600",
            textColor: "text-red-800",
            ext: "PDF"
        };
    } else if (isZip) {
        theme = {
            bg: "bg-blue-50/40",
            border: "border-blue-200/80",
            hoverBorder: "hover:border-blue-400 hover:bg-blue-50",
            iconColor: "border-blue-600 bg-blue-50/80",
            foldColor: "bg-blue-100 border-blue-600",
            barColor: "bg-blue-600",
            textColor: "text-blue-800",
            ext: "ZIP"
        };
    } else if (isExe) {
        theme = {
            bg: "bg-amber-50/40",
            border: "border-amber-200/80",
            hoverBorder: "hover:border-amber-400 hover:bg-amber-50",
            iconColor: "border-amber-600 bg-amber-50/80",
            foldColor: "bg-amber-100 border-amber-600",
            barColor: "bg-amber-600",
            textColor: "text-amber-800",
            ext: "EXE"
        };
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) onClick(e);
    };

    const renderFileLogo = () => {
        return (
            <div className={`relative w-8 h-10 rounded-md border flex flex-col justify-between overflow-hidden shadow-xs shrink-0 select-none ${theme.iconColor}`}>
                {/* Folded page corner at top right */}
                <div 
                    className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-bl-sm border-b border-l ${theme.foldColor}`} 
                    style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
                ></div>
                
                {/* Mini body lines for document aesthetic */}
                <div className="flex-1 pt-3.5 px-1 space-y-0.5">
                    <div className={`h-[1.5px] w-4/5 rounded-full ${isExcel ? 'bg-green-200' : isPdf ? 'bg-red-200' : isZip ? 'bg-blue-200' : isExe ? 'bg-amber-200' : 'bg-gray-300'}`}></div>
                    <div className={`h-[1.5px] w-3/5 rounded-full ${isExcel ? 'bg-green-200' : isPdf ? 'bg-red-200' : isZip ? 'bg-blue-200' : isExe ? 'bg-amber-200' : 'bg-gray-300'}`}></div>
                </div>

                {/* Bottom colored bar indicating extension name */}
                <div className={`w-full py-0.5 text-[8px] font-black text-center uppercase tracking-wider text-white ${theme.barColor}`}>
                    {theme.ext.substring(0, 4)}
                </div>
            </div>
        );
    };

    return (
        <div className={`relative group w-full ${className}`}>
            <div
                onClick={handleClick}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs w-full ${theme.bg} ${theme.border} ${theme.hoverBorder} hover:shadow-sm`}
            >
                {renderFileLogo()}
                <span className="text-xs font-bold text-gray-700 leading-normal flex-1 line-clamp-2 break-all pr-2">
                    {name}
                </span>
            </div>

            {/* Custom Premium Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-[9999] pointer-events-none">
                <div className="bg-gray-900/95 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-normal max-w-xs break-all text-center border border-white/10 backdrop-blur-xs">
                    {name}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                </div>
            </div>
        </div>
    );
};

export default FileItem;
