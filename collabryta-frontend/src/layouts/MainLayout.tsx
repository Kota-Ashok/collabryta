import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { userService } from "../services/userService";
import { authService } from "../services/authService";

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith("/messages");

  React.useEffect(() => {
    // Initial heartbeat
    if (authService.isAuthenticated()) {
      userService.updateStatus("Online").catch(console.error);
    }

    // Periodic heartbeat every 30 seconds
    const interval = setInterval(() => {
      if (authService.isAuthenticated()) {
        userService.updateStatus("Online").catch(console.error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-500 min-h-screen ${isSidebarOpen ? 'lg:ml-80' : 'lg:ml-80'}`}>
        <div className={`flex flex-col flex-1 ${isMessagesPage ? 'p-0' : 'p-4'}`}>
          <Topbar
            isSidebarOpen={isSidebarOpen}
            onMenuClick={() => setSidebarOpen((p) => !p)}
          />

          <main className={`flex-1 w-full overflow-hidden mt-4 ${isMessagesPage ? 'p-0 bg-transparent shadow-none border-none rounded-none' : 'max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 bg-white/50 backdrop-blur-sm rounded-[32px] border border-slate-200/50 shadow-sm'}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={isMessagesPage ? "h-full" : ""}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
