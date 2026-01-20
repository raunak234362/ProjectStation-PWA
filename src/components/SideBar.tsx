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
  isMinimized: boolean; // desktop: collapsed, mobile: open/close
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
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      {/* BACKDROP (mobile only, when sidebar open) */}
      {isMobile && !isMinimized && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40
        h-screen flex flex-col bg-background
        transition-transform duration-300 ease-in-out
        ${isMinimized ? "w-24" : "w-72"}
        ${
          isMobile
            ? isMinimized
              ? "-translate-x-full"
              : "translate-x-0 shadow-2xl"
            : "translate-x-0"
        }`}
      >
        {/* HEADER */}
        <div
          className={`sticky top-0 z-30 bg-background
          flex items-center pt-6 pb-2 px-6
          ${
            isMobile
              ? "justify-between"
              : isMinimized
              ? "justify-center"
              : "justify-start"
          }`}
        >
          <div className="flex items-center w-full justify-center">
            {!isMinimized ? (
              <img
                src={LOGO}
                alt="Logo"
                className="bg-white w-56 object-contain rounded-3xl drop-shadow-sm"
              />
            ) : (
              <img
                src={SLOGO}
                alt="Logo"
                className="bg-white w-16 object-contain p-1 rounded-3xl drop-shadow-sm"
              />
            )}
          </div>

          {isMobile && (
            <Button
              onClick={toggleSidebar}
              className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
            >
              <X size={22} />
            </Button>
          )}
        </div>

        {/* NAV (scrollable) */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          <ul className="flex flex-col gap-0.5 w-full pl-4">
            {navItems.map(
              ({ label, to, roles, icon }) =>
                canView(roles) && (
                  <li key={label} className="relative group">
                    <NavLink
                      to={
                        label === "Dashboard" &&
                        (userRole === "sales" ||
                          userRole === "sales_manager")
                          ? "/dashboard/sales"
                          : to
                      }
                      end={to === "/dashboard"}
                      onClick={isMobile ? toggleSidebar : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-4 py-2.5 transition-all duration-200 font-bold text-md tracking-wide relative 
                        ${
                          isActive
                            ? "bg-white text-green-500 rounded-l-[30px] shadow-sm pl-6 z-20"
                            : "text-white/80 hover:text-background hover:bg-white/80 rounded-l-[30px] pl-6"
                        } ${
                          isMinimized
                            ? "justify-center px-0 w-14 h-14 mx-auto rounded-xl! pl-0!"
                            : ""
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {!isMinimized && isActive && (
                            <>
                              <div className="absolute right-0 -top-5 w-5 h-5 rounded-br-3xl shadow-[5px_5px_0_5px_#f9fafb]" />
                              <div className="absolute right-0 -bottom-5 w-5 h-5 rounded-tr-[20px] shadow-[5px_-5px_0_5px_#f9fafb]" />
                            </>
                          )}
                          <div className="relative z-20">{icon}</div>
                          {!isMinimized && (
                            <span className="relative z-20">{label}</span>
                          )}
                        </>
                      )}
                    </NavLink>

                    {/* tooltip */}
                    {isMinimized && !isMobile && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 hidden group-hover:flex">
                        <span className="bg-gray-800 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-xl">
                          {label}
                        </span>
                      </div>
                    )}
                  </li>
                )
            )}
          </ul>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-background p-6 z-30">
          {!isMinimized && (
            <div className="flex items-center gap-4 mb-4 bg-white/10 p-3 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-700 font-extrabold text-lg">
                {sessionStorage.getItem("username")?.[0] || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">
                  {sessionStorage.getItem("username")}
                </p>
                <p className="text-[10px] text-green-100 font-bold uppercase truncate opacity-80">
                  {userData?.role || userRole}
                </p>
              </div>
            </div>
          )}

          <Button
            className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all ${
              isMinimized
                ? "justify-center bg-white/10 text-white hover:bg-white/20"
                : "justify-start px-6 bg-white/10 text-white hover:bg-white/20"
            }`}
            onClick={fetchLogout}
          >
            <LogOut size={20} />
            {!isMinimized && <span className="font-bold text-sm">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
