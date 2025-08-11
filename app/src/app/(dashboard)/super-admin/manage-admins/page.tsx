'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserCheck, Plus, Users, Shield, Loader2, Trash2, AlertTriangle } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/api';

interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  organization_name: string;
  is_active: boolean;
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Load admins from API
  const loadAdmins = async () => {
    try {
      const response = await apiClient.get<any>('/auth/users/', { role: 'Org Admin' });

      const adminsData = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setAdmins(adminsData);
    } catch (error: any) {
      console.error('Error loading admins:', error);
      if (error instanceof ApiError) {
        if (error.code === '401') {
          toast.error('Authentication failed. Please login again.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Network error. Please check if the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete admin function
  const deleteAdmin = async (adminId: number, adminName: string, adminEmail: string) => {
    setDeleting(adminId);
    
    try {
      console.log(`Attempting to delete admin ${adminId}: ${adminName} (${adminEmail})`);

      await apiClient.delete<void>(`/auth/users/${adminId}/`);

      toast.success(`Admin "${adminName}" has been deleted successfully`);
      // Remove from local state
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));

      // Dispatch event for dashboard sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adminDeleted', { detail: adminId }));
      }
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      if (error instanceof ApiError) {
        if (error.code === '401') {
          toast.error('Authentication failed. Please login again.');
        } else if (error.code === '404') {
          toast.error('Admin not found. They may have been already deleted.');
          setAdmins(prev => prev.filter(admin => admin.id !== adminId));
        } else if (error.code === '403') {
          toast.error('You do not have permission to delete this admin.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Network error. Please check if the backend server is running.');
      }
    } finally {
      setDeleting(null);
    }
  };

  // Initial load and listen for admin creation events
  useEffect(() => {
    loadAdmins();

    // Listen for admin creation and update events
    const handleAdminCreated = (event: any) => {
      console.log('Admin created event received:', event.detail);
      toast.success('Admin list updated');
      loadAdmins();
    };

    const handleAdminUpdated = (event: any) => {
      console.log('Admin updated event received:', event.detail);
      toast.success('Admin list updated');
      loadAdmins();
    };

    window.addEventListener('adminCreated', handleAdminCreated);
    window.addEventListener('adminUpdated', handleAdminUpdated);

    return () => {
      window.removeEventListener('adminCreated', handleAdminCreated);
      window.removeEventListener('adminUpdated', handleAdminUpdated);
    };
  }, []);

  const activeAdmins = admins.filter(admin => admin.is_active);
  const inactiveAdmins = admins.filter(admin => !admin.is_active);

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Admins</h1>
            </div>
            <p className="text-gray-600">
              Manage organization administrators and their access levels
            </p>
          </div>
          <Link href="/super-admin/manage-admins/new">
            <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2 h-[44px] text-[14px] font-medium rounded-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Admins</p>
              <p className="text-2xl font-bold text-blue-700">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  admins.length
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
              <p className="text-blue-600 text-sm font-medium">Active Admins</p>
              <p className="text-2xl font-bold text-blue-700">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  activeAdmins.length
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Inactive Admins</p>
              <p className="text-2xl font-bold text-blue-700">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  inactiveAdmins.length
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
          <h2 className="text-lg font-semibold text-gray-800">Administrators List</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading admins...</span>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No Admins Found</p>
              <p className="text-gray-500 mb-4">Start by creating your first organization admin.</p>
              <Link href="/super-admin/manage-admins/new">
                <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Admin
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {admin.first_name} {admin.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{admin.organization_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      admin.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Link href={`/super-admin/manage-admins/${admin.id}/edit`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </Button>
                    </Link>
                    
                    {/* Delete Button with Confirmation */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleting === admin.id}
                        >
                          {deleting === admin.id ? (
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
                            Delete Administrator
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div>
                              Are you sure you want to delete <strong className="text-red-600">"{admin.first_name} {admin.last_name}"</strong>?
                              <br /><br />
                              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                <strong>Email:</strong> {admin.email}<br />
                                <strong>Organization:</strong> {admin.organization_name}
                              </div>
                              <br />
                              <span className="text-red-500 font-medium">⚠️ This action cannot be undone</span> and will permanently:
                              <br />
                              <ul className="mt-2 text-left list-disc list-inside space-y-1 text-sm">
                                <li>Remove their administrator access</li>
                                <li>Delete their user account</li>
                                <li>Revoke all permissions</li>
                              </ul>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-3 pt-4">
                          <AlertDialogCancel className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAdmin(admin.id, `${admin.first_name} ${admin.last_name}`, admin.email)}
                            className="flex-1 bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white font-semibold"
                          >
                            Delete Administrator
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
