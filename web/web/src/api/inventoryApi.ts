import {api} from '@/api/axiosConfig.ts';
import type {InventoryItem} from '@/types/InventoryItem.ts';
import type {ScanItemsPage} from '@/types/ScanItemsPage.ts';


export const inventoryApi = {
    getAllItemsPage: async (exclusiveStartKey: string | null | undefined): Promise<ScanItemsPage> => {
        const response = await api.post<ScanItemsPage>('/items/all', exclusiveStartKey ?? null);
        return response.data;
    },
    getItemById: async (id: string): Promise<InventoryItem> => {
        const response = await api.get<InventoryItem>(`/items/get?id=${id}`);
        return response.data;
    },
    getItemsByCategory: async(category: string, exclusiveStartKey: string | null | undefined): Promise<ScanItemsPage> => {
        const url: string = exclusiveStartKey ?
            `/items/all/category?category=${category}&name=${''}&exclusiveStartKey=${exclusiveStartKey}` :
            `/items/all/category?category=${category}`;
        const response = await api.get<ScanItemsPage>(url);
        return response.data;
    },
    getItemsByCategoryAndName: async (category: string, name: string, exclusiveStartKey: string | null | undefined): Promise<ScanItemsPage> => {
        const url: string = exclusiveStartKey ?
            `/items/all/category?category=${category}&name=${name}&exclusiveStartKey=${exclusiveStartKey}` :
            `/items/all/category?category=${category}&name=${name}`;
        const response = await api.get<ScanItemsPage>(url);
        return response.data;
    },
    getItemsByName: async (name: string, exclusiveStartKey: string | null | undefined): Promise<ScanItemsPage> => {
        const url: string = exclusiveStartKey ?
            `/items/all/name?&name=${name}&exclusiveStartKey=${exclusiveStartKey}` :
            `/items/all/name?&name=${name}`;
        const response = await api.get<ScanItemsPage>(url);
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
