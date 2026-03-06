import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import { useSelector } from "react-redux";

const Layout = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { activeModalCount } = useSelector((state: any) => state.ui);
  const isModalOpen = activeModalCount > 0;

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
        transition-colors duration-300
      "
    >
      {/* Desktop Sidebar */}
      {!isModalOpen && (
        <div className="hidden md:flex relative z-20 py-0 pl-0">
          <Sidebar
            isMinimized={isMinimized}
            toggleSidebar={toggleSidebar}
            isMobile={false}
          />
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar container */}
      {!isModalOpen && (
        <div className="md:hidden">
          <Sidebar
            isMinimized={!isMobileOpen}
            toggleSidebar={() => setIsMobileOpen(false)}
            isMobile={true}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 min-w-0 min-h-0 ${isModalOpen ? "p-0" : "p-2 md:p-3.5"} relative z-50 bg-white`} // Clean white background
      >
        <div
          className={`
            flex-1 flex flex-col relative overflow-hidden ${isModalOpen ? "rounded-none" : "rounded-2xl"}
            bg-white
            transition-all
          `}
        >
          {/* Header */}
          <div className="pb-4">
            <Header isMinimized={isMinimized} isMobileOpen={isMobileOpen} toggleSidebar={toggleSidebar} />
          </div>

          {/* Page Content */}
          <main className="flex-1 w-full overflow-y-auto custom-scrollbar pr-2">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
