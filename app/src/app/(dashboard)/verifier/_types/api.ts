/**
 * TypeScript interfaces for Verifier Dashboard API responses
 * Provides type safety and consistency across the verifier components
 */

// Import consolidated API response types
export type { ApiResponse } from '@/types';

// Paginated response structure
export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ==================== VERIFIER DASHBOARD TYPES ====================

// Overview/Stats API Response
export interface VerifierOverviewResponse {
  total_payments?: number;
  total_successful_payments?: number;
  total_unsuccess_payments?: number;
  total_verification_pending_payments?: number;
  total_revenue?: string | number;
  total_refunded_amount?: string | number;
}

// Invoice Status API Response
export interface InvoiceStatusResponse {
  paid_invoices?: number;
  overdue_invoices?: number;
  pending_invoices?: number;
  refunded_invoices?: number;
  rejected_invoices?: number;
  processing_invoices?: number;
}

// Payment Methods API Response
export interface PaymentMethodsResponse {
  credit_card?: number;
  bank_transfer?: number;
  mobile_wallet?: number;
  cheque?: number;
  qr_payment?: number;
  in_hand_cash?: number;
}

// Payment Failure API Response
export interface PaymentFailureResponse {
  insufficient_funds?: number;
  invalid_card?: number;
  bank_decline?: number;
  technical_error?: number;
  cheque_bounce?: number;
  payment_received_not_reflected?: number;
}

// Payment Distribution API Response
export interface PaymentDistributionResponse {
  processing_invoices?: number;
  paid_invoices?: number;
  rejected_invoices?: number;
  pending_invoices?: number;
  initiated_invoices?: number;
  refunded_invoices?: number;
  bad_debt_invoices?: number;
}

// Verification Queue Item
export interface VerificationQueueItem {
  invoice_id?: string;
  client_name?: string;
  payment_amount?: string | number;
  invoice_status?: 'pending' | 'verified' | 'rejected' | string;
  created_at?: string;
  due_date?: string;
  payment_method?: string;
}

// Audit Log Item
export interface AuditLogItem {
  id?: number;
  action: string;
  timestamp: string;
  user: string;
  details: string;
  invoice_id?: string;
  client_name?: string;
  payment_amount?: string | number;
}

// Refund/Bad Debt Item
export interface RefundItem {
  invoice_id?: string;
  client_name?: string;
  payment_amount?: string | number;
  invoice_status?: 'bad_debt' | 'refunded' | string;
  failure_remarks?: string;
  approved_remarks?: string;
  approval_date?: string;
  created_at?: string;
  refund_reason?: string;
}

// ==================== PAYMENT VERIFICATION TYPES ====================

// Payment Verification Form Data
export interface PaymentVerificationFormData {
  dealId: string;
  clientName: string;
  dealName: string;
  payMethod: string;
  paymentReceiptLink?: string;
  paymentValue: string;
  chequeNumber?: string;
  paymentDate: string;
  requestedBy: string;
  salesPersonRemarks?: string;
  uploadInvoice?: FileList;
  amountInInvoice: string;
  refundReason?: string;
  verifierRemarks: string;
}

// Payment Verification API Request
export interface PaymentVerificationRequest {
  invoice_status: 'verified' | 'rejected';
  verifier_remarks: string;
  amount_in_invoice: string | number;
  failure_remarks?: string;
  invoice_file?: File;
}

// Payment Verification API Response
export interface PaymentVerificationResponse {
  success: boolean;
  message?: string;
  payment_id?: string;
  invoice_id?: string;
  status: 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
}

// Payment Details for Verification Form
export interface PaymentDetailsResponse {
  payment: {
    id: string;
    payment_method?: string;
    received_amount?: number;
    verified_amount?: number;
    cheque_number?: string;
    payment_date?: string;
    payment_remarks?: string;
    receipt_file?: string;
    verification_status?: 'pending' | 'verified' | 'rejected';
    verified_by?: string;
    verifier_remarks?: string;
  };
  deal: {
    deal_id?: string;
    deal_name?: string;
    deal_value?: number;
    currency?: string;
    deal_date?: string;
    due_date?: string;
    deal_remarks?: string;
    client?: {
      id: number;
      client_name?: string;
      email?: string;
      phone_number?: string;
    };
    created_by?: {
      id: number;
      full_name?: string;
      email?: string;
    };
  };
}

// ==================== DEALS TYPES ====================

// Deal data structure
export interface Deal {
  id: string;
  deal_id?: string;
  deal_name: string;
  client_name: string;
  deal_value: number;
  currency?: string;
  deal_date?: string;
  due_date?: string;
  deal_remarks?: string;
  payment_method?: string;
  pay_status?: string;
  verification_status?: string;
  version?: 'original' | 'edited';
  created_by?: {
    id: number;
    full_name?: string;
  };
  payments_read?: Payment[];
}

// Payment data structure
export interface Payment {
  id: string;
  payment_serial?: string;
  payment_method?: string;
  payment_value?: number;
  received_amount?: number;
  verified_amount?: number;
  payment_date?: string;
  created_at?: string;
  payment_version?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verifier_remarks?: string;
  receipt_link?: string;
  deal_remarks?: string;
  verifier_remark_status?: 'yes' | 'no';
  status: 'pending' | 'verified' | 'rejected';
}

// ==================== INVOICE TYPES ====================

// Invoice data structure
export interface Invoice {
  invoice_id: string;
  client_name: string;
  deal_name: string;
  invoice_date: string;
  due_date?: string;
  amount: string | number;
  status: 'pending' | 'verified' | 'rejected' | string;
  payment_id?: string;
  receipt_file?: string;
}

// Invoice API Response
export interface InvoicesResponse extends Array<Invoice> {}

// ==================== ERROR HANDLING ====================

// API Error Response
export interface ApiError {
  message: string;
  code?: string | number;
  details?: any;
  field_errors?: Record<string, string[]>;
}

// Query Error (React Query)
export interface QueryError extends Error {
  response?: {
    status: number;
    data?: ApiError;
  };
}

// ==================== DISPLAY/UI TYPES ====================

// Stat Card Display Item
export interface StatDisplayItem {
  title: string;
  number: string;
  className: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Overview Card Item
export interface OverviewCardItem {
  label: string;
  count: string;
  color: string;
  textColor: string;
}

// Chart Data Point
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Table Column Definition (generic)
export interface TableColumn<T = any> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (props: { row: any; getValue: any }) => React.ReactNode;
  size?: number;
  sortable?: boolean;
  filterable?: boolean;
}

// ==================== UTILITY TYPES ====================

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Period filter options
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Sort order options
export type SortOrder = 'asc' | 'desc';

// Filter operator options
export type FilterOperator = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';

// Generic filter structure
export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
}

// Generic sort structure
export interface Sort {
  field: string;
  order: SortOrder;
}

// Generic pagination structure
export interface Pagination {
  page: number;
  pageSize: number;
  total?: number;
  hasMore?: boolean;
}

// Generic query parameters
export interface QueryParams {
  search?: string;
  filters?: Filter[];
  sort?: Sort[];
  pagination?: Pagination;
}

// ==================== CONTEXT TYPES ====================

// Verifier Data Context Type (already defined in VerifierDataProvider)
export interface VerifierDataContextType {
  // Overview data
  overviewData: VerifierOverviewResponse | null;
  overviewLoading: boolean;
  overviewError: QueryError | null;

  // Invoice status data
  invoiceStatusData: InvoiceStatusResponse | null;
  invoiceStatusLoading: boolean;
  invoiceStatusError: QueryError | null;

  // Payment methods data
  paymentMethodsData: PaymentMethodsResponse | null;
  paymentMethodsLoading: boolean;
  paymentMethodsError: QueryError | null;

  // Payment failure data
  paymentFailureData: PaymentFailureResponse | null;
  paymentFailureLoading: boolean;
  paymentFailureError: QueryError | null;

  // Payment distribution data
  paymentDistributionData: PaymentDistributionResponse | null;
  paymentDistributionLoading: boolean;
  paymentDistributionError: QueryError | null;

  // Verification queue data
  verificationQueueData: VerificationQueueItem[] | null;
  verificationQueueLoading: boolean;
  verificationQueueError: QueryError | null;

  // Audit logs data
  auditLogsData: AuditLogItem[] | null;
  auditLogsLoading: boolean;
  auditLogsError: QueryError | null;

  // Refunds data
  refundsData: RefundItem[] | null;
  refundsLoading: boolean;
  refundsError: QueryError | null;

  // Combined states
  isLoading: boolean;
  hasError: boolean;
  
  // Refresh functions
  refreshAll: () => void;
  refreshOverview: () => void;
  refreshPaymentData: () => void;
}

// ==================== FORM VALIDATION ====================

// Form validation error structure
export interface FormError {
  field: string;
  message: string;
  code?: string;
}

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// Form field configuration
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'file' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}