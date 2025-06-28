'use client';

import React, { createContext, useContext, useState } from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';

// Sidebar Context
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: true, // Default to collapsed to match Figma spacious layout
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default to collapsed for more spacious layout like Figma
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        {/* Smooth responsive layout with proper transitions */}
        <div className={cn(
          "transition-all duration-300 ease-in-out", // Smooth transition matching sidebar
          isCollapsed ? "lg:pl-20" : "lg:pl-80"
        )}>
          <Header />
          {/* Clean content area without extra padding */}
          <main className="bg-gray-50 min-h-[calc(100vh-5rem)]">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
