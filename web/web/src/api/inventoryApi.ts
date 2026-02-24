import {api} from '@/api/axiosConfig.ts';
import type {InventoryItem} from '@/types/InventoryItem.ts';
import type {ScanItemsPage} from '@/types/ScanItemsPage.ts';


export const inventoryApi = {
    getAllItemsPage: async (lastEvaluatedKey: string | null): Promise<ScanItemsPage> => {
        const response = await api.post<ScanItemsPage>('/items/all', lastEvaluatedKey ?? null);
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
        const response = await api.patch<InventoryItem>('/items/patch', item);
        return response.data;
    },
    deleteItem: async (id: string): Promise<void> => {
        await api.delete(`/items/delete?id=${id}`);
    }
};
