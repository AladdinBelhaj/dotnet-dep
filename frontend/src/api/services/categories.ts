import { api } from '../axios';
import type { Category } from '../../types';

export const categoriesService = {
    getAll: async () => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
    },
    create: async (category: Omit<Category, 'id'>) => {
        const response = await api.post<Category>('/categories', category);
        return response.data;
    },
    update: async (id: number, category: Category) => {
        const response = await api.put(`/categories/${id}`, category);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },
};
