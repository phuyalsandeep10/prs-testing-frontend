"use client";

import React, { useMemo, useState, useCallback } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { format } from "date-fns";
import { UnifiedTable } from "@/components/core";
import ExpandButton from "@/components/shared/ExpandButton";
import { useDeals, useUpdatePaymentStatus } from "@/hooks/api";
import { Deal, Payment } from "@/types/deals";
import { useRoleConfig } from "@/hooks/useRoleBasedColumns";

// Helper function to convert index to ordinal words
const getOrdinalWord = (index: number): string => {
  const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
  return ordinals[index] || `${index + 1}th`;
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
  onVerifyPayment?: (dealId: string, paymentId: string, status: 'verified' | 'rejected') => void;
  searchTerm?: string;
}

const DealsTable: React.FC<DealsTableProps> = ({
  onEditDeal,
  onAddPayment,
  onVerifyPayment,
  searchTerm = "",
}) => {
  const roleConfig = useRoleConfig();
  
  // Use standardized deals hook for verifier
  const {
    data: deals = [],
    isLoading,
    error,
  } = useDeals({
    // For verifier, we typically want deals that need verification
    status: 'pending_verification',
    ...(searchTerm && { search: searchTerm })
  });
  
  const isError = !!error;

  const columns: ColumnDef<Deal>[] = useMemo(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <ExpandButton
            isExpanded={row.getIsExpanded()}
            onToggle={row.getToggleExpandedHandler()}
            variant="verifier"
          />
        ),
      },
      {
        accessorKey: "deal_name",
        header: "Deal Name",
        cell: ({ row }) => (
          <div className="text-[12px] font-medium text-gray-900">
            {row.original.deal_name}
          </div>
        ),
      },
      {
        accessorKey: "client_name",
        header: "Client Name",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700">
            {row.original.client_name}
          </div>
        ),
      },
      {
        accessorKey: "pay_status",
        header: "Pay Status",
        cell: ({ row }) => {
          const status = row.original.pay_status === 'full_payment' ? 'Full Pay' : 'Partial Pay';
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
        accessorKey: "deal_remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700 max-w-xs truncate">
            {row.original.deal_remarks || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: "deal_value",
        header: "Deal Value",
        cell: ({ row }) => (
          <div className="text-[12px] font-medium text-gray-900">
            {row.original.deal_value}
          </div>
        ),
      },
      {
        accessorKey: "deal_date",
        header: "Deal Date",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700">
            {format(new Date(row.original.deal_date), "MMM d, yyyy")}
          </div>
        ),
      },
      {
        accessorKey: "payments",
        header: "Payment",
        cell: ({ row }) => {
          const payments = row.original.payments;
          if (!payments || payments.length === 0) return "No Payments";
          
          return (
            <div className="flex gap-1 flex-wrap">
              {payments.map((p, index) => {
                const isVerified = p.status === "verified";
                const isPending = p.status === "pending";
                const badgeClass = isVerified
                  ? "bg-green-100 text-green-800 border-green-200"
                  : isPending
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : "bg-red-100 text-red-800 border-red-200";

                return (
                  <PaymentTooltip key={index} amount={`$${p.received_amount}`}>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
                      {getOrdinalWord(index)}
                    </span>
                  </PaymentTooltip>
                );
              })}
            </div>
          );
        },
      },
      {
        id: "payment_method",
        header: "Pay Method",
        cell: ({ row }) => {
          const payments = row.original.payments;
          if (!payments || payments.length === 0) {
            return <div className="text-[12px] text-gray-700">N/A</div>;
          }
          const methods = [...new Set(payments.map(p => p.payment_method))];
          return <div className="text-[12px] text-gray-700">{methods.join(', ')}</div>;
        },
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700">
            {format(new Date(row.original.due_date), "MMM d, yyyy")}
          </div>
        ),
      },
      {
        accessorKey: "version",
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
      ...(roleConfig.shouldShowSalesperson ? [{
        accessorKey: "created_by.full_name" as const,
        header: "Sales Person",
        cell: ({ row }: { row: { original: Deal } }) => (
          <div className="text-[12px] text-gray-700">
            {row.original.created_by?.full_name || 'N/A'}
          </div>
        ),
      }] : []),
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            {roleConfig.allowedActions.includes('verify') && (
              <>
                <button
                  onClick={() => onVerifyPayment?.(row.original.id, row.original.payments?.[0]?.id || '', 'verified')}
                  className="w-6 h-6 rounded-full bg-[#22C55E] text-white flex items-center justify-center hover:bg-[#16A34A] transition-colors"
                  title="Verify Payment"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onVerifyPayment?.(row.original.id, row.original.payments?.[0]?.id || '', 'rejected')}
                  className="w-6 h-6 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                  title="Reject Payment"
                >
                  <X className="w-3 h-3" />
                </button>
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
          <div className="text-[12px] text-gray-800">{row.original.received_amount}</div>
        ),
      },
      {
        accessorKey: "payment_method",
        header: "Method",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">{row.original.payment_method}</div>
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
            {row.original.verified_by ? row.original.verified_by.full_name : "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "verification_remarks",
        header: "Verifier Remarks",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.verification_remarks || 'N/A'}
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
  const createNestedColumns = useCallback((dealId: string): ColumnDef<Payment>[] => [
    ...nestedColumns.slice(0, -1), // Remove the last action column
    {
      id: "verification_actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          {row.original.status === 'pending' && (
            <>
              <button
                onClick={() => onVerifyPayment?.(dealId, row.original.id, 'verified')}
                className="w-5 h-5 rounded-full bg-[#22C55E] text-white flex items-center justify-center hover:bg-[#16A34A] transition-colors"
                title="Verify"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => onVerifyPayment?.(dealId, row.original.id, 'rejected')}
                className="w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                title="Reject"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      ),
    }],
    [nestedColumns, onVerifyPayment]
  );

  const expandedContent = useCallback(
    (row: Row<Deal>) => (
      <div className="bg-gray-50 p-4">
        <h3 className="font-semibold text-lg mb-2">Payment Details for Verification</h3>
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

  const getRowClassName = (row: Row<Deal>) => {
    const hasRejectedPayment = row.original.payments?.some(
      (p: Payment) => p.status === 'rejected'
    );
    const hasPendingPayment = row.original.payments?.some(
      (p: Payment) => p.status === 'pending'
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
    return <div className="p-4 text-center text-red-500">Error fetching deals: {error.message}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <UnifiedTable
        columns={columns as ColumnDef<unknown>[]}
        data={deals || []}
        expandedContent={expandedContent}
        getRowProps={(row: Row<Deal>) => ({
          className: getRowClassName(row),
        })}
        config={{
          features: {
            expansion: true,
            pagination: true,
            globalSearch: false,
            columnVisibility: false,
          },
          styling: {
            variant: "figma",
            size: "sm",
          },
          pagination: {
            pageSize: 10,
          },
        }}
      />
    </div>
  );
};

export default DealsTable;
