
import React from "react";
import { Menu, ChevronLeft } from "lucide-react";
import Button from "./fields/Button";

interface HeaderProps {
  isMinimized: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMinimized, toggleSidebar }) => {
  return (
    <header className="flex items-center justify-between bg-white shadow-md p-3 border-b border-gray-200 sticky top-0 z-40">
      {/* Left Section: Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <Button
          onClick={toggleSidebar}
          className="p-2 bg-teal-400 text-white rounded-md hover:bg-teal-500 transition-all"
        >
          {isMinimized ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </Button>
        <h1 className="text-lg font-semibold text-gray-800">
          Whiteboard Engineering
        </h1>
      </div>

      {/* Right Section: (You can add profile, notifications, etc.) */}
      <div className="flex items-center gap-4">
        <span className="text-gray-600 text-sm">Welcome Back 👋</span>
      </div>
    </header>
  );
};

export default Header;
