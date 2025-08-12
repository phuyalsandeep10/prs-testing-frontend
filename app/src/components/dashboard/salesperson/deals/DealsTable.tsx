"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { UnifiedTable } from "@/components/core";
import ExpandButton from "@/components/dashboard/salesperson/deals/ExpandButton";
import { apiClient } from "@/lib/api-client";
import { Deal } from "@/types/deals";
import Image from "next/image";
import Edit from "@/assets/icons/edit.svg";
import Add from "@/assets/icons/add.svg";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDealExpanded } from "@/hooks/api/useDeals";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Deal[];
}

// Fetch deals function
const fetchDeals = async (searchTerm: string): Promise<Deal[]> => {
  try {
    // Add pagination parameters to get more deals and ensure we get the latest ones
    const response = await apiClient.get<ApiResponse>("/deals/deals/", {
      search: searchTerm,
      page: 1,
      limit: 25, // Use the actual limit that works
      ordering: "-created_at", // Sort by creation date descending to get newest first
    });
    // The apiClient.get() method returns the data directly, not wrapped in a .data property
    const dealsData = response.results;
    return dealsData || []; // Return the data array from the response
  } catch (error) {
    throw error;
  }
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

// Parent table data structure
// interface MainUsers {
//   id: string;
//   "Deal Name": string;
//   "Client Name": string;
//   "Pay Status": string;
//   Remarks: string;
//   "Deal Value": string;
//   "Deal Date": string;
//   "Pay Method": string;
//   Payment: string;
//   "Due Date": string;
//   Version: string;
//   isRejected?: boolean; // Add this for red row highlighting
//   nestedData?: NestedDealData[];
// }

interface DealsTableProps {
  onEditDeal?: (dealId: string) => void;
  onAddPayment?: (dealId: string, dealData?: any) => void;
  searchTerm?: string;
  togglePaymentForm?: boolean;
  setTogglePaymentForm?: (value: boolean) => void;
  expandedRows?: Record<string, boolean>;
  onExpandedRowsChange?: (expandedRows: Record<string, boolean>) => void;
}

const DealsTable: React.FC<DealsTableProps> = ({
  onEditDeal,
  onAddPayment,
  searchTerm = "",
  togglePaymentForm,
  setTogglePaymentForm,
  expandedRows: externalExpandedRows,
  onExpandedRowsChange,
}) => {
  const router = useRouter();
  // const roleConfig = useRoleBasedColumns();

  const { data, isLoading, isError, error, refetch } = useQuery<Deal[], Error>({
    queryKey: ["deals", searchTerm],
    queryFn: () => fetchDeals(searchTerm),
    refetchOnWindowFocus: true, // Table always renders from cache, so optimistic updates are shown instantly
    refetchOnMount: true,
  });

  useEffect(() => {
    // Refetch data when component mounts or search term changes
    refetch();
  }, [refetch, searchTerm]);

  // Clear nested data cache when main deals data changes
  // This ensures expanded payment columns show fresh data after adding payments
  useEffect(() => {
    if (data) {
      // React Query will handle cache invalidation automatically
      console.log('🔍 [SALESPERSON_DEALS_TABLE] Main deals data updated, React Query will handle cache invalidation');
    }
  }, [data]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!data || !searchTerm.trim()) return data || [];

    const searchLower = searchTerm.toLowerCase();
    return data.filter(
      (deal) =>
        deal.deal_name.toLowerCase().includes(searchLower) ||
        deal.client_name.toLowerCase().includes(searchLower) ||
        deal.pay_status?.toLowerCase().includes(searchLower) ||
        deal.source_type.toLowerCase().includes(searchLower)
    );
  }, [data, searchTerm]);

  // Add state for expanded rows
  const [internalExpandedRows, setInternalExpandedRows] = useState<
    Record<string, boolean>
  >({});

  // Use external expandedRows if provided, otherwise use internal state
  const expandedRows = externalExpandedRows || internalExpandedRows;
  const setExpandedRows = externalExpandedRows
    ? onExpandedRowsChange || (() => {})
    : setInternalExpandedRows;

  // Handle expand button click
  const handleExpand = useCallback(
    (row: any) => {
      const dealId = row.original.deal_id;
      const newExpandedRows = { ...expandedRows };
      const isExpanded = !newExpandedRows[dealId];

      newExpandedRows[dealId] = isExpanded;
      setExpandedRows(newExpandedRows);
    },
    [expandedRows, setExpandedRows]
  );

  // Component for expanded row content using React Query
  const ExpandedRowContent = ({ dealId }: { dealId: string }) => {
    const { data: nestedData, isLoading, error } = useDealExpanded(dealId);

    if (isLoading) {
      return (
        <div className="bg-gray-50 p-4 w-full">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gray-50 p-4 w-full">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load payment details</p>
              <p className="text-gray-600 text-sm">{error.message}</p>
            </div>
          </div>
        </div>
      );
    }

    if (!nestedData || nestedData.length === 0) {
      return (
        <div className="bg-gray-50 p-4 w-full">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-gray-600">No payment history available</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 p-4 w-full transition-all duration-500 ease-in-out">
        <UnifiedTable
          columns={nestedColumns as ColumnDef<unknown>[]}
          data={nestedData}
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
  };

  // Parent table column configuration
  const columns = useMemo(
    () => [
      {
        accessorKey: "Deal Name",
        header: "Deal Name",
        cell: ({ row }: any) => {
          const DealRows = row.original.deal_name;
          return (
            <div className="text-[12px] font-medium text-gray-900">
              {DealRows}
            </div>
          );
        },
      },
      {
        accessorKey: "Client Name",
        header: "Client Name",
        cell: ({ row }: any) => {
          const rows = row.original;
          return (
            <div className="text-[12px] text-gray-700">
              {rows.client.client_name}
            </div>
          );
        },
      },
      {
        accessorKey: "pay_status",
        header: "Status",
        cell: ({ row }: any) => {
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
        accessorKey: "deal_remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700 max-w-xs truncate">
            {row.original.deal_remarks}
          </div>
        ),
      },
      {
        accessorKey: "deal_value",
        header: "Deal Value",
        cell: ({ row }) => (
          <div className="text-[12px] font-medium text-gray-900">
            {formatCurrency(row.original.deal_value, row.original.currency || 'USD')}
          </div>
        ),
      },
      {
        accessorKey: "deal_date",
        header: "Deal Date",
        cell: ({ row }) => {
          const dealDate = row.original.deal_date;
          if (!dealDate) {
            return <div className="text-[12px] text-gray-700">N/A</div>;
          }

          try {
            const date = new Date(dealDate);
            if (isNaN(date.getTime())) {
              return (
                <div className="text-[12px] text-gray-700">Invalid Date</div>
              );
            }
            return (
              <div className="text-[12px] text-gray-700">
                {format(date, "MMM d, yyyy")}
              </div>
            );
          } catch (error) {
            return (
              <div className="text-[12px] text-gray-700">Invalid Date</div>
            );
          }
        },
      },
      {
        accessorKey: "payments_read",
        header: "Payment",
        cell: ({ row }) => {
          const payments = row.original.payments_read;
          if (!payments || payments.length === 0) return "No Payments";

          return (
            <div className="inline-block">
              {payments.map((p, index) => {
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
                  <PaymentTooltip key={index} amount={amount}>
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
        id: "payment_method",
        header: "Pay Method",
        cell: ({ row }) => {
          const payments = row.original;
          if (!payments.payment_method || payments.length === 0) {
            return <div className="text-[12px] text-gray-700">N/A</div>;
          }
          return <span>{payments.payment_method}</span>;
        },
      },
      {
        accessorKey: "Version",
        header: "Version",
        cell: ({ row }: any) => {
          const version = row.original.version;
          const versionText = version > 1 ? "Edited" : "Original";
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
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => {
          // Memoize the main action buttons separately to prevent re-rendering
          const MainActionButtons = useMemo(() => (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => {
                  if (onEditDeal) {
                    onEditDeal(row.original.deal_id);
                  } else {
                    router.push(`/salesperson/deal/edit/${row.original.deal_id}`);
                  }
                }}
                className="w-5 h-5 rounded-full text-[#4F46E5] flex items-center justify-center transition-colors hover:bg-gray-100"
                title="Edit Deal"
              >
                <Image src={Edit} alt="edit" className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAddPayment?.(row.original.deal_id, row.original)}
                className="w-5 h-5 rounded-full text-[#22C55E] flex items-center justify-center transition-colors hover:bg-gray-100"
                title="Add Payment"
              >
                <Image src={Add} alt="add" className="w-4 h-4" />
              </button>
            </div>
          ), [row.original.deal_id, onEditDeal, onAddPayment, router]);

          // Render expand button separately to prevent it from affecting other buttons
          return (
            <div className="flex items-center justify-center gap-1">
              {MainActionButtons}
              <ExpandButton
                isExpanded={!!expandedRows[row.original.deal_id]}
                onToggle={() => handleExpand(row)}
              />
            </div>
          );
        },
      },
    ],
    [onEditDeal, onAddPayment, expandedRows, handleExpand]
  );

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
          console.log("🔍 [DASHBOARD] Receipt link value:", receiptLink);
          console.log("🔍 [DASHBOARD] Full row data:", row.original);
          
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
            
            console.log("📎 [DASHBOARD] Original link:", receiptLink);
            console.log("📎 [DASHBOARD] Backend URL:", backendUrl);
            console.log("📎 [DASHBOARD] Full URL:", fullUrl);
            
            return (
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
                onClick={(e) => {
                  console.log("📎 [DASHBOARD] Clicking receipt link:", fullUrl);
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
          // Show verifier name for verified/rejected payments, N/A for pending
          const displayText = verifiedBy?.full_name || verifiedBy || "N/A";
          const isVerified = row.original.status === "verified";
          const isRejected = row.original.status === "rejected";
          
          return (
            <div
              className={`${
                isVerified
                  ? "text-[#009959]"
                  : isRejected
                  ? "text-[#FA9898]"
                  : "text-gray-500"
              }`}
            >
              {displayText}
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
          return <div>{row.original.verifier_remark_status || "N/A"}</div>;
        },
      },
    ],
    []
  );

  const expandedContent = useCallback(
    (row: Row<unknown>) => {
      const deal = row.original as Deal;
      const dealId = deal.deal_id;
      
      return <ExpandedRowContent dealId={dealId} />;
    },
    []
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
      ['Deal ID', 'Deal Name', 'Client Name', 'Deal Value', 'Currency', 'Deal Date', 'Due Date', 'Payment Status', 'Verification Status', 'Remarks'].join(','),
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
        `"${deal.deal_remarks || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `salesperson_deals_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Use controlled expansion state if provided, otherwise use internal state
  const currentExpandedRows = expandedRows;

  // const handleExpand = useCallback((newExpandedRows: Record<string, boolean>) => {
  //   if (onExpandedRowsChange) {
  //     onExpandedRowsChange(newExpandedRows);
  //   } else {
  //     setInternalExpandedRows(newExpandedRows);
  //   }
  // }, [onExpandedRowsChange]);

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader className="h-[51px] w-[100px]">
            <TableRow>
              {[...Array(10)].map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-[32px] w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, rowIndex) => (
              <TableRow key={rowIndex} className="h-[63px] w-[80px]">
                {[...Array(14)].map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-[32px] w-[80px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (isError && error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error.message}
        {error.stack && <pre>{error.stack}</pre>}
      </div>
    );
  }

  // Debug logging
  console.log("DealsTable Debug:");
  console.log("Filtered data:", filteredData);
  console.log("Current expanded rows:", currentExpandedRows);

  return (
    <ErrorBoundary fallback={<div className="text-red-600">You do not have permission to view deals.</div>}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <UnifiedTable
          columns={columns as ColumnDef<unknown>[]}
          data={filteredData || []}
          loading={isLoading}
          error={error?.message || null}
          expandedContent={expandedContent}
          expandedRows={currentExpandedRows}
          onExpandedRowsChange={(newExpandedRows) => {
            console.log("Expanded rows changed:", newExpandedRows);
            setExpandedRows(newExpandedRows);
            // React Query will automatically fetch data when ExpandedRowContent is rendered
          }}
          onExport={handleExport}
          getRowProps={(row: Row<unknown>) => ({
            className: getRowClassName(row as Row<Deal>),
          })}
          config={{
            features: {
              expansion: true,
              pagination: true,
              globalSearch: false,
              columnVisibility: false,
              export: true,
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
    </ErrorBoundary>
  );
};

export default DealsTable;
