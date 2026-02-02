import React, { useState } from 'react';
import Layout from './components/Layout';
import Header from './components/Header';
import InventoryList from './components/InventoryList';
import InventoryForm from './components/InventoryForm';
import { InventoryItem } from './types';

function App() {
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const handleAddItem = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleSuccess = () => {
        setIsFormOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <Layout>
            <Header onAddItem={handleAddItem} />

            <div className="glass-panel p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Inventory Items</h2>
                </div>
                <InventoryList
                    onEdit={handleEditItem}
                    refreshTrigger={refreshTrigger}
                />
            </div>

            {isFormOpen && (
                <InventoryForm
                    item={editingItem}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </Layout>
    );
}

export default App;
