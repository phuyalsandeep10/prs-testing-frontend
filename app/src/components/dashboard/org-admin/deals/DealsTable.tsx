"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useDealsQuery, useDeleteDeal } from "@/hooks/useDeals";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Plus, ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { UnifiedTable } from "@/components/core";
import ExpandButton from "@/components/shared/ExpandButton";
import { useRoleConfig } from "@/hooks/useRoleBasedColumns";
import { Deal, Payment } from "@/types/deals";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const deleteDealMutation = useDeleteDeal();
  const { data: dealsResponse, isLoading, error } = useDealsQuery({
    search: searchTerm,
    ordering: "-created_at",
  });
  
  // Debug logging
  console.log('🔍 [ORG_ADMIN_DEALS_TABLE_DEBUG] ===== ORG ADMIN DEALS TABLE DEBUG =====');
  console.log('🔍 [ORG_ADMIN_DEALS_TABLE_DEBUG] dealsResponse:', dealsResponse);
  console.log('🔍 [ORG_ADMIN_DEALS_TABLE_DEBUG] isLoading:', isLoading);
  console.log('🔍 [ORG_ADMIN_DEALS_TABLE_DEBUG] error:', error);
  console.log('🔍 [ORG_ADMIN_DEALS_TABLE_DEBUG] dealsResponse?.data:', dealsResponse?.data);
  console.log('🔍 [ORG_ADMIN_DEALS_TABLE_DEBUG] dealsResponse?.data?.length:', dealsResponse?.data?.length);
  console.log('🔍 [ORG_ADMIN_DEALS_TABLE_DEBUG] ===========================================');
  
  // Handle the data structure like salesperson table
  const deals = useMemo(() => {
    if (Array.isArray(dealsResponse?.data)) {
      return dealsResponse.data;
    } else if (dealsResponse?.data && typeof dealsResponse.data === 'object' && 'results' in dealsResponse.data) {
      return (dealsResponse.data as { results: Deal[] }).results;
    }
    return [];
  }, [dealsResponse]);
  
  console.log('🔍 [ORG_ADMIN_DEALS_TABLE_DEBUG] Final deals array length:', deals.length);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const roleConfig = useRoleConfig();

  const handleRowExpand = useCallback((rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

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
          const statusRaw = row.original.pay_status; // full_payment | partial_payment
          const statusLabel = statusRaw === "full_payment" ? "Full Pay" : "Partial Pay";
          const badgeClass =
            statusRaw === "full_payment"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700";
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>{
              statusLabel
            }</span>
          );
        },
      },
      {
        id: "remarks",
        header: "Remarks",
        accessorKey: "deal_remarks",
        cell: ({ row }) => (
          <span className="truncate max-w-[150px] block text-sm text-gray-700">
            {row.original.deal_remarks || "-"}
          </span>
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
          const payments = row.original.payments || [];
          const dealStatus = row.original.verification_status;
          
          // If no payments exist, show deal status
          if (payments.length === 0) {
            const statusColor = 
              dealStatus === "verified" ? "text-green-600" :
              dealStatus === "rejected" ? "text-red-600" : 
              "text-orange-500"; // pending = orange
            
            return (
              <div className="flex gap-1">
                <span className={`text-xs font-semibold ${statusColor}`}>
                  First
                </span>
              </div>
            );
          }
          
          // If payments exist, show them with proper status colors
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
                  <span
                    key={p.id}
                    className={cn(
                      "text-xs font-semibold",
                      statusColor
                    )}
                  >
                    {idx === 0 ? "First" : "Second"}
                  </span>
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
          
          // If payments exist, show first payment's method
          return <span className="text-sm">{payments[0]?.payment_method || "-"}</span>;
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
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.version === 'edited' ? "Edited" : "Original"}
          </span>
        ),
      },
      // Sales Person column - always show for org-admin
      {
        id: "sales_person",
        header: "Sales Person",
        cell: ({ row }: any) => (
          <span className="text-sm">{row.original.created_by?.full_name || "-"}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleRowExpand(row.id);
              }}
              title={expandedRows[row.id] ? "Collapse" : "Expand"}
            >
              {expandedRows[row.id] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {roleConfig.allowedActions.includes('edit') && (
              <Button
                size="icon"
                variant="outline"
                onClick={() => onEditDeal?.(row.original.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {roleConfig.allowedActions.includes('addPayment') && (
              <Button
                size="icon"
                variant="outline"
                onClick={() => onAddPayment?.(row.original.id)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {roleConfig.allowedActions.includes('delete') && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the deal
                      "{row.original.deal_name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={async () => {
                        try {
                          await deleteDealMutation.mutateAsync(row.original.id);
                          toast.success("Deal deleted successfully!");
                        } catch (error: any) {
                          toast.error(error.message || "Failed to delete deal");
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ),
      },
    ],
    [onEditDeal, onAddPayment, roleConfig.allowedActions, expandedRows, handleRowExpand]
  );

  // Get row className for styling
  const getRowClassName = (row: Row<Deal>) => {
    const payments = row.original.payments as Payment[] | undefined;
    const hasRejected = payments?.some((p) => p.status === "rejected");
    return hasRejected ? "bg-red-50" : "";
  };

  return (
    <UnifiedTable
      data={deals}
      columns={columns as any}
      loading={isLoading}
      error={error ? "Failed to load deals" : undefined}
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


