import { ApiResponse, User, Deal, Client, Team, Organization, DashboardStats, TableFilters, SortOption } from '@/lib/types/roles';
import { UserRole, Permission } from '@/lib/types/roles';
import { hasPermission, canAccessResource, PermissionScope } from '@/lib/auth/permissions';

// API Configuration - Standardized to match backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Enhanced API Error class for better error handling
 */
export class APIError extends Error {
  public status: number;
  public code: string;
  public details?: Record<string, any>;

  constructor(message: string, status: number, code: string = 'API_ERROR', details?: Record<string, any>) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Request interceptor for adding auth headers and organization context
 */
interface RequestOptions extends RequestInit {
  timeout?: number;
  organizationId?: string;
  skipAuth?: boolean;
}

/**
 * Enterprise-grade API Client with role-based access control
 */
class APIClient {
  private baseURL: string;
  private defaultTimeout: number;
  private authToken?: string;
  private organizationId?: string;
  private userRole?: UserRole;
  private userScope?: PermissionScope;
  private userPermissions: Permission[] = [];

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  /**
   * Set authentication context
   */
  setAuth(token: string, userRole: UserRole, permissions: Permission[], organizationId?: string, userScope?: PermissionScope) {
    this.authToken = token;
    this.userRole = userRole;
    this.organizationId = organizationId;
    this.userScope = userScope;
    this.userPermissions = permissions;
  }

  /**
   * Clear authentication context
   */
  clearAuth() {
    this.authToken = undefined;
    this.userRole = undefined;
    this.organizationId = undefined;
    this.userScope = undefined;
  }

  /**
   * Generic request method with comprehensive error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      organizationId = this.organizationId,
      skipAuth = false,
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };

      // Add authentication headers - Fixed to match Django Token auth
      if (!skipAuth && this.authToken) {
        headers['Authorization'] = `Token ${this.authToken}`;  // Changed from Bearer to Token
      }

      // Add organization context
      if (organizationId) {
        headers['X-Organization-ID'] = organizationId;
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 204 No Content response
      if (response.status === 204) {
        return { success: true } as ApiResponse<T>;
      }
      
      const data = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", data);
        throw new APIError(
          data.detail || data.message || 'Request failed',
          response.status,
          data.code || 'HTTP_ERROR',
          data.errors
        );
      }

      // The backend doesn't always wrap successful responses.
      // We standardize it here. The raw data from the backend becomes the `data` property of our standard response.
      return { success: true, data: data } as ApiResponse<T>;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408, 'TIMEOUT');
        }
        console.error("Network/Client-side Error:", error);
        throw new APIError(error.message, 0, 'NETWORK_ERROR');
      }

      throw new APIError('Unknown error occurred', 0, 'UNKNOWN_ERROR');
    }
  }

  /**
   * GET request with query parameters
   */
  async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T>(
    endpoint: string, 
    file: File, 
    onProgress?: (progress: number) => void,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response as ApiResponse<T>);
          } else {
            reject(new APIError(
              response.message || 'Upload failed',
              xhr.status,
              response.code || 'UPLOAD_ERROR'
            ));
          }
        } catch {
          reject(new APIError('Invalid response format', xhr.status, 'PARSE_ERROR'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new APIError('Upload failed', 0, 'NETWORK_ERROR'));
      });

      xhr.open('POST', url);
      
      // Add auth headers
      if (this.authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
      }
      
      if (this.organizationId) {
        xhr.setRequestHeader('X-Organization-ID', this.organizationId);
      }

      xhr.send(formData);
    });
  }

  // ============= ROLE-BASED DATA ACCESS METHODS =============

  /**
   * Fetch users with role-based filtering
   */
  async getUsers(filters?: TableFilters, sort?: SortOption): Promise<ApiResponse<User[]>> {
    this.checkPermission('manage:users');
    
    const params = {
      ...filters,
      sort: sort ? `${sort.field}:${sort.direction}` : undefined,
    };

    const response = await this.get<User[]>('/users', params);
    
    // Filter data based on user's scope
    if (response.data && this.userRole && this.userScope) {
      response.data = this.filterUsersByScope(response.data);
    }

    return response;
  }

  /**
   * Create new user with role validation
   */
  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    this.checkPermission('manage:users');
    
    // Validate user can create this role
    if (userData.role && this.userRole && !this.canManageRole(userData.role)) {
      throw new APIError(
        `Insufficient permissions to create ${userData.role}`,
        403,
        'PERMISSION_DENIED'
      );
    }

    return this.post<User>('/users', userData);
  }

  /**
   * Fetch deals with role-based access control
   */
  async getDeals(filters?: TableFilters, sort?: SortOption): Promise<ApiResponse<Deal[]>> {
    this.checkPermission('manage:deals');
    return this.get<Deal[]>('/deals', { ...filters, ...sort });
  }

  /**
   * Create new deal
   */
  async createDeal(dealData: Partial<Deal>): Promise<ApiResponse<Deal>> {
    this.checkPermission('manage:deals');
    return this.post<Deal>('/deals', dealData);
  }

  /**
   * Update deal status (for verifiers)
   */
  async updateDealStatus(
    dealId: string, 
    status: Deal['status'], 
    remarks?: string
  ): Promise<ApiResponse<Deal>> {
    this.checkPermission('update_deal_status');
    return this.patch<Deal>(`/deals/${dealId}/status/`, { status, remarks });
  }

  /**
   * Fetch clients with role-based filtering
   */
  async getClients(filters?: TableFilters, sort?: SortOption): Promise<ApiResponse<Client[]>> {
    const params: Record<string, any> = { ...filters };
    if (sort) {
      params.ordering = `${sort.direction === 'desc' ? '-' : ''}${sort.field}`;
    }
    return this.get<Client[]>('/clients/', params);
  }

  /**
   * Create new client
   */
  async createClient(clientData: Partial<Client>): Promise<ApiResponse<Client>> {
    this.checkPermission('create_client');
    return this.post<Client>('/clients/', clientData);
  }

  async updateClient(clientId: string, clientData: Partial<Client>): Promise<ApiResponse<Client>> {
    this.checkPermission('edit_client_details');
    return this.put<Client>(`/clients/${clientId}/`, clientData);
  }

  async deleteClient(clientId: string): Promise<ApiResponse<null>> {
    this.checkPermission('delete_client');
    return this.delete<null>(`/clients/${clientId}/`);
  }

  /**
   * Fetch teams with proper access control
   */
  async getTeams(filters?: TableFilters): Promise<ApiResponse<Team[]>> {
    this.checkPermission('create:teams');
    const response = await this.get<Team[]>('/teams', filters);
    
    if (response.success) {
      // Filter teams based on user's scope
      if (response.data && this.userRole && this.userScope) {
        response.data = this.filterTeamsByScope(response.data);
      }
    }

    return response;
  }

  /**
   * Create new team
   */
  async createTeam(teamData: Partial<Team>): Promise<ApiResponse<Team>> {
    this.checkPermission('create:teams');
    return this.post<Team>('/teams', teamData);
  }

  /**
   * Fetch dashboard stats with role-based data
   */
  async getDashboardStats(dateRange?: { from: string; to: string }): Promise<ApiResponse<DashboardStats>> {
    this.checkPermission('view:analytics');
    
    const params = dateRange ? { from: dateRange.from, to: dateRange.to } : {};
    const response = await this.get<DashboardStats>('/dashboard/stats', params);
    
    // Filter stats based on user's role and scope
    if (response.data && this.userRole && this.userScope) {
      response.data = this.filterStatsByScope(response.data);
    }

    return response;
  }

  /**
   * Fetch organizations (super admin only)
   */
  async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    this.checkPermission('create:organization');
    return this.get<Organization[]>('/organizations');
  }

  /**
   * Create new organization (super admin only)
   */
  async createOrganization(orgData: Partial<Organization>): Promise<ApiResponse<Organization>> {
    this.checkPermission('create:organization');
    return this.post<Organization>('/organizations/', orgData);
  }

  async getDealById(dealId: string): Promise<ApiResponse<Deal>> {
    this.checkPermission('view_own_deals'); // Or a more specific permission
    return this.get<Deal>(`/deals/${dealId}/`);
  }

  async getClientById(clientId: string): Promise<ApiResponse<Client>> {
    this.checkPermission('view_own_clients');
    return this.get<Client>(`/clients/${clientId}/`);
  }

  async getDealsByClientId(clientId: string): Promise<ApiResponse<Deal[]>> {
    this.checkPermission('view_own_deals');
    return this.get<Deal[]>(`/clients/${clientId}/deals/`);
  }

  // ============= PERMISSION AND FILTERING HELPERS =============

  /**
   * Check if user has required permission
   */
  private checkPermission(permission: Permission) {
    if (!this.userPermissions.includes(permission)) {
      throw new APIError(
        `Insufficient permissions. Required: ${permission}`,
        403,
        'PERMISSION_DENIED'
      );
    }
  }

  /**
   * Check if user can manage specific role
   */
  private canManageRole(targetRole: UserRole): boolean {
    if (!this.userRole) return false;
    
    const hierarchy: Record<UserRole, UserRole[]> = {
      'super-admin': ['org-admin', 'supervisor', 'salesperson', 'verifier', 'team-member'],
      'org-admin': ['supervisor', 'salesperson', 'verifier', 'team-member'],
      'supervisor': ['salesperson', 'team-member'],
      'salesperson': [],
      'verifier': [],
      'team-member': [],
    };

    return hierarchy[this.userRole]?.includes(targetRole) ?? false;
  }

  /**
   * Filter users based on current user's scope
   */
  private filterUsersByScope(users: User[]): User[] {
    if (!this.userRole || !this.userScope) return users;

    return users.filter(user => {
      if (this.userRole === 'super-admin') return true;
      if (this.userRole === 'org-admin') {
        return user.organizationId === this.userScope.organizationId;
      }
      if (this.userRole === 'supervisor') {
        return user.organizationId === this.userScope.organizationId &&
               user.teamId === this.userScope.teamId;
      }
      return false;
    });
  }

  /**
   * Filter deals based on current user's scope
   */
  private filterDealsByScope(deals: Deal[]): Deal[] {
    if (!this.userRole || !this.userScope) return deals;

    return deals.filter(deal => {
      if (this.userRole === 'super-admin') return true;
      if (this.userRole === 'org-admin' || this.userRole === 'verifier') {
        return deal.organizationId === this.userScope.organizationId;
      }
      if (this.userRole === 'supervisor') {
        return deal.organizationId === this.userScope.organizationId &&
               deal.teamId === this.userScope.teamId;
      }
      if (this.userRole === 'salesperson') {
        return deal.salespersonId === this.userScope.userId;
      }
      return false;
    });
  }

  /**
   * Filter clients based on current user's scope
   */
  private filterClientsByScope(clients: Client[]): Client[] {
    if (!this.userRole || !this.userScope) {
      return clients;
    }

    switch (this.userRole) {
      case 'super-admin':
        return clients;
      case 'org-admin':
        return clients.filter(
          (client) => client.organization === Number(this.organizationId)
        );
      case 'salesperson':
        if (this.userScope.userId) {
          return clients.filter(
            (client) => client.created_by === Number(this.userScope.userId)
          );
        }
        return [];
      default:
        return [];
    }
  }

  /**
   * Filter teams based on current user's scope
   */
  private filterTeamsByScope(teams: Team[]): Team[] {
    if (!this.userScope || !this.organizationId) {
      return teams;
    }

    return teams.filter(team => {
      if (this.userRole === 'super-admin') return true;
      if (this.userRole === 'org-admin') {
        return team.organizationId === this.organizationId;
      }
      if (this.userRole === 'supervisor') {
        return team.id === this.userScope.teamId;
      }
      return false;
    });
  }

  /**
   * Filter dashboard stats based on current user's scope
   */
  private filterStatsByScope(stats: DashboardStats): DashboardStats {
    if (!this.userRole || !this.userScope) return stats;

    // For role-specific stat filtering, you might want to modify
    // certain stats based on the user's scope
    if (this.userRole === 'salesperson') {
      // Remove team performance data for salesperson
      return {
        ...stats,
        teamPerformance: undefined,
      };
    }

    return stats;
  }
}

/**
 * Singleton instance of the API client
 */
export const apiClient = new APIClient(); 