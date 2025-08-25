// ==================== CORE TYPES ====================
// Re-export User and Client types to make them available from main types module
export type { User, Client } from '@/lib/types/roles';
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== USER & AUTH TYPES ====================
// Re-export UserRole from the main roles module to avoid conflicts
export type { UserRole } from '@/lib/types/roles';
export type UserStatus = 'active' | 'inactive' | 'invited' | 'suspended';

export interface AuthState {
  user: import('@/lib/types/roles').User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthResponse {
  token: string;
  user: import('@/lib/types/roles').User;
  message?: string;
}

export interface PasswordChangeResponse extends AuthResponse {}

export interface Activity {
  timestamp: string;
  description: string;
  type?: 'meeting' | 'call' | 'email' | 'note';
}

// ==================== TEAM TYPES ====================
export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role?: import('@/lib/types/roles').UserRole;
}

export interface Team extends BaseEntity {
  teamName: string;
  teamLead: string;
  contactNumber: string;
  teamMembers: TeamMember[];
  assignedProjects: string;
  extraProjectsCount?: number;
  description?: string;
}

// ==================== COMMISSION TYPES ====================
export type Currency = string; // Updated to support all ISO currencies

export interface CommissionData extends BaseEntity {
  fullName: string;
  totalSales: number;
  currency: Currency;
  rate: number;
  percentage: number;
  bonus: number;
  penalty: number;
  // Calculated fields
  convertedAmt: number;
  total: number;
  totalReceivable: number;
}

// ==================== PERMISSION TYPES ====================
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export';
export type PermissionResource = 'users' | 'clients' | 'teams' | 'commission' | 'reports' | 'settings';

export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
}

// ==================== API TYPES ====================
// Consolidated ApiResponse interface - single source of truth
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    count?: number;
    next?: string | null;
    previous?: string | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success?: boolean;
  message?: string;
}

// Alternative paginated response structure for backend compatibility
export interface PaginatedApiResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// ==================== FORM TYPES ====================
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'number' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: any; // Zod schema
}

export interface FormConfig {
  fields: FormField[];
  submitText?: string;
  resetText?: string;
}

// ==================== TABLE TYPES ====================
export interface TableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface TableConfig<T> {
  columns: TableColumn<T>[];
  data: T[];
  pagination?: {
    enabled: boolean;
    pageSize: number;
  };
  sorting?: {
    enabled: boolean;
    defaultSort?: keyof T;
    defaultOrder?: 'asc' | 'desc';
  };
  filtering?: {
    enabled: boolean;
    searchableColumns?: (keyof T)[];
  };
  selection?: {
    enabled: boolean;
    multiple?: boolean;
  };
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification extends BaseEntity {
  title: string;
  message: string;
  notificationType: 'client_created' | 'deal_created' | 'deal_updated' | 'deal_status_changed' | 'user_created' | 'role_created' | 'team_created' | 'project_created' | 'commission_created' | 'payment_received' | 'new_organization' | 'system_alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'business' | 'user_management' | 'system' | 'security';
  isRead: boolean;
  readAt?: string;
  relatedObjectType?: string;
  relatedObjectId?: number;
  actionUrl?: string;
  recipientEmail: string;
  organizationName?: string;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  recentNotifications: Notification[];
}

export interface NotificationPreferences {
  desktopNotification: boolean;
  unreadNotificationBadge: boolean;
  pushNotificationTimeout: string;
  communicationEmails: boolean;
  announcementsUpdates: boolean;
  allNotificationSounds: boolean;
  // Backend fields
  enableClientNotifications?: boolean;
  enableDealNotifications?: boolean;
  enableUserManagementNotifications?: boolean;
  enableTeamNotifications?: boolean;
  enableProjectNotifications?: boolean;
  enableCommissionNotifications?: boolean;
  enableSystemNotifications?: boolean;
  minPriority?: string;
  autoMarkReadDays?: number;
}

export interface UserSession extends BaseEntity {
  ip_address?: string;
  user_agent?: string; // Add missing user_agent property
  device: string;
  is_current_session?: boolean;
  // Add device object structure for browser/os info
  device_info?: {
    browser?: string;
    os?: string;
  };
  last_activity?: string; // Add missing last_activity property
}

// ==================== DASHBOARD TYPES ====================
export interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalTeams: number;
  totalCommission: number;
  recentActivities: Activity[];
  notifications: Notification[];
}

// ==================== COMPONENT PROP TYPES ====================
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// ==================== UTILITY TYPES ====================
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type WithoutId<T> = Omit<T, 'id'>;
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T> = Partial<Omit<T, 'createdAt' | 'updatedAt'>> & { id: string };

// Re-exporting from other type files
export * from './deals';
