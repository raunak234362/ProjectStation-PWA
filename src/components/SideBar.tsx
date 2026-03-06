/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LOGO from "../assets/logo.png";
import SLOGO from "../assets/mainLogoS.png";
import { navItems } from "../constants/navigation";
import { LogOut, X } from "lucide-react";

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
        h-full flex flex-col bg-white border-r border-gray-100 transition-all duration-300
        z-[100]
        ${isMobile
          ? `fixed inset-y-0 left-0 w-72 transform shadow-2xl ${isMinimized ? "-translate-x-full" : "translate-x-0"
          }`
          : `relative ${isExpanded ? "w-64" : "w-20"}`
        }
      `}
    >
      {/* Header / Logo */}
      <div
        className={`flex items-center ${isMobile
          ? "justify-between px-6"
          : isExpanded
            ? "justify-center"
            : "justify-center"
          }`}
      >
        <div className="flex items-center justify-center transition-all duration-300">
          {isExpanded ? (
            <img
              src={LOGO}
              alt="Logo"
              className="h-24 w-auto object-contain transition-all duration-300"
            />
          ) : (
            <img
              src={SLOGO}
              alt="Logo"
              className="h-8 w-8 object-contain transition-all duration-300"
            />
          )}
        </div>

        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-black hover:bg-gray-100 transition-colors rounded-lg"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-2 flex flex-col overflow-y-auto sidebar-scrollbar px-2 space-y-1">
        <nav className="flex flex-col gap-0.5 w-full">
          {navItems.map(
            ({ label, to, roles, icon }) =>
              canView(roles) && (
                <div key={label} className="relative group">
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
                      `flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg transition-all duration-200 relative
                      ${isActive
                        ? "bg-gray-50 text-black border border-black/10 border-l-[4px] border-l-[#6bbd45]"
                        : "text-black hover:bg-gray-50 hover:text-black hover:border-y hover:border-r hover:border-black/10 hover:border-l-[4px] hover:border-l-[#6bbd45] border border-transparent border-l-[4px] border-l-transparent"
                      } ${!isExpanded ? "justify-center px-0 w-10 h-10 mx-auto border-none p-0 bg-transparent" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`transition-colors duration-200 ${isActive ? "text-black" : "text-black group-hover:text-black"
                            }`}
                        >
                          {icon}
                        </div>
                        {isExpanded && (
                          <span className="truncate tracking-wide">
                            {label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Tooltip for minimized state */}
                  {!isExpanded && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded shadow-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      {label}
                    </div>
                  )}
                </div>
              ),
          )}
        </nav>
      </div>

      {/* User & Actions Footer */}
      <div className="p-4 mt-auto border-t border-gray-100">
        {isExpanded && (
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold text-sm">
              {sessionStorage.getItem("username")?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-lg font-bold text-black truncate">
                {sessionStorage.getItem("firstName")}
              </p>
              <p className="text-xs uppercase tracking-wider text-black font-semibold truncate">
                {sessionStorage.getItem("userDesignation")}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            className={`w-full flex items-center gap-3 py-2 rounded-full transition-all text-black bg-[#6bbd45]/10 border border-black/20 text-xs font-black uppercase tracking-widest hover:bg-[#6bbd45]/20
              ${isExpanded ? "justify-start px-6" : "justify-center px-0"}`}
            onClick={() => window.location.reload()}
          >
            <div className={`transition-transform duration-700 ${!isExpanded ? "" : "group-hover:rotate-180"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
            </div>
            {isExpanded && <span>Refresh</span>}
          </button>

          <button
            className={`w-full flex items-center gap-3 py-2 rounded-full transition-all text-black bg-white border border-black/20 text-xs font-black uppercase tracking-widest hover:bg-gray-50
              ${isExpanded ? "justify-start px-6" : "justify-center px-0"}`}
            onClick={fetchLogout}
          >
            <LogOut size={14} strokeWidth={3} />
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
