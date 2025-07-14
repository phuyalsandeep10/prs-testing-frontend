'use client';

import { useOrgDashboard } from '@/hooks/api/useDashboard';
import StatsCard from '@/components/dashboard/StatsCard';
import WelcomeHeader from '@/components/dashboard/org-admin/WelcomeHeader';
import RecentActivity from '@/components/dashboard/org-admin/RecentActivity';
import QuickActions from '@/components/dashboard/org-admin/QuickActions';
import PerformanceMetrics from '@/components/dashboard/org-admin/PerformanceMetrics';
import TeamOverview from '@/components/dashboard/org-admin/TeamOverview';
import DealPipeline from '@/components/dashboard/org-admin/DealPipeline';
import Analytics from '@/components/dashboard/org-admin/Analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function OrgAdminDashboard() {
  const { data: dashboardData, isLoading, error } = useOrgDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Demo Mode Notification */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Demo Mode:</strong> This dashboard is currently using mock data. 
          Backend integration will be available once the API endpoints are ready.
        </AlertDescription>
      </Alert>

      {/* Enhanced Welcome Header */}
      <WelcomeHeader dashboardData={dashboardData?.overview} />

      {/* Performance Metrics */}
      <PerformanceMetrics dashboardData={dashboardData?.overview} />

      {/* Analytics Charts */}
      <Analytics analyticsData={dashboardData?.analytics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Overview */}
        <div className="lg:col-span-2">
          <TeamOverview teamData={dashboardData?.team_members} />
        </div>
        
        {/* Quick Actions */}
        <div>
          <QuickActions systemStatus={dashboardData?.system_status} />
        </div>
      </div>

      {/* Deal Pipeline */}
      <DealPipeline pipelineData={dashboardData?.deal_pipeline} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={dashboardData?.recent_activities} />
        </div>
        
        {/* Additional Stats */}
        <div className="space-y-4">
          <StatsCard 
            title="Pending Approvals" 
            value={dashboardData?.overview?.pending_approvals?.toString() || "0"} 
          />
          <StatsCard 
            title="System Alerts" 
            value={dashboardData?.overview?.system_alerts?.toString() || "0"} 
          />
          <StatsCard 
            title="Data Usage" 
            value={`${dashboardData?.overview?.data_usage || 0}%`} 
          />
        </div>
      </div>
    </div>
  );
}

