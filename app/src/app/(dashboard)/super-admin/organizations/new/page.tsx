'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import SlideModal from '@/components/ui/SlideModal';
import { useCreateOrganization } from "@/hooks/api";

// Zod validation schema
const organizationSchema = z.object({
  name: z.string()
    .min(2, "Organization name must be at least 2 characters")
    .max(255, "Organization name must not exceed 255 characters"),
  is_active: z.string(), // Remove default to make it required
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function NewOrganizationPage() {
  const router = useRouter();
  const createOrganizationMutation = useCreateOrganization();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      is_active: "true",
    },
    mode: 'onChange',
  });

  const handleClose = useCallback(() => {
    router.push('/super-admin/organizations');
  }, [router]);

  const handleClear = useCallback(() => {
    form.reset({
      name: '',
      is_active: "true",
    });
    toast.info("Form cleared");
  }, [form]);

  const onSubmit = async (values: any) => {
    try {
      // Prepare data for API
      const organizationData = {
        name: values.name,
        is_active: values.is_active === "true",
      };
      
      // Use standardized hook
      await createOrganizationMutation.mutateAsync(organizationData);
      
      toast.success('Organization created successfully! You can now create an admin for this organization.');
      
      // Close modal and navigate back
      handleClose();
      
    } catch (error: any) {
      console.error('Error creating organization:', error);
      
      // Handle validation errors from backend
      if (error.status === 400 && error.data) {
        if (error.data.name) {
          form.setError('name', { 
            message: Array.isArray(error.data.name) ? error.data.name[0] : error.data.name 
          });
        }
        
        // Show general error for other validation issues
        const errorMessage = error.data.detail || 
                           error.data.message || 
                           error.data.non_field_errors?.[0] || 
                           'Validation failed';
        toast.error(errorMessage);
      } else {
        // Handle other errors
        toast.error(error.message || 'Failed to create organization. Please try again.');
      }
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

  return (
    <SlideModal
      isOpen={true}
      onClose={handleClose}
      title="Add New Organization"
      width="md"
      showCloseButton={true}
    >
      <div className="px-6 py-6">
        <Form {...form}>
          <form id="organization-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Information Section */}
            <div>
              <h3 className="text-[16px] font-medium text-gray-900 mb-4">Organization Information</h3>
              <p className="text-[14px] text-gray-600 mb-6">
                Create the organization first. After this, you can add an admin for this organization in the "Manage Admins" section.
              </p>
            </div>

            {/* Organization Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Organization Name<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                      placeholder="CG Group Pvt.Ltd" 
                      disabled={createOrganizationMutation.isPending}
                    />
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
                        disabled={createOrganizationMutation.isPending}
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
                disabled={createOrganizationMutation.isPending}
                className="px-6 py-2 h-[44px] text-[14px] font-medium"
              >
                Clear
              </Button>
              
              <Button
                type="submit"
                disabled={createOrganizationMutation.isPending}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2 h-[44px] text-[14px] font-medium"
              >
                {createOrganizationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </SlideModal>
  );
}
