import api from './api';
import { User } from './authService';

export interface Meeting {
    id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    meeting_link?: string;
    host: User;
    participants: User[];
}

export const meetingService = {
    getAllMeetings: async (): Promise<Meeting[]> => {
        const response = await api.get('/meetings/');
        return response.data;
    },

    createMeeting: async (meetingData: {
        title: string;
        description?: string;
        start_time: string;
        end_time: string;
        location?: string;
        meeting_link?: string;
        participant_ids?: number[];
    }): Promise<Meeting> => {
        const response = await api.post('/meetings/', meetingData);
        return response.data;
    },

    deleteMeeting: async (id: number): Promise<void> => {
        await api.delete(`/meetings/${id}`);
    }
};
