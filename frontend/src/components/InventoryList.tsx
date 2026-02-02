import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, Box, AlertTriangle } from 'lucide-react';
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

    if (loading) return <div className="text-center p-10 text-gray-400">Loading inventory...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <div key={item.itemId} className="glass-panel p-6 relative group hover:bg-gray-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${item.available ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            <Box className={`w-6 h-6 ${item.available ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(item)} className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.itemId)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="text-xl font-bold text-white">${item.price}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Stock</p>
                            <div className={`flex items-center gap-1 ${item.stockLevel < item.threshold ? 'text-orange-400' : 'text-white'}`}>
                                {item.stockLevel < item.threshold && <AlertTriangle className="w-3 h-3" />}
                                <span className="text-xl font-bold">{item.stockLevel}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InventoryList;
