'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import SlideModal from '@/components/ui/SlideModal';
import { useOrganizations, useCreateAdmin, useCreateRole } from "@/hooks/api";

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

export default function NewAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgParam = searchParams.get('org');
  
  // Use standardized hooks
  const { data: organizations = [], isLoading: loadingOrganizations } = useOrganizations();
  const createAdminMutation = useCreateAdmin();
  const createRoleMutation = useCreateRole();

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

  const handleClose = useCallback(() => {
    router.push('/super-admin/manage-admins');
  }, [router]);

  const handleClear = useCallback(() => {
    form.reset({
      first_name: '',
      last_name: '',
      email: '',
      organization: '',
      is_active: "true",
    });
    toast.info("Form cleared");
  }, [form]);

  const onSubmit = async (values: AdminFormData) => {
    try {
      // Find the selected organization name from the organizations list
      const selectedOrg = organizations.find(org => org.id.toString() === values.organization);
      const organizationName = selectedOrg ? selectedOrg.name : values.organization;

      // Create the admin user - the backend will handle role creation automatically
      const adminData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        organization: organizationName, // Send name as string
        is_active: values.is_active === "true",
        // No need to specify org_role - backend will create/get Org Admin role automatically
      };
      
      await createAdminMutation.mutateAsync(adminData);
      
      toast.success('Admin created successfully! A temporary password has been sent to their email.');
      
      // Close modal and navigate back
      handleClose();
      
    } catch (error: any) {
      console.error('Error creating admin:', error);
      
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
        toast.error(error.message || 'Failed to create admin. Please try again.');
      }
    }
  };

  // Pre-select organization if org parameter is provided
  useEffect(() => {
    if (orgParam && organizations.length > 0 && !form.getValues().organization) {
      const orgExists = organizations.find(org => org.id.toString() === orgParam);
      if (orgExists) {
        form.setValue('organization', orgParam);
        toast.info(`Pre-selected organization: ${orgExists.name}`);
      }
    }
  }, [orgParam, organizations, form]);

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

  const isLoading = createAdminMutation.isPending || createRoleMutation.isPending;

  return (
    <SlideModal
      isOpen={true}
      onClose={handleClose}
      title="Add New Admin"
      width="md"
      showCloseButton={true}
    >
      <div className="px-6 py-6 flex-1 overflow-y-auto">
        <Form {...form}>
          <form id="admin-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 min-h-full">
            {/* Admin Information Section */}
            <div>
              <h3 className="text-[16px] font-medium text-gray-900 mb-4">Admin Information</h3>
              <p className="text-[14px] text-gray-600 mb-6">
                Create an admin user for an organization. A temporary password will be sent to their email.
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
                onClick={handleClear}
                disabled={isLoading}
                className="px-6 py-2 h-[44px] text-[14px] font-medium"
              >
                Clear
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading || loadingOrganizations}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2 h-[44px] text-[14px] font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Admin'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </SlideModal>
  );
}
