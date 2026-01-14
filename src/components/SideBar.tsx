/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const userData = useSelector(
    (state: any) => state?.userdata?.userDetail
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

  return (
    <aside
      className={`h-full bg-gradient-to-b from-[#f0fdf4] to-white transition-all duration-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isMinimized ? "w-24" : "w-80"
        } ${isMobile ? "fixed inset-y-0 left-0 z-50 shadow-2xl bg-white" : "relative border-r-0"
        }`}
    >
      {/* Header */}
      <div
        className={`flex items-center pt-8 pb-4 px-6 ${isMobile ? "justify-between" : isMinimized ? "justify-center" : "justify-start pl-8"
          }`}
      >
        {!isMinimized ? (
          <img src={LOGO} alt="Logo" className="w-44 object-contain drop-shadow-sm" />
        ) : (
          <img src={SLOGO} alt="Logo" className="w-12 object-contain drop-shadow-sm" />
        )}

        {isMobile && (
          <Button
            onClick={toggleSidebar}
            className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors shadow-sm"
          >
            <X size={22} />
          </Button>
        )}
      </div>

      {/* Navigation - Optimized for No Scroll */}
      <div className="flex-1 px-4 py-2 flex flex-col justify-center">
        <ul className="flex flex-col gap-1 w-full">
          {navItems.map(
            ({ label, to, roles, icon }) =>
              canView(roles) && (
                <li key={label} className="relative group">
                  <NavLink
                    to={to}
                    end={to === "/dashboard"}
                    onClick={isMobile ? toggleSidebar : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-3 rounded-[1.25rem] transition-all duration-300 font-bold text-[15px] tracking-wide ${isActive
                        ? "bg-green-600 text-white shadow-[0_8px_20px_-6px_rgba(22,163,74,0.5)] scale-[1.02]"
                        : "text-gray-500 hover:bg-green-50 hover:text-green-700 hover:pl-6"
                      } ${isMinimized ? "justify-center px-0 w-14 h-14 mx-auto" : ""}`
                    }
                  >
                    <div className={`${isMinimized ? "" : ""}`}>{icon}</div>
                    {!isMinimized && <span>{label}</span>}
                  </NavLink>

                  {/* Tooltip for minimized sidebar */}
                  {isMinimized && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 hidden group-hover:flex">
                      <span className="bg-green-800 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-xl whitespace-nowrap">
                        {label}
                      </span>
                    </div>
                  )}
                </li>
              )
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-6 mt-auto">
        {!isMinimized && (
          <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-green-50">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-extrabold text-xl shadow-inner">
              {userData?.firstName?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-base font-bold text-gray-800 truncate">
                {userData
                  ? `${userData.firstName ?? ""} ${userData.lastName ?? ""
                    }`.trim()
                  : "User"}
              </p>
              <p className="text-xs text-green-600 font-bold uppercase tracking-wider truncate">
                {userData?.role || userRole}
              </p>
            </div>
          </div>
        )}

        <Button
          className={`w-full flex items-center gap-3 py-3.5 rounded-xl transition-all shadow-sm ${isMinimized
              ? "justify-center bg-red-50 text-red-500 hover:bg-red-100"
              : "justify-start px-6 bg-red-50 text-red-500 hover:bg-red-100 hover:shadow-md"
            }`}
          onClick={fetchLogout}
        >
          <LogOut size={22} />
          {!isMinimized && <span className="font-bold text-sm">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
