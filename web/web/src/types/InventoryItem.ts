export interface InventoryItem {
    itemId: string;
    name: string;
    description: string;
    price: number;
    stockLevel: number;
    category: string;
    threshold: number;
    available: boolean;
}