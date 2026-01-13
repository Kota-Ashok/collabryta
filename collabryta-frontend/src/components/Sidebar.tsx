import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  CalendarDays,
  FileUp,
  ClipboardList,
  LogOut,
  Settings,
  Video,
  Layers,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { authService } from "../services/authService";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Messages", icon: MessageSquare, path: "/messages" },
    { label: "Meetings", icon: Video, path: "/meetings" },
    { label: "Tasks", icon: ClipboardList, path: "/tasks" },
    { label: "Calendar", icon: CalendarDays, path: "/calendar" },
    { label: "Files", icon: FileUp, path: "/files" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 text-zinc-100 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Brand Section */}
        <div
          className="h-16 flex items-center px-6 border-b border-zinc-800 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex items-center gap-2.5">
            <div className="bg-white text-zinc-900 p-1.5 rounded-lg">
              <Layers size={18} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">Collabryta</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">Platform</div>
          {navItems.map(({ label, icon: Icon, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  onClose();
                }}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
              >
                <Icon
                  size={18}
                  strokeWidth={2}
                  className={`${active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                    } transition-colors`}
                />
                {label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => {
              authService.logout();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
