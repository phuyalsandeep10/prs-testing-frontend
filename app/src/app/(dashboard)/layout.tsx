import React from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6 sm:p-8 lg:p-10 bg-gray-50 min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
