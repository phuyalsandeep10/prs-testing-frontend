'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Users, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useOrganizations, useDeleteOrganization } from "@/hooks/api";

interface Organization {
  id: number;
  name: string;
  admin_email?: string;
  is_active: boolean;
}

export default function OrganizationsPage() {
  const [deleting, setDeleting] = useState<number | null>(null);

  // Use standardized hooks
  const { data: organizations = [], isLoading: loading, error } = useOrganizations();
  const deleteOrganizationMutation = useDeleteOrganization();

  // Handle delete with optimistic UI updates
  const deleteOrganization = async (orgId: number, orgName: string) => {
    setDeleting(orgId);
    
    try {
      await deleteOrganizationMutation.mutateAsync(orgId);
      toast.success(`Organization "${orgName}" has been deleted successfully`);
    } catch (error: any) {
      console.error('Failed to delete organization:', error);
      
      // Handle specific error cases
      if (error.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.status === 403) {
        toast.error('You do not have permission to delete this organization.');
      } else if (error.status === 404) {
        toast.error('Organization not found. It may have been already deleted.');
      } else {
        toast.error(`Failed to delete organization: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setDeleting(null);
    }
  };

  // Handle loading error
  if (error) {
    console.error('Error loading organizations:', error);
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load organizations</h3>
          <p className="text-gray-600 mb-4">
            {error.message || 'Network error. Please check if the backend server is running.'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const activeOrganizations = organizations.filter(org => org.is_active);
  const inactiveOrganizations = organizations.filter(org => !org.is_active);

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
              <p className="text-2xl font-bold text-blue-700">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  organizations.length
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Organizations</p>
              <p className="text-2xl font-bold text-green-700">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  activeOrganizations.length
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Inactive Organizations</p>
              <p className="text-2xl font-bold text-orange-700">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  inactiveOrganizations.length
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-500 mt-2">Loading organizations...</p>
        </div>
      ) : (
        <>
          {/* Active Organizations */}
          {activeOrganizations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Organizations</h2>
              <div className="grid gap-4">
                {activeOrganizations.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    organization={org}
                    onDelete={deleteOrganization}
                    isDeleting={deleting === org.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Organizations */}
          {inactiveOrganizations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Inactive Organizations</h2>
              <div className="grid gap-4">
                {inactiveOrganizations.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    organization={org}
                    onDelete={deleteOrganization}
                    isDeleting={deleting === org.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Organizations State */}
          {organizations.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first organization.
              </p>
              <Link href="/super-admin/organizations/new">
                <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Organization
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Organization Card Component
interface OrganizationCardProps {
  organization: Organization;
  onDelete: (id: number, name: string) => void;
  isDeleting: boolean;
}

function OrganizationCard({ organization, onDelete, isDeleting }: OrganizationCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            organization.is_active 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <Building2 className="h-6 w-6" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{organization.name}</h3>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                organization.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {organization.is_active ? 'Active' : 'Inactive'}
              </span>
              {organization.admin_email && (
                <span className="text-sm text-gray-600">
                  Admin: {organization.admin_email}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/super-admin/manage-admins/new?org=${organization.id}`}>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Manage Admins
            </Button>
          </Link>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{organization.name}"? This action cannot be undone
                  and will remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(organization.id, organization.name)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
