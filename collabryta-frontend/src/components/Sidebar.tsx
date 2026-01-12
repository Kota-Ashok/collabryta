import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  CalendarDays,
  FileUp,
  ClipboardList,
  LogOut,
  Users,
  Settings,
  Video,
  Sparkles,
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
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-4 left-4 z-50 h-[calc(100vh-32px)] w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 transform transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-[calc(100%+32px)]"
          } lg:translate-x-0 flex flex-col`}
      >
        {/* Brand Section */}
        <div
          className="p-6 flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-slate-200">
            <Sparkles size={16} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Collabryta.</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">

          {navItems.map(({ label, icon: Icon, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  onClose();
                }}
                className={`w-full group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${active
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-500 hover:text-blue-600 hover:bg-slate-50 font-medium"
                  }`}
              >
                <div className={`p-1.5 rounded-md transition-all duration-300 ${active ? "bg-white shadow-sm" : "group-hover:bg-white/50"}`}>
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.5 : 2}
                    className={`${active ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"
                      } transition-colors`}
                  />
                </div>
                <span className="text-xs">{label}</span>
                {active && (
                  <motion.div
                    layoutId="sidebar-active-dot"
                    className="ml-auto w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 mt-auto border-t border-slate-100">
          <button
            onClick={() => {
              authService.logout();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-300"
          >
            <div className="p-1.5 rounded-md group-hover:bg-white">
              <LogOut size={16} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
