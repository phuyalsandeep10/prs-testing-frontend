import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Client, 
  Team, 
  CommissionData,
  CreateInput,
  UpdateInput,
  Activity,
  DashboardStats,
  Notification
} from '@/types';

// ==================== API CONFIGURATION ====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_TIMEOUT = 10000;

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

    // ✅ Add this
  public setAuth(
    token: string,
    role: string,
    permissions: string[],
    orgId: string,
    scope: Record<string, any>
  ) {
    this.token = token;
  }

  // ✅ Add this
  public clearAuth() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Token ${authToken}` }),
          ...options.headers,
        },
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
}

// ==================== API CLIENT INSTANCE ====================
export const apiClient = new ApiClient();

// ==================== USER API ====================
export const userApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    apiClient.getPaginated<User>('/users', params?.page, params?.limit, params),
  
  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),
  
  create: (data: CreateInput<User>) =>
    apiClient.post<User>('/users', data),
  
  update: (data: UpdateInput<User>) =>
    apiClient.put<User>(`/users/${data.id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<void>(`/users/${id}`),
  
  changeStatus: (id: string, status: User['status']) =>
    apiClient.patch<User>(`/users/${id}/status`, { status }),
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
    apiClient.getPaginated<Client>('/clients', params?.page, params?.limit, params),
  
  getById: (id: string) =>
    apiClient.get<Client>(`/clients/${id}`),
  
  create: (data: CreateInput<Client>) =>
    apiClient.post<Client>('/clients', data),
  
  update: (data: UpdateInput<Client>) =>
    apiClient.put<Client>(`/clients/${data.id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<void>(`/clients/${id}`),
  
  addActivity: (clientId: string, activity: CreateInput<Activity>) =>
    apiClient.post<Client>(`/clients/${clientId}/activities`, activity),
};

// ==================== TEAM API ====================
export const teamApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.getPaginated<Team>('/teams', params?.page, params?.limit, params),
  
  getById: (id: string) =>
    apiClient.get<Team>(`/teams/${id}`),
  
  create: (data: CreateInput<Team>) =>
    apiClient.post<Team>('/teams', data),
  
  update: (data: UpdateInput<Team>) =>
    apiClient.put<Team>(`/teams/${data.id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<void>(`/teams/${id}`),
  
  addMember: (teamId: string, userId: string) =>
    apiClient.post<Team>(`/teams/${teamId}/members`, { userId }),
  
  removeMember: (teamId: string, userId: string) =>
    apiClient.delete<Team>(`/teams/${teamId}/members/${userId}`),
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