import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { useAuth } from '@/stores';
import { USER_ROLES } from '@/lib/constants';
import { toast } from 'sonner';

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Password Change Mutation Hook with role validation and event logging
export const usePasswordChange = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: PasswordChangeData) => {
      // Debug: Log all available data
      console.log('Debug - Available data:', {
        user: user,
        hasUser: !!user
      });

      if (!user) {
        console.error('No user data available:', { user });
        throw new ApiError(
          'User authentication failed. Please log in again.',
          'USER_DATA_UNAVAILABLE'
        );
      }

      // Debug: Log user role for troubleshooting
      console.log('Password change attempt:', { 
        userRole: user?.role, 
        verifierRole: USER_ROLES.VERIFIER, 
        salespersonRole: USER_ROLES.SALESPERSON,
        roleMatch: user?.role === USER_ROLES.VERIFIER || user?.role === USER_ROLES.SALESPERSON
      });

      // Early validation - check if user role is allowed to change password
      if (user.role === USER_ROLES.VERIFIER || user.role === USER_ROLES.SALESPERSON) {
        console.log('Blocking password change for restricted role:', user.role);
        
        // Log unauthorized attempt (don't await to avoid blocking the error message)
        logUnauthorizedPasswordChangeAttempt(user.id, user.role, user.org_id).catch(console.warn);
        
        // Send notification to org admin (don't await to avoid blocking the error message)
        notifyOrgAdminOfAttempt(user.id, user.role, user.org_id).catch(console.warn);
        
        throw new ApiError(
          'You are not allowed to change your password. If you need to change your password, please contact your administrator.',
          'PERMISSION_DENIED',
          { 
            role: user.role, 
            userId: user.id,
            action: 'password_change_attempt'
          }
        );
      }

      try {
        const response = await apiClient.changePassword(data);
        return response.data;
      } catch (error) {
        console.error('Password change error:', error);
        
        // If it's our custom permission error, re-throw it
        if (error instanceof ApiError && error.code === 'PERMISSION_DENIED') {
          throw error;
        }
        
        // For other API errors, check if there's a specific message
        if (error instanceof ApiError) {
          throw error;
        }
        
        // For unknown errors, wrap them
        throw new ApiError(
          'An unexpected error occurred while changing password',
          'UNKNOWN_ERROR'
        );
      }
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      console.log('Password changed successfully');
    },
    onError: (error: ApiError) => {
      console.error('Password change failed:', error);
      
      if (error.code === 'PERMISSION_DENIED') {
        toast.error(error.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to change password. Please check your current password and try again.');
      }
    },
  });
};

// Function to log unauthorized password change attempts
async function logUnauthorizedPasswordChangeAttempt(userId: string, role: string, orgId?: string) {
  try {
    await apiClient.post('/security/events/', {
      event_type: 'unauthorized_password_change_attempt',
      user_id: userId,
      role: role,
      org_id: orgId,
      details: {
        timestamp: new Date().toISOString(),
        action: 'password_change_attempt',
        status: 'blocked'
      }
    });
  } catch (error) {
    console.warn('Failed to log security event:', error);
  }
}

// Function to notify org admin of unauthorized attempt
async function notifyOrgAdminOfAttempt(userId: string, role: string, orgId?: string) {
  try {
    await apiClient.post('/notifications/security-alert/', {
      type: 'security_alert',
      priority: 'high',
      recipient_type: 'org_admin',
      org_id: orgId,
      message: `User with ID ${userId} (role: ${role}) attempted to change their password but was denied due to role restrictions.`,
      details: {
        user_id: userId,
        role: role,
        attempted_action: 'password_change',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.warn('Failed to send security notification:', error);
  }
}

// Hook with convenient interface
export const usePasswordManagement = () => {
  const { user } = useAuth();
  const passwordChangeMutation = usePasswordChange();
  
  // Check if user is allowed to change password
  const canChangePassword = user?.role !== USER_ROLES.VERIFIER && user?.role !== USER_ROLES.SALESPERSON;

  return {
    // Actions
    changePassword: passwordChangeMutation.mutate,
    changePasswordAsync: passwordChangeMutation.mutateAsync,
    
    // State
    isChanging: passwordChangeMutation.isPending,
    isSuccess: passwordChangeMutation.isSuccess,
    isError: passwordChangeMutation.isError,
    error: passwordChangeMutation.error,
    
    // Permissions
    canChangePassword,
    
    // Utils
    reset: passwordChangeMutation.reset,
  };
}; 