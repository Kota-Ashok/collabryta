import React, { useState, useEffect } from "react";
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

  useEffect(() => {
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
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full lg:ml-72 transition-all duration-300">
        <Topbar
          isSidebarOpen={isSidebarOpen}
          onMenuClick={() => setSidebarOpen((p) => !p)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-zinc-50/50 flex flex-col">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"
          >
            <Outlet />
          </motion.div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
