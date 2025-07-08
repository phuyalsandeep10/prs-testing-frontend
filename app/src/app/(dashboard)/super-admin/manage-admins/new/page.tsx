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

// Type definitions
interface Organization {
  id: number;
  name: string;
  is_active: boolean;
}

interface Role {
  id: number;
  name: string;
  organization: number | null;
}

// Zod validation schema - removed password fields since they're auto-generated
const adminSchema = z.object({
  first_name: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  last_name: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
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
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);

  // Debug logging for state changes
  useEffect(() => {
    console.log('Organizations state updated:', organizations);
    console.log('Loading organizations state:', loadingOrganizations);
  }, [organizations, loadingOrganizations]);

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

  // Load organizations function
  const loadOrganizations = async () => {
    console.log('Loading organizations...');
    setLoadingOrganizations(true);
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('Using auth token:', token ? 'Token present' : 'No token');
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        setLoadingOrganizations(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/organizations/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response data:', data);
        
        const orgsList = Array.isArray(data) ? data : data.results || [];
        console.log('Processed organizations list:', orgsList);
        
        setOrganizations(orgsList);
        
        if (orgsList.length === 0) {
          console.warn('No organizations found in the response');
          toast.info('No organizations found. Please create an organization first.');
        } else {
          console.log(`Successfully loaded ${orgsList.length} organizations`);
          toast.success(`Loaded ${orgsList.length} organization${orgsList.length !== 1 ? 's' : ''}`);
        }
      } else {
        const errorData = await response.text();
        console.error('Failed to load organizations:', response.status, errorData);
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          toast.error('Access denied. You need super admin permissions.');
        } else {
          toast.error(`Failed to load organizations (Status: ${response.status})`);
        }
      }
    } catch (error) {
      console.error('Network error loading organizations:', error);
      toast.error('Network error. Please check if the backend server is running.');
    } finally {
      setLoadingOrganizations(false);
    }
  };

  // Load organizations on component mount and listen for organization creation events
  useEffect(() => {
    loadOrganizations();

    // Listen for organization creation events to refresh dropdown
    const handleOrganizationCreated = (event: any) => {
      console.log('Organization created event received in admin form:', event.detail);
      toast.success('Organization list updated');
      loadOrganizations();
    };

    window.addEventListener('organizationCreated', handleOrganizationCreated);

    return () => {
      window.removeEventListener('organizationCreated', handleOrganizationCreated);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 16);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => router.push('/super-admin/manage-admins'), 300);
  }, [router]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

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
    console.log('Admin form submitted with values:', values);
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
      if (!values.first_name || !values.last_name || !values.email || !values.organization || !values.is_active) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
      
      // First, get or create the Org Admin role for the selected organization
      let orgAdminRoleId = null;
      
      try {
        // Check if Org Admin role exists for this organization
        const rolesResponse = await fetch(`http://localhost:8000/api/v1/permissions/roles/?organization=${values.organization}`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          console.log('Existing roles for organization:', rolesData);
          const roles = Array.isArray(rolesData) ? rolesData : rolesData.results || [];
          
          // Look for existing Org Admin role
          const orgAdminRole = roles.find((role: Role) => role.name === 'Org Admin');
          
          if (orgAdminRole) {
            orgAdminRoleId = orgAdminRole.id;
            console.log('Found existing Org Admin role ID:', orgAdminRoleId);
          } else {
            console.log('Org Admin role not found, creating new one...');
            
            // Create the Org Admin role for this organization
            const createRoleResponse = await fetch('http://localhost:8000/api/v1/permissions/roles/', {
              method: 'POST',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: 'Org Admin',
                organization: parseInt(values.organization),
              }),
            });

            if (createRoleResponse.ok) {
              const newRole = await createRoleResponse.json();
              orgAdminRoleId = newRole.id;
              console.log('Created new Org Admin role with ID:', orgAdminRoleId);
            } else {
              const errorData = await createRoleResponse.json().catch(() => ({}));
              console.error('Failed to create Org Admin role:', createRoleResponse.status, errorData);
            }
          }
        } else {
          console.log('Failed to fetch roles:', rolesResponse.status);
        }
      } catch (error) {
        console.error('Error handling Org Admin role:', error);
      }

      // Create the admin user
      const userData = {
        username: values.email, // Use email as username
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        organization: parseInt(values.organization),
        org_role: orgAdminRoleId,
        is_active: values.is_active === "true",
      };

      console.log('Sending admin creation request:', userData);

      const response = await fetch('http://localhost:8000/api/v1/auth/users/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Admin creation response status:', response.status);
      const data = await response.json();
      console.log('Admin creation response data:', data);

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.email) {
          form.setError('email', { message: Array.isArray(data.email) ? data.email[0] : data.email });
        }
        if (data.username) {
          form.setError('email', { message: Array.isArray(data.username) ? data.username[0] : data.username });
        }
        if (data.first_name) {
          form.setError('first_name', { message: Array.isArray(data.first_name) ? data.first_name[0] : data.first_name });
        }
        if (data.last_name) {
          form.setError('last_name', { message: Array.isArray(data.last_name) ? data.last_name[0] : data.last_name });
        }
        if (data.organization) {
          form.setError('organization', { message: Array.isArray(data.organization) ? data.organization[0] : data.organization });
        }
        
        // Show general error for other issues
        const errorMessage = data.detail || data.message || data.non_field_errors?.[0] || 'Failed to create admin';
        toast.error(errorMessage);
        return;
      }

      // Backend now handles sending credentials
      toast.success(
        `Admin created successfully! Login credentials have been sent to ${values.email}.`
      );
      
      // Close modal first
      handleClose();
      
      // Dispatch custom event to update admin list without full page reload
      window.dispatchEvent(new CustomEvent('adminCreated', { detail: data }));
      
      // Fallback: refresh page if custom event doesn't work
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating admin:', error);
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
              Add New Admin
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
            <form id="admin-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Admin Information Section */}
              <div>
                <h3 className="text-[16px] font-medium text-gray-900 mb-4">Admin Information</h3>
                <p className="text-[14px] text-gray-600 mb-6">Create an organization admin. Login credentials will be automatically sent to the provided email address.</p>
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Admin Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                      Admin Email<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="email"
                        className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                        placeholder="admin@company.com" 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin Organization */}
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                      Admin Organization<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      {loadingOrganizations ? (
                        <div className="h-[48px] border-2 border-[#4F46E5] rounded-lg flex items-center px-3 bg-gray-50">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-gray-600">Loading organizations...</span>
                        </div>
                      ) : organizations.length === 0 ? (
                        <div className="h-[48px] border-2 border-gray-300 rounded-lg flex items-center px-3 bg-gray-50">
                          <span className="text-gray-500">No organizations found. Please create one first.</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            {...field}
                            disabled={isLoading}
                            className="h-[48px] w-full border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg px-3 bg-white appearance-none cursor-pointer"
                          >
                            <option value="">Select organization</option>
                            {organizations.map((org) => (
                              <option key={org.id} value={org.id.toString()}>
                                {org.name} ({org.is_active ? 'Active' : 'Inactive'})
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </FormControl>
                    {organizations.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Found {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
                      </div>
                    )}
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
              form="admin-form"
              disabled={isLoading || loadingOrganizations}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-2 h-[44px] text-[14px] font-medium rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Save Admin"
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