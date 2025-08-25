/**
 * API Response Normalizer for Commission Page
 * Handles different response formats and provides consistent data structures
 */

export interface NormalizedCommissionData {
  organization_goal: number;
  company_goal_chart: {
    achieved_percentage: number;
    sales_growth_percentage: number;
    current_sales: number;
  };
  period_summary: {
    period: string;
  };
  top_clients_this_period: Array<{
    client_id: number;
    client_name: string;
    total_deals: number;
    total_value: number;
  }>;
  regular_clients_all_time: Array<{
    client_id: number;
    client_name: string;
    total_deals: number;
    total_value: number;
  }>;
}

export interface NormalizedClientData {
  id: string;
  client_id: string;
  client_name: string;
  email: string;
  phone_number: string;
  nationality: string;
  remarks: string;
  status: string;
  total_deals: number;
  total_value: number;
  outstanding_amount: number;
}

/**
 * Normalizes commission API response to standard format
 */
export function normalizeCommissionResponse(response: any): NormalizedCommissionData {
  if (!response || typeof response !== 'object') {
    return getDefaultCommissionData();
  }

  try {
    return {
      organization_goal: Math.max(1, Number(response.organization_goal) || 1),
      company_goal_chart: {
        achieved_percentage: Math.max(0, Number(response.company_goal_chart?.achieved_percentage) || 0),
        sales_growth_percentage: Number(response.company_goal_chart?.sales_growth_percentage) || 0,
        current_sales: Math.max(0, Number(response.company_goal_chart?.current_sales) || 0),
      },
      period_summary: {
        period: response.period_summary?.period || response.period || 'Monthly',
      },
      top_clients_this_period: normalizeClientArray(response.top_clients_this_period || []),
      regular_clients_all_time: normalizeClientArray(response.regular_clients_all_time || []),
    };
  } catch (error) {
    console.error('Error normalizing commission response:', error);
    return getDefaultCommissionData();
  }
}

/**
 * Normalizes client array from various API response formats
 */
function normalizeClientArray(clients: any[]): Array<{
  client_id: number;
  client_name: string;
  total_deals: number;
  total_value: number;
}> {
  if (!Array.isArray(clients)) {
    return [];
  }

  return clients.map(client => ({
    client_id: Number(client.client_id || client.id) || 0,
    client_name: getClientName(client),
    total_deals: Number(client.total_deals) || 0,
    total_value: Number(client.total_value || client.value) || 0,
  })).filter(client => client.client_id > 0); // Filter out invalid clients
}

/**
 * Normalizes individual client data from API response
 */
export function normalizeClientData(client: any): NormalizedClientData | null {
  if (!client || typeof client !== 'object') {
    return null;
  }

  const clientId = String(client.client_id || client.id || '');
  if (!clientId) {
    return null; // Invalid client without ID
  }

  return {
    id: clientId,
    client_id: clientId,
    client_name: getClientName(client),
    email: client.email || '',
    phone_number: client.phone_number || '',
    nationality: client.nationality || '',
    remarks: client.remarks || '',
    status: client.status || client.client_status || 'pending',
    total_deals: Number(client.total_deals) || 0,
    total_value: Number(client.total_value) || 0,
    outstanding_amount: Number(client.outstanding_amount) || 0,
  };
}

/**
 * Extracts client name from various possible field names
 */
function getClientName(client: any): string {
  return (
    client?.client_name ||
    client?.name ||
    client?.client__client_name ||
    'Unknown Client'
  );
}

/**
 * Returns default commission data structure for error cases
 */
function getDefaultCommissionData(): NormalizedCommissionData {
  return {
    organization_goal: 1,
    company_goal_chart: {
      achieved_percentage: 0,
      sales_growth_percentage: 0,
      current_sales: 0,
    },
    period_summary: {
      period: 'Monthly',
    },
    top_clients_this_period: [],
    regular_clients_all_time: [],
  };
}

/**
 * Validates and sanitizes numeric values
 */
export function sanitizeNumericValue(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
}

/**
 * Validates and sanitizes string values
 */
export function sanitizeStringValue(value: any, defaultValue: string = ''): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  return defaultValue;
}

/**
 * Type guard to check if response has required commission fields
 */
export function isValidCommissionResponse(response: any): boolean {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.organization_goal !== 'undefined'
  );
}

/**
 * Type guard to check if response has required client fields
 */
export function isValidClientResponse(response: any): boolean {
  return (
    response &&
    typeof response === 'object' &&
    (response.client_id || response.id)
  );
}