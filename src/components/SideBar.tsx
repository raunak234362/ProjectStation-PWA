/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavLink, useNavigate } from "react-router-dom";
import LOGO from "../assets/logo.png";
import {
  ChartCandlestick,
  Home,
  MessageSquare,
  User2,
  Hourglass,
  LogOut,
  FolderOpenDot,
  X,
  Group,
  LucideComponent,
} from "lucide-react";
import { useSelector } from "react-redux";
import Button from "./fields/Button";
import type { UserData } from "../interface";
import type { JSX } from "react";

interface SidebarProps {
  isMinimized: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
}

interface NavItem {
  label: string;
  to: string;
  icon: JSX.Element;
  roles: string[];
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

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: <Home />,
      roles: [
        "admin",
        "department-manager",
        "deputy-manager",
        "project-manager",
        "client",
        "system-admin",
        "user",
        "estimator",
        "sales",
      ],
    },
    {
      label: "Fabricator",
      to: "fabricator",
      icon: <LucideComponent />,
      roles: [
        "admin",
        "department-manager",
        "deputy-manager",
        "project-manager",
        "client",
        "system-admin",
        "user",
        "estimator",
        "sales",
      ],
    },
    {
      label: "Projects",
      to: "projects",
      icon: <FolderOpenDot />,
      roles: [
        "admin",
        "department-manager",
        "deputy-manager",
        "project-manager",
        "user",
        "human-resource",
      ],
    },
    {
      label: "Tasks",
      to: "tasks",
      icon: <ChartCandlestick />,
      roles: [
        "admin",
        "department-manager",
        "deputy-manager",
        "project-manager",
        "user",
        "system-admin",
        "human-resource",
      ],
    },
    {
      label: "Estimations",
      to: "estimation",
      icon: <Hourglass />,
      roles: ["admin", "department-manager", "deputy-manager", "user"],
    },

    {
      label: "Manage Team",
      to: "manage-team",
      icon: <Group />,
      roles: [
        "admin",
        "department-manager",
        "project-manager",
        "deputy-manager",
        "user",
        "human-resource",
      ],
    },
    {
      label: "Chats",
      to: "chats",
      icon: <MessageSquare />,
      roles: [
        "admin",
        "department-manager",
        "project-manager",
        "deputy-manager",
        "user",
        "human-resource",
      ],
    },
    {
      label: "Profile",
      to: "profile",
      icon: <User2 />,
      roles: [
        "admin",
        "user",
        "client",
        "estimator",
        "sales",
        "deputy-manager",
        "project-manager",
        "department-manager",
        "system-admin",
        "human-resource",
      ],
    },
  ];

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
      className={`h-full rounded-2xl m-auto border-white/25 shadow-xl bg-white border-r backdrop-blur-3xl text-black transition-all duration-300 flex flex-col ${
        isMinimized ? "w-16" : "w-64"
      }`}
      style={{ overflow: "visible" }} // ✅ allows tooltip overflow
    >
      {/* Header */}
      <div
        className={`flex items-center py-1.5 px-4 ${
          isMobile ? "justify-between" : "justify-center"
        }`}
      >
        {!isMinimized ? (
          <img src={LOGO} alt="Logo" className="w-40" />
        ) : (
          <img src={LOGO} alt="Logo" className="w-24" />
        )}

        {isMobile && (
          <Button
            onClick={toggleSidebar}
            className="p-1 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col gap-2 px-2 relative">
          {navItems.map(
            ({ label, to, roles, icon }) =>
              canView(roles) && (
                <li key={label} className="relative group">
                  <NavLink
                    to={to}
                    end={to === "/dashboard"}
                    onClick={isMobile ? toggleSidebar : undefined}
                    className={({ isActive }) =>
                      isActive
                        ? `flex items-center font-semibold text-white bg-linear-to-r from-emerald-200 to-teal-500 py-2 px-3 rounded-md w-full ${
                            isMinimized ? "justify-center" : "justify-start"
                          }`
                        : `text-teal-600 font-semibold hover:text-white hover:bg-linear-to-r hover:from-emerald-100 hover:to-teal-500 py-2 px-3 rounded-md flex items-center w-full ${
                            isMinimized ? "justify-center" : "justify-start"
                          }`
                    }
                  >
                    <div className="text-teal-700">{icon}</div>
                    {!isMinimized && <span className="ml-3">{label}</span>}
                  </NavLink>

                  {/* Tooltip for minimized sidebar */}
                  {isMinimized && (
                    <div className="absolute z-30 -translate-0.5  hidden group-hover:flex">
                      <span className="bg-teal-900 text-white text-[10px] font-medium py-1 px-1 rounded-md shadow-lg whitespace-nowrap">
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
      <div className="p-4 border-t border-gray-200">
        {!isMinimized && (
          <div className="mb-2">
            <p className="text-sm font-semibold truncate">
              {userData
                ? `${userData.firstName ?? ""} ${
                    userData.lastName ?? ""
                  }`.trim()
                : "User"}
            </p>
            <p className="text-xs text-gray-500">
              {userData?.role?.toUpperCase() || userRole.toUpperCase()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Version - 1.4.0</p>
          </div>
        )}

        <div className="flex flex-col justify-center">
          <Button className="" onClick={fetchLogout}>
            {isMinimized ? <LogOut size={18} /> : "Logout"}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
