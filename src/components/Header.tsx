import React from "react";
import { Menu, ChevronLeft, Bell } from "lucide-react";
import Button from "./fields/Button";
import { useLocation } from "react-router-dom";
import { navItems } from "../constants/navigation";

interface HeaderProps {
  isMinimized: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMinimized, toggleSidebar }) => {
  const location = useLocation();

  // Find the active tab label
  const activeTab = navItems.find((item) => {
    const fullPath = item.to.startsWith("/")
      ? item.to
      : `/dashboard/${item.to}`;
    return location.pathname === fullPath;
  });

  const headerTitle = activeTab ? activeTab.label : "Whiteboard Technologies";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full py-3 px-6 bg-white rounded-2xl mb-4 border border-gray-100 shadow-sm">
      {/* Left: Sidebar Toggle & Title */}
      <div className="flex items-center gap-4">
        <Button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-[0_4px_10px_-2px_rgba(34,197,94,0.4)]"
        >
          {isMinimized ? (
            <Menu size={18} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={20} strokeWidth={3} />
          )}
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-green-600 uppercase tracking-widest leading-none">
            {headerTitle}
          </h1>
        </div>
      </div>

      {/* Right: Greeting & Notifications */}
      <div className="flex items-center gap-3">
        <div className="flex-col items-end hidden sm:flex">
          <span className="text-md font-extrabold text-gray-800 tracking-widest">
            Welcome Back,
            <span className="ml-1 text-md font-bold text-green-500 tracking-widest uppercase">
              {sessionStorage.getItem("username") || "User"}
            </span>
          </span>
        </div>
        <button className="relative p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all shadow-sm group">
          <Bell
            size={20}
            strokeWidth={2.5}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
