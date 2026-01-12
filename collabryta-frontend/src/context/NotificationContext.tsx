import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { authService } from '../services/authService';
import { Bell, AlertCircle, X, Shield, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Context interface for managing global application notifications.
 */
interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refresh: () => Promise<void>;
    showToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState<{ title: string; message: string; type: string } | null>(null);

    const showToast = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        setToast({ title, message, type });
        setTimeout(() => setToast(null), 5000);
    }, []);

    const fetchNotifications = useCallback(async (showToastIfNew = false) => {
        if (!authService.isAuthenticated()) return;

        try {
            const data = await notificationService.getNotifications(0, 50);

            if (showToastIfNew && data.length > 0 && notifications.length > 0) {
                // If there's a new notification that wasn't there before
                const latestNew = data[0];
                const alreadyKnown = notifications.some(n => n.id === latestNew.id);
                if (!alreadyKnown && !latestNew.is_read) {
                    showToast(latestNew.title, latestNew.description, latestNew.type);
                }
            }

            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }, [notifications, showToast]);

    const addNotification = useCallback((notification: Notification) => {
        setNotifications(prev => {
            if (prev.some(n => n.id === notification.id)) return prev;
            showToast(notification.title, notification.description, notification.type);
            return [notification, ...prev];
        });
        setUnreadCount(prev => prev + 1);
    }, [showToast]);

    const markAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    useEffect(() => {
        if (authService.isAuthenticated()) {
            fetchNotifications();

            // Setup polling for new notifications every 60 seconds
            const pollInterval = setInterval(() => {
                fetchNotifications(true);
            }, 60000);

            return () => {
                clearInterval(pollInterval);
            };
        }
    }, [fetchNotifications]);

    const getIconForToastType = (type: string) => {
        switch (type) {
            case 'success': return <Shield size={18} className="text-white" />;
            case 'info': return <Activity size={18} className="text-white" />;
            case 'warning': return <Zap size={18} className="text-white" />;
            case 'error': return <AlertCircle size={18} className="text-white" />;
            default: return <Bell size={18} className="text-white" />;
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            refresh: fetchNotifications,
            showToast
        }}>
            {children}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-8 right-8 z-[9999] w-full max-w-[400px]"
                    >
                        <div className="bg-white rounded-[32px] p-6 shadow-2xl shadow-indigo-200/40 border border-slate-100 flex items-start gap-5 relative overflow-hidden group">
                            {/* Decorative accent */}
                            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />

                            <div className={`p-3 rounded-2xl shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                    toast.type === 'error' ? 'bg-rose-50 text-rose-600' :
                                        'bg-indigo-50 text-indigo-600'
                                }`}>
                                {getIconForToastType(toast.type)}
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    {toast.type} notification
                                </p>
                                <h4 className="text-sm font-bold text-slate-900 mb-1 truncate">{toast.title}</h4>
                                <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">{toast.message}</p>
                            </div>
                            <button
                                onClick={() => setToast(null)}
                                className="absolute top-6 right-6 p-1 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
