/**
 * @deprecated This entire file is deprecated. Use useAuth from @/stores instead
 * Keeping for backward compatibility only - migrating to Zustand AuthStore
 */

import { useAuth } from "@/stores";

interface UseAuthTokenResult {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearToken: () => void;
  refreshToken: () => void;
}

export function useAuthToken(): UseAuthTokenResult {
  const auth = useAuth();

  return {
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: !auth.isHydrated, // Loading until hydrated
    error: !auth.isAuthenticated && auth.isHydrated ? "Not authenticated" : null,
    clearToken: auth.logout,
    refreshToken: () => {
      // No-op for now - Zustand handles this automatically
    },
  };
}

/**
 * @deprecated Use the standardized API client instead
 * Hook for making authenticated API requests using Zustand AuthStore
 */
export function useAuthenticatedFetch() {
  const auth = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    // Wait for auth to be ready before making requests
    if (!auth.isHydrated) {
      throw new Error("Authentication not ready yet. Please wait...");
    }

    if (!auth.token || !auth.isAuthenticated) {
      throw new Error("No authentication token available");
    }

    console.log('🌐 Making authenticated request to:', url);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        Authorization: `Token ${auth.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        auth.logout();
        throw new Error("Authentication failed. Please log in again.");
      }

      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  };

  return {
    authenticatedFetch,
    isAuthenticated: auth.isAuthenticated,
    token: auth.token,
  };
}