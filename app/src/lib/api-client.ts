/**
 * Standardized API Client for React Query Integration
 * Enhanced with security features while maintaining compatibility
 */

import { secureStorage } from './security/secureStorage';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
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

  constructor() {
    // Determine API base URL (defaults to Django `/api` namespace)
    const rawBase = process.env.NEXT_PUBLIC_API_URL || 'https://backend-prs.onrender.com/api';

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
   * Get auth token with enhanced security validation
   * Now centralized through AuthStore
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // First try to get from AuthStore (centralized)
    try {
      const { useAuthStore } = require('@/stores/authStore');
      const store = useAuthStore.getState();
      if (store.token && this.isValidToken(store.token)) {
        return store.token;
      }
    } catch (error) {
      // Fall back to localStorage if store not available
    }
    
    // Fallback: Use secure storage with integrity checking
    const token = secureStorage.getItem('authToken');
    
    // Additional token validation
    if (token && !this.isValidToken(token)) {
      console.warn('🔒 Invalid token detected, clearing storage');
      secureStorage.removeItem('authToken');
      return null;
    }
    
    return token;
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
    // Join base and endpoint with exactly one slash between them
    const url = `${this.baseURL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);





    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(includeAuth),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Handle rate limiting (429) with exponential backoff retry
      if (response.status === 429) {
        const maxRetries = 3;
        if (retryCount < maxRetries) {
          // Parse retry-after header or use exponential backoff
          const retryAfter = response.headers.get('retry-after');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000;
          
          console.warn(`🚦 Rate limited (429), retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.request<T>(endpoint, options, includeAuth, retryCount + 1);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            'Too many requests. Please wait a moment and try again.',
            response.status,
            'RATE_LIMIT_EXCEEDED',
            errorData
          );
        }
      }

      // Debug successful responses
      if (response.ok) {
        console.log(`✅ API Success: ${endpoint}`, response.status);
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
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error?.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      
      throw new ApiError(
        error?.message || 'Network error occurred',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string): Promise<void> {
    await this.request(endpoint, { method: 'DELETE' });
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
    const allParams = { page, limit, ...params };
    const queryString = `?${new URLSearchParams(allParams).toString()}`;
    return this.request<PaginatedResponse<T>>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  /**
   * File upload with FormData (POST)
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.postMultipart<T>(endpoint, formData);
  }

  /**
   * POST multipart request (legacy compatibility)
   */
  async postMultipart<T>(endpoint: string, formData: FormData): Promise<T> {
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
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code || 'UPLOAD_ERROR',
          errorData
        );
      }

      return response.json();
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
  async putMultipart<T>(endpoint: string, formData: FormData): Promise<T> {
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

      return response.json();
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
  async patchMultipart<T>(endpoint: string, formData: FormData): Promise<T> {
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
        method: 'PATCH',
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

      return response.json();
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
    return this.get('/auth/profile/');
  }

  async updateProfile(data: any): Promise<any> {
    if (data.avatar) {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(data).forEach(key => {
        if (key !== 'avatar' && data[key] !== undefined) {
          formData.append(key, String(data[key]));
        }
      });
      
      // Add the file under the correct nested structure
      formData.append('profile.profile_picture', data.avatar);
      
      // Try PATCH multipart first, fallback to PUT if needed
      try {
        return await this.patchMultipart('/auth/profile/', formData);
      } catch (error) {
        return this.putMultipart('/auth/profile/', formData);
      }
    } else {
      return this.patch('/auth/profile/', data);
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
    return this.get('/notifications/preferences/');
  }

  async updateNotificationPreferences(data: any): Promise<any> {
    return this.patch('/notifications/preferences/', data);
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

  /**
   * Session Management Methods
   */
  async getSessions(): Promise<any> {
    return this.get('/auth/sessions/');
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
    apiClient.post(`/team/teams/${teamId}/members/`, { userId }),
  
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