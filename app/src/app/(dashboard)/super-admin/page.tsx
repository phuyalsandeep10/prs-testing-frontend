import StatsCard from '@/components/dashboard/StatsCard';

export default function SuperAdminDashboard() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage the entire system from here</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatsCard title="Total Organizations" value="12" />
        <StatsCard title="Total Admins" value="24" />
        <StatsCard title="Active Users" value="150" />
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
              <span className="text-gray-600">Last Backup</span>
              <span className="text-gray-800 font-medium">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Server Uptime</span>
              <span className="text-gray-800 font-medium">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
