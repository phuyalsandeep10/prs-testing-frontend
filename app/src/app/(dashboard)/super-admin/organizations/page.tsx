'use client';

import { useState, useEffect } from 'react';
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

interface Organization {
  id: number;
  name: string;
  admin_email?: string;
  is_active: boolean;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Load organizations from API
  const loadOrganizations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Loading organizations with token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Making request to:', 'http://localhost:8000/api/v1/organizations/');
      const response = await fetch('http://localhost:8000/api/v1/organizations/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Organizations data received:', data);
        setOrganizations(Array.isArray(data) ? data : data.results || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load organizations:', response.status, errorData);
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          // Optionally redirect to login
          // window.location.href = '/login';
        } else {
          toast.error(`Failed to load organizations: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Network error. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Delete organization function
  const deleteOrganization = async (orgId: number, orgName: string) => {
    setDeleting(orgId);
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        setDeleting(null);
        return;
      }

      console.log(`Attempting to delete organization ${orgId}: ${orgName}`);
      
      const response = await fetch(`http://localhost:8000/api/v1/organizations/${orgId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok || response.status === 204) {
        console.log(`Organization ${orgName} deleted successfully`);
        toast.success(`Organization "${orgName}" has been deleted successfully`);
        
        // Remove from local state
        setOrganizations(prev => prev.filter(org => org.id !== orgId));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete organization:', response.status, errorData);
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          toast.error('You do not have permission to delete this organization.');
        } else if (response.status === 404) {
          toast.error('Organization not found. It may have been already deleted.');
          // Remove from local state anyway
          setOrganizations(prev => prev.filter(org => org.id !== orgId));
        } else {
          toast.error(`Failed to delete organization: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Network error. Please check if the backend server is running.');
    } finally {
      setDeleting(null);
    }
  };

  // Initial load and listen for organization creation events
  useEffect(() => {
    loadOrganizations();

    // Listen for organization creation events
    const handleOrganizationCreated = (event: any) => {
      console.log('Organization created event received:', event.detail);
      toast.success('Organization list updated');
      loadOrganizations();
    };

    // Listen for admin creation events to update organization admin emails
    const handleAdminCreated = (event: any) => {
      console.log('Admin created event received in organizations page:', event.detail);
      toast.success('Organization admin updated');
      loadOrganizations(); // Refresh to show updated admin_email
    };

    window.addEventListener('organizationCreated', handleOrganizationCreated);
    window.addEventListener('adminCreated', handleAdminCreated);

    return () => {
      window.removeEventListener('organizationCreated', handleOrganizationCreated);
      window.removeEventListener('adminCreated', handleAdminCreated);
    };
  }, []);

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

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Active Organizations</p>
              <p className="text-2xl font-bold text-blue-700">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  activeOrganizations.length
                )}
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
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  inactiveOrganizations.length
                )}
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading organizations...</span>
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No Organizations Found</p>
              <p className="text-gray-500 mb-4">Start by creating your first organization.</p>
              <Link href="/super-admin/organizations/new">
                <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Organization
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <div key={org.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div>
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-600">{org.admin_email || 'No admin assigned'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      org.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {org.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                    
                    {/* Delete Button with Confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleting === org.id}
                        >
                          {deleting === org.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-2 border-red-100 shadow-xl max-w-md">
                        <AlertDialogHeader className="text-center pb-4">
                          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                          </div>
                          <AlertDialogTitle className="text-xl font-bold text-red-600 mb-2">
                            Delete Organization
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-700 leading-relaxed">
                            Are you sure you want to delete <strong className="text-red-600">"{org.name}"</strong>? 
                            <br /><br />
                            <span className="text-red-500 font-medium">⚠️ This action cannot be undone</span> and will permanently remove:
                            <br />
                            <ul className="mt-2 text-left list-disc list-inside space-y-1 text-sm">
                              <li>All organization administrators</li>
                              <li>All users and their data</li>
                              <li>All organizational settings</li>
                              <li>All associated business data</li>
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-3 pt-4">
                          <AlertDialogCancel className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteOrganization(org.id, org.name)}
                            className="flex-1 bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white font-semibold"
                          >
                            Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 