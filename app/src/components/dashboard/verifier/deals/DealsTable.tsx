"use client";

import React, { useMemo, useState, useCallback } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Check, X, Edit, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { UnifiedTable } from "@/components/core";
import ExpandButton from "@/components/shared/ExpandButton";
import { useDealsQuery } from "@/hooks/useDeals";
import { Deal, Payment } from "@/types/deals";
import { useRoleConfig } from "@/hooks/useRoleBasedColumns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Fetch deals function for verifier (gets deals that need verification)
const fetchDeals = async (searchTerm: string): Promise<Deal[]> => {
      const response = await apiClient.get<Deal[]>("/deals/deals/", {
      search: searchTerm,
      page: 1,
      limit: 25, // Use the actual limit that works
      ordering: "-created_at", // Sort by creation date descending to get newest first
    });
  return response.data || [];
};

// Tooltip component for payment amounts
interface PaymentTooltipProps {
  children: React.ReactNode;
  amount: string;
}

// Memoized Tooltip component for payment amounts
const PaymentTooltip = React.memo<PaymentTooltipProps>(
  ({ children, amount }) => {
    const [isVisible, setIsVisible] = useState(false);

    const showTooltip = useCallback(() => setIsVisible(true), []);
    const hideTooltip = useCallback(() => setIsVisible(false), []);

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          className="cursor-pointer"
        >
          {children}
        </div>
        {isVisible && (
          <div className="absolute z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
            Amount: {amount}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );
  }
);

PaymentTooltip.displayName = "PaymentTooltip";

interface DealsTableProps {
  onEditDeal?: (dealId: string) => void;
  onAddPayment?: (dealId: string) => void;
  onVerifyPayment?: (
    dealId: string,
    paymentId: string,
    status: "verified" | "rejected"
  ) => void;
  searchTerm?: string;
}

const DealsTable: React.FC<DealsTableProps> = ({
  onEditDeal,
  onAddPayment,
  onVerifyPayment,
  searchTerm = "",
}) => {
  const roleConfig = useRoleBasedColumns();

  const {
    data: dealsResponse,
    isLoading,
    error,
  } = useDealsQuery({
    search: searchTerm,
    ordering: "-created_at",
  });
  
  // Debug logging
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] ===== VERIFIER DEALS TABLE DEBUG =====');
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] dealsResponse:', dealsResponse);
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] isLoading:', isLoading);
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] error:', error);
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] dealsResponse?.data:', dealsResponse?.data);
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] dealsResponse?.data?.length:', dealsResponse?.data?.length);
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] dealsResponse?.pagination:', dealsResponse?.pagination);
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] Raw response structure:', {
    hasResults: dealsResponse?.data && typeof dealsResponse.data === 'object' && 'results' in dealsResponse.data,
    isArray: Array.isArray(dealsResponse?.data),
    dataType: typeof dealsResponse?.data,
    keys: dealsResponse?.data ? Object.keys(dealsResponse.data) : 'No data'
  });
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] ===========================================');
  
  // Handle the data structure like salesperson table
  const deals = useMemo(() => {
    if (Array.isArray(dealsResponse?.data)) {
      return dealsResponse.data;
    } else if (dealsResponse?.data && typeof dealsResponse.data === 'object' && 'results' in dealsResponse.data) {
      return (dealsResponse.data as { results: Deal[] }).results;
    }
    return [];
  }, [dealsResponse]);
  
  console.log('🔍 [VERIFIER_DEALS_TABLE_DEBUG] Final deals array length:', deals.length);
  
  const isError = !!error;

  // Expansion state management
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Expanded content renderer
  const renderExpandedContent = (row: any) => {
    const payments = row.original.payments || [];
    
    return (
      <div className="p-4 bg-gray-50 border-t">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
        {payments.length === 0 ? (
          <p className="text-gray-500">No payments found for this deal</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment: Payment, index: number) => (
              <div key={payment.id} className="bg-white p-3 rounded-lg border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <div className="text-gray-900">${payment.received_amount}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Method:</span>
                    <div className="text-gray-900">{payment.payment_method || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      payment.status === "verified" ? "bg-green-100 text-green-700" :
                      payment.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    )}>
                      {payment.status || row.original.verification_status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <div className="text-gray-900">
                      {payment.payment_date ? format(new Date(payment.payment_date), "MMM d, yyyy") : 'N/A'}
                    </div>
                  </div>
                </div>
                {payment.payment_remarks && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="font-medium text-gray-700">Remarks:</span>
                    <div className="text-gray-900 text-sm">{payment.payment_remarks}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const columns: ColumnDef<Deal>[] = useMemo(
    () => [
      {
        id: "deal_name",
        header: "Deal Name",
        accessorKey: "deal_name",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-900">
            {row.original.deal_name}
          </span>
        ),
      },
      {
        id: "client_name",
        header: "Client Name",
        accessorKey: "client_name",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.client_name}
          </span>
        ),
      },
      {
        id: "pay_status",
        header: "Status",
        accessorKey: "pay_status",
        cell: ({ row }) => {
          const status =
            row.original.pay_status === "full_payment"
              ? "Full Pay"
              : "Partial Pay";
          const getStatusColor = () => {
            switch (status.toLowerCase()) {
              case "full pay":
                return "bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full";
              case "partial pay":
                return "bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full";
              default:
                return "bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full";
            }
          };
          return <span className={getStatusColor()}>{status}</span>;
        },
      },
      {
        id: "remarks",
        header: "Remarks",
        accessorKey: "deal_remarks",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700 max-w-xs truncate">
            {row.original.deal_remarks || "N/A"}
          </div>
        ),
      },
      {
        id: "deal_value",
        header: "Deal Value",
        accessorKey: "deal_value",
        cell: ({ row }) => {
          const value = row.original.deal_value;
          const numericValue = typeof value === 'number' ? value : parseFloat(String(value || '0'));
          const formattedValue = `रू ${numericValue.toLocaleString()}`;
          return (
            <span className="text-sm text-gray-900 font-medium">{formattedValue}</span>
          );
        },
      },
      {
        id: "deal_date",
        header: "Deal Date",
        accessorKey: "deal_date",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.deal_date ? format(new Date(row.original.deal_date), "MMM d, yyyy") : "-"}
          </span>
        ),
      },
      {
        id: "payment",
        header: "Payment",
        cell: ({ row }) => {
          const payments = row.original.payments;
          if (!payments || payments.length === 0) return "No Payments";

          return (
            <div className="flex gap-1">
              {payments.slice(0, 2).map((p: Payment, idx: number) => {
                // Determine payment status - if payment has status, use it; otherwise use deal status
                const paymentStatus = p.status || dealStatus;
                const statusColor = 
                  paymentStatus === "verified" ? "text-green-600" :
                  paymentStatus === "rejected" ? "text-red-600" : 
                  "text-orange-500"; // pending = orange
                
                return (
                  <PaymentTooltip key={index} amount={`$${p.received_amount}`}>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeClass}`}
                    >
                      {`Pay ${index + 1}`}
                    </span>
                  </PaymentTooltip>
                );
              })}
            </div>
          );
        },
      },
      {
        id: "pay_method",
        header: "Pay Method",
        cell: ({ row }) => {
          const payments = row.original.payments || [];
          
          // If no payments exist, show deal's payment method
          if (payments.length === 0) {
            const dealPaymentMethod = row.original.payment_method;
            return <span className="text-sm">{dealPaymentMethod || "-"}</span>;
          }
          const methods = [...new Set(payments.map((p) => p.payment_method))];
          return (
            <div className="text-[12px] text-gray-700">
              {methods.join(", ")}
            </div>
          );
        },
      },
      {
        id: "due_date",
        header: "Due Date",
        accessorKey: "due_date",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.due_date ? format(new Date(row.original.due_date), "MMM d, yyyy") : "-"}
          </span>
        ),
      },
      {
        id: "version",
        header: "Version",
        cell: ({ row }) => {
          const versionText = row.original.version > 1 ? "Edited" : "Original";
          return (
            <span
              className={`px-2 py-1 text-[12px] font-medium rounded ${
                versionText === "Edited"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {versionText}
            </span>
          );
        },
      },
      // Conditionally include Sales Person column based on role
      ...(roleConfig.shouldShowSalesperson
        ? [
            {
              accessorKey: "created_by.full_name" as const,
              header: "Sales Person",
              cell: ({ row }: { row: { original: Deal } }) => (
                <div className="text-[12px] text-gray-700">
                  {row.original.created_by?.full_name || "N/A"}
                </div>
              ),
            },
          ]
        : []),
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            {roleConfig.allowedActions.includes("verify") && (
              <>
                <button
                  onClick={() =>
                    onVerifyPayment?.(
                      row.original.id,
                      row.original.payments?.[0]?.id || "",
                      "verified"
                    )
                  }
                  className="w-6 h-6 rounded-full bg-[#22C55E] text-white flex items-center justify-center hover:bg-[#16A34A] transition-colors"
                  title="Verify Payment"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() =>
                    onVerifyPayment?.(
                      row.original.id,
                      row.original.payments?.[0]?.id || "",
                      "rejected"
                    )
                  }
                  className="w-6 h-6 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                  title="Reject Payment"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [roleConfig, onVerifyPayment]
  );

  const nestedColumns: ColumnDef<Payment>[] = useMemo(
    () => [
      {
        accessorKey: "payment_date",
        header: "Payment Date",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {format(new Date(row.original.payment_date), "MMM d, yyyy")}
          </div>
        ),
      },
      {
        accessorKey: "received_amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.received_amount}
          </div>
        ),
      },
      {
        accessorKey: "payment_method",
        header: "Method",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.payment_method}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const getStatusColor = () => {
            switch (status.toLowerCase()) {
              case "verified":
                return "bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full";
              case "rejected":
                return "bg-[#FEF2F2] text-[#DC2626] px-3 py-1 text-[12px] font-medium rounded-full";
              case "pending":
                return "bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full";
              default:
                return "bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full";
            }
          };
          return <span className={getStatusColor()}>{status}</span>;
        },
      },
      {
        accessorKey: "verified_by.full_name",
        header: "Verified By",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.verified_by
              ? row.original.verified_by.full_name
              : "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "verification_remarks",
        header: "Verifier Remarks",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.verification_remarks || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "receipt_file",
        header: "Receipt",
        cell: ({ row }) =>
          row.original.receipt_file ? (
            <a
              href={row.original.receipt_file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-[12px]"
            >
              View
            </a>
          ) : (
            <div className="text-[12px] text-gray-800">N/A</div>
          ),
      },
      // Note: Verification actions handled separately in createNestedColumns
    ],
    []
  );

  // Helper to pass deal ID to nested payment actions
  const createNestedColumns = useCallback(
    (dealId: string): ColumnDef<Payment>[] => [
      ...nestedColumns.slice(0, -1), // Remove the last action column
      {
        id: "verification_actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            {row.original.status === "pending" && (
              <>
                <button
                  onClick={() =>
                    onVerifyPayment?.(dealId, row.original.id, "verified")
                  }
                  className="w-5 h-5 rounded-full bg-[#22C55E] text-white flex items-center justify-center hover:bg-[#16A34A] transition-colors"
                  title="Verify"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() =>
                    onVerifyPayment?.(dealId, row.original.id, "rejected")
                  }
                  className="w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                  title="Reject"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [nestedColumns, onVerifyPayment]
  );

  const expandedContent = useCallback(
    (row: Row<Deal>) => (
      <div className="bg-gray-50 p-4">
        <UnifiedTable
          columns={createNestedColumns(row.original.id) as ColumnDef<unknown>[]}
          data={row.original.payments || []}
          config={{
            features: {
              pagination: false,
              sorting: false,
              filtering: false,
              selection: false,
              expansion: false,
              columnVisibility: false,
              globalSearch: false,
            },
            styling: {
              variant: "compact",
            },
          }}
        />
      </div>
    ),
    [createNestedColumns]
  );

  // Get row className for styling
  const getRowClassName = (row: Row<Deal>) => {
    const hasRejectedPayment = row.original.payments?.some(
      (p: Payment) => p.status === "rejected"
    );
    const hasPendingPayment = row.original.payments?.some(
      (p: Payment) => p.status === "pending"
    );

    if (hasRejectedPayment) {
      return "bg-red-50 hover:bg-red-100 transition-colors";
    }
    if (hasPendingPayment) {
      return "bg-yellow-50 hover:bg-yellow-100 transition-colors";
    }
    return "";
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading deals...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error fetching deals: {error.message}
      </div>
    );
  }

  return (
    <UnifiedTable
      data={deals}
      columns={columns as any}
      loading={isLoading}
      error={isError ? "Failed to load deals" : undefined}
      expandedContent={renderExpandedContent}
      expandedRows={expandedRows}
      onExpandedRowsChange={setExpandedRows}
      getRowProps={(row) => ({
        className: getRowClassName(row as Row<Deal>),
      })}
      config={{
        styling: { variant: "figma" },
        features: {
          pagination: true,
          sorting: true,
          selection: false,
          export: false,
          refresh: false,
          columnVisibility: false,
          globalSearch: false,
          expansion: true,
        },
        pagination: {
          pageSize: 10,
          showSizeSelector: true,
          showInfo: true,
        },
        messages: {
          empty: "No deals found.",
          loading: "Loading deals...",
        },
      }}
    />
  );
};

export default DealsTable;
