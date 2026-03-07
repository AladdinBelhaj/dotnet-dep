import { api } from '../axios';
import type { Product } from '../../types';

export const productsService = {
    getAll: async () => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },
    create: async (product: Omit<Product, 'id' | 'category' | 'supplier'>) => {
        const response = await api.post<Product>('/products', product);
        return response.data;
    },
    update: async (id: number, product: Omit<Product, 'category' | 'supplier'>) => {
        const response = await api.put(`/products/${id}`, product);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};
