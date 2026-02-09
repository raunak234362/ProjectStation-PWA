import { Menu, ChevronLeft, Bell, Sun, Moon } from "lucide-react";
import Button from "./fields/Button";
import { useLocation } from "react-router-dom";
import { navItems } from "../constants/navigation";
import { useTheme } from "../context/ThemeContext";

interface HeaderProps {
  isMinimized: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMinimized, toggleSidebar }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Find the active tab label
  const activeTab = navItems.find((item) => {
    const fullPath = item.to.startsWith("/")
      ? item.to
      : `/dashboard/${item.to}`;
    return location.pathname === fullPath;
  });

  const headerTitle = activeTab ? activeTab.label : "Whiteboard Technologies";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full py-3 px-6 bg-white dark:bg-slate-900 rounded-2xl mb-4 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
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
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold text-green-600 uppercase tracking-widest leading-none">
              {headerTitle}
            </h1>
          </div>
          <div className="flex-col items-end hidden sm:flex">
            <span className="text-md md:text-lg font-medium text-gray-800 dark:text-slate-200 tracking-widest">
              Welcome Back,
              <span className="ml-1 text-md md:text-lg  text-green-500 tracking-widest uppercase">
                {sessionStorage.getItem("username") || "User"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Greeting & Theme & Notifications */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm group"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <Moon size={22} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
          ) : (
            <Sun size={22} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
          )}
        </button>

        <button className="relative p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all shadow-sm group">
          <Bell
            size={25}
            strokeWidth={2.5}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
