import { api } from '../axios';
import type { Supplier } from '../../types';

export const suppliersService = {
    getAll: async () => {
        const response = await api.get<Supplier[]>('/suppliers');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<Supplier>(`/suppliers/${id}`);
        return response.data;
    },
    create: async (supplier: Omit<Supplier, 'id'>) => {
        const response = await api.post<Supplier>('/suppliers', supplier);
        return response.data;
    },
    update: async (id: number, supplier: Supplier) => {
        const response = await api.put(`/suppliers/${id}`, supplier);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/suppliers/${id}`);
        return response.data;
    },
};
