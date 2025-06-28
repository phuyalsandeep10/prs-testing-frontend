'use client';

import React, { useState } from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Each component manages its own state
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      {/* Smooth responsive layout with proper transitions */}
      <div className={cn(
        "transition-all duration-300 ease-in-out smooth-transition gpu-accelerated", // Added performance classes
        isCollapsed ? "lg:pl-20" : "lg:pl-80"
      )}>
        <Header />
        {/* Clean content area without extra padding */}
        <main className="bg-gray-50 min-h-[calc(100vh-5rem)] tab-content-optimized prevent-shift">
          {children}
        </main>
      </div>
    </div>
  );
}
