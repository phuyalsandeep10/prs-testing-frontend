import { 
  ApiResponse, 
  PaginatedResponse, 
  Client, 
  Team, 
  NotificationPreferences,
  UserSession,
  NotificationStats,
  // Note: Deal type lives in a dedicated module to keep the generic type bundle smaller
  // Importing lazily to avoid circular deps with heavy role definitions
} from '@/types';
import { User } from '@/lib/types/roles';
import type { Deal, Payment } from '@/types/deals';
import {
  CommissionData,
  CreateInput,
  UpdateInput,
  Activity,
  DashboardStats,
  Notification
} from '@/types';

// ==================== API CONFIGURATION ====================
// Use NEXT_PUBLIC_API_URL as complete base (e.g. http://localhost:8000/api)
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');
const API_TIMEOUT = 10000;

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // duplicate setAuth/clearAuth removed -- single implementation is defined later in the class

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Join base and endpoint with exactly one slash
    const url = `${this.baseURL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    // List of endpoints that do NOT require an auth token.
    const PUBLIC_ENDPOINTS = [
      '/auth/login',
      '/auth/super-admin/login',
      '/auth/super-admin/verify',
      '/auth/org-admin/login',
      '/auth/org-admin/verify',
      '/auth/change-password',
      '/auth/forgot-password',
      '/auth/reset-password',
    ];

    try {
      const authToken = localStorage.getItem('authToken');
      
      // Check if the current request endpoint path starts with any of the public paths.
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(publicEp => endpoint.startsWith(publicEp));

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          // Attach token only when we have one and the request is NOT for a public endpoint.
          ...(authToken && !isPublicEndpoint && { 'Authorization': `Token ${authToken}` }),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // On 401 clear stored token to avoid poison for future auth attempts.
        // A 403 means the user is authenticated but lacks permissions, so we shouldn't clear the token.
        if (response.status === 401) {
          localStorage.removeItem('authToken');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status.toString(),
          errorData
        );
      }

      // Handle cases where the server returns 204 No Content or a non-JSON payload
      let parsedData: any = null;
      // Only attempt to parse JSON if the response is not empty and advertises JSON
      if (response.status !== 204) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          parsedData = await response.json();
        } else {
          // Fallback: try to read as text (for plaintext success messages)
          parsedData = await response.text().catch(() => null);
        }
      }

      return {
        data: parsedData as T,
        success: true,
        // If we parsed JSON and it had a message, use it, otherwise empty string
        message: (parsedData as any)?.message ?? '',
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error?.name === 'AbortError') {
        throw new ApiError('Request timeout', 'TIMEOUT');
      }
      throw new ApiError(
        error?.message || 'An unexpected error occurred',
        'UNKNOWN_ERROR'
      );
    }
  }

  // ==================== GENERIC CRUD METHODS ====================
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async postMultipart<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        ...(authToken && { 'Authorization': `Token ${authToken}` }),
      };

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
          response.status.toString(),
          errorData
        );
      }

      const data = await response.json();
      return {
        data,
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error?.name === 'AbortError') {
        throw new ApiError('Request timeout', 'TIMEOUT');
      }
      throw new ApiError(
        error?.message || 'An unexpected error occurred',
        'UNKNOWN_ERROR'
      );
    }
  }

  async putMultipart<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        ...(authToken && { 'Authorization': `Token ${authToken}` }),
      };

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
          response.status.toString(),
          errorData
        );
      }

      const data = await response.json();
      return {
        data,
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error?.name === 'AbortError') {
        throw new ApiError('Request timeout', 'TIMEOUT');
      }
      throw new ApiError(
        error?.message || 'An unexpected error occurred',
        'UNKNOWN_ERROR'
      );
    }
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ==================== PAGINATED REQUESTS ====================
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const allParams = { page, limit, ...params };
    const response = await this.get<PaginatedResponse<T>>(endpoint, allParams);
    return response.data;
  }

  // ==================== AUTH MANAGEMENT ====================
  /**
   * Stores the auth token locally so it can be attached to subsequent requests.
   * Additional parameters are accepted for forward-compatibility but are not used here yet.
   */
  setAuth(token: string, ..._rest: any[]): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Clears any stored authentication information.
   */
  clearAuth(): void {
    localStorage.removeItem('authToken');
  }

  // ==================== DEAL & CLIENT SHORTCUTS ====================
  /** Convenience wrapper for fetching a single deal by id */
  async getDealById(id: string): Promise<ApiResponse<Deal>> {
    return this.get<Deal>(`/deals/deals/${id}/`);
  }

  /** Convenience wrapper for fetching a single client by id */
  async getClientById(id: string): Promise<ApiResponse<Client>> {
    return this.get<Client>(`/clients/${id}/`);
  }

  /** Fetch all deals for a given client */
  async getDealsByClientId(clientId: string): Promise<ApiResponse<Deal[]>> {
    return this.get<Deal[]>(`/deals/deals/?client=${clientId}`);
  }

  // ==================== SETTINGS API METHODS ====================
  
  // Profile Management
  async getProfile(): Promise<ApiResponse<User>> {
    return this.get<User>('/auth/profile/');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.patch<User>('/auth/profile/', data);
  }

  // Password Management
  async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.post('/auth/password/change/', data);
  }

  // Notification Preferences
  async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return this.get<NotificationPreferences>('/notifications/preferences/');
  }

  async updateNotificationPreferences(data: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    return this.patch<NotificationPreferences>('/notifications/preferences/', data);
  }

  // ==================== NOTIFICATION API METHODS ====================
  async getNotifications(params?: {
    unread_only?: boolean;
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Notification>> {
    try {
      return this.getPaginated<Notification>('notifications/', params?.page, params?.limit, params);
    } catch (error) {
      console.warn('Notification endpoint not available, returning empty response:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
    }
  }

  async getNotificationStats(): Promise<ApiResponse<NotificationStats>> {
    try {
      return this.get<NotificationStats>('notifications/stats/');
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

  async getUnreadCount(): Promise<ApiResponse<{ unread_count: number }>> {
    try {
      return this.get<{ unread_count: number }>('notifications/unread_count/');
    } catch (error) {
      console.warn('Unread count endpoint not available, returning zero:', error);
      return {
        data: { unread_count: 0 },
        success: true,
        message: 'Fallback response'
      };
    }
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return this.post<{ message: string }>(`notifications/${id}/mark_as_read/`, {});
    } catch (error) {
      console.warn('Mark as read endpoint not available:', error);
      return {
        data: { message: 'Operation not supported' },
        success: false,
        message: 'Endpoint not available'
      };
    }
  }

  async markNotificationsAsRead(notificationIds?: string[]): Promise<ApiResponse<{ message: string; count: number }>> {
    try {
      return this.post<{ message: string; count: number }>('notifications/mark_all_as_read/', {
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

  // Session Management
  async getSessions(): Promise<ApiResponse<UserSession[]>> {
    return this.get<UserSession[]>('/auth/sessions/');
  }

  async revokeSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete<{ message: string }>(`/auth/sessions/${sessionId}/`);
  }
}

// ==================== API CLIENT INSTANCE ====================
export const apiClient = new ApiClient();

// ==================== USER API ====================
export const userApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    apiClient.getPaginated<User>('/auth/users/', params?.page, params?.limit, params),
  
  getById: (id: string) =>
    apiClient.get<User>(`/auth/users/${id}/`),
  
  create: (data: CreateInput<User>) =>
    apiClient.post<User>('/auth/users/', data),
  
  update: (data: UpdateInput<User>) =>
    apiClient.put<User>(`/auth/users/${data.id}/`, data),
  
  delete: (id: string) =>
    apiClient.delete<void>(`/auth/users/${id}/`),
  
  changeStatus: (id: string, status: User['status']) =>
    apiClient.patch<User>(`/auth/users/${id}/status/`, { status }),
};

// ==================== CLIENT API ====================
export const clientApi = {
  getAll: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    category?: string;
    status?: string;
  }) =>
    apiClient.getPaginated<Client>('/clients/', params?.page, params?.limit, params),
  
  getById: (id: string) =>
    apiClient.get<Client>(`/clients/${id}/`),
  
  create: (data: CreateInput<Client>) =>
    apiClient.post<Client>('/clients/', data),
  
  update: (data: UpdateInput<Client>) =>
    apiClient.put<Client>(`/clients/${data.id}/`, data),
  
  delete: (id: string) =>
    apiClient.delete<void>(`/clients/${id}/`),
  
  addActivity: (clientId: string, activity: CreateInput<Activity>) =>
    apiClient.post<Client>(`/clients/${clientId}/activities/`, activity),
};

// ==================== TEAM API ====================
export const teamApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.getPaginated<Team>('/team/teams/', params?.page, params?.limit, params),
  
  getById: (id: string) =>
    apiClient.get<Team>(`/team/teams/${id}/`),
  
  create: (data: CreateInput<Team>) =>
    apiClient.post<Team>('/team/teams/', data),
  
  update: (data: UpdateInput<Team>) =>
    apiClient.put<Team>(`/team/teams/${data.id}/`, data),
  
  delete: (id: string) =>
    apiClient.delete<void>(`/team/teams/${id}/`),
  
  addMember: (teamId: string, userId: string) =>
    apiClient.post<Team>(`/team/teams/${teamId}/members/`, { userId }),
  
  removeMember: (teamId: string, userId: string) =>
    apiClient.delete<Team>(`/team/teams/${teamId}/members/${userId}/`),
};

// ==================== DEAL API ====================
export const dealApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    ordering?: string;
  }) =>
    apiClient.getPaginated<Deal>('/deals/deals/', params?.page, params?.limit, params),

  getById: (id: string) => apiClient.get<Deal>(`/deals/deals/${id}/`),

  create: (data: CreateInput<Deal>) => apiClient.post<Deal>('/deals/deals/', data),

  update: (data: UpdateInput<Deal>) => apiClient.put<Deal>(`/deals/deals/${data.id}/`, data),

  delete: (id: string) => apiClient.delete<void>(`/deals/deals/${id}/`),
};

// ==================== PAYMENT API ====================
export const paymentApi = {
  getAll: (params?: { page?: number; limit?: number; dealId?: string; clientId?: string }) =>
    apiClient.getPaginated<Payment>('/deals/payments/', params?.page, params?.limit, params),

  getById: (id: string) => apiClient.get<Payment>(`/deals/payments/${id}/`),

  create: (data: CreateInput<Payment>) => apiClient.post<Payment>('/deals/payments/', data),

  update: (data: UpdateInput<Payment>) => apiClient.put<Payment>(`/deals/payments/${data.id}/`, data),

  delete: (id: string) => apiClient.delete<void>(`/deals/payments/${id}/`),

  verify: (id: string, status: 'verified' | 'rejected') =>
    apiClient.post<Payment>(`/deals/payments/${id}/verify/`, { status }),
};

export class ApiError extends Error {
  code?: string;
  details?: Record<string, any>;

  constructor(message: string, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}