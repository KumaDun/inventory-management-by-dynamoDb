import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, Box, AlertTriangle, Search } from 'lucide-react';
import { inventoryApi } from '../api/inventoryApi';
import { InventoryItem } from '../types';

interface InventoryListProps {
    onEdit: (item: InventoryItem) => void;
    refreshTrigger: number;
}

const InventoryList: React.FC<InventoryListProps> = ({ onEdit, refreshTrigger }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadItems();
    }, [refreshTrigger]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await inventoryApi.getAllItems();
            setItems(data);
        } catch (error) {
            console.error("Failed to load items", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await inventoryApi.deleteItem(id);
                loadItems();
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    return (
        <div className="table-container">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="w-12"></th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="text-center py-10 text-gray-500">
                                Loading inventory...
                            </td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-12">
                                <div className="flex flex-col items-center gap-3 text-gray-400">
                                    <div className="p-4 bg-gray-50 rounded-full">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <p>No inventory items found. Add your first item above.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.itemId} className="group transition-colors hover:bg-white/50">
                                <td>
                                    <div className={`p-2 rounded-lg inline-flex ${item.available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        <Box className="w-5 h-5" />
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1">{item.description}</div>
                                    </div>
                                </td>
                                <td>
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                                        {item.category || 'Uncategorized'}
                                    </span>
                                </td>
                                <td className="font-medium">${item.price.toFixed(2)}</td>
                                <td>
                                    <div className={`flex items-center gap-2 ${item.stockLevel < item.threshold ? 'text-orange-600 font-bold' : ''}`}>
                                        {item.stockLevel < item.threshold && <AlertTriangle className="w-4 h-4" />}
                                        {item.stockLevel}
                                    </div>
                                </td>
                                <td>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.available ? 'Active' : 'Archived'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item.itemId)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryList;
