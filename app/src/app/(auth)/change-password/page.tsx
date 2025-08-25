'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { PasswordChangeResponse, ApiResponse } from '@/types';

const passwordChangeSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
});

export default function ChangePasswordPage() {
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [userType, setUserType] = React.useState<string>('');
  const router = useRouter();

  // Check user type and session validity on component mount
  React.useEffect(() => {
    const tempToken = localStorage.getItem('tempToken');
    const tempEmail = localStorage.getItem('tempEmail');
    const storedUserType = localStorage.getItem('userType');

    console.log('🔍 Debug localStorage values:', {
      tempToken: tempToken ? 'Present' : 'Missing',
      tempEmail: tempEmail ? 'Present' : 'Missing', 
      storedUserType: storedUserType || 'Missing'
    });

    // Check if user has temporary credentials (required for password change)
    if (!tempToken || !tempEmail) {
      console.log('❌ No temporary credentials found - redirecting to login');
      setError('Session expired. Please login again.');
      router.push('/login');
      return;
    }

    // Set user type (both super_admin and org_admin are allowed)
    if (storedUserType) {
      setUserType(storedUserType);
    } else {
      // If no userType, set as org_admin since they're the primary users for temporary passwords
      console.log('⚠️ No userType found - setting as org_admin (default for temp passwords)');
      setUserType('org_admin');
    }
  }, [router]);

  // Always call useForm at the top level (before any conditional returns)
  const form = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = form.watch('newPassword') || '';

  // Password validation checks
  const validations = [
    {
      label: 'A minimum of 8 characters',
      isValid: newPassword.length >= 8,
    },
    {
      label: 'At least one special character',
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
    {
      label: 'At least one number',
      isValid: /[0-9]/.test(newPassword),
    },
    {
      label: 'At least one uppercase letter',
      isValid: /[A-Z]/.test(newPassword),
    },
  ];

  React.useEffect(() => {
    // Check if we have the required temporary token and email
    const tempToken = localStorage.getItem('tempToken');
    const tempEmail = localStorage.getItem('tempEmail');
    
    if (!tempToken || !tempEmail) {
      // No temporary credentials, redirect to login
      router.push('/login');
    }
  }, [router]);

  const onSubmit = async (values: z.infer<typeof passwordChangeSchema>) => {
    setIsLoading(true);
    setError('');

    try {
      const tempToken = localStorage.getItem('tempToken');
      const tempEmail = localStorage.getItem('tempEmail');

      if (!tempToken || !tempEmail) {
        setError('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      console.log('🔑 Attempting password change for:', tempEmail);
      console.log('🎫 Using temporary token:', tempToken ? 'Present' : 'Missing');
      
      const requestData = {
        email: tempEmail,
        new_password: values.newPassword,
        temporary_token: tempToken
      };
      
      console.log('📤 Password change request:', requestData);
      console.log('🔍 Current userType for context:', userType);
      
      // Try different endpoints for first-time password setup
      console.log('🔄 Trying /auth/password/set/ endpoint first...');
      let response: ApiResponse<PasswordChangeResponse>;
      try {
        response = await apiClient.post<PasswordChangeResponse>('/auth/password/set/', requestData);
      } catch (setError: any) {
        console.log('❌ /auth/password/set/ failed, trying /auth/change-password:', setError.message);
        response = await apiClient.post<PasswordChangeResponse>('/auth/change-password', requestData);
      }
      
      const data = response.data;
      
      console.log('📥 Password change response data:', response);

      if (data) {
        // Password changed successfully
        console.log('✅ Password changed successfully');
        
        // Store the new auth token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Clean up temporary credentials
        localStorage.removeItem('tempToken');
        localStorage.removeItem('tempEmail');
        
        // Redirect based on user role - check both user_type and role fields
        const userTypeFromResponse = data.user?.user_type;
        const userRoleData = data.user?.role;
        let userRole = '';
        
        // First check user_type field (which our backend returns)
        if (userTypeFromResponse && typeof userTypeFromResponse === 'string') {
          userRole = userTypeFromResponse.toLowerCase();
        }
        // Fallback to role field if user_type is not available
        else if (typeof userRoleData === 'string') {
          userRole = userRoleData.toLowerCase();
        } else if (userRoleData && typeof userRoleData === 'object') {
          userRole = ((userRoleData as any).name || '').toLowerCase();
        }
        
        console.log('🎭 User role for redirect:', userRole, 'From user_type:', userTypeFromResponse, 'From role:', userRoleData);
        
        // Check if user is super admin
        if (data.user?.is_superuser || userRole?.includes('super')) {
          console.log('🔐 Redirecting to super-admin dashboard');
          router.push('/super-admin');
        } else if (userRole === 'org_admin' || userRole?.includes('admin')) {
          console.log('🏢 Redirecting to org-admin dashboard');
          router.push('/org-admin');
        } else if (userRole?.includes('salesperson')) {
          console.log('💼 Redirecting to salesperson dashboard');
          router.push('/salesperson');
        } else if (userRole?.includes('verifier')) {
          console.log('✅ Redirecting to verifier dashboard');
          router.push('/verifier');
        } else if (userRole?.includes('supervisor')) {
          console.log('👥 Redirecting to supervisor dashboard');
          router.push('/supervisor');
        } else if (userRole?.includes('team')) {
          console.log('👤 Redirecting to team-member dashboard');
          router.push('/team-member');
        } else {
          console.log('🏠 Default redirect to super-admin (unrecognized role)');
          console.log('🔍 Debug - userRole value:', JSON.stringify(userRole));
          router.push('/super-admin');
        }
      } else {
        // This shouldn't happen with apiClient, but just in case
        console.error('❌ Unexpected response structure:', data);
        setError('Unexpected response from server. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Password change error:', {
        name: error?.name || 'Unknown',
        message: error?.message || 'Unknown error',
        code: error?.code,
        status: error?.status,
        details: error?.details
      });
      
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else if (error?.message) {
        setError(`Failed to change password: ${error.message}`);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking user type - but only briefly for session validation
  if (!userType) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex flex-col items-center justify-center space-y-4">
            <Image src="/PRSlogo.png" alt="PRS Logo" width={100} height={100} />
            <h1 className="text-lg font-semibold text-gray-700">Payment Receiving System</h1>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex flex-col items-center justify-center space-y-4">
          <Image src="/PRSlogo.png" alt="PRS Logo" width={100} height={100} />
          <h1 className="text-lg font-semibold text-gray-700">Payment Receiving System</h1>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Set Your Password
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Please set a new secure password for your administrator account
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4F46E5]">
                      New Password<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          {...field}
                          className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg pr-12"
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Requirements */}
              <div className="space-y-4">
                <p className="text-base font-semibold text-gray-900">
                  Your password must contain:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {validations.map((validation, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        validation.isValid ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {validation.isValid && (
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${
                        validation.isValid ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {validation.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4F46E5]">
                      Confirm New Password<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          {...field}
                          className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg pr-12"
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full justify-center rounded-md border border-transparent bg-[#4F46E5] px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
} 