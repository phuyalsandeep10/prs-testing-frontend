'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { toast } from "sonner";
import { apiClient, ApiError } from '@/lib/api';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface DashboardStats {
  totalOrganizations: number;
  totalAdmins: number;
  activeUsers: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalAdmins: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard stats from API using apiClient
  const loadStats = async () => {
    setLoading(true);
    try {
      // apiClient handles tokens and base URL automatically
      const [orgsResponse, adminsResponse, usersResponse] = await Promise.all([
        apiClient.get<any>('/organizations/'),
        apiClient.get<any>('/auth/users/', { role: 'Org Admin' }),
        apiClient.get<any>('/auth/users/'),
      ]);

      const orgsData = orgsResponse.data;
      const adminsData = adminsResponse.data;
      const usersData = usersResponse.data;
      
      const organizations = Array.isArray(orgsData) ? orgsData : orgsData?.results || [];
      const admins = Array.isArray(adminsData) ? adminsData : adminsData?.results || [];
      const users = Array.isArray(usersData) ? usersData : usersData?.results || [];

      setStats({
        totalOrganizations: organizations.length,
        totalAdmins: admins.length,
        activeUsers: users.filter((user: any) => user.is_active).length,
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred while loading dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load and listen for creation events
  useEffect(() => {
    loadStats();

    // Listen for organization creation events
    const handleOrganizationCreated = (event: any) => {
      console.log('Organization created event received in dashboard:', event.detail);
      loadStats(); // Refresh all stats
    };

    // Listen for admin creation events
    const handleAdminCreated = (event: any) => {
      console.log('Admin created event received in dashboard:', event.detail);
      loadStats(); // Refresh all stats
    };

    // Listen for deletion events
    const handleOrganizationDeleted = (event: any) => {
      console.log('Organization deleted event received in dashboard:', event.detail);
      loadStats();
    };

    const handleAdminDeleted = (event: any) => {
      console.log('Admin deleted event received in dashboard:', event.detail);
      loadStats();
    };
 
    window.addEventListener('organizationCreated', handleOrganizationCreated);
    window.addEventListener('adminCreated', handleAdminCreated);
    window.addEventListener('organizationDeleted', handleOrganizationDeleted);
    window.addEventListener('adminDeleted', handleAdminDeleted);

    return () => {
      window.removeEventListener('organizationCreated', handleOrganizationCreated);
      window.removeEventListener('adminCreated', handleAdminCreated);
      window.removeEventListener('organizationDeleted', handleOrganizationDeleted);
      window.removeEventListener('adminDeleted', handleAdminDeleted);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the entire system from here</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatsCard 
            title="Total Organizations" 
            value={loading ? "Loading..." : stats.totalOrganizations.toString()} 
          />
          <StatsCard 
            title="Total Admins" 
            value={loading ? "Loading..." : stats.totalAdmins.toString()} 
          />
          <StatsCard 
            title="Active Users" 
            value={loading ? "Loading..." : stats.activeUsers.toString()} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                <p className="font-medium text-gray-800">Create New Organization</p>
                <p className="text-sm text-gray-600">Add a new organization to the system</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                <p className="font-medium text-gray-800">Manage Administrators</p>
                <p className="text-sm text-gray-600">View and manage organization admins</p>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">System Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Health</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Excellent</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database Status</span>
                <span className="text-gray-800 font-medium">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API Status</span>
                <span className="text-gray-800 font-medium">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
