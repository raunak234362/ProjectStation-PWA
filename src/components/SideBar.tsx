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
    sessionStorage.clear();
    navigate("/");
  };

  const isExpanded = !isMinimized || (isHovered && !isMobile);

  return (
    <aside
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className={`
        h-full flex flex-col transition-all duration-300
        backdrop-blur-xl bg-gray-500/20 dark:bg-slate-900/70
        border border-gray-500/10
        shadow-gray-500/20 shadow-md
        hover:shadow-lg
        ${isMobile
          ? `fixed inset-y-0 left-0 z-50 w-72 transform ${
              isMinimized ? "-translate-x-full" : "translate-x-0"
            }`
          : `relative rounded-3xl ${isExpanded ? "w-72" : "w-24"}`
        }
      `}
    >
      {/* Header */}
      <div
        className={`flex items-center pt-6 pb-2 px-6 ${
          isMobile
            ? "justify-between"
            : isExpanded
              ? "justify-start"
              : "justify-center"
        }`}
      >
        <div className="flex items-center w-full justify-center">
          <img
            src={isExpanded ? LOGO : SLOGO}
            alt="Logo"
            className={`bg-white dark:bg-white/90 rounded-xl drop-shadow-sm transition-all duration-300 ${
              isExpanded ? "w-56" : "w-16 p-1"
            }`}
          />
        </div>

        {isMobile && (
          <Button
            onClick={toggleSidebar}
            className="p-2 bg-white/20 rounded-md hover:bg-white/40"
          >
            <X size={22} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-2 overflow-y-auto sidebar-scrollbar overflow-x-hidden">
        <ul className="flex flex-col gap-1 pl-4">
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
                      `
                      group flex items-center gap-4 py-2.5 transition-all duration-200
                      text-lg relative rounded-lg
                      ${
                        isActive
                          ? "bg-white/80 dark:bg-green-600/80 backdrop-blur-md text-green-600 dark:text-white shadow-md"
                          : "text-primary hover:bg-white/40 hover:translate-x-1 hover:shadow-[0_6px_16px_-6px_rgba(34,197,94,0.45)]"
                      }
                      ${isMobile ? "mx-4 px-4" : "pl-6"}
                      ${
                        !isExpanded
                          ? "justify-center w-14 h-14 mx-auto pl-0"
                          : "w-full"
                      }
                    `
                    }
                  >
                    <div className="transition-transform duration-200 group-hover:scale-110 text-green-600">
                      {icon}
                    </div>

                    {isExpanded && (
                      <span className="whitespace-nowrap font-medium">
                        {label}
                      </span>
                    )}
                  </NavLink>

                  {/* Tooltip (collapsed) */}
                  {!isExpanded && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4
                      opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      <div className="bg-gray-900/90 backdrop-blur-md text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                        {label}
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
          <div className="flex items-center gap-4 mb-4 bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold">
              {sessionStorage.getItem("username")?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold truncate">
                {sessionStorage.getItem("username")}
              </p>
              <p className="text-xs uppercase opacity-70 truncate">
                {userData?.role || userRole}
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={fetchLogout}
          className={`
            w-full flex items-center gap-3 py-3 rounded-2xl transition-all
            bg-white/20 text-primary backdrop-blur-md
            hover:bg-white/40 hover:shadow-[0_8px_20px_-8px_rgba(34,197,94,0.45)]
            ${!isExpanded ? "justify-center" : "px-6"}
          `}
        >
          <LogOut size={20} />
          {isExpanded && <span className="text-sm">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
