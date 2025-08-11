'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import SlideModal from '@/components/ui/SlideModal';
import { useOrganizations } from "@/hooks/api";
import { apiClient, ApiError } from '@/lib/api';

// Zod validation schema
const adminSchema = z.object({
  first_name: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  last_name: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
  email: z.string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  organization: z.string()
    .min(1, "Organization is required"),
  is_active: z.string().default("true"),
});

type AdminFormData = z.infer<typeof adminSchema>;

interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  organization_name: string;
  organization_id?: number;
  is_active: boolean;
}

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params.adminId as string;
  
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Use standardized hooks
  const { data: organizations = [], isLoading: loadingOrganizations } = useOrganizations();

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      organization: '',
      is_active: "true",
    },
  });

  // Load admin data
  const loadAdmin = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Admin>(`/auth/users/${adminId}/`);
      const adminData = response.data;
      setAdmin(adminData);
      
      // Find the organization ID from the organization name
      const orgId = organizations.find(org => org.name === adminData.organization_name)?.id?.toString() || '';
      
      // Populate form with admin data
      form.reset({
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        email: adminData.email,
        organization: orgId,
        is_active: adminData.is_active ? "true" : "false",
      });
    } catch (error: any) {
      console.error('Error loading admin:', error);
      if (error instanceof ApiError) {
        if (error.code === '404') {
          toast.error('Admin not found');
          router.push('/super-admin/manage-admins');
        } else if (error.code === '401') {
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

  // Load admin data when organizations are loaded
  useEffect(() => {
    if (organizations.length > 0) {
      loadAdmin();
    }
  }, [adminId, organizations]);

  const handleClose = useCallback(() => {
    router.push('/super-admin/manage-admins');
  }, [router]);

  const onSubmit = async (values: AdminFormData) => {
    try {
      setUpdating(true);
      
      // Find the selected organization name from the organizations list
      const selectedOrg = organizations.find(org => org.id.toString() === values.organization);
      const organizationName = selectedOrg ? selectedOrg.name : values.organization;

      // Update the admin user
      const adminData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        organization: organizationName, // Send name as string
        is_active: values.is_active === "true",
      };
      
      await apiClient.put(`/auth/users/${adminId}/`, adminData);
      
      toast.success('Admin updated successfully!');
      
      // Dispatch event for dashboard sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adminUpdated', { detail: adminId }));
      }
      
      // Close modal and navigate back
      handleClose();
      
    } catch (error: any) {
      console.error('Error updating admin:', error);
      
      // Handle validation errors from backend
      if (error.status === 400 && error.data) {
        // Set form errors for specific fields
        Object.keys(error.data).forEach(key => {
          if (key in form.getValues()) {
            form.setError(key as keyof AdminFormData, {
              message: Array.isArray(error.data[key]) ? error.data[key][0] : error.data[key]
            });
          }
        });
        
        // Show general error
        const errorMessage = error.data.detail || 
                           error.data.message || 
                           error.data.non_field_errors?.[0] || 
                           'Validation failed';
        toast.error(errorMessage);
      } else {
        // Handle other errors
        toast.error(error.message || 'Failed to update admin. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  const isLoading = updating || loading;

  if (loading && !admin) {
    return (
      <SlideModal
        isOpen={true}
        onClose={handleClose}
        title="Edit Admin"
        width="md"
        showCloseButton={true}
      >
        <div className="px-6 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading admin data...</span>
        </div>
      </SlideModal>
    );
  }

  return (
    <SlideModal
      isOpen={true}
      onClose={handleClose}
      title="Edit Admin"
      width="md"
      showCloseButton={true}
    >
      <div className="px-6 py-6 flex-1 overflow-y-auto">
        <Form {...form}>
          <form id="admin-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 min-h-full">
            {/* Admin Information Section */}
            <div>
              <h3 className="text-[16px] font-medium text-gray-900 mb-4">Edit Admin Information</h3>
              <p className="text-[14px] text-gray-600 mb-6">
                Update the admin user details for {admin?.first_name} {admin?.last_name}.
              </p>
            </div>

            {/* First Name */}
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    First Name<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                      placeholder="John" 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Last Name<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                      placeholder="Doe" 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Email<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="email"
                      className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                      placeholder="john.doe@example.com" 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization */}
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Organization<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <select
                        {...field}
                        disabled={isLoading || loadingOrganizations}
                        className="h-[48px] w-full border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg px-3 bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select an organization</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id.toString()}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#4F46E5]">
                        {loadingOrganizations ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Status<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <select
                        {...field}
                        disabled={isLoading}
                        className="h-[48px] w-full border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg px-3 bg-white appearance-none cursor-pointer"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#4F46E5]">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-2 h-[44px] text-[14px] font-medium"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading || loadingOrganizations}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2 h-[44px] text-[14px] font-medium"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Admin'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </SlideModal>
  );
}