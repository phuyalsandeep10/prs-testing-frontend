/**
 * Standardized API Client for React Query Integration
 * Replaces multiple API clients with a single, consistent interface
 */

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
    const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    // 1. Remove any trailing slashes so we can safely append our own
    let normalized = rawBase.replace(/\/+$/, '');

    // 2. Use normalized base as-is (do not enforce additional path segments)
    this.baseURL = normalized;
    this.timeout = 10000;
  }

  /**
   * Get auth token with consistent format
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
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
   * Generic request method with consistent error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
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
   * File upload with FormData
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
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
   * Authentication methods
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    return this.getAuthToken();
  }
}

// Export singleton instance
export const apiClient = new StandardApiClient();

// Export types for use in hooks
export type { ApiResponse, PaginatedResponse, ApiError }; 