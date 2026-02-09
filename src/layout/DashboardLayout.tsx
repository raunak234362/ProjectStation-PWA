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
      if (window.innerWidth < 768) {
        setIsMobileOpen(false);
      } else if (window.innerWidth >= 768 && window.innerWidth < 1200) {
        setIsMinimized(true);
      } else {
        setIsMinimized(false);
      }
    };
    handleResize();
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
    // Reverted to Brand Green Background
    <div className="flex h-screen w-screen overflow-hidden bg-[#6bbd45] dark:bg-green-950 transition-colors duration-300">
      {/* Sidebar Area */}
      <div className="hidden md:flex relative z-0 py-6 pl-6">
        <Sidebar
          isMinimized={isMinimized}
          toggleSidebar={toggleSidebar}
          isMobile={false}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sidebar
          isMinimized={!isMobileOpen}
          toggleSidebar={() => setIsMobileOpen(false)}
          isMobile={true}
        />
      </div>

      {/* Main Content Area - "Floating Island" effect */}
      <div className="flex flex-col flex-1 min-h-0 bg-transparent p-0 md:p-2 md:pl-2 relative z-10">
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-3xl shadow-3xl overflow-hidden flex flex-col relative transition-all border border-white/50 dark:border-slate-800 backdrop-blur-sm">

          {/* Optional: If Header is needed globally, it goes here */}
          <div className="px-8 pt-6">
            <Header isMinimized={isMinimized} toggleSidebar={toggleSidebar} />
          </div>

          <main className="flex-1 w-full overflow-y-auto custom-scrollbar px-8 pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
