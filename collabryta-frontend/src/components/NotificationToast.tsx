import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export interface Notification {
    id: number | string;
    title: string;
    description?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    created_at?: string;
}

interface NotificationToastProps {
    notification: Notification | null;
    onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification) return null;

    const iconMap = {
        info: <Info className="text-blue-500" size={20} />,
        success: <CheckCircle className="text-green-500" size={20} />,
        warning: <AlertTriangle className="text-yellow-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
    };

    const bgColorMap = {
        info: 'bg-blue-50 border-blue-200',
        success: 'bg-green-50 border-green-200',
        warning: 'bg-yellow-50 border-yellow-200',
        error: 'bg-red-50 border-red-200',
    };

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '50%' }}
                    animate={{ opacity: 1, y: 20, x: '50%' }}
                    exit={{ opacity: 0, scale: 0.95, x: '50%' }}
                    className={`fixed top-0 right-1/2 translate-x-1/2 z-[9999] min-w-[320px] max-w-[450px] p-4 rounded-xl border shadow-2xl ${bgColorMap[notification.type || 'info']} flex items-start gap-3 backdrop-blur-md`}
                >
                    <div className="mt-1">
                        {iconMap[notification.type || 'info']}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm">{notification.title}</h4>
                        {notification.description && (
                            <p className="text-gray-600 text-xs mt-1 leading-relaxed">{notification.description}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X size={16} className="text-gray-400" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationToast;
