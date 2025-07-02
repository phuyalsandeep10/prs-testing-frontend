"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import deleteIcon from "@/assets/icons/delete.svg";
import Image from "next/image";
import { format } from "date-fns";
import { UnifiedTable } from "@/components/core";
import ExpandButton from "@/components/dashboard/salesperson/deals/ExpandButton";
import { apiClient } from "@/lib/api";
import { Deal, Payment } from "@/types/deals";
import { useRoleBasedColumns } from "@/hooks/useRoleBasedColumns";

// Fetch deals function for org-admin (gets all deals in organization)
const fetchDeals = async (searchTerm: string): Promise<Deal[]> => {
  const response = await apiClient.get<Deal[]>("/deals/", {
    search: searchTerm,
  });
  return response.data || [];
};

// Tooltip component for payment amounts
interface PaymentTooltipProps {
  children: React.ReactNode;
  amount: string;
}

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
  searchTerm?: string;
}

const DealsTable: React.FC<DealsTableProps> = ({
  onEditDeal,
  onAddPayment,
  searchTerm = "",
}) => {
  const roleConfig = useRoleBasedColumns();
  
  const {
    data: deals,
    isLoading,
    isError,
    error,
  } = useQuery<Deal[], Error>({
    queryKey: ["deals", searchTerm],
    queryFn: () => fetchDeals(searchTerm),
  });

  const columns: ColumnDef<Deal>[] = useMemo(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <ExpandButton
            isExpanded={row.getIsExpanded()}
            onToggle={row.getToggleExpandedHandler()}
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
                const badgeClass = isVerified
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200";

                return (
                  <PaymentTooltip key={index} amount={`$${p.received_amount}`}>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
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
            {roleConfig.allowedActions.includes('edit') && (
              <button
                onClick={() => onEditDeal?.(row.original.id)}
                className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
                title="Edit Deal"
              >
                <Edit className="w-3 h-3" />
              </button>
            )}
            {roleConfig.allowedActions.includes('addPayment') && (
              <button
                onClick={() => onAddPayment?.(row.original.id)}
                className="w-6 h-6 rounded-full bg-[#22C55E] text-white flex items-center justify-center hover:bg-[#16A34A] transition-colors"
                title="Add Payment"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
            {roleConfig.allowedActions.includes('delete') && (
              <button
                title="Delete Deal"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 transition-colors"
              >
                <Image src={deleteIcon} alt="Delete" width={16} height={16} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [roleConfig, onEditDeal, onAddPayment]
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
    ],
    []
  );

  const expandedContent = useCallback(
    (row: Row<Deal>) => (
      <div className="bg-gray-50 p-4">
        <h3 className="font-semibold text-lg mb-2">Payment Details</h3>
        <UnifiedTable
          columns={nestedColumns as ColumnDef<unknown>[]}
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
    [nestedColumns]
  );

  const getRowClassName = (row: Row<Deal>) => {
    const hasRejectedPayment = row.original.payments?.some(
      (p: Payment) => p.status === 'rejected'
    );
    return hasRejectedPayment ? "bg-red-50 hover:bg-red-100 transition-colors" : "";
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
