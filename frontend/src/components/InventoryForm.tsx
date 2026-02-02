import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { X } from 'lucide-react';
import { inventoryApi } from '../api/inventoryApi';
import { InventoryItem } from '../types';

interface InventoryFormProps {
    item: InventoryItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ item, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        itemId: '',
        name: '',
        description: '',
        price: 0,
        stockLevel: 0,
        category: '',
        threshold: 10,
        available: true
    });

    useEffect(() => {
        if (item) {
            setFormData(item);
        }
    }, [item]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            // Ensure numbers are numbers
            const payload: InventoryItem = {
                ...(formData as InventoryItem), // Cast because we know we filled it or it's from existing item
                price: parseFloat(formData.price?.toString() || '0'),
                stockLevel: parseInt(formData.stockLevel?.toString() || '0'),
                threshold: parseInt(formData.threshold?.toString() || '0')
            };

            if (item) {
                await inventoryApi.updateItem(payload);
            } else {
                // Generate ID if new (simple random for demo)
                if (!payload.itemId) payload.itemId = 'ITEM-' + Date.now();
                await inventoryApi.createItem(payload);
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving item", error);
            alert("Failed to save item");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{item ? 'Edit Item' : 'New Item'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Item ID</label>
                            <input
                                name="itemId"
                                value={formData.itemId || ''}
                                onChange={handleChange}
                                disabled={!!item}
                                placeholder="Auto-generated if empty"
                                className="input-field opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Name</label>
                            <input required name="name" value={formData.name || ''} onChange={handleChange} className="input-field" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} className="input-field h-24" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Price</label>
                            <input required type="number" step="0.01" name="price" value={formData.price || 0} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Stock</label>
                            <input required type="number" name="stockLevel" value={formData.stockLevel || 0} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Threshold</label>
                            <input required type="number" name="threshold" value={formData.threshold || 0} onChange={handleChange} className="input-field" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            name="available"
                            checked={formData.available || false}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                        />
                        <label className="text-sm">Available for sale</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 hover:bg-white/10 rounded-lg">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryForm;
