import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";

const Layout = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close sidebar automatically when resizing from mobile → desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsMinimized((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100/50">
      {/* Sidebar Area - sits on the green background */}
      <div className="hidden md:flex relative z-10">
        <Sidebar
          isMinimized={isMinimized}
          toggleSidebar={toggleSidebar}
          isMobile={false}
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <div
        className={`fixed top-0 left-0 h-full bg-white z-50 transform transition-transform duration-300 md:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <Sidebar
          isMinimized={false}
          toggleSidebar={() => setIsMobileOpen(false)}
          isMobile={true}
        />
      </div>

      {/* Main Content Area - White Card effect with rounded corners on the left */}
      <div className="flex flex-col flex-1 min-h-0 bg-[#f0fdf4] p-4 pl-0">
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col relative">

          {/* Optional: If Header is needed globally, it goes here inside the white card */}
          <div className="px-8 pt-6">
            <Header isMinimized={isMinimized} toggleSidebar={toggleSidebar} />
          </div>

          <main className="flex-1 w-full overflow-y-auto custom-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
