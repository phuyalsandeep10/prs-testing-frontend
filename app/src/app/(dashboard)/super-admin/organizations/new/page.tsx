'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

// Zod validation schema - only organization fields
const organizationSchema = z.object({
  name: z.string()
    .min(2, "Organization name must be at least 2 characters")
    .max(255, "Organization name must not exceed 255 characters"),
  is_active: z.string().default("true"),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function NewOrganizationPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      is_active: "true",
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 16);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => router.push('/super-admin/organizations'), 300);
  }, [router]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleClear = useCallback(() => {
    form.reset({
      name: '',
      is_active: "true",
    });
    toast.info("Form cleared");
  }, [form]);

  const onSubmit = async (values: OrganizationFormData) => {
    console.log('Form submitted with values:', values);
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('Auth token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setIsLoading(false);
        return;
      }

      // Validate required fields
      if (!values.name || !values.is_active) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
      
      const requestBody = {
        name: values.name,
        is_active: values.is_active === "true",
      };
      
      console.log('Sending request:', requestBody);
      
      // Create only the organization (no admin user)
      const response = await fetch('http://localhost:8000/api/v1/organizations/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.name) {
          form.setError('name', { message: Array.isArray(data.name) ? data.name[0] : data.name });
        }
        
        // Show general error for other issues
        const errorMessage = data.detail || data.message || data.non_field_errors?.[0] || 'Failed to create organization';
        toast.error(errorMessage);
        return;
      }

      toast.success('Organization created successfully! You can now create an admin for this organization.');
      console.log('Organization created successfully:', data);
      
      // Close modal first
      handleClose();
      
      // Refresh the organizations list by triggering a custom event
      window.dispatchEvent(new CustomEvent('organizationCreated', { detail: data }));
      
      // Fallback: refresh page if custom event doesn't work
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
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

  const modal = (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-[99999]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 99999 }}
    >
      <div 
        className="ml-auto w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[100000] flex flex-col"
        style={{ 
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)', 
          zIndex: 100000,
          height: '100vh',
          minHeight: '100vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#16A34A]">
              Add New Organization
            </h2>
            <button 
              onClick={handleClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-visible px-6 py-6">
          <Form {...form}>
            <form id="organization-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Organization Information Section */}
              <div>
                <h3 className="text-[16px] font-medium text-gray-900 mb-4">Organization Information</h3>
                <p className="text-[14px] text-gray-600 mb-6">Create the organization first. After this, you can add an admin for this organization in the "Manage Admins" section.</p>
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
                        disabled={isLoading}
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
                          disabled={isLoading}
                          className="h-[48px] w-full border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg px-3 bg-white appearance-none cursor-pointer"
                        >
                          <option value="">Select status</option>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Footer - At Very Bottom */}
        <div className="px-6 py-6 bg-gradient-to-r from-[#4F46E5] via-[#7C8FE8] to-[#A8B5EB] flex-shrink-0 mt-auto border-t-0">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-8 py-2 h-[44px] text-[14px] font-medium rounded-lg"
            >
              Clear
            </Button>
            <Button
              type="submit"
              form="organization-form"
              disabled={isLoading}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-2 h-[44px] text-[14px] font-medium rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render portal only on client side
  if (typeof window === 'undefined') return null;

  return createPortal(modal, document.body);
} 