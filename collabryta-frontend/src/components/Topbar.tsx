import React, { useEffect, useState, useRef } from "react";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
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
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-zinc-200 sticky top-0 z-30">
      {/* Search Section */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center w-full max-w-sm bg-zinc-100/50 border border-zinc-200 px-3 py-2 rounded-lg focus-within:bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-100 transition-all duration-200 group">
          <Search size={16} className="text-zinc-400 mr-2 group-focus-within:text-zinc-600 transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm font-medium w-full text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg transition-all duration-200 ${showNotifications ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 shadow-xl rounded-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <h3 className="text-sm font-semibold text-zinc-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 border-b border-zinc-50 cursor-pointer transition-colors flex gap-3 items-start ${!notif.is_read ? "bg-indigo-50/30" : "hover:bg-zinc-50"
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.is_read ? "bg-indigo-100 text-indigo-600" : "bg-zinc-100 text-zinc-400"
                            }`}
                        >
                          <Bell size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 leading-tight mb-1">
                            {notif.title}
                          </p>
                          <p className="text-xs text-zinc-500 line-clamp-2">
                            {notif.description}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-1.5">
                            {new Date(notif.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <Bell className="text-zinc-300 mx-auto mb-2" size={24} />
                      <p className="text-xs text-zinc-500">No new notifications</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="h-6 w-px bg-zinc-200 mx-1" />

        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-lg hover:bg-zinc-50 transition-colors group"
        >
          <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-white shadow-sm">
            {user?.name ? getInitials(user.name) : "U"}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-zinc-900 leading-none">
              {user?.name || "User"}
            </p>
          </div>
          <ChevronDown size={14} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
