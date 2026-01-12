import api from './api';

export interface FileData {
    id: number;
    filename: string;
    file_path: string;
    file_type: string;
    file_size_bytes: number;
    title: string;
    description?: string;
    uploaded_at: string;
    owner_id: number;
}

export const fileService = {
    getAllFiles: async (): Promise<FileData[]> => {
        const response = await api.get('/files');
        return response.data;
    },

    getMyFiles: async (): Promise<FileData[]> => {
        const response = await api.get('/files/my-files');
        return response.data;
    },

    uploadFile: async (file: File, title: string, description?: string): Promise<FileData> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        if (description) {
            formData.append('description', description);
        }

        const response = await api.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
