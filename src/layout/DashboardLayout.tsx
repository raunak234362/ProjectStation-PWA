import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";

const Layout = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleSidebar = () => setIsMinimized((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isMinimized={isMinimized}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex flex-col flex-1">
        <Header isMinimized={isMinimized} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
