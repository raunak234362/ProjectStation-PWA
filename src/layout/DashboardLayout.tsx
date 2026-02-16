import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";

const Layout = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Responsive sidebar behavior
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
    <div
      className="
        flex h-screen w-screen overflow-hidden
        bg-white
        dark:bg-slate-700
        transition-colors duration-300
      "
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex relative z-20 py-2 pl-2">
        <Sidebar
          isMinimized={isMinimized}
          toggleSidebar={toggleSidebar}
          isMobile={false}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className="md:hidden z-50">
        <Sidebar
          isMinimized={!isMobileOpen}
          toggleSidebar={() => setIsMobileOpen(false)}
          isMobile={true}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-h-0 p-2 pl-0 relative z-10">
        <div
          className="
            flex-1 flex flex-col relative overflow-hidden rounded-3xl
            bg-white/75 dark:bg-slate-900/70 backdrop-blur-xl
            border border-green-500/20 dark:border-green-400/20
            shadow-lg
            before:absolute before:inset-0 before:rounded-3xl
            before:bg-linear-to-b before:from-white/30 before:to-transparent
            before:pointer-events-none
            transition-all
          "
        >
          {/* Header */}
          <div className="px-8 pt-6 border-b border-green-500/10">
            <Header
              isMinimized={isMinimized}
              toggleSidebar={toggleSidebar}
            />
          </div>

          {/* Page Content */}
          <main className="flex-1 w-full overflow-y-auto custom-scrollbar ">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
