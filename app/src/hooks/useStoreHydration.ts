"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

/**
 * Custom hook to handle Zustand store hydration and prevent SSR mismatches
 * This hook ensures that stores are properly hydrated before components rely on their state
 */
export const useStoreHydration = () => {
  const [isHydrationComplete, setIsHydrationComplete] = useState(false);
  
  // Get hydration states from stores
  const isAuthHydrated = useAuthStore((state) => state.isHydrated);
  const isUIHydrated = useUIStore((state) => state.isHydrated);
  
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

    // Wait for both stores to be hydrated
    if (isAuthHydrated && isUIHydrated) {
      setIsHydrationComplete(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Store hydration complete');
      }
    }
  }, [isAuthHydrated, isUIHydrated]);

  // For client-side only functionality
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Force hydration check after a timeout to handle edge cases
    const timeoutId = setTimeout(() => {
      if (!isHydrationComplete) {
        console.warn('⚠️ Store hydration timeout - forcing completion');
        setIsHydrationComplete(true);
      }
    }, 1000); // 1 second timeout

    return () => clearTimeout(timeoutId);
  }, [isHydrationComplete]);

  return {
    isHydrationComplete,
    isAuthHydrated,
    isUIHydrated,
  };
};

/**
 * Hook specifically for auth-dependent components
 * Returns null while hydrating to prevent SSR mismatches
 */
export const useAuthWithHydration = () => {
  const authStore = useAuthStore();
  const { isHydrationComplete } = useStoreHydration();

  // Return null while hydrating to prevent SSR mismatches
  if (!isHydrationComplete) {
    return {
      ...authStore,
      isAuthenticated: false,
      user: null,
      token: null,
      isAuthInitialized: false,
      isHydrating: true,
    };
  }

  return {
    ...authStore,
    isHydrating: false,
  };
};

/**
 * Hook specifically for UI store with hydration safety
 */
export const useUIWithHydration = () => {
  const uiStore = useUIStore();
  const { isHydrationComplete } = useStoreHydration();

  // Return safe defaults while hydrating
  if (!isHydrationComplete) {
    return {
      ...uiStore,
      sidebarCollapsed: false,
      theme: 'system' as const,
      isHydrating: true,
    };
  }

  return {
    ...uiStore,
    isHydrating: false,
  };
};