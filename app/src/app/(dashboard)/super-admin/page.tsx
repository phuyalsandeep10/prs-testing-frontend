import StatsCard from '@/components/dashboard/StatsCard';

export default function SuperAdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Super Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Organizations" value="12" />
        <StatsCard title="Total Admins" value="24" />
        <StatsCard title="Active Users" value="150" />
      </div>

      <div className="mt-8">
        {/* Placeholder for more dashboard widgets */}
        <div className="h-96 rounded-lg border-4 border-dashed border-gray-200" />
      </div>
    </div>
  );
}
