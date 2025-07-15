'use client';

import React from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/stores';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Mark the entire dashboard subtree as dynamic. This avoids build-time errors for client hooks
// (e.g. useRouter, useSearchParams) used within nested pages that would otherwise require
// a suspense boundary during static rendering.
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use Zustand sidebar store
  const { sidebarCollapsed } = useSidebar();
  
  // Wait for authentication to be initialized before rendering
  const isAuthInitialized = useAuthInitialization();
  
  // Show loading state while auth is initializing
  if (!isAuthInitialized) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen overflow-hidden">
      <Sidebar />
      {/* Main content area that responds to actual sidebar state */}
      <div className={cn(
        "transition-all duration-300 ease-in-out layout-responsive relative z-10",
        // Responsive sidebar margins
        sidebarCollapsed ? "layout-sidebar-collapsed" : "layout-sidebar-expanded"
      )}>
        <Header />
        {/* Content area with proper positioning for modals */}
        <main className={cn(
          "bg-gray-50 relative",
          "min-h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)]", // Exact viewport fit
          "tab-content-optimized prevent-shift overflow-auto"
        )}>
          <div className="relative h-full">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
