import api from './api';

export interface Chat {
    id: number;
    name: string;
    is_group: boolean;
    last_message?: string;
    last_message_time?: string;
    status?: 'online' | 'offline' | 'group';
    other_user_id?: number | null;
    unread_count?: number;
}

export interface MessageSender {
    id: number;
    name: string;
    avatar?: string;
}

export interface Message {
    id: number;
    chat_id: number;
    sender_id: number;
    sender?: MessageSender;
    content: string;
    timestamp: string;
    is_read: boolean;
}

export const messageService = {
    getChats: async (): Promise<Chat[]> => {
        const response = await api.get('/messages/conversations');
        return response.data;
    },

    createChat: async (participantIds: number[], name?: string, isGroup: boolean = false): Promise<Chat> => {
        const response = await api.post('/messages/conversations', {
            participant_ids: participantIds,
            name,
            is_group: isGroup
        });
        return response.data;
    },

    getMessages: async (chatId: number): Promise<Message[]> => {
        const response = await api.get(`/messages/${chatId}`);
        return response.data;
    },

    sendMessage: async (chatId: number, content: string): Promise<Message> => {
        const response = await api.post(`/messages/${chatId}`, {
            content
        });
        return response.data;
    },

    markAsRead: async (chatId: number): Promise<void> => {
        await api.put(`/messages/${chatId}/read`);
    }
};
