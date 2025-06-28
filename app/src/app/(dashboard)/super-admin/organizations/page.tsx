import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Users } from 'lucide-react';

const organizations = [
  { id: 1, name: 'TechCorp', admin: 'john.doe@techcorp.com', status: 'Active' },
  { id: 2, name: 'HealthWell', admin: 'jane.smith@healthwell.com', status: 'Active' },
  { id: 3, name: 'FinancePro', admin: 'sam.wilson@financepro.com', status: 'Inactive' },
];

export default function OrganizationsPage() {
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            </div>
            <p className="text-gray-600">
              Manage all organizations in the system and their administrators
            </p>
          </div>
          <Link href="/super-admin/organizations/new">
            <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2 h-[44px] text-[14px] font-medium rounded-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Organizations</p>
              <p className="text-2xl font-bold text-blue-700">{organizations.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Active Organizations</p>
              <p className="text-2xl font-bold text-blue-700">
                {organizations.filter(org => org.status === 'Active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Inactive Organizations</p>
              <p className="text-2xl font-bold text-blue-700">
                {organizations.filter(org => org.status === 'Inactive').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
          <h2 className="text-lg font-semibold text-gray-800">Organizations List</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {organizations.map((org) => (
              <div key={org.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div>
                  <h3 className="font-semibold text-gray-900">{org.name}</h3>
                  <p className="text-sm text-gray-600">{org.admin}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    org.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {org.status}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 