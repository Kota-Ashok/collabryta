import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { authService } from '../services/authService';
import { Bell, AlertCircle, X, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: any) => void;
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
    const [user, setUser] = useState<any>(null);

    const showToast = useCallback((title: string, message: string, type: string = 'info') => {
        setToast({ title, message, type });
        setTimeout(() => setToast(null), 6000);
    }, []);

    const fetchNotifications = useCallback(async (showToastIfNew = false) => {
        if (!authService.isAuthenticated()) return;

        try {
            const data = await notificationService.getNotifications(0, 50);

            if (showToastIfNew) {
                setNotifications(prev => {
                    if (data.length > 0 && prev.length > 0) {
                        const latestNew = data[0];
                        const alreadyKnown = prev.some(n => n.id === latestNew.id);
                        if (!alreadyKnown && !latestNew.is_read) {
                            const content = latestNew.description || (latestNew as any).content || (latestNew as any).message || '';
                            showToast(latestNew.title, content, latestNew.type || 'info');
                        }
                    }
                    return data;
                });
            } else {
                setNotifications(data);
            }

            const unread = data.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('[Notifications] Fetch Error:', err);
        }
    }, [showToast]);

    const addNotification = useCallback((payload: any) => {
        const id = payload.id || Date.now();
        const content = payload.description || payload.content || payload.message || '';

        const newNotif: Notification = {
            id,
            title: payload.title || 'Notification',
            description: content,
            type: payload.type || 'info',
            created_at: payload.created_at || new Date().toISOString(),
            is_read: false,
            user_id: user?.id || 0
        };

        setNotifications(prev => {
            if (prev.some(n => n.id === id)) return prev;
            showToast(newNotif.title, content, newNotif.type);
            return [newNotif, ...prev];
        });
        setUnreadCount(prev => prev + 1);
    }, [showToast, user?.id]);

    useEffect(() => {
        const init = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                    fetchNotifications();
                } catch (err) {
                    console.error('[Notifications] Init Error:', err);
                }
            }
        };

        if (authService.isAuthenticated() && !user) {
            init();
        }
    }, [fetchNotifications, user]);

    // Fallback polling (every 2 minutes)
    useEffect(() => {
        const poll = setInterval(() => {
            if (authService.isAuthenticated()) fetchNotifications(true);
        }, 120000);
        return () => clearInterval(poll);
    }, [fetchNotifications]);

    const markAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('[Notifications] Mark Read Error:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('[Notifications] Mark All Read Error:', err);
        }
    };

    const getIconForToastType = (type: string) => {
        switch (type) {
            case 'success': return <Shield size={20} />;
            case 'error': return <AlertCircle size={20} />;
            case 'warning': return <Zap size={20} />;
            default: return <Bell size={20} />;
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
                {
                    toast && (
                        <motion.div
                            initial={{ opacity: 0, x: 100, y: 20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="fixed top-24 right-6 z-[9999] w-full max-w-[380px]"
                        >
                            <div className="relative group overflow-hidden rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-5 flex items-start gap-4 transition-all hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${toast.type === 'success' ? 'bg-gradient-to-b from-emerald-400 to-teal-500' :
                                    toast.type === 'error' ? 'bg-gradient-to-b from-rose-400 to-red-600' :
                                        toast.type === 'warning' ? 'bg-gradient-to-b from-amber-400 to-orange-500' :
                                            'bg-gradient-to-b from-indigo-500 to-blue-600'
                                    }`} />

                                <div className={`shrink-0 p-3 rounded-xl ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                    toast.type === 'error' ? 'bg-rose-50 text-rose-600' :
                                        toast.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                            'bg-indigo-50 text-indigo-600'
                                    }`}>
                                    {getIconForToastType(toast.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${toast.type === 'success' ? 'text-emerald-600' :
                                            toast.type === 'error' ? 'text-rose-600' :
                                                toast.type === 'warning' ? 'text-amber-600' :
                                                    'text-indigo-600'
                                            }`}>
                                            {toast.type || 'info'} alert
                                        </span>
                                        <button
                                            onClick={() => setToast(null)}
                                            className="text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1">
                                        {toast.title}
                                    </h4>
                                    <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-3">
                                        {toast.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </NotificationContext.Provider >
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
