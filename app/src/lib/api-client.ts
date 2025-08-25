/**
 * Standardized API Client for React Query Integration
 * Enhanced with security features while maintaining compatibility
 */

import { secureStorage } from './security/secureStorage';
import { ApiResponse, PaginatedResponse } from '@/types';

// Type guard for API responses
function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return response && 
         typeof response === 'object' && 
         'data' in response &&
         typeof response.success === 'boolean';
}

// Type guard for paginated responses
function isPaginatedResponse<T>(response: any): response is PaginatedResponse<T> {
  return response && 
         typeof response === 'object' && 
         'data' in response && 
         Array.isArray(response.data) &&
         'pagination' in response;
}

// Type guard for checking if response has data property
function hasDataProperty(response: any): response is { data: any } {
  return response && typeof response === 'object' && 'data' in response;
}

// Safe property access helper
function safeGetProperty<T>(obj: any, property: string, defaultValue: T): T {
  try {
    return obj && typeof obj === 'object' && property in obj ? obj[property] : defaultValue;
  } catch {
    return defaultValue;
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class StandardApiClient {
  private baseURL: string;
  private timeout: number;
  private controller: AbortController | null = null;

  constructor() {
    // Determine API base URL (defaults to Django `/api` namespace)
    const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

    // 1. Remove any trailing slashes so we can safely append our own
    let normalized = rawBase.replace(/\/+$/, '');

    // 2. Use normalized base as-is (do not enforce additional path segments)
    this.baseURL = normalized;
    this.timeout = 10000;
    
    // Setup periodic security cleanup
    if (typeof window !== 'undefined') {
      // Clean up expired storage entries every 30 minutes
      setInterval(() => {
        secureStorage.cleanupExpired();
      }, 30 * 60 * 1000);
    }
  }

  /**
   * Get auth token from Zustand AuthStore
   * Falls back to localStorage during hydration
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      // Get AuthStore state directly
      const { useAuthStore } = require('@/stores/authStore');
      const store = useAuthStore.getState();
      
      // If store is hydrated and authenticated, use its token
      if (store.isHydrated && store.isAuthenticated && store.token) {
        console.log('🔑 Using token from AuthStore');
        return store.token;
      }
      
      // If not hydrated yet, try localStorage as fallback
      if (!store.isHydrated) {
        const token = localStorage.getItem('authToken');
        if (token && this.isValidToken(token)) {
          console.log('🔄 Using localStorage token during hydration');
          return token;
        }
      }
    } catch (error) {
      console.warn('🔑 AuthStore not available:', error);
    }
    
    // Final fallback - check localStorage directly
    const token = localStorage.getItem('authToken');
    if (token && this.isValidToken(token)) {
      console.log('🔑 Using localStorage token as final fallback');
      return token;
    }
    
    console.warn('🔑 No valid authentication token found');
    return null;
  }

  /**
   * Get consistent headers for all requests
   */
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Token ${token}`;
        console.log('🔑 Authorization header added to request');
      } else {
        console.warn('🔑 No token available for authorization header');
      }
    }

    return headers;
  }

  /**
   * Generic request method with consistent error handling and retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true,
    retryCount = 0
  ): Promise<T> {
    const timeoutId = setTimeout(() => {
      if (this.controller) {
        this.controller.abort();
      }
    }, this.timeout);

    try {
      // Ensure proper URL construction with slash separation
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${this.baseURL}${normalizedEndpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (includeAuth) {
        const token = this.getAuthToken();
        if (token) {
          headers.Authorization = `Token ${token}`;
        }
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: this.controller?.signal,
      });

      clearTimeout(timeoutId);

      // Debug response details
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 API Request: ${options.method || 'GET'} ${endpoint}`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });
      }

      // Handle authentication failures (401). Keep token for 403 (permission error)
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        throw new ApiError('Authentication required', response.status, 'AUTH_ERROR');
      }

      // For 403 we surface a permission error but do NOT clear the token — user is still authenticated
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || 'You do not have permission to perform this action.',
          response.status,
          'PERMISSION_DENIED',
          errorData
        );
      }

      // Handle rate limiting (429) with retry information
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        const errorData = await response.json().catch(() => ({}));
        const message = `Rate limit exceeded. Please try again in ${retryAfter} seconds.`;
        console.warn(`🚦 Rate limit hit on ${endpoint}. Retry after ${retryAfter}s`);
        throw new ApiError(
          errorData.detail || message,
          response.status,
          'RATE_LIMITED',
          { ...errorData, retryAfter: parseInt(retryAfter) }
        );
      }

      // Handle successful but empty responses (e.g., 204 No Content)
      if (response.status === 204) {
        return Promise.resolve(null as T);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Debug: surface the full error payload in the browser console
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.error('[API ERROR]', response.status, url, errorData);
        }

        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code || 'API_ERROR',
          errorData
        );
      }

      const data = await response.json();
      
      // Validate response structure before returning
      if (data === null || data === undefined) {
        return data;
      }
      
      // Ensure we have a valid object response
      if (typeof data !== 'object') {
        console.warn('API returned non-object response:', typeof data);
      }
      
      // Standardize response structure access
      return this.normalizeResponse<T>(data);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error.message || 'Network error',
        error.status || 0,
        'NETWORK_ERROR',
        error
      );
    }
  }

  /**
   * Normalizes API response structure for consistent access
   * Handles different response formats and ensures consistent structure
   */
  private normalizeResponse<T>(data: any): T {
    // If data is already the expected type, return it
    if (data && typeof data === 'object') {
      // Handle standard ApiResponse<T> structure
      if ('data' in data && 'success' in data) {
        return data.data as T;
      }
      
      // Handle paginated responses
      if ('results' in data && 'count' in data) {
        return data.results as T;
      }
      
      // Handle direct data responses
      if (Array.isArray(data) || (typeof data === 'object' && !('error' in data))) {
        return data as T;
      }
      
      // Handle error responses
      if ('error' in data || 'detail' in data) {
        throw new ApiError(
          data.error?.message || data.detail || 'API returned an error',
          400,
          'API_ERROR',
          data
        );
      }
    }
    
    // Return data as-is if no normalization needed
    return data as T;
  }

  /**
   * GET request with proper type handling
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    // Convert number parameters to strings for URLSearchParams
    const stringParams = params ? Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key, 
        typeof value === 'number' ? value.toString() : value
      ])
    ) : {};
    
    const queryString = stringParams ? `?${new URLSearchParams(stringParams).toString()}` : '';
    const response = await this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
    
    // Ensure response follows ApiResponse structure
    if (isApiResponse<T>(response)) {
      return response;
    }
    
    // Wrap raw response in ApiResponse structure
    return {
      data: response as T,
      success: true,
      message: 'Success'
    };
  }

  /**
   * POST request with proper type handling
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Ensure response follows ApiResponse structure
    if (isApiResponse<T>(response)) {
      return response;
    }
    
    // Wrap raw response in ApiResponse structure
    return {
      data: response as T,
      success: true,
      message: 'Success'
    };
  }

  /**
   * PUT request with proper type handling
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Ensure response follows ApiResponse structure
    if (isApiResponse<T>(response)) {
      return response;
    }
    
    // Wrap raw response in ApiResponse structure
    return {
      data: response as T,
      success: true,
      message: 'Success'
    };
  }

  /**
   * PATCH request with proper type handling
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Ensure response follows ApiResponse structure
    if (isApiResponse<T>(response)) {
      return response;
    }
    
    // Wrap raw response in ApiResponse structure
    return {
      data: response as T,
      success: true,
      message: 'Success'
    };
  }

  /**
   * DELETE request with proper type handling
   */
  async delete(endpoint: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(endpoint, { method: 'DELETE' });
    
    // Handle null/void responses from 204 No Content
    if (response === null || response === undefined) {
      return {
        data: undefined as void,
        success: true,
        message: 'Deleted successfully'
      };
    }
    
    // Ensure response follows ApiResponse structure
    if (isApiResponse<void>(response)) {
      return response;
    }
    
    // Wrap raw response in ApiResponse structure
    return {
      data: undefined as void,
      success: true,
      message: 'Deleted successfully'
    };
  }

  /**
   * GET request with pagination support (legacy compatibility)
   */
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const allParams = { 
      page: page.toString(), 
      limit: limit.toString(), 
      ...Object.fromEntries(
        Object.entries(params || {}).map(([key, value]) => [
          key, 
          typeof value === 'number' ? value.toString() : value
        ])
      )
    };
    const queryString = `?${new URLSearchParams(allParams).toString()}`;
    const response = await this.request<any>(`${endpoint}${queryString}`, { method: 'GET' });
    
    // Ensure response follows PaginatedResponse structure
    if (isPaginatedResponse<T>(response)) {
      return response;
    }
    
    // Handle ApiResponse wrapper around paginated data
    if (isApiResponse<PaginatedResponse<T>>(response) && response.data && isPaginatedResponse<T>(response.data)) {
      return response.data;
    }
    
    // Handle direct array response - convert to paginated format
    if (Array.isArray(response)) {
      return {
        data: response,
        pagination: { page: 1, limit: response.length, total: response.length, totalPages: 1 }
      };
    }
    
    // Fallback for unexpected response format
    return {
      data: [],
      pagination: { page: 1, limit: 0, total: 0, totalPages: 0 }
    };
  }

  /**
   * File upload with FormData (POST)
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.postMultipart<T>(endpoint, formData);
  }

  /**
   * POST multipart request (legacy compatibility)
   */
  async postMultipart<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔍 [POSTMULTIPART_ERROR] Full error data:', JSON.stringify(errorData, null, 2));
        console.error('🔍 [POSTMULTIPART_ERROR] Response status:', response.status);
        console.error('🔍 [POSTMULTIPART_ERROR] URL:', url);
        if (errorData.error) {
          console.error('🔍 [POSTMULTIPART_ERROR] Nested error:', JSON.stringify(errorData.error, null, 2));
        }
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code || 'UPLOAD_ERROR',
          errorData
        );
      }

      const responseData = await response.json();
      
      // Ensure response follows ApiResponse structure
      if (isApiResponse<T>(responseData)) {
        return responseData;
      }
      
      // Wrap raw response in ApiResponse structure
      return {
        data: responseData,
        success: true,
        message: 'Upload successful'
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error?.name === 'AbortError') {
        throw new ApiError('Upload timeout', 408, 'TIMEOUT');
      }
      
      throw new ApiError(
        error?.message || 'Upload failed',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * PUT multipart request (legacy compatibility)
   */
  async putMultipart<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code || 'UPLOAD_ERROR',
          errorData
        );
      }

      const responseData = await response.json();
      
      // Ensure response follows ApiResponse structure
      if (isApiResponse<T>(responseData)) {
        return responseData;
      }
      
      // Wrap raw response in ApiResponse structure
      return {
        data: responseData,
        success: true,
        message: 'Upload successful'
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error?.name === 'AbortError') {
        throw new ApiError('Upload timeout', 408, 'TIMEOUT');
      }
      
      throw new ApiError(
        error?.message || 'Upload failed',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * PATCH multipart request (legacy compatibility)
   */
  async patchMultipart<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    console.log('🚀 PATCH MULTIPART REQUEST TO:', url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
        console.log('🔑 Token added to PATCH request');
      }
      
      // IMPORTANT: Do NOT set Content-Type for FormData - let browser set it with boundary
      console.log('🔥 About to send PATCH request...');

      const response = await fetch(url, {
        method: 'PATCH',
        body: formData,
        signal: controller.signal,
        headers,
      });
      
      console.log('📡 PATCH Response status:', response.status);
      console.log('📡 PATCH Response headers:', Object.fromEntries(response.headers.entries()));

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code || 'UPLOAD_ERROR',
          errorData
        );
      }

      const responseData = await response.json();
      
      // Ensure response follows ApiResponse structure
      if (isApiResponse<T>(responseData)) {
        return responseData;
      }
      
      // Wrap raw response in ApiResponse structure
      return {
        data: responseData,
        success: true,
        message: 'Upload successful'
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error?.name === 'AbortError') {
        throw new ApiError('Upload timeout', 408, 'TIMEOUT');
      }
      
      throw new ApiError(
        error?.message || 'Upload failed',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Authentication methods with enhanced security and AuthStore sync
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      // Validate token before storing
      if (this.isValidToken(token)) {
        // Store in secure storage for backup
        secureStorage.setItem('authToken', token);
        // Also store in regular localStorage for compatibility
        localStorage.setItem('authToken', token);
      } else {
        console.error('🔒 Invalid token format, not storing');
      }
    }
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      // Clear from all storage locations
      secureStorage.removeItem('authToken');
      localStorage.removeItem('authToken');
      
      // Also clear from AuthStore
      try {
        const { useAuthStore } = require('@/stores/authStore');
        const store = useAuthStore.getState();
        if (store.token) {
          store.logout();
        }
      } catch (error) {
        // AuthStore not available, continue
      }
    }
  }

  /**
   * Legacy compatibility methods
   */
  setAuth(token: string, ...args: any[]): void {
    this.setToken(token);
  }

  clearAuth(): void {
    this.clearToken();
  }

  /**
   * Validate token format to prevent XSS injection
   */
  private isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // Basic token format validation (adjust based on your token format)
    // This prevents script injection while allowing valid tokens
    const tokenRegex = /^[A-Za-z0-9_-]+$/;
    
    // Must be reasonable length (not too short, not suspiciously long)
    if (token.length < 10 || token.length > 500) return false;
    
    // Must not contain dangerous strings
    const dangerousPatterns = [
      '<script',
      'javascript:',
      'data:text/html',
      'onclick=',
      'onerror='
    ];
    
    const lowerToken = token.toLowerCase();
    if (dangerousPatterns.some(pattern => lowerToken.includes(pattern))) {
      return false;
    }
    
    return true;
  }

  getToken(): string | null {
    return this.getAuthToken();
  }

  /**
   * Convenience methods for common operations
   */
  async getDealById(id: string): Promise<any> {
    return this.get(`/deals/deals/${id}/`);
  }

  async getClientById(id: string): Promise<any> {
    return this.get(`/clients/${id}/`);
  }

  async getDealsByClientId(clientId: string): Promise<any> {
    return this.get(`/deals/deals/?client=${clientId}`);
  }

  /**
   * Profile Management
   */
  async getProfile(): Promise<any> {
    console.log('API Client - Fetching profile...'); // Debug log
    const result = await this.get('/auth/profile/');
    console.log('API Client - Profile fetch result (full):', result); // Debug log
    console.log('API Client - Profile fetch result.data:', result?.data); // Debug log
    
    // Handle different response structures
    if (result && typeof result === 'object') {
      // If result has data property, return it
      if (result.data) {
        console.log('Using result.data'); // Debug log
        return result;
      }
      // If result is already the user object (no wrapper), wrap it
      else if (result && typeof result === 'object' && ('id' in result || 'email' in result)) {
        console.log('Wrapping direct user object'); // Debug log
        return { data: result, success: true };
      }
    }
    
    console.warn('Unexpected profile response structure:', result); // Debug log
    return result;
  }

  async updateProfile(data: any): Promise<any> {
    console.log('=== API CLIENT UPDATE PROFILE DEBUG ===');
    console.log('API Client - Updating profile with data:', data);
    console.log('data.avatar exists:', !!data.avatar);
    console.log('data.avatar type:', typeof data.avatar);
    console.log('data.avatar instanceof File:', data.avatar instanceof File);
    console.log('About to check if avatar exists for multipart upload...');
    
    if (data.avatar) {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(data).forEach(key => {
        if (key !== 'avatar' && data[key] !== undefined) {
          formData.append(key, String(data[key]));
          console.log(`FormData added: ${key} = ${data[key]}`);
        }
      });
      
      // Add the file with the correct field name for Django's nested serializer
      console.log('Adding profile_picture to FormData:', data.avatar);
      console.log('File name:', data.avatar.name);
      console.log('File size:', data.avatar.size);
      console.log('File type:', data.avatar.type);
      formData.append('profile_picture', data.avatar);
      
      // Debug FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Use the main profile endpoint with multipart support
      const result = await this.patchMultipart('/auth/profile/', formData);
      console.log('API Client - Profile update result:', result);
      return result;
    } else {
      console.log('API Client - Updating profile without avatar');
      const result = await this.patch('/auth/profile/', data);
      console.log('API Client - Profile update result:', result);
      return result;
    }
  }

  /**
   * Password Management
   */
  async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<any> {
    return this.post('/auth/password/change/', data);
  }

  /**
   * Notification Methods
   */
  async getNotificationPreferences(): Promise<any> {
    try {
      console.log('API Client - Fetching notification preferences from /notifications/preferences/'); // Debug log
      const result = await this.get('/notifications/preferences/');
      console.log('API Client - Notification preferences result:', result); // Debug log
      console.log('API Client - Result type:', typeof result, 'Keys:', result ? Object.keys(result) : 'null'); // Debug log
      return result;
    } catch (error) {
      console.warn('API Client - Primary notification preferences endpoint failed:', error);
      try {
        console.log('API Client - Trying fallback endpoint /auth/users/notification-preferences/'); // Debug log
        const result = await this.get('/auth/users/notification-preferences/');
        console.log('API Client - Fallback notification preferences result:', result); // Debug log
        return result;
      } catch (fallbackError) {
        console.warn('API Client - All notification preference endpoints failed:', fallbackError);
        // Return empty response that will trigger fallback defaults
        return { data: null, success: false, message: 'Endpoint not available' };
      }
    }
  }

  async updateNotificationPreferences(data: any): Promise<any> {
    console.log('API Client - Updating notification preferences with data:', data); // Debug log
    
    try {
      // Try the correct endpoint first
      console.log('API Client - Trying primary endpoint: PATCH /notifications/preferences/');
      const result = await this.patch('/notifications/preferences/', data);
      console.log('API Client - Primary endpoint success:', result); // Debug log
      return result;
    } catch (error) {
      console.warn('API Client - Primary notification preferences update endpoint failed:', error);
      try {
        console.log('API Client - Trying fallback endpoint: PATCH /auth/users/notification-preferences/');
        const result = await this.patch('/auth/users/notification-preferences/', data);
        console.log('API Client - Fallback endpoint success:', result); // Debug log
        return result;
      } catch (fallbackError) {
        console.error('API Client - All notification preference update endpoints failed:', fallbackError);
        throw new ApiError('Unable to update notification preferences', 500, 'PREFERENCES_UPDATE_ERROR');
      }
    }
  }

  async getNotifications(params?: {
    unread_only?: boolean;
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      return this.getPaginated('notifications/', params?.page, params?.limit, params);
    } catch (error) {
      console.warn('Notification endpoint not available, returning empty response:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
  }

  async getNotificationStats(): Promise<any> {
    try {
      return this.get('notifications/stats/');
    } catch (error) {
      console.warn('Notification stats endpoint not available, returning empty response:', error);
      return {
        data: {
          totalNotifications: 0,
          unreadCount: 0,
          byType: {},
          byPriority: {},
          recentNotifications: []
        },
        success: true,
        message: 'Fallback response'
      };
    }
  }

  async getUnreadCount(): Promise<any> {
    try {
      return this.get('notifications/unread_count/');
    } catch (error) {
      console.warn('Unread count endpoint not available, returning zero:', error);
      return {
        data: { unread_count: 0 },
        success: true,
        message: 'Fallback response'
      };
    }
  }

  async markNotificationAsRead(id: string): Promise<any> {
    try {
      return this.post(`notifications/${id}/mark_as_read/`, {});
    } catch (error) {
      console.warn('Mark as read endpoint not available:', error);
      return {
        data: { message: 'Operation not supported' },
        success: false,
        message: 'Endpoint not available'
      };
    }
  }

  async markNotificationsAsRead(notificationIds?: string[]): Promise<any> {
    try {
      return this.post('notifications/mark_all_as_read/', {
        notification_ids: notificationIds || []
      });
    } catch (error) {
      console.warn('Mark all as read endpoint not available:', error);
      return {
        data: { message: 'Operation not supported', count: 0 },
        success: false,
        message: 'Endpoint not available'
      };
    }
  }

  async getWebSocketToken(): Promise<any> {
    try {
      return this.post('notifications/websocket-token/', {});
    } catch (error) {
      console.warn('WebSocket token endpoint not available:', error);
      throw new ApiError('WebSocket token generation failed', 500, 'WS_TOKEN_ERROR');
    }
  }

  /**
   * Session Management Methods
   */
  async getSessions(): Promise<any> {
    try {
      console.log('API Client - Fetching sessions from /auth/sessions/...'); // Debug log
      const result = await this.get('/auth/sessions/');
      console.log('API Client - Sessions fetch result:', result); // Debug log
      
      // Handle different response structures from the backend
      if (result && typeof result === 'object') {
        // If it has results array (paginated response)
        if ('results' in result && Array.isArray(result.results)) {
          return { data: { results: result.results }, success: true };
        }
        // If it's directly an array
        else if (Array.isArray(result)) {
          return { data: result, success: true };
        }
        // If it's wrapped in data property
        else if ('data' in result && result.data) {
          return result;
        }
        // Return the result as-is
        else {
          return { data: result, success: true };
        }
      }
      
      return result;
    } catch (error) {
      console.error('API Client - Sessions fetch error:', error);
      // Check if it's a 404 or endpoint not found
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        console.log('API Client - Sessions endpoint not found, sessions feature may not be implemented yet');
      }
      // Return empty structure that the hook can handle
      return { data: { results: [] }, success: false, message: 'Sessions endpoint not available' };
    }
  }

  async revokeSession(sessionId: string): Promise<any> {
    return this.delete(`/auth/sessions/${sessionId}/`);
  }
}

// Export singleton instance
export const apiClient = new StandardApiClient();

// ==================== LEGACY API EXPORTS ====================
// These provide compatibility with the legacy API client interface

export const userApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    apiClient.getPaginated('/auth/users/', params?.page, params?.limit, params),
  
  getById: (id: string) =>
    apiClient.get(`/auth/users/${id}/`),
  
  create: (data: any) =>
    apiClient.post('/auth/users/', data),
  
  update: (data: any) =>
    apiClient.put(`/auth/users/${data.id}/`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/auth/users/${id}/`),
  
  changeStatus: (id: string, status: any) =>
    apiClient.patch(`/auth/users/${id}/status/`, { status }),
};

export const clientApi = {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    category?: string;
    status?: string;
  }) =>
    apiClient.getPaginated('/clients/', params?.page, params?.limit, params),
  
  getById: (id: string) =>
    apiClient.get(`/clients/${id}/`),
  
  create: (data: any) =>
    apiClient.post('/clients/', data),
  
  update: (data: any) =>
    apiClient.put(`/clients/${data.id}/`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/clients/${id}/`),
  
  addActivity: (clientId: string, activity: any) =>
    apiClient.post(`/clients/${clientId}/activities/`, activity),
};

export const teamApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.getPaginated('/team/teams/', params?.page, params?.limit, params),
  
  getById: (id: string) =>
    apiClient.get(`/team/teams/${id}/`),
  
  create: (data: any) =>
    apiClient.post('/team/teams/', data),
  
  update: (data: any) =>
    apiClient.put(`/team/teams/${data.id}/`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/team/teams/${id}/`),
  
  addMember: (teamId: string, userId: string) =>
    apiClient.post(`/team/teams/${teamId}/members`, { userId }),
    
  addMembers: (teamId: string, userIds: number[]) =>
    apiClient.post(`/team/teams/${teamId}/members/`, { user_ids: userIds }),
  
  removeMember: (teamId: string, userId: string) =>
    apiClient.delete(`/team/teams/${teamId}/members/${userId}/`),
};

export const dealApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    ordering?: string;
  }) =>
    apiClient.getPaginated('/deals/deals/', params?.page, params?.limit, params),

  getById: (id: string) => 
    apiClient.get(`/deals/deals/${id}/`),

  create: (data: any) => 
    apiClient.post('/deals/deals/', data),

  update: (data: any) => 
    apiClient.put(`/deals/deals/${data.id}/`, data),

  delete: (id: string) => 
    apiClient.delete(`/deals/deals/${id}/`),
};

export const paymentApi = {
  getAll: (params?: { page?: number; limit?: number; dealId?: string; clientId?: string }) =>
    apiClient.getPaginated('/deals/payments/', params?.page, params?.limit, params),

  getById: (id: string) => 
    apiClient.get(`/deals/payments/${id}/`),

  create: (data: any) => 
    apiClient.post('/deals/payments/', data),

  update: (data: any) => 
    apiClient.put(`/deals/payments/${data.id}/`, data),

  delete: (id: string) => 
    apiClient.delete(`/deals/payments/${id}/`),

  verify: (id: string, status: 'verified' | 'rejected') =>
    apiClient.post(`/deals/payments/${id}/verify/`, { status }),
};

// Export types for use in hooks
export type { ApiResponse, PaginatedResponse };
export { ApiError }; 