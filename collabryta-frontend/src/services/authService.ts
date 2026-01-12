import api from './api';

export interface User {
    id: number;
    email: string;
    name?: string;
    role?: string;
    avatar?: string;
}

export const authService = {
    login: async (email: string, password: string) => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        // OAuth2PasswordRequestForm expects form data
        const response = await api.post('/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response.data;
    },

    register: async (userData: any) => {
        const { name, email, password } = userData;
        const response = await api.post('/users/', {
            email,
            password,
            name,
        });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            // More robust base64 decoding for JWT
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                console.warn('Token expired at:', new Date(payload.exp * 1000).toLocaleString());
                localStorage.removeItem('token');
                return false;
            }
            return true;
        } catch (e) {
            console.error('Error validating token:', e);
            localStorage.removeItem('token');
            return false;
        }
    },

    updateProfile: async (profileData: any) => {
        const response = await api.put('/users/me', profileData);
        return response.data;
    }
};
