/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LOGO from "../assets/logo.png";
import SLOGO from "../assets/mainLogoS.png";
import { navItems } from "../constants/navigation";
import { LogOut, X } from "lucide-react";
import { useSelector } from "react-redux";
import Button from "./fields/Button";
import type { UserData } from "../interface";

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
  const userData = useSelector(
    (state: any) => state?.userInfo?.userDetail,
  ) as UserData | null;

  const navigate = useNavigate();
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase() || "";

  const canView = (roles: string[]): boolean =>
    roles.includes(userRole.toLowerCase());

  const fetchLogout = (): void => {
    try {
      sessionStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // The sidebar is effectively expanded if it's not minimized OR if it's being hovered in desktop view
  const isExpanded = !isMinimized || (isHovered && !isMobile);

  return (
    <aside
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className={`h-full transition-all duration-300 flex flex-col 
        ${isMobile
          ? `fixed inset-y-0 left-0 z-50 bg-[#6bbd45] dark:bg-green-950 shadow-2xl w-72 transform ${isMinimized ? "-translate-x-full" : "translate-x-0"}`
          : `relative rounded-3xl bg-[#6bbd45] dark:bg-green-950 text-white shadow-soft ${isExpanded ? "w-72" : "w-24"}`
        }`}
    >
      {/* Header */}
      <div
        className={`flex items-center pt-6 pb-2 px-6 ${isMobile
          ? "justify-between"
          : !isExpanded
            ? "justify-center"
            : "justify-start"
          }`}
      >
        <div className="flex items-center w-full justify-center">
          {isExpanded ? (
            <img
              src={LOGO}
              alt="Logo"
              className="bg-white dark:bg-white/90 w-56 object-contain rounded-xl drop-shadow-sm transition-all duration-300"
            />
          ) : (
            <img
              src={SLOGO}
              alt="Logo"
              className="bg-white dark:bg-white/90 w-16 object-contain p-1 rounded-xl drop-shadow-sm transition-all duration-300"
            />
          )}
        </div>

        {isMobile && (
          <Button
            onClick={toggleSidebar}
            className="p-2 bg-white/10 text-white rounded-[6px] hover:bg-white/20 transition-colors"
          >
            <X size={22} />
          </Button>
        )}
      </div>

      <div className="flex-1 py-2 flex flex-col overflow-y-auto sidebar-scrollbar overflow-x-hidden">
        <ul className="flex flex-col gap-0.5 w-full pl-4">
          {navItems.map(
            ({ label, to, roles, icon }) =>
              canView(roles) && (
                <li key={label} className="relative group">
                  <NavLink
                    to={
                      label === "Dashboard" &&
                        (userRole === "sales" || userRole === "sales_manager")
                        ? "/dashboard/sales"
                        : to
                    }
                    end={to === "/dashboard"}
                    onClick={isMobile ? toggleSidebar : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-4 py-2.5 transition-all duration-200 text-xl tracking-wide relative 
                      ${isActive
                        ? `bg-white dark:bg-green-600 rounded-[6px] text-green-600 dark:text-white shadow-sm z-20 ${isMobile ? " mx-4 px-4" : "ml-0 pl-6"
                        }`
                        : `text-white rounded-[6px] hover:bg-white/10 ${isMobile ? " mx-4 px-4" : " ml-0 pl-6"
                        }`
                      } ${!isExpanded
                        ? "justify-center px-0 w-14 h-14 mx-auto rounded-[6px]! ml-0! pl-0!"
                        : "w-full"
                      }`
                    }
                  >
                    {() => (
                      <>
                        <div
                          className={`${!isExpanded ? "" : ""} relative z-20`}
                        >
                          {icon}
                        </div>
                        {isExpanded && (
                          <span className="relative z-20 whitespace-nowrap overflow-hidden transition-all duration-300 opacity-100">
                            {label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Tooltip fallback for minimized sidebar (backup if expansion is disabled or restricted) */}
                  {!isExpanded && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                      <div className="bg-gray-900 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-2xl whitespace-nowrap flex items-center gap-2">
                        {label}
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </div>
                    </div>
                  )}
                </li>
              ),
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-6 mt-auto">
        {isExpanded && (
          <div className="flex items-center gap-4 mb-4 bg-white/10 dark:bg-green-900/40 p-3 rounded-2xl border border-white/10 dark:border-green-800/20 backdrop-blur-sm transition-all duration-300 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-green-500 flex items-center justify-center text-green-700 dark:text-white font-extrabold text-lg shadow-sm shrink-0">
              {sessionStorage.getItem("username")?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {sessionStorage.getItem("username")}
              </p>
              <p className="text-[10px] text-green-100 font-bold uppercase tracking-wider truncate opacity-80">
                {userData?.role || userRole}
              </p>
            </div>
          </div>
        )}

        <Button
          className={`w-full flex items-center gap-3 py-3 rounded-2xl transition-all ${!isExpanded
            ? "justify-center bg-white/10 text-white hover:bg-white/20"
            : "justify-start px-6 bg-white/10 text-white hover:bg-white/20"
            }`}
          onClick={fetchLogout}
        >
          <LogOut size={20} />
          {isExpanded && <span className="font-bold text-sm">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
