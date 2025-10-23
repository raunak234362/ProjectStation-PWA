import { NavLink, useNavigate } from "react-router-dom";
import LOGO from "../assets/logo.png";
import SmallLogo from "../assets/logo.png"
import {
  ChartCandlestick,
  Home,
  MessageSquare,
  RefreshCw,
  User2,
  Hourglass,
  LogOut,
  FolderOpenDot,
} from "lucide-react";
import { useSelector } from "react-redux";
import Button from "./fields/Button";
import type { UserData } from "../interface";
import type { JSX } from "react";

interface SidebarProps {
  refresh: () => void;
  isMinimized: boolean;
}

interface NavItem {
  label: string;
  to: string;
  icon: JSX.Element;
  roles: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ refresh, isMinimized }) => {
  const userData = useSelector(
    (state: any) => state?.userdata?.userDetail
  ) as UserData | null;

  const navigate = useNavigate();
  const userType = sessionStorage.getItem("userType")?.toLowerCase() || "";

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
    roles.includes(userType.toLowerCase());

  const fetchLogout = (): void => {
    try {
      sessionStorage.removeItem("userType");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("socketId");
      sessionStorage.removeItem("userId");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className={`h-screen bg-white/70 border-r-4 rounded-lg border-gray-200 text-black transition-all duration-300 flex flex-col ${
        isMinimized ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-4 border-b border-gray-200">
        {!isMinimized ? (
          <img src={LOGO} alt="Logo" className="w-36" />
        ) : (
          <img src={SmallLogo} alt="Logo" className="w-12" />
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-2">
          <ul className="flex flex-col gap-3">
            {navItems.map(
              ({ label, to, roles, icon }) =>
                canView(roles) && (
                  <li key={label}>
                    <NavLink
                      to={to}
                      end={to === "/dashboard"}
                      className={({ isActive }) =>
                        isActive
                          ? `flex items-center text-white bg-teal-400/50 py-2 px-3 rounded-md w-full ${
                              isMinimized ? "justify-center" : "justify-start"
                            }`
                          : `text-black hover:text-white hover:bg-teal-200 py-2 px-3 rounded-md flex items-center w-full ${
                              isMinimized ? "justify-center" : "justify-start"
                            }`
                      }
                    >
                      <div className="text-teal-500 flex-shrink-0">{icon}</div>
                      {!isMinimized && <div className="ml-3">{label}</div>}
                    </NavLink>
                  </li>
                )
            )}
          </ul>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 flex flex-col items-start border-t border-gray-200">
        {!isMinimized && (
          <div>
            <div className="text-center text-base font-semibold truncate w-full">
              {userData
                ? `${userData.firstName ?? ""} ${userData.middleName ?? ""} ${
                    userData.lastName ?? ""
                  }`.trim()
                : "User"}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              {userData?.role?.toUpperCase() || userType.toUpperCase()}
            </div>
            <div className="text-xs text-gray-500 mb-2">Version - 1.4.0</div>
          </div>
        )}

        <div
          className={`flex ${
            isMinimized ? "flex-col" : "flex-row"
          } gap-2 w-full justify-center items-center px-4`}
        >
          <Button onClick={fetchLogout} className="p-1 bg-teal-400 text-white">
            {isMinimized ? <LogOut size={20} /> : "Logout"}
          </Button>
          <Button onClick={refresh} className="p-1 bg-teal-400 text-white">
            <RefreshCw size={20} />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
