import { ChevronLeft, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { navItems } from "../constants/navigation";
import NotificationPopup from "./NotificationPopup";

interface HeaderProps {
  isMinimized: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isMinimized, isMobileOpen }) => {
  const location = useLocation();

  // Find the active tab label
  const activeTab = navItems.find((item) => {
    const fullPath = item.to.startsWith("/")
      ? item.to
      : `/dashboard/${item.to}`;
    return location.pathname === fullPath;
  });

  const headerTitle = activeTab ? activeTab.label : "Dashboard";

  // Use Menu icon on mobile when closed, or on desktop when minimized
  const isMobile = window.innerWidth < 768;
  const showMenuIcon = isMobile ? !isMobileOpen : isMinimized;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full py-1.5 px-3 sm:py-2.5 sm:px-6 bg-transparent transition-all duration-300 gap-4">
      {/* Left: Sidebar Toggle & Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white text-black border border-black/5 rounded-lg hover:bg-gray-50 transition-all shadow-sm shrink-0"
        >
          {showMenuIcon ? (
            <Menu size={18} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={18} strokeWidth={2.5} />
          )}
        </button>
        <h1 className="text-sm sm:text-xl font-black text-black uppercase tracking-tight truncate">
          {headerTitle}
        </h1>
      </div>

      {/* Right: Greeting & Notifications */}
      <div className="flex items-center gap-3 shrink-0">
        <NotificationPopup />
      </div>
    </header>
  );
};

export default Header;
