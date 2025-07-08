import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to ensure authentication is properly initialized after Zustand hydration
 * This prevents race conditions where API calls are made before auth state is hydrated
 */
export const useAuthInitialization = () => {
  const { isAuthInitialized, setAuthInitialized } = useAuthStore();

  useEffect(() => {
    // Ensure auth is marked as initialized after hydration
    if (!isAuthInitialized) {
      const timer = setTimeout(() => {
        setAuthInitialized(true);
      }, 100); // Small delay to ensure hydration completes

      return () => clearTimeout(timer);
    }
  }, [isAuthInitialized, setAuthInitialized]);

  return isAuthInitialized;
};

/**
 * Hook to check if authentication is ready for API calls
 * This combines initialization state with user presence
 */
export const useAuthReady = () => {
  const { isAuthInitialized, user, isAuthenticated } = useAuthStore();
  
  return {
    isAuthReady: isAuthInitialized && (isAuthenticated ? !!user : true),
    isAuthInitialized,
    isAuthenticated,
    user,
  };
}; 