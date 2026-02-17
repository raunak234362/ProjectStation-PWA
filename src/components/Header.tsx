import { Menu, ChevronLeft } from "lucide-react";
import Button from "./fields/Button";
import { useLocation } from "react-router-dom";
import { navItems } from "../constants/navigation";
import NotificationPopup from "./NotificationPopup";

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

  const headerTitle = activeTab ? activeTab.label : "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full py-3 px-6 bg-white rounded-2xl mb-4 border border-black shadow-md transition-all duration-300">
      {/* Left: Sidebar Toggle & Title */}
      <div className="flex items-center gap-4">
        <Button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-900 border border-gray-200 rounded-xl hover:bg-white hover:border-[#6bbd45] hover:text-[#6bbd45] transition-all shadow-sm group"
        >
          {isMinimized ? (
            <Menu size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft size={20} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
          )}
        </Button>
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-widest leading-none">
              {headerTitle}
            </h1>
          </div>
          <div className="flex-col items-end hidden sm:flex">
            <span className="text-md md:text-lg font-medium text-gray-800 tracking-widest">
              Welcome Back,
              <span className="ml-1 text-md md:text-lg  text-green-500 tracking-widest uppercase">
                {sessionStorage.getItem("firstName") || ""}{" "}
                {sessionStorage.getItem("lastName") || ""}
                {!sessionStorage.getItem("firstName") &&
                  !sessionStorage.getItem("lastName") &&
                  (sessionStorage.getItem("username") || "User")}
              </span>
            </span>
          </div>
        </div>
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
