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
        <div className="hidden md:flex relative z-20 py-2 pl-2">
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
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {!isModalOpen && (
        <div className="md:hidden z-50">
          <Sidebar
            isMinimized={!isMobileOpen}
            toggleSidebar={() => setIsMobileOpen(false)}
            isMobile={true}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 min-h-0 ${isModalOpen ? "p-0" : "p-2 pl-0"} relative z-10`}
      >
        <div
          className={`
            flex-1 flex flex-col relative overflow-hidden ${isModalOpen ? "rounded-none" : "rounded-3xl"}
            bg-white
            ${isModalOpen ? "" : "border border-green-500 shadow-sm"}
            transition-all
          `}
        >
          {/* Header */}
          <div className="px-8 pt-6 border-b border-green-500/10">
            <Header isMinimized={isMinimized} toggleSidebar={toggleSidebar} />
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
