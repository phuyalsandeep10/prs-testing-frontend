'use client';

import React, { createContext, useContext, useState } from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';

// Create Sidebar Context for shared state
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Shared sidebar state - Default to expanded
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="bg-gray-50 min-h-screen overflow-hidden">
        <Sidebar />
        {/* Main content area that responds to actual sidebar state */}
        <div className={cn(
          "transition-all duration-300 ease-in-out layout-responsive relative z-10",
          // Responsive sidebar margins
          isCollapsed ? "layout-sidebar-collapsed" : "layout-sidebar-expanded"
        )}>
          <Header />
          {/* Content area with proper positioning for modals */}
          <main className={cn(
            "bg-gray-50 relative",
            "min-h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)]", // Exact viewport fit
            "tab-content-optimized prevent-shift overflow-auto"
          )}>
            <div className="relative h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
