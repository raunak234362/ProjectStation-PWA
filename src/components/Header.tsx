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
    <header className="flex items-center justify-between w-full py-1 px-2 rounded-xl z-20 sticky top-0 border border-white/25 shadow-xl bg-white backdrop-blur-3xl backdrop-saturate-150 ring-1 ring-white/20 [box-shadow:0_8px_32px_0_rgba(31,38,135,0.20)] transition-all duration-300 text-xl dark:bg-gray-900 dark:border-gray-700">
      {/* Left: Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <Button onClick={toggleSidebar}>
          {isMinimized ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </Button>
        <p className="text-sm md:text-2xl font-bold text-green-600 uppercase">
          {headerTitle}
        </p>
      </div>

      {/* Right: Greeting */}
      <div className="flex items-center gap-4">
        <span className="text-green-600/90 text-sm hidden sm:block">
          Welcome Back 👋
        </span>
        <Bell />
      </div>
    </header>
  );
};

export default Header;
