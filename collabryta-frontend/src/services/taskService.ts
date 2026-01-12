import api from './api';
import { User } from './authService';

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: string; // "Pending", "Completed"
    priority: string; // "Low", "Medium", "High"
    start_date?: string;
    end_date?: string;
    owner_id: number;
    assigned_to_id?: number;
    owner?: User; // Depending on if backend returns full object or just ID. My serialization uses ORM mode so it might return objects? 
    // Wait, Schema Task uses TaskInDBBase which extends TaskBase. 
    // TaskBase has assigned_to_id.
    // The relationship is in the model, but schema didn't explicitly include nested User objects by default unless I configured it. 
    // Checking schema: TaskInDBBase doesn't have owner/assigned_to fields of type User, just IDs.
    // So frontend will receive IDs.
    created_at: string;
}

export const taskService = {
    getAllTasks: async (): Promise<Task[]> => {
        const response = await api.get('/tasks/');
        return response.data;
    },

    getTask: async (id: number): Promise<Task> => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },

    createTask: async (taskData: {
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        start_date?: string; // ISO string
        end_date?: string; // ISO string
        assigned_to_id?: number;
    }): Promise<Task> => {
        const response = await api.post('/tasks/', taskData);
        return response.data;
    },

    updateTask: async (id: number, taskData: Partial<Task>): Promise<Task> => {
        const response = await api.put(`/tasks/${id}`, taskData);
        return response.data;
    },

    deleteTask: async (id: number): Promise<void> => {
        await api.delete(`/tasks/${id}`);
    }
};
