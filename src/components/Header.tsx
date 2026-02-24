import { ChevronLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { navItems } from "../constants/navigation";
import NotificationPopup from "./NotificationPopup";

interface HeaderProps {
  isMinimized: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();

  // Find the active tab label
  const activeTab = navItems.find((item) => {
    const fullPath = item.to.startsWith("/")
      ? item.to
      : `/dashboard/${item.to}`;
    return location.pathname === fullPath;
  });

  const headerTitle = activeTab ? activeTab.label : "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full py-4 px-8 bg-transparent transition-all duration-300">
      {/* Left: Sidebar Toggle & Title */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center bg-white text-black border border-black/10 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-black text-black uppercase tracking-tight">
          {headerTitle}
        </h1>
      </div>

      {/* Right: Greeting & Theme & Notifications */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        {/* <button
          onClick={toggleTheme}
          className="p-2.5 bg-green-50 text-gray-600 hover:bg-green-100 rounded-xl transition-all shadow-sm group"
          title={
            theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
          }
        >
          {theme === "light" ? (
            <Moon
              size={22}
              strokeWidth={2.5}
              className="group-hover:rotate-12 transition-transform"
            />
          ) : (
            <Sun
              size={22}
              strokeWidth={2.5}
              className="group-hover:rotate-90 transition-transform"
            />
          )}
        </button> */}

        {/* Notification Bell */}
        <NotificationPopup />
      </div>
    </header>
  );
};

export default Header;
