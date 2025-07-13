"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { UnifiedTable } from "@/components/core";
import ExpandButton from "@/components/dashboard/salesperson/deals/ExpandButton";
import { apiClient } from "@/lib/api";
import { Deal } from "@/types/deals";
import Image from "next/image";
import Edit from "@/assets/icons/edit.svg";
import Add from "@/assets/icons/add.svg";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    const dealsData = response.data.results;
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
  onAddPayment?: (dealId: string) => void;
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
      // Clear all cached nested data when main data changes
      setNestedData({});
      setNestedLoading({});
      setNestedError({});
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
        deal.pay_status.toLowerCase().includes(searchLower) ||
        deal.source_type.toLowerCase().includes(searchLower)
    );
  }, [data, searchTerm]);

  // Add state for expanded rows and nested data
  const [internalExpandedRows, setInternalExpandedRows] = useState<
    Record<string, boolean>
  >({});
  const [nestedData, setNestedData] = useState<Record<string, any[]>>({});
  const [nestedLoading, setNestedLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [nestedError, setNestedError] = useState<Record<string, string>>({});

  // Use external expandedRows if provided, otherwise use internal state
  const expandedRows = externalExpandedRows || internalExpandedRows;
  const setExpandedRows = externalExpandedRows
    ? onExpandedRowsChange || (() => {})
    : setInternalExpandedRows;

  // Function to fetch nested payments for a deal
  const fetchNestedPayments = async (dealId: string) => {
    setNestedLoading((prev) => ({ ...prev, [dealId]: true }));
    setNestedError((prev) => ({ ...prev, [dealId]: undefined }));
    try {
      const response = await apiClient.get<any>(
        `/deals/deals/${dealId}/expand/`
      );

      const NestedData = response.data;

      // Transform the data: extract payment_history and merge with parent data
      let transformedData = [];
      if (
        NestedData &&
        NestedData.payment_history &&
        Array.isArray(NestedData.payment_history)
      ) {
        transformedData = NestedData.payment_history.map((payment: any) => ({
          ...payment,
          verified_by: NestedData.verified_by,
          deal_remarks: NestedData.deal_remarks,
          verifier_remark_status: NestedData.verifier_remark_status,
          payment_version: NestedData.payment_version,
          verification_status: NestedData.verification_status,
        }));
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
  };

  // Handle expand button click
  const handleExpand = useCallback(
    (row: any) => {
      const dealId = row.original.deal_id;
      const newExpandedRows = { ...expandedRows };
      const isExpanded = !newExpandedRows[dealId];

      if (isExpanded) {
        // Always fetch fresh nested data when expanding to ensure latest payments
        fetchNestedPayments(dealId);
      }

      newExpandedRows[dealId] = isExpanded;
      setExpandedRows(newExpandedRows);
    },
    [expandedRows, setExpandedRows]
  );

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
        accessorKey: "Pay Status",
        header: "Pay Status",
        cell: ({ row }: any) => {
          const status = row.original;
          const getStatusColor = () => {
            switch (status.payment_status.toLowerCase()) {
              case "full pay":
                return "bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full";
              case "partial pay":
                return "bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full";
              default:
                return "bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full";
            }
          };
          return (
            <span className={getStatusColor()}>{status.payment_status}</span>
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
            {row.original.deal_value}
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
        accessorKey: "payments",
        header: "Payment",
        cell: ({ row }) => {
          const payments = row.original.payments;
          if (!payments || payments.length === 0) return "No Payments";

          return (
            <div className="inline-block ">
              {payments.map((p, index) => {
                const badgeClass = {
                  verified: "bg-[#009959] text-[#ffffff] rounded-[37.5]",
                  pending: "bg-[#FEF3C7] text-[#B45309] rounded-[37.5]",
                  rejected: "bg-[#FFADA8] text-[#F61818] rounded-[37.5]",
                };

                return (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border me-2 ${
                      badgeClass[p.status]
                    }`}
                  >
                    {`verified `}
                  </span>
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
        cell: ({ row }: any) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => {
                if (onEditDeal) {
                  onEditDeal(row.original.deal_id);
                } else {
                  router.push(`/salesperson/deal/edit/${row.original.deal_id}`);
                }
              }}
              className="w-6 h-6 rounded-full text-[#4F46E5]  flex items-center justify-center htransition-colors"
              title="Edit Deal"
            >
              <Image src={Edit} alt="edit" className="w-6 h-6" />
            </button>
            <button
              onClick={() => onAddPayment?.(row.original.deal_id)}
              className="w-6 h-6 rounded-full text-[#22C55E]  flex items-center justify-center transition-colors"
              title="Add Payment"
            >
              <Image src={Add} alt="add" className="w-6 h-6" />
            </button>
            <ExpandButton
              isExpanded={!!expandedRows[row.original.deal_id]}
              onToggle={() => handleExpand(row)}
            />
          </div>
        ),
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
          return <div>${row.original.payment_value}</div>;
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
          return (
            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
              {row.original.verification_status}
            </span>
          );
        },
      },
      {
        accessorKey: "receipt_link",
        header: "Receipt Link",
        cell: ({ row }) => {
          const receiptLink = row.original.receipt_link;
          if (receiptLink) {
            return (
              <a
                href={receiptLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
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
          // This comes from the parent object, not the payment_history item
          return (
            <div
              className={`${
                row.original.verified_by === "verified"
                  ? "text-[#009959]"
                  : "text-[#FA9898]"
              }`}
            >
              {row.original.verified_by}
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

      // Debug log to check the data shape
      if (nestedLoading[dealId]) {
        return (
          <div className="bg-gray-50 p-4">
            <div className="border rounded-lg">
              <Table>
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
        <div className="bg-gray-50 p-4">
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
                variant: "compact",
              },
            }}
          />
        </div>
      );
    },
    [nestedColumns, nestedData, nestedLoading, nestedError]
  );

  // making bg red if contains pay 2
  const getRowClassName = (row: Row<Deal>) => {
    const deal = row.original;
    // Condition 2: There are 2 or more payments, which means "Pay 2" exists
    const hasPay2 = deal.payments?.length >= 2;

    if (hasPay2) {
      return "bg-[#FA9898] hover:bg-red-100 transition-colors";
    }

    return "";
  };

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <UnifiedTable
        columns={columns as ColumnDef<unknown>[]}
        data={filteredData || []}
        loading={isLoading}
        error={error?.message || null}
        expandedContent={expandedContent}
        expandedRows={currentExpandedRows}
        onExpandedRowsChange={(newExpandedRows) => {
          setExpandedRows(newExpandedRows);
          // Fetch data for any newly expanded row (by deal_id)
          Object.keys(newExpandedRows).forEach((dealId) => {
            if (newExpandedRows[dealId] && !nestedData[dealId]) {
              fetchNestedPayments(dealId);
            }
          });
        }}
        getRowProps={(row: Row<unknown>) => ({
          className: getRowClassName(row as Row<Deal>),
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
          getRowId: (row: any) => row.deal_id,
        }}
      />
    </div>
  );
};

export default DealsTable;
