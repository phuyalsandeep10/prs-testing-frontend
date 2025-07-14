// Core role types for the multi-tenant SaaS platform
export type UserRole = 
  | 'super-admin' 
  | 'org-admin' 
  | 'supervisor' 
  | 'salesperson' 
  | 'verifier' 
  | 'team-member';

export type Permission = 
  | 'create:organization' 
  | 'manage:users' 
  | 'create:teams' 
  | 'manage:deals' 
  | 'verify:invoices' 
  | 'view:analytics' 
  | 'manage:clients'
  | 'send:notifications'
  | 'approve:deals'
  | 'deny:deals'
  // Team management permissions
  | 'view_team'
  | 'view_all_teams'
  | 'add_team'
  | 'change_team'
  | 'delete_team'
  // User management permissions
  | 'view_user'
  | 'add_user'
  | 'change_user'
  | 'delete_user'
  // granular client permissions
  | 'view_own_clients'
  | 'view_all_clients'
  | 'create_client'
  | 'edit_client_details'
  | 'delete_client'
  // granular deal permissions
  | 'view_own_deals'
  | 'view_all_deals'
  | 'create_deal'
  | 'log_deal_activity'
  | 'verify_deal_payment'
  | 'update_deal_status';

// User interface with comprehensive role data
export interface User {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  organizationId?: string;
  teamId?: string;
  permissions: Permission[];
  isTeamLead?: boolean;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatar?: string;
  address?: string;
  phoneNumber?: string;
}

// Organization structure
export interface Organization {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'trial';
  adminId: string;
  settings: OrganizationSettings;
  createdAt: string;
  plan: 'starter' | 'professional' | 'enterprise';
}

export interface OrganizationSettings {
  allowedDomains: string[];
  dealApprovalPolicy: 'auto' | 'manual' | 'tiered';
  notificationPreferences: NotificationSettings;
  timezone: string;
  currency: string;
}

// Team structure
export interface Team {
  id: string;
  name: string;
  organizationId: string;
  supervisorId: string;
  memberIds: string[];
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  targets?: TeamTargets;
}

export interface TeamTargets {
  monthlyDeals: number;
  monthlyRevenue: number;
  clientAcquisition: number;
}

// Deal workflow types
export interface Deal {
  id: string;
  clientId: string;
  salespersonId: string;
  organizationId: string;
  teamId: string;
  amount: number;
  currency: string;
  status: DealStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  verificationStatus: VerificationStatus;
  verifierId?: string;
  createdAt: string;
  updatedAt: string;
  expectedCloseDate: string;
  actualCloseDate?: string;
  rejectionReason?: string;
  verifierRemarks?: string;
  salesPersonRemarks?: string;
  attachments: DealAttachment[];
  timeline: DealTimelineEvent[];
}

export type DealStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under-review' 
  | 'verified' 
  | 'approved' 
  | 'rejected' 
  | 'closed';

export type VerificationStatus = 
  | 'pending' 
  | 'in-progress' 
  | 'verified' 
  | 'denied' 
  | 'requires-clarification';

export interface DealAttachment {
  id: string;
  name: string;
  url: string;
  type: 'invoice' | 'contract' | 'receipt' | 'other';
  uploadedBy: string;
  uploadedAt: string;
}

export interface DealTimelineEvent {
  id: string;
  type: 'created' | 'submitted' | 'verified' | 'approved' | 'rejected' | 'updated';
  userId: string;
  userName: string;
  userRole: UserRole;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Client management
export interface Client {
  id: string;
  client_name: string;
  email: string;
  phone_number: string;
  nationality: string | null;
  created_at: string;
  updated_at: string;
  remarks: string | null;
  satisfaction: 'excellent' | 'good' | 'average' | 'poor' | null;
  status: 'clear' | 'pending' | 'bad_debt' | null;
  created_by: number;
  created_by_name?: string;
  organization: number;
  total_value: number | null;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Notification system
export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export type NotificationType = 
  | 'deal:created' 
  | 'deal:submitted' 
  | 'deal:verified' 
  | 'deal:approved' 
  | 'deal:rejected' 
  | 'deal:requires-clarification'
  | 'user:created' 
  | 'team:assigned' 
  | 'target:achieved' 
  | 'target:missed'
  | 'system:maintenance'
  | 'organization:updated';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms?: boolean;
  types: Record<NotificationType, boolean>;
}

// Dashboard analytics types
export interface DashboardStats {
  totalDeals: number;
  totalRevenue: number;
  activeClients: number;
  conversionRate: number;
  averageDealSize: number;
  monthlyGrowth: number;
  pendingVerifications?: number;
  teamPerformance?: TeamPerformanceMetric[];
}

export interface TeamPerformanceMetric {
  teamId: string;
  teamName: string;
  dealsClosed: number;
  revenue: number;
  target: number;
  achievement: number; // percentage
}

// Role-based navigation and permissions
export interface RoleBasedRoute {
  path: string;
  label: string;
  icon: string;
  permissions: Permission[];
  children?: RoleBasedRoute[];
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Filter and search types for tables
export interface TableFilters {
  search?: string;
  status?: string[];
  role?: UserRole[];
  dateRange?: {
    from: string;
    to: string;
  };
  organizationId?: string;
  teamId?: string;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// Form types for various entities
export interface CreateUserFormData {
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  isTeamLead?: boolean;
  permissions: Permission[];
  organizationId: string;
}

export interface CreateTeamFormData {
  name: string;
  description?: string;
  supervisorId: string;
  memberIds: string[];
  targets?: TeamTargets;
  organizationId: string;
}

export interface CreateDealFormData {
  clientId: string;
  amount: number;
  currency: string;
  expectedCloseDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  salesPersonRemarks?: string;
  attachments: File[];
}

// Real-time updates and WebSocket types
export interface WebSocketMessage {
  type: 'notification' | 'deal_update' | 'user_status' | 'team_update';
  payload: any;
  timestamp: string;
  userId?: string;
  organizationId?: string;
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
} 