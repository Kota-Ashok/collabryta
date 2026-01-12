import api from './api';

export interface User {
    id: number;
    email: string;
    name: string;
    is_active: boolean;
    role?: string;
    avatar?: string;
    status: 'Online' | 'Offline' | 'Away';
    last_seen?: string;
}

export const userService = {
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get('/users/');
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get('/users/me');
        return response.data;
    },

    updateStatus: async (status: string): Promise<void> => {
        await api.post('/users/heartbeat', null, { params: { status } });
    }
};
