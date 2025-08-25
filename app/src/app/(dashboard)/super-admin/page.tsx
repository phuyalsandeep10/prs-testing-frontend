'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/dashboard/StatsCard';
import { toast } from "sonner";
import { apiClient, ApiError } from '@/lib/api-client';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface DashboardStats {
  totalOrganizations: number;
  totalAdmins: number;
  activeUsers: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalAdmins: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard stats from API using apiClient
  const loadStats = async () => {
    console.log('🔄 loadStats() function called');
    setLoading(true);
    try {
      console.log('📡 Making API calls to fetch dashboard data...');
      // apiClient handles tokens and base URL automatically
      const [orgsResponse, adminsResponse, usersResponse] = await Promise.all([
        apiClient.get<any>('/organizations/'),
        apiClient.get<any>('/auth/users/', { role: 'Org Admin' }),
        apiClient.get<any>('/auth/users/'), // Get all users for active user count
      ]);

      // Handle paginated responses from DRF
      const organizations = (orgsResponse && orgsResponse.data && orgsResponse.data.results && Array.isArray(orgsResponse.data.results)) 
        ? orgsResponse.data.results 
        : (orgsResponse && orgsResponse.data && Array.isArray(orgsResponse.data)) ? orgsResponse.data : [];
        
      const admins = (adminsResponse && adminsResponse.data && adminsResponse.data.results && Array.isArray(adminsResponse.data.results))
        ? adminsResponse.data.results
        : (adminsResponse && adminsResponse.data && Array.isArray(adminsResponse.data)) ? adminsResponse.data : [];
        
      const users = (usersResponse && usersResponse.data && usersResponse.data.results && Array.isArray(usersResponse.data.results))
        ? usersResponse.data.results
        : (usersResponse && usersResponse.data && Array.isArray(usersResponse.data)) ? usersResponse.data : [];

      console.log('📊 Raw API responses:', {
        orgsResponse: orgsResponse,
        adminsResponse: adminsResponse,
        usersResponse: usersResponse
      });

      console.log('📈 Dashboard stats loaded:', {
        organizations: organizations.length,
        admins: admins.length,
        users: users.length,
        activeUsers: users.filter((user: any) => user.is_active).length
      });

      const newStats = {
        totalOrganizations: organizations.length,
        totalAdmins: admins.length,
        activeUsers: users.filter((user: any) => user.is_active).length,
      };
      
      console.log('🔄 Updating dashboard stats state:', newStats);
      setStats(newStats);
      console.log('✅ Dashboard stats state updated');

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
    console.log('Dashboard useEffect running, setting up event listeners...');
    
    // Add a global event listener to debug if events are being dispatched
    const globalHandler = (event: any) => {
      if (event.type === 'adminCreated') {
        console.log('🔍 Global event listener caught adminCreated event:', event.detail);
      }
    };
    window.addEventListener('adminCreated', globalHandler);
    
    loadStats();

    // Listen for organization creation events
    const handleOrganizationCreated = (event: any) => {
      console.log('Organization created event received in dashboard:', event.detail);
      loadStats(); // Refresh all stats
    };

    // Listen for admin creation events
    const handleAdminCreated = (event: any) => {
      console.log('Admin created event received in dashboard:', event.detail);
      console.log('Refreshing dashboard stats...');
      console.log('About to call loadStats()...');
      console.log('Event handler executing...');
      
      try {
        console.log('Calling loadStats()...');
        loadStats(); // Refresh all stats
        console.log('loadStats() called successfully');
      } catch (error) {
        console.error('Error calling loadStats():', error);
      }
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
 
    console.log('Adding event listeners for adminCreated, organizationCreated, etc...');
    window.addEventListener('organizationCreated', handleOrganizationCreated);
    window.addEventListener('adminCreated', handleAdminCreated);
    window.addEventListener('organizationDeleted', handleOrganizationDeleted);
    window.addEventListener('adminDeleted', handleAdminDeleted);

    console.log('Event listeners added successfully');

    return () => {
      console.log('Cleaning up event listeners...');
      window.removeEventListener('adminCreated', globalHandler);
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
              <div 
                onClick={() => {
                  console.log('Navigating to create organization...');
                  router.push('/super-admin/organizations/new');
                }}
                className="p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md hover:bg-blue-50 transition-all cursor-pointer"
              >
                <p className="font-medium text-gray-800">Create New Organization</p>
                <p className="text-sm text-gray-600">Add a new organization to the system</p>
              </div>
              <div 
                onClick={() => {
                  console.log('Navigating to manage administrators...');
                  router.push('/super-admin/manage-admins');
                }}
                className="p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md hover:bg-blue-50 transition-all cursor-pointer"
              >
                <p className="font-medium text-gray-800">Manage Administrators</p>
                <p className="text-sm text-gray-600">View and manage organization admins</p>
              </div>
              <div 
                onClick={() => {
                  console.log('Navigating to organizations list...');
                  router.push('/super-admin/organizations');
                }}
                className="p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md hover:bg-blue-50 transition-all cursor-pointer"
              >
                <p className="font-medium text-gray-800">View All Organizations</p>
                <p className="text-sm text-gray-600">Browse and manage existing organizations</p>
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
