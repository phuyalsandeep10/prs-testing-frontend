/**
 * API Response Normalizers for Verifier Dashboard
 * Handles different response formats and provides consistent data structures
 */

// Normalized data interfaces
export interface NormalizedOverviewData {
  total_payments: number;
  total_successful_payments: number;
  total_unsuccess_payments: number;
  total_verification_pending_payments: number;
  total_revenue: string;
  average_transaction_value: number;
  total_refunded_amount: string;
}

export interface NormalizedInvoiceStatusData {
  paid_invoices: number;
  overdue_invoices: number;
  pending_invoices: number;
  refunded_invoices: number;
  rejected_invoices: number;
  processing_invoices: number;
}

export interface NormalizedPaymentMethodsData {
  credit_card: number;
  bank_transfer: number;
  mobile_wallet: number;
  cheque: number;
  qr_payment: number;
  in_hand_cash: number;
}

export interface NormalizedPaymentFailureData {
  insufficient_funds: number;
  invalid_card: number;
  bank_decline: number;
  technical_error: number;
  cheque_bounce: number;
  payment_received_not_reflected: number;
}

export interface NormalizedPaymentDistributionData {
  processing_invoices: number;
  paid_invoices: number;
  rejected_invoices: number;
  pending_invoices: number;
  initiated_invoices: number;
  refunded_invoices: number;
  bad_debt_invoices: number;
}

export interface NormalizedVerificationQueueItem {
  invoice_id: string;
  client_name: string;
  payment_amount: string;
  payment_amount_numeric: number;
  invoice_status: string;
  formatted_amount: string;
}

export interface NormalizedAuditLogItem {
  timestamp: string;
  verifier: string;
  actions: string;
  status: string;
  transaction_id: string;
  formatted_timestamp: string;
}

export interface NormalizedRefundItem {
  transaction_id: string;
  client_name: string;
  amount: string;
  amount_numeric: number;
  status: string;
  reasons: string;
  date: string;
  formatted_amount: string;
}

/**
 * Normalizes overview response data
 */
export function normalizeOverviewResponse(response: any): NormalizedOverviewData {
  if (!response || typeof response !== 'object') {
    return getDefaultOverviewData();
  }

  const totalRevenue = Number(response.total_revenue || 0);
  const totalPayments = Number(response.total_payments || 1); // Avoid division by zero

  return {
    total_payments: Number(response.total_payments || 0),
    total_successful_payments: Number(response.total_successful_payments || 0),
    total_unsuccess_payments: Number(response.total_unsuccess_payments || 0),
    total_verification_pending_payments: Number(response.total_verification_pending_payments || 0),
    total_revenue: response.total_revenue || "0.00",
    average_transaction_value: totalRevenue / totalPayments,
    total_refunded_amount: response.total_refunded_amount || "0.00",
  };
}

/**
 * Normalizes invoice status response data
 */
export function normalizeInvoiceStatusResponse(response: any): NormalizedInvoiceStatusData {
  if (!response || typeof response !== 'object') {
    return getDefaultInvoiceStatusData();
  }

  return {
    paid_invoices: Number(response.paid_invoices || 0),
    overdue_invoices: Number(response.overdue_invoices || 0),
    pending_invoices: Number(response.pending_invoices || 0),
    refunded_invoices: Number(response.refunded_invoices || 0),
    rejected_invoices: Number(response.rejected_invoices || 0),
    processing_invoices: Number(response.processing_invoices || response.pending_invoices || 0),
  };
}

/**
 * Normalizes payment methods response data
 */
export function normalizePaymentMethodsResponse(response: any): NormalizedPaymentMethodsData {
  if (!response || typeof response !== 'object') {
    return getDefaultPaymentMethodsData();
  }

  return {
    credit_card: Number(response.credit_card || 0),
    bank_transfer: Number(response.bank_transfer || 0),
    mobile_wallet: Number(response.mobile_wallet || 0),
    cheque: Number(response.cheque || 0),
    qr_payment: Number(response.qr_payment || 0),
    in_hand_cash: Number(response.in_hand_cash || 0),
  };
}

/**
 * Normalizes payment failure response data
 */
export function normalizePaymentFailureResponse(response: any): NormalizedPaymentFailureData {
  if (!response || typeof response !== 'object') {
    return getDefaultPaymentFailureData();
  }

  return {
    insufficient_funds: Number(response.insufficient_funds || 0),
    invalid_card: Number(response.invalid_card || 0),
    bank_decline: Number(response.bank_decline || 0),
    technical_error: Number(response.technical_error || 0),
    cheque_bounce: Number(response.cheque_bounce || 0),
    payment_received_not_reflected: Number(response.payment_received_not_reflected || 0),
  };
}

/**
 * Normalizes payment distribution response data
 */
export function normalizePaymentDistributionResponse(response: any): NormalizedPaymentDistributionData {
  if (!response || typeof response !== 'object') {
    return getDefaultPaymentDistributionData();
  }

  return {
    processing_invoices: Number(response.processing_invoices || 0),
    paid_invoices: Number(response.paid_invoices || 0),
    rejected_invoices: Number(response.rejected_invoices || 0),
    pending_invoices: Number(response.pending_invoices || 0),
    initiated_invoices: Number(response.initiated_invoices || 0),
    refunded_invoices: Number(response.refunded_invoices || 0),
    bad_debt_invoices: Number(response.bad_debt_invoices || 0),
  };
}

/**
 * Normalizes verification queue response data
 */
export function normalizeVerificationQueueResponse(response: any): NormalizedVerificationQueueItem[] {
  if (!Array.isArray(response)) {
    return [];
  }

  return response.slice(0, 6).map((item: any) => {
    const paymentAmount = Number(item.payment_amount || 0);
    
    return {
      invoice_id: item.invoice_id || "N/A",
      client_name: item.client_name || "Unknown",
      payment_amount: item.payment_amount || "0",
      payment_amount_numeric: paymentAmount,
      invoice_status: normalizeStatus(item.invoice_status),
      formatted_amount: `$${paymentAmount.toFixed(2)}`,
    };
  });
}

/**
 * Normalizes audit logs response data
 */
export function normalizeAuditLogsResponse(response: any): NormalizedAuditLogItem[] {
  const results = response?.results || [];
  
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map((log: any) => {
    const invoiceMatch = log.details?.match(/Invoice (\S+)/);
    const transactionId = invoiceMatch ? invoiceMatch[1] : "N/A";

    let status = "Pending";
    if (log.action === "Verified") status = "Success";
    else if (log.action === "Rejected") status = "Failed";

    const timestamp = new Date(log.timestamp);

    return {
      timestamp: log.timestamp,
      verifier: log.user || "Unknown",
      actions: log.action || "Unknown",
      status,
      transaction_id: transactionId,
      formatted_timestamp: timestamp.toLocaleString(),
    };
  });
}

/**
 * Normalizes refunds response data
 */
export function normalizeRefundsResponse(response: any): NormalizedRefundItem[] {
  if (!Array.isArray(response)) {
    return [];
  }

  return response.slice(0, 5).map((item: any) => {
    const status = normalizeRefundStatus(item.invoice_status);
    const paymentAmount = Number(item.payment_amount || 0);
    
    const reasons = getRefundReasons(item, status);

    return {
      transaction_id: item.invoice_id || "N/A",
      client_name: item.client_name || "Unknown",
      amount: item.payment_amount || "0",
      amount_numeric: paymentAmount,
      status,
      reasons,
      date: item.approval_date || "N/A",
      formatted_amount: `$ ${paymentAmount.toFixed(2)}`,
    };
  });
}

// Helper functions
function normalizeStatus(status: string | undefined): string {
  if (!status) return "Unknown";
  return status === "pending" ? "Pending" : status;
}

function normalizeRefundStatus(status: string | undefined): string {
  if (status === "bad_debt") return "Bad Debt";
  if (status === "refunded") return "Refunded";
  return status || "Unknown";
}

function getRefundReasons(item: any, status: string): string {
  if (status === "Bad Debt") {
    return item.failure_remarks || "No failure reason";
  }
  if (status === "Refunded") {
    return item.approved_remarks || "No approved remarks";
  }
  return "No remarks";
}

// Default data providers
function getDefaultOverviewData(): NormalizedOverviewData {
  return {
    total_payments: 0,
    total_successful_payments: 0,
    total_unsuccess_payments: 0,
    total_verification_pending_payments: 0,
    total_revenue: "0.00",
    average_transaction_value: 0,
    total_refunded_amount: "0.00",
  };
}

function getDefaultInvoiceStatusData(): NormalizedInvoiceStatusData {
  return {
    paid_invoices: 0,
    overdue_invoices: 0,
    pending_invoices: 0,
    refunded_invoices: 0,
    rejected_invoices: 0,
    processing_invoices: 0,
  };
}

function getDefaultPaymentMethodsData(): NormalizedPaymentMethodsData {
  return {
    credit_card: 0,
    bank_transfer: 0,
    mobile_wallet: 0,
    cheque: 0,
    qr_payment: 0,
    in_hand_cash: 0,
  };
}

function getDefaultPaymentFailureData(): NormalizedPaymentFailureData {
  return {
    insufficient_funds: 0,
    invalid_card: 0,
    bank_decline: 0,
    technical_error: 0,
    cheque_bounce: 0,
    payment_received_not_reflected: 0,
  };
}

function getDefaultPaymentDistributionData(): NormalizedPaymentDistributionData {
  return {
    processing_invoices: 0,
    paid_invoices: 0,
    rejected_invoices: 0,
    pending_invoices: 0,
    initiated_invoices: 0,
    refunded_invoices: 0,
    bad_debt_invoices: 0,
  };
}

/**
 * Transforms normalized data to display format for components
 */
export function transformForInvoiceStatusDisplay(data: NormalizedInvoiceStatusData) {
  return [
    {
      label: "Completed Deal",
      count: data.paid_invoices.toString(),
      color: "#C1EAD9",
      textColor: "#026C40",
    },
    {
      label: "Overdue Deal", 
      count: data.overdue_invoices.toString(),
      color: "#FBD0D0",
      textColor: "#A90101",
    },
    {
      label: "Pending Deal",
      count: data.pending_invoices.toString(),
      color: "#FFCA89",
      textColor: "#814804",
    },
    {
      label: "Refunded Deal",
      count: data.refunded_invoices.toString(),
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
    {
      label: "Disputed Deal",
      count: data.rejected_invoices.toString(),
      color: "#FBDAB1",
      textColor: "#666403",
    },
    {
      label: "Processing Deal",
      count: data.processing_invoices.toString(),
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
  ];
}

export function transformForPaymentMethodsDisplay(data: NormalizedPaymentMethodsData) {
  return [
    {
      label: "Credit Card",
      count: data.credit_card.toString(),
      color: "#C1EAD9",
      textColor: "#026C40",
    },
    {
      label: "Bank Transfer",
      count: data.bank_transfer.toString(),
      color: "#FBD0D0",
      textColor: "#A90101",
    },
    {
      label: "Mobile Wallet",
      count: data.mobile_wallet.toString(),
      color: "#FFCA89",
      textColor: "#814804",
    },
    {
      label: "Cheque",
      count: data.cheque.toString(),
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
    {
      label: "QR Payment",
      count: data.qr_payment.toString(),
      color: "#FBDAB1",
      textColor: "#666403",
    },
    {
      label: "In-Hand Cash",
      count: data.in_hand_cash.toString(),
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
  ];
}

export function transformForPaymentFailureDisplay(data: NormalizedPaymentFailureData) {
  return [
    {
      label: "Insufficient Funds",
      count: data.insufficient_funds.toString(),
      color: "#C1EAD9",
      textColor: "#026C40",
    },
    {
      label: "Invalid Card",
      count: data.invalid_card.toString(),
      color: "#FBD0D0",
      textColor: "#A90101",
    },
    {
      label: "Bank Decline",
      count: data.bank_decline.toString(),
      color: "#FFCA89",
      textColor: "#814804",
    },
    {
      label: "Technical Error",
      count: data.technical_error.toString(),
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
    {
      label: "Cheque Bounce",
      count: data.cheque_bounce.toString(),
      color: "#FBDAB1",
      textColor: "#666403",
    },
    {
      label: "Payment Received but Not Reflected",
      count: data.payment_received_not_reflected.toString(),
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
  ];
}