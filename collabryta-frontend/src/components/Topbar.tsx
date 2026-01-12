import React, { useEffect, useState, useRef } from "react";
import { Menu, Search, Bell, Sparkles, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { User } from "../services/userService";
import { useNotifications } from "../context/NotificationContext";
import { AnimatePresence, motion } from "framer-motion";

interface TopbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between px-6 py-3 transition-all duration-500">
      {/* Search Section */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-slate-200"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center w-full max-w-sm bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300 group">
          <Search size={18} className="text-slate-400 mr-3 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Quick search (Ctrl + K)"
            className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        {/* Pro Badge */}


        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-xl transition-all duration-300 ${showNotifications ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 bg-white hover:bg-slate-50 hover:text-blue-600 border border-slate-200"
              }`}
          >
            <Bell size={20} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border-2 ${showNotifications ? 'bg-white border-blue-600' : 'bg-rose-500 border-white'}`} />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 5, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl z-50 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">You have {unreadCount} new updates</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-5 border-b border-slate-50 cursor-pointer transition-all flex gap-4 items-start ${!notif.is_read ? "bg-blue-50/30" : "hover:bg-slate-50"
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.is_read ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Bell size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 leading-tight mb-1">
                            {notif.title}
                          </p>
                          <p className="text-[12px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                            {notif.description}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            {new Date(notif.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                        <Bell className="text-slate-300" size={28} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">All caught up!</h4>
                      <p className="text-xs text-slate-400 font-medium mt-1">No new notifications for now.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-3 p-1.5 pr-4 transition-all duration-300 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 group shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200 transition-transform group-hover:scale-105">
            {user?.name ? getInitials(user.name) : "U"}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none mb-1">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {user?.role || "Member"}
            </p>
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
