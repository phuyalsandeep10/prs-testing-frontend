"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/hooks/useAuthToken";
import type {
  VerifierOverviewResponse,
  InvoiceStatusResponse,
  PaymentMethodsResponse,
  PaymentFailureResponse,
  PaymentDistributionResponse,
  VerificationQueueItem,
  AuditLogItem,
  RefundItem,
  QueryError
} from "../_types/api";

// Centralized data provider for verifier dashboard
// Coordinates all API calls to prevent duplicates and improve performance

interface VerifierDataContextType {
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

const VerifierDataContext = createContext<VerifierDataContextType | undefined>(undefined);

interface VerifierDataProviderProps {
  children: React.ReactNode;
}

export const VerifierDataProvider: React.FC<VerifierDataProviderProps> = ({ children }) => {
  const { authenticatedFetch, isAuthenticated, token } = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  // Overview data query
  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["verifier-overview"],
    queryFn: () => authenticatedFetch("/verifier/dashboard/"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Invoice status data query
  const {
    data: invoiceStatusData,
    isLoading: invoiceStatusLoading,
    error: invoiceStatusError,
    refetch: refetchInvoiceStatus,
  } = useQuery({
    queryKey: ["verifier-invoice-status"],
    queryFn: () => authenticatedFetch("/verifier/dashboard/invoice-status/"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Payment methods data query
  const {
    data: paymentMethodsData,
    isLoading: paymentMethodsLoading,
    error: paymentMethodsError,
    refetch: refetchPaymentMethods,
  } = useQuery({
    queryKey: ["verifier-payment-methods"],
    queryFn: () => authenticatedFetch("/verifier/dashboard/payment-methods/"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes - less frequently changing
    refetchOnWindowFocus: false,
  });

  // Payment failure data query
  const {
    data: paymentFailureData,
    isLoading: paymentFailureLoading,
    error: paymentFailureError,
    refetch: refetchPaymentFailure,
  } = useQuery({
    queryKey: ["verifier-payment-failures"],
    queryFn: () => authenticatedFetch("/verifier/dashboard/payment-failure-reasons/"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Payment distribution data query
  const {
    data: paymentDistributionData,
    isLoading: paymentDistributionLoading,
    error: paymentDistributionError,
    refetch: refetchPaymentDistribution,
  } = useQuery({
    queryKey: ["verifier-payment-distribution"],
    queryFn: () => authenticatedFetch("/verifier/dashboard/payment-status-distribution/"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchOnWindowFocus: false,
  });

  // Verification queue data query
  const {
    data: verificationQueueData,
    isLoading: verificationQueueLoading,
    error: verificationQueueError,
    refetch: refetchVerificationQueue,
  } = useQuery({
    queryKey: ["verifier-verification-queue"],
    queryFn: () => authenticatedFetch("/verifier/dashboard/verification-queue/"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 minute - frequently changing
    refetchOnWindowFocus: true, // Refetch on focus for verification queue
  });

  // Audit logs data query
  const {
    data: auditLogsResponse,
    isLoading: auditLogsLoading,
    error: auditLogsError,
    refetch: refetchAuditLogs,
  } = useQuery({
    queryKey: ["verifier-audit-logs"],
    queryFn: () => authenticatedFetch("/verifier/dashboard/audit-logs/"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Refunds data query
  const {
    data: refundsData,
    isLoading: refundsLoading,
    error: refundsError,
    refetch: refetchRefunds,
  } = useQuery({
    queryKey: ["verifier-refunds"],
    queryFn: () => authenticatedFetch("/verifier/dashboard/recent-refunds-or-bad-debts/"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Extract audit logs from response
  const auditLogsData = auditLogsResponse?.results || null;

  // Compute combined states
  const isLoading = overviewLoading || invoiceStatusLoading || paymentMethodsLoading || 
                   paymentFailureLoading || paymentDistributionLoading || 
                   verificationQueueLoading || auditLogsLoading || refundsLoading;

  const hasError = !!(overviewError || invoiceStatusError || paymentMethodsError || 
                     paymentFailureError || paymentDistributionError || 
                     verificationQueueError || auditLogsError || refundsError);

  // Memoized refresh functions
  const refreshAll = useMemo(() => () => {
    refetchOverview();
    refetchInvoiceStatus();
    refetchPaymentMethods();
    refetchPaymentFailure();
    refetchPaymentDistribution();
    refetchVerificationQueue();
    refetchAuditLogs();
    refetchRefunds();
  }, [
    refetchOverview, refetchInvoiceStatus, refetchPaymentMethods, refetchPaymentFailure,
    refetchPaymentDistribution, refetchVerificationQueue, refetchAuditLogs, refetchRefunds
  ]);

  const refreshOverview = useMemo(() => () => {
    refetchOverview();
  }, [refetchOverview]);

  const refreshPaymentData = useMemo(() => () => {
    refetchInvoiceStatus();
    refetchPaymentMethods();
    refetchPaymentFailure();
    refetchPaymentDistribution();
  }, [refetchInvoiceStatus, refetchPaymentMethods, refetchPaymentFailure, refetchPaymentDistribution]);

  const value: VerifierDataContextType = useMemo(() => ({
    // Overview data
    overviewData: overviewData || null,
    overviewLoading,
    overviewError,

    // Invoice status data
    invoiceStatusData: invoiceStatusData || null,
    invoiceStatusLoading,
    invoiceStatusError,

    // Payment methods data
    paymentMethodsData: paymentMethodsData || null,
    paymentMethodsLoading,
    paymentMethodsError,

    // Payment failure data
    paymentFailureData: paymentFailureData || null,
    paymentFailureLoading,
    paymentFailureError,

    // Payment distribution data
    paymentDistributionData: paymentDistributionData || null,
    paymentDistributionLoading,
    paymentDistributionError,

    // Verification queue data
    verificationQueueData: verificationQueueData || null,
    verificationQueueLoading,
    verificationQueueError,

    // Audit logs data
    auditLogsData,
    auditLogsLoading,
    auditLogsError,

    // Refunds data
    refundsData: refundsData || null,
    refundsLoading,
    refundsError,

    // Combined states
    isLoading,
    hasError,

    // Refresh functions
    refreshAll,
    refreshOverview,
    refreshPaymentData,
  }), [
    overviewData, overviewLoading, overviewError,
    invoiceStatusData, invoiceStatusLoading, invoiceStatusError,
    paymentMethodsData, paymentMethodsLoading, paymentMethodsError,
    paymentFailureData, paymentFailureLoading, paymentFailureError,
    paymentDistributionData, paymentDistributionLoading, paymentDistributionError,
    verificationQueueData, verificationQueueLoading, verificationQueueError,
    auditLogsData, auditLogsLoading, auditLogsError,
    refundsData, refundsLoading, refundsError,
    isLoading, hasError,
    refreshAll, refreshOverview, refreshPaymentData
  ]);

  // Show authentication prompt if not authenticated
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access the verifier dashboard.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <VerifierDataContext.Provider value={value}>
      {children}
    </VerifierDataContext.Provider>
  );
};

export const useVerifierDataContext = (): VerifierDataContextType => {
  const context = useContext(VerifierDataContext);
  if (context === undefined) {
    throw new Error('useVerifierDataContext must be used within a VerifierDataProvider');
  }
  return context;
};

export default VerifierDataProvider;