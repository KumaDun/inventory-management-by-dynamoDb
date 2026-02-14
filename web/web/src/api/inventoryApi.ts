import {api} from '@/api/axiosConfig.ts';
import type {InventoryItem} from '@/types/InventoryItem.ts';

export const inventoryApi = {
    getAllItems: async (): Promise<InventoryItem[]> => {
        const response = await api.get<InventoryItem[]>('/items/all');
        return response.data;
    },
    getItem: async (id: string): Promise<InventoryItem> => {
        const response = await api.get<InventoryItem>(`/items/get?id=${id}`);
        return response.data;
    },
    createItem: async (item: InventoryItem): Promise<InventoryItem> => {
        const response = await api.post<InventoryItem>('/items/post', item);
        return response.data;
    },
    updateItem: async (item: InventoryItem): Promise<InventoryItem> => {
        const response = await api.post<InventoryItem>('/items/post', item);
        return response.data;
    },
    deleteItem: async (id: string): Promise<void> => {
        await api.delete(`/items/delete?id=${id}`);
    }
};
