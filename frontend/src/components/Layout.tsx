import React, { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {children}
            </div>
        </div>
    );
};

export default Layout;
