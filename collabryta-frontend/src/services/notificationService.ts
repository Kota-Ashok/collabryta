import api from './api';

export interface Notification {
    id: number;
    title: string;
    description: string;
    created_at: string;
    is_read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
    user_id: number;
}

export const notificationService = {
    getNotifications: async (skip: number = 0, limit: number = 20): Promise<Notification[]> => {
        const response = await api.get(`/notifications/?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    markAsRead: async (id: number): Promise<Notification> => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<void> => {
        await api.put(`/notifications/read-all`);
    }
};
