import { api } from '../axios';
import type { StockMovement } from '../../types';

export const stockService = {
    getHistory: async () => {
        const response = await api.get<StockMovement[]>('/stock/history');
        return response.data;
    },
    addMovement: async (movement: { productId: number; quantity: number; type: 'Entry' | 'Exit' }) => {
        const response = await api.post('/stock/movement', movement);
        return response.data;
    },
};
