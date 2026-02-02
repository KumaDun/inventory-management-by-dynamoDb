import React from 'react';
import { Package, Plus } from 'lucide-react';

interface HeaderProps {
    onAddItem: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddItem }) => {
    return (
        <div className="glass-panel p-6 flex justify-between items-center bg-gray-900/50">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Package className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Inventory Management
                    </h1>
                    <p className="text-gray-400 text-sm">System Dashboard</p>
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
