import React from 'react';
import { Package, Plus } from 'lucide-react';

interface HeaderProps {
    onAddItem: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddItem }) => {
    return (
        <div className="glass-panel p-6 flex justify-between items-center bg-white/50">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Inventory
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Management System</p>
                </div>
            </div>

            <button onClick={onAddItem} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add New Item
            </button>
        </div>
    );
};

export default Header;
