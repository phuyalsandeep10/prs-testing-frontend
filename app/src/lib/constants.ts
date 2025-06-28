// ==================== API CONSTANTS ====================
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// ==================== PAGINATION CONSTANTS ====================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// ==================== USER ROLES ====================
export const USER_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ORG_ADMIN: 'org-admin',
  SALESPERSON: 'salesperson',
  SUPERVISOR: 'supervisor',
  VERIFIER: 'verifier',
  TEAM_MEMBER: 'team-member',
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: ['*'], // All permissions
  [USER_ROLES.ORG_ADMIN]: [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'clients.create', 'clients.read', 'clients.update', 'clients.delete',
    'teams.create', 'teams.read', 'teams.update', 'teams.delete',
    'commission.read', 'commission.update',
    'reports.read', 'reports.export',
  ],
  [USER_ROLES.SALESPERSON]: [
    'clients.create', 'clients.read', 'clients.update',
    'deals.create', 'deals.read', 'deals.update',
    'commission.read',
  ],
  [USER_ROLES.SUPERVISOR]: [
    'teams.read', 'teams.update',
    'users.read', 'users.update',
    'reports.read',
  ],
  [USER_ROLES.VERIFIER]: [
    'deals.read', 'deals.verify',
    'invoices.read', 'invoices.verify',
    'refunds.read', 'refunds.process',
  ],
  [USER_ROLES.TEAM_MEMBER]: [
    'tasks.read', 'tasks.update',
    'projects.read',
  ],
} as const;

// ==================== STATUS CONSTANTS ====================
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  INVITED: 'invited',
  SUSPENDED: 'suspended',
} as const;

export const CLIENT_STATUS = {
  CLEAR: 'clear',
  PENDING: 'pending',
  BAD_DEPTH: 'bad-depth',
} as const;

export const CLIENT_CATEGORY = {
  LOYAL: 'loyal',
  INCONSISTENT: 'inconsistent',
  OCCASIONAL: 'occasional',
} as const;

export const CLIENT_SATISFACTION = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
} as const;

// ==================== CURRENCY CONSTANTS ====================
export const CURRENCIES = {
  NEP: 'NEP',
  AUD: 'AUD',
  USD: 'USD',
} as const;

export const CURRENCY_SYMBOLS = {
  [CURRENCIES.NEP]: 'रू',
  [CURRENCIES.AUD]: 'A$',
  [CURRENCIES.USD]: '$',
} as const;

// ==================== ROUTES ====================
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
  
  // Dashboard
  DASHBOARD: {
    SUPER_ADMIN: '/super-admin',
    ORG_ADMIN: '/org-admin',
    SALESPERSON: '/salesperson',
    SUPERVISOR: '/supervisor',
    VERIFIER: '/verifier',
    TEAM_MEMBER: '/team-member',
  },
  
  // Feature Routes
  USERS: '/org-admin/manage-users',
  CLIENTS: '/org-admin/manage-clients',
  TEAMS: '/org-admin/manage-teams',
  DEALS: '/salesperson/deal',
  COMMISSION: '/salesperson/commission',
  SETTINGS: '/settings',
} as const;

// ==================== UI CONSTANTS ====================
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  LOADING_TIMEOUT: 30000,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// ==================== VALIDATION CONSTANTS ====================
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 254,
  NAME_MAX_LENGTH: 100,
  PHONE_PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// ==================== FILE UPLOAD CONSTANTS ====================
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_SPREADSHEET_TYPES: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
} as const;

// ==================== NOTIFICATION CONSTANTS ====================
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// ==================== LOCAL STORAGE KEYS ====================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recent_searches',
} as const;

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created!',
  UPDATED: 'Successfully updated!',
  DELETED: 'Successfully deleted!',
  SAVED: 'Successfully saved!',
  UPLOADED: 'File uploaded successfully!',
  SENT: 'Successfully sent!',
} as const;

// ==================== TABLE CONFIGURATION ====================
export const TABLE_FEATURES = {
  PAGINATION: 'pagination',
  SORTING: 'sorting',
  FILTERING: 'filtering',
  SELECTION: 'selection',
  EXPANSION: 'expansion',
  COLUMN_VISIBILITY: 'columnVisibility',
  GLOBAL_SEARCH: 'globalSearch',
  EXPORT: 'export',
  REFRESH: 'refresh',
} as const;

export const TABLE_VARIANTS = {
  DEFAULT: 'default',
  MINIMAL: 'minimal',
  PROFESSIONAL: 'professional',
  COMPACT: 'compact',
} as const;

// ==================== FORM CONFIGURATION ====================
export const FORM_FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  SWITCH: 'switch',
  RADIO: 'radio',
  DATE: 'date',
  FILE: 'file',
  CUSTOM: 'custom',
} as const;

export const FORM_LAYOUTS = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
  GRID: 'grid',
  SECTIONS: 'sections',
} as const;

export const FORM_VARIANTS = {
  DEFAULT: 'default',
  MINIMAL: 'minimal',
  PROFESSIONAL: 'professional',
  COMPACT: 'compact',
} as const;
