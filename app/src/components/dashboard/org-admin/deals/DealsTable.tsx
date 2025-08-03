"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useDealsQuery, useDeleteDeal } from "@/hooks/useDeals";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Plus, ChevronRight, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import EditIcon from "@/assets/icons/edit.svg";
import AddIcon from "@/assets/icons/add.svg";
import { apiClient } from "@/lib/api";
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
import ExpandButton from "@/components/dashboard/salesperson/deals/ExpandButton";
import { useRoleConfig } from "@/hooks/useRoleBasedColumns";
import { Deal, Payment } from "@/types/deals";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  // Add state for nested data
  const [nestedData, setNestedData] = useState<Record<string, any[]>>({});
  const [nestedLoading, setNestedLoading] = useState<Record<string, boolean>>({});
  const [nestedError, setNestedError] = useState<Record<string, string>>({});

  // Function to fetch nested payments for a deal
  const fetchNestedPayments = useCallback(async (dealId: string) => {
    setNestedLoading((prev) => ({ ...prev, [dealId]: true }));
    setNestedError((prev) => ({ ...prev, [dealId]: undefined }));
    try {
      const response = await apiClient.get<any>(
        `/deals/deals/${dealId}/expand/`
      );

      const NestedData = response.data;

      // Transform the data: extract payment_history (no need to merge since fields are already included)
      let transformedData = [];
      if (
        NestedData &&
        NestedData.payment_history &&
        Array.isArray(NestedData.payment_history)
      ) {
        transformedData = NestedData.payment_history;
      }

      setNestedData((prev) => {
        const newData = { ...prev, [dealId]: transformedData };
        return newData;
      });
    } catch (err: any) {
      setNestedError((prev) => ({
        ...prev,
        [dealId]: err.message || "Error fetching nested data",
      }));
    } finally {
      setNestedLoading((prev) => ({ ...prev, [dealId]: false }));
    }
  }, []);

  // Handle expand button click
  const handleExpand = useCallback(
    (row: any) => {
      const dealId = row.original.deal_id || row.original.id;
      const isExpanded = !expandedRows[dealId];

      if (isExpanded) {
        // Always fetch fresh nested data when expanding to ensure latest payments
        fetchNestedPayments(dealId);
      }

      setExpandedRows(prev => ({
        ...prev,
        [dealId]: isExpanded
      }));
    },
    [expandedRows, fetchNestedPayments]
  );

  // Listen for payment status updates and clear nested data cache
  useEffect(() => {
    const handlePaymentUpdate = (event: CustomEvent) => {
      const { dealId, action, status } = event.detail;
      console.log('🔍 [ORG_ADMIN_DEALS_TABLE] Payment status updated:', { dealId, action, status });
      
      // Clear nested data cache for the specific deal
      if (dealId) {
        setNestedData(prev => {
          const newData = { ...prev };
          delete newData[dealId];
          return newData;
        });
        
        // If the deal is currently expanded, refetch the data
        if (expandedRows[dealId]) {
          fetchNestedPayments(dealId);
        }
      } else {
        // If no specific dealId, clear all nested data cache
        setNestedData({});
        setNestedLoading({});
        setNestedError({});
      }
    };

    window.addEventListener('paymentStatusUpdated', handlePaymentUpdate as EventListener);
    
    return () => {
      window.removeEventListener('paymentStatusUpdated', handlePaymentUpdate as EventListener);
    };
  }, [expandedRows, fetchNestedPayments]);

  // Nested columns for payment details
  const nestedColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "payment_serial",
        header: "Payment",
        cell: ({ row }) => {
          return <div>{row.original.payment_serial}</div>;
        },
      },
      {
        accessorKey: "payment_date",
        header: "Payment Date",
        cell: ({ row }) => {
          const paymentDate = row.original.payment_date;
          const formattedDate = new Date(paymentDate).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          );
          return <span>{formattedDate}</span>;
        },
      },
      {
        accessorKey: "created_at",
        header: "Payment Created",
        cell: ({ row }) => {
          const createdDate = row.original.created_at;
          const formattedDate = new Date(createdDate).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          );
          return <span>{formattedDate}</span>;
        },
      },
      {
        accessorKey: "payment_value",
        header: "Payment Value",
        cell: ({ row }) => {
          const paymentValue = row.original.payment_value;
          const currency = row.original.deal?.currency || 'USD';
          return <div>{formatCurrency(paymentValue, currency)}</div>;
        },
      },
      {
        accessorKey: "payment_version",
        header: "Payment Version",
        cell: ({ row }) => {
          return (
            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
              {row.original.payment_version}
            </span>
          );
        },
      },
      {
        accessorKey: "verification_status",
        header: "Payment Status",
        cell: ({ row }) => {
          const status = row.original.verification_status;
          let statusClasses = "";
          
          switch (status) {
            case "verified":
              statusClasses = "bg-green-100 text-green-800";
              break;
            case "rejected":
              statusClasses = "bg-red-100 text-red-800";
              break;
            case "pending":
              statusClasses = "bg-orange-100 text-orange-800";
              break;
            default:
              statusClasses = "bg-gray-100 text-gray-600";
          }
          
          return (
            <span className={`px-2 py-1 text-xs font-medium rounded ${statusClasses}`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "receipt_link",
        header: "Receipt Link",
        cell: ({ row }) => {
          const receiptLink = row.original.receipt_link;
          console.log("🔍 [ORG-ADMIN] Receipt link value:", receiptLink);
          console.log("🔍 [ORG-ADMIN] Full row data:", row.original);
          
          if (receiptLink) {
            // Fix relative URLs by making them absolute with backend URL
            const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
            let fullUrl;
            if (receiptLink.startsWith('http')) {
              fullUrl = receiptLink;
            } else if (receiptLink.startsWith('/media/')) {
              fullUrl = `${backendUrl}${receiptLink}`;
            } else {
              fullUrl = `${backendUrl}/media/${receiptLink}`;
            }
            
            return (
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
                onClick={(e) => {
                  console.log("📎 [ORG-ADMIN] Clicking receipt link:", fullUrl);
                }}
              >
                View Receipt
              </a>
            );
          }
          return <div>No receipt</div>;
        },
      },
      {
        accessorKey: "verified_by",
        header: "Verified By",
        cell: ({ row }) => {
          const verifiedBy = row.original.verified_by;
          const status = row.original.verification_status;
          
          let textClass = "text-sm";
          if (status === 'verified') {
            textClass += " text-green-600 font-medium";
          } else if (status === 'rejected') {
            textClass += " text-red-600 font-medium";
          } else {
            textClass += " text-gray-500";
          }
          
          return (
            <div className={textClass}>
              {verifiedBy || 'Not verified yet'}
            </div>
          );
        },
      },
      {
        accessorKey: "deal_remarks",
        header: "Remarks",
        cell: ({ row }) => {
          return <div>{row.original.deal_remarks || "N/A"}</div>;
        },
      },
      {
        accessorKey: "verifier_remark_status",
        header: "Verifier Remark",
        cell: ({ row }) => {
          const remarkStatus = row.original.verifier_remark_status;
          const status = row.original.verification_status;
          
          let badgeClass = "px-2 py-1 text-xs font-medium rounded";
          if (remarkStatus === 'yes' || status === 'verified') {
            badgeClass += " bg-green-100 text-green-800 border border-green-200";
          } else if (status === 'rejected') {
            badgeClass += " bg-red-100 text-red-800 border border-red-200";
          } else {
            badgeClass += " bg-gray-100 text-gray-600 border border-gray-200";
          }
          
          const displayText = remarkStatus === 'yes' ? 'Verified' : 
                             status === 'rejected' ? 'Rejected' : 'Pending';
          
          return (
            <span className={badgeClass}>
              {displayText}
            </span>
          );
        },
      },
    ],
    []
  );

  // Expanded content renderer
  const renderExpandedContent = useCallback(
    (row: Row<unknown>) => {
      const deal = row.original as Deal;
      const dealId = deal.deal_id || deal.id;

      if (nestedLoading[dealId]) {
        return (
          <div className="bg-gray-50 p-4 w-full transition-all duration-500 ease-in-out">
            <div className="border rounded-lg w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    {[...Array(12)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-[24px] w-[100px]" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(2)].map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {[...Array(12)].map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-[32px] w-[100px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      }
      if (nestedError[dealId])
        return <div className="text-red-500 p-4">{nestedError[dealId]}</div>;

      const tableData = nestedData[dealId] || [];

      return (
        <div className="bg-gray-50 p-4 w-full transition-all duration-500 ease-in-out">
          <UnifiedTable
            columns={nestedColumns as ColumnDef<unknown>[]}
            data={tableData}
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
                variant: "figma",
              },
            }}
          />
        </div>
      );
    },
    [nestedColumns, nestedData, nestedLoading, nestedError]
  );

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
              ? "bg-[#009959] text-[#ffffff]"
              : "bg-[#FEF3C7] text-[#B45309]";
          return (
            <span className={`px-3 py-1 text-[12px] font-medium rounded-full ${badgeClass}`}>{
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
          const currency = row.original.currency || 'USD';
          return (
            <span className="text-sm text-gray-900 font-medium">
              {formatCurrency(value, currency)}
            </span>
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
          const payments = row.original.payments_read || [];
          if (!payments || payments.length === 0) return "No Payments";

          return (
            <div className="inline-block">
              {payments.map((p: Payment, index: number) => {
                const paymentNumber = index === 0 ? "First" : 
                                    index === 1 ? "Second" : 
                                    index === 2 ? "Third" : 
                                    index === 3 ? "Fourth" : 
                                    index === 4 ? "Fifth" : 
                                    `${index + 1}th`;
                
                const badgeClass = {
                  verified: "bg-green-500 text-white border-green-600",
                  pending: "bg-orange-400 text-white border-orange-500",
                  rejected: "bg-red-500 text-white border-red-600",
                };

                // Format the payment amount - use verified amount if available, otherwise use received amount
                const amountToShow = p.verified_amount || p.received_amount;
                const currency = row.original.currency || 'USD';
                const amount = formatCurrency(amountToShow, currency);

                return (
                  <PaymentTooltip key={p.id} amount={amount}>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border me-2 ${
                        badgeClass[p.status] || badgeClass.pending
                      }`}
                    >
                      {paymentNumber}
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
          const payments = row.original.payments_read || [];
          
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
        cell: ({ row }) => {
          // Memoize the main action buttons separately to prevent re-rendering
          const MainActionButtons = useMemo(() => (
            <div className="flex items-center justify-center gap-1">
              {roleConfig.allowedActions.includes('edit') && (
                <button
                  onClick={() => onEditDeal?.(row.original.id)}
                  className="w-5 h-5 rounded-full text-[#4F46E5] flex items-center justify-center transition-colors hover:bg-gray-100"
                  title="Edit Deal"
                >
                  <Image src={EditIcon} alt="edit" className="w-4 h-4" />
                </button>
              )}
              {roleConfig.allowedActions.includes('addPayment') && (
                <button
                  onClick={() => onAddPayment?.(row.original.id)}
                  className="w-5 h-5 rounded-full text-[#22C55E] flex items-center justify-center transition-colors hover:bg-gray-100"
                  title="Add Payment"
                >
                  <Image src={AddIcon} alt="add" className="w-4 h-4" />
                </button>
              )}
              {roleConfig.allowedActions.includes('delete') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="w-5 h-5 rounded-full text-red-600 flex items-center justify-center transition-colors hover:bg-gray-100"
                      title="Delete Deal"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
          ), [row.original.id, row.original.deal_name, roleConfig.allowedActions, onEditDeal, onAddPayment, deleteDealMutation]);

          // Render expand button separately to prevent it from affecting other buttons
          return (
            <div className="flex items-center justify-center gap-1">
              {MainActionButtons}
              <ExpandButton
                isExpanded={!!expandedRows[row.id]}
                onToggle={() => handleExpand(row)}
              />
            </div>
          );
        },
      },
    ],
    [onEditDeal, onAddPayment, roleConfig.allowedActions, handleExpand]
  );

  // Row styling based on payment verification status
  const getRowClassName = (row: Row<Deal>) => {
    const deal = row.original;
    const payments = deal.payments_read || [];
    
    // Check if any payment is rejected - make entire row red
    const hasRejectedPayment = payments.some(payment => payment.status === 'rejected');
    if (hasRejectedPayment) {
      return "bg-red-100 hover:bg-red-200 transition-colors";
    }
    
    // Check if all payments are verified - make row green
    const allPaymentsVerified = payments.length > 0 && payments.every(payment => payment.status === 'verified');
    if (allPaymentsVerified) {
      return "bg-green-50 hover:bg-green-100 transition-colors";
    }
    
    // Default styling for pending payments
    return "hover:bg-gray-50 transition-colors";
  };

  // Export function for deals
  const handleExport = useCallback((data: Deal[]) => {
    const csvContent = [
      // CSV Header
      ['Deal ID', 'Deal Name', 'Client Name', 'Deal Value', 'Currency', 'Deal Date', 'Due Date', 'Payment Status', 'Verification Status', 'Sales Person', 'Remarks'].join(','),
      // CSV Data
      ...data.map(deal => [
        deal.deal_id,
        `"${deal.deal_name}"`,
        `"${deal.client_name}"`,
        deal.deal_value,
        deal.currency,
        deal.deal_date,
        deal.due_date || '',
        deal.pay_status,
        deal.verification_status,
        `"${deal.created_by?.full_name || ''}"`,
        `"${deal.deal_remarks || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `org_admin_deals_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <UnifiedTable
      key={`org-admin-deals-${deals.length}`}
      data={deals}
      columns={columns as any}
      loading={isLoading}
      error={error ? "Failed to load deals" : undefined}
      expandedContent={renderExpandedContent}
      expandedRows={expandedRows}
      onExpandedRowsChange={setExpandedRows}
      onExport={handleExport}
      getRowProps={(row) => ({
        className: getRowClassName(row as Row<Deal>),
      })}
      config={{
        styling: { variant: "figma" },
        features: {
          pagination: true,
          sorting: true,
          selection: false,
          export: true,
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


