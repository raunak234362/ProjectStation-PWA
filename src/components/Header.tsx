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
    <header className="flex items-center justify-between w-full py-5 px-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
      {/* Left: Sidebar Toggle & Title */}
      <div className="flex items-center gap-5">
        <Button
          onClick={toggleSidebar}
          className="w-11 h-11 flex items-center justify-center bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-[0_8px_20px_-4px_rgba(34,197,94,0.4)]"
        >
          {isMinimized ? <Menu size={20} strokeWidth={2.5} /> : <ChevronLeft size={24} strokeWidth={3} />}
        </Button>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-green-600 uppercase tracking-tight leading-none drop-shadow-sm">
            {headerTitle}
          </h1>
        </div>
      </div>

      {/* Right: Greeting & Notifications */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-base font-extrabold text-gray-800 tracking-tight">
            Welcome Back ,
       
          <span className="text-base font-bold text-green-500 tracking-wide uppercase">
              {sessionStorage.getItem("firstName") || "User"} 
          </span>
          </span>
        </div>
        <button className="relative p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-[1rem] transition-all shadow-sm group">
          <Bell size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
