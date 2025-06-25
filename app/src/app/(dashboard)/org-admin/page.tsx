import StatsCard from '@/components/dashboard/StatsCard';
import WelcomeHeader from '@/components/dashboard/org-admin/WelcomeHeader';
import RecentActivity from '@/components/dashboard/org-admin/RecentActivity';
import QuickActions from '@/components/dashboard/org-admin/QuickActions';

export default function OrgAdminDashboard() {
  return (
    <div className="space-y-8">
      <WelcomeHeader />

      {/* Key Metrics Section */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Key Metrics</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Users" value="42" />
          <StatsCard title="Supervisors" value="5" />
          <StatsCard title="Salespersons" value="25" />
          <StatsCard title="Verifiers" value="12" />
        </div>
      </section>

      {/* Placeholder for future components */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

