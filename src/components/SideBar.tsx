/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LOGO from "../assets/logo.png";
import SLOGO from "../assets/mainLogoS.png";
import { navItems } from "../constants/navigation";
import { LogOut, X, RefreshCw } from "lucide-react";

interface SidebarProps {
  isMinimized: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMinimized,
  toggleSidebar,
  isMobile = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const navigate = useNavigate();
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

  const canView = (roles: string[]): boolean =>
    roles.includes(userRole.toLowerCase());

  const handleRefresh = (): void => {
    window.location.reload();
  };

  const fetchLogout = (): void => {
    sessionStorage.clear();
    navigate("/");
  };

  const isExpanded = !isMinimized || (isHovered && !isMobile);

  return (
    <aside
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className={`
        h-full flex flex-col transition-all duration-500
        backdrop-blur-xl z-0
        hover:shadow-[#6bbd45]
        ${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-72 transform shadow-2xl ${
                isMinimized ? "-translate-x-full" : "translate-x-0"
              }`
            : `relative rounded-3xl ${isExpanded ? "w-72" : "w-24"}`
        }
      `}
    >
      {/* Header / Logo */}
      <div
        className={`flex items-center ${
          isMobile
            ? "justify-between"
            : isExpanded
              ? "justify-start"
              : "justify-center"
        }`}
      >
        <div className="flex items-center w-full justify-center group">
          {isExpanded ? (
            <img
              src={LOGO}
              alt="Logo"
              className="bg-white w-56 object-contain rounded-3xl  group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <img
              src={SLOGO}
              alt="Logo"
              className="bg-white w-20 h-20 object-contain p-2 rounded-2xl  group-hover:rotate-12 transition-all duration-500"
            />
          )}
        </div>

        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-900 dark:text-white hover:bg-white/10 transition-colors rounded-lg"
          >
            <X size={22} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 flex flex-col overflow-y-auto sidebar-scrollbar">
        <nav className="flex flex-col gap-4 w-full px-4">
          {navItems.map(
            ({ label, to, roles, icon }) =>
              canView(roles) && (
                <div key={label} className="group relative">
                  <NavLink
                    to={
                      label === "Dashboard"
                        ? userRole === "sales" || userRole === "sales_manager"
                          ? "/dashboard/sales"
                          : userRole === "client" || userRole === "client_admin"
                            ? "/dashboard/client"
                            : to
                        : to
                    }
                    end={
                      to === "/dashboard" &&
                      userRole !== "client" &&
                      userRole !== "client_admin" &&
                      userRole !== "sales" &&
                      userRole !== "sales_manager"
                    }
                    onClick={isMobile ? toggleSidebar : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-4 py-3.5 transition-all duration-500 text-sm font-black tracking-tight relative overflow-hidden
                      ${
                        isActive
                          ? " text-black bg-gray-300 border-2 border-[#6bbd45] rounded-2xl px-6 scale-105 z-10"
                          : "text-gray-900 border border-[#6bbd45] dark:text-gray-100 hover:bg-white/10 hover:text-black dark:hover:text-white px-6 rounded-2xl hover:translate-x-1"
                      } ${isExpanded ? "" : "justify-center w-14 h-14 mx-auto rounded-2xl shadow-md px-0"}`
                    }
                  >
                    {/* Rolling Hover Background Effect */}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-10" />
                    <div
                      className={`${isExpanded ? "" : "scale-125"} shrink-0 transition-transform duration-500 group-hover:rotate-12`}
                    >
                      {icon}
                    </div>
                    {isExpanded && (
                      <span className="truncate uppercase tracking-wider">
                        {label}
                      </span>
                    )}
                  </NavLink>

                  {/* Tooltip for minimized state */}
                  {!isExpanded && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-[#22c55e] text-white text-[10px] font-black rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.2)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 uppercase tracking-widest">
                      {label}
                    </div>
                  )}
                </div>
              ),
          )}
        </nav>
      </div>

      {/* User & Actions Footer */}
      <div className="p-6 mt-auto">
        {isExpanded && (
          <div className="flex items-center gap-4 mb-8 bg-black/20 dark:bg-white/10 p-4 rounded-3xl border border-white/5 backdrop-blur-md shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-green-500 flex items-center justify-center text-[#22c55e] dark:text-white font-black text-xl shadow-[0_5px_15px_rgba(0,0,0,0.15)]">
              {sessionStorage.getItem("username")?.[0] || "U"}
            </div>
            <div className="overflow-hidden text-gray-900 dark:text-gray-100">
              <p className="text-sm truncate uppercase tracking-widest">
                {sessionStorage.getItem("firstName")}
              </p>
              <p className="text-[10px] uppercase tracking-widest truncate opacity-80 font-bold">
                {sessionStorage.getItem("userDesignation")}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            className={`w-full flex items-center gap-3 py-3 rounded-2xl transition-all text-gray-900 dark:text-gray-100 hover:bg-white/20 hover:text-black dark:hover:text-white text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md group
              ${isExpanded ? "justify-start px-6" : "justify-center px-0"}`}
            onClick={handleRefresh}
          >
            <RefreshCw
              size={18}
              className="group-hover:rotate-180 transition-transform duration-700"
            />
            {isExpanded && <span>Refresh</span>}
          </button>

          <button
            className={`w-full flex items-center gap-3 py-3 rounded-2xl transition-all text-gray-900 dark:text-gray-100 hover:bg-red-500/30 hover:text-red-900 dark:hover:text-red-100 text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md
              ${isExpanded ? "justify-start px-6" : "justify-center px-0"}`}
            onClick={fetchLogout}
          >
            <LogOut size={18} />
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
