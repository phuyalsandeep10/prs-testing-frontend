import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Password Change Mutation Hook
export const usePasswordChange = () => {
  return useMutation({
    mutationFn: async (data: PasswordChangeData) => {
      const response = await apiClient.changePassword(data);
      return response.data;
    },
    onSuccess: () => {
      // Password changed successfully
      console.log('Password changed successfully');
    },
    onError: (error) => {
      console.error('Password change failed:', error);
    },
  });
};

// Hook with convenient interface
export const usePasswordManagement = () => {
  const passwordChangeMutation = usePasswordChange();

  return {
    // Actions
    changePassword: passwordChangeMutation.mutate,
    changePasswordAsync: passwordChangeMutation.mutateAsync,
    
    // State
    isChanging: passwordChangeMutation.isPending,
    isSuccess: passwordChangeMutation.isSuccess,
    isError: passwordChangeMutation.isError,
    error: passwordChangeMutation.error,
    
    // Utils
    reset: passwordChangeMutation.reset,
  };
}; 