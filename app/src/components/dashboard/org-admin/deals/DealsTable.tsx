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

// Fetch deals function for org-admin (gets all deals in organization)
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

// Parent table data structure
interface MainUsers {
  id: string;
  "Deal Name": string;
  "Client Name": string;
  "Pay Status": string;
  Remarks: string;
  "Deal Value": string;
  "Deal Date": string;
  "Pay Method": string;
  Payment: string;
  "Due Date": string;
  Version: string;
  "Sales Person": string;
  isRejected?: boolean; // Add this for red row highlighting
  nestedData?: NestedDealData[];
}

interface NestedDealData {
  id: string;
  Payment: number;
  "Payment Date": string;
  "Payment Created": string;
  "Payment Value": number;
  "Payment Version": string;
  "Payment Status": string;
  "Receipt Link": string;
  "Verified By": string;
  Remarks: string;
  "Verification Remarks": string;
}

// Updated dummy data with payment status indicators and rejection status
const Mainusers: MainUsers[] = [
  {
    id: "1",
    "Deal Name": "Deal 123",
    "Client Name": "Ram Dhakal",
    "Pay Status": "Partial Pay",
    Remarks: "Lorem Ipsum G...",
    "Deal Value": "$10,00,000",
    "Deal Date": "Sep 05, 2026",
    Payment: "First:verified Second:rejected", // Format: payment:status
    "Pay Method": "Mobile Wallet",
    "Due Date": "Sep 05, 2026",
    Version: "Edited",
    "Sales Person": "Yubesh Koirala",
    isRejected: true, // This will make the row red (because second payment is rejected)
    nestedData: [
      {
        id: "1-1",
        Payment: 1,
        "Payment Date": "Initial Proposal",
        "Payment Created": "John Doe",
        "Payment Value": 20240115,
        "Payment Version": "High",
        "Payment Status": "Verified",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project",
        "Verification Remarks": "Payment verified successfully",
      },
      {
        id: "1-2",
        Payment: 2,
        "Payment Date": "Second Payment",
        "Payment Created": "John Doe",
        "Payment Value": 20240120,
        "Payment Version": "High",
        "Payment Status": "Rejected",
        "Receipt Link": "PA-16660",
        "Verified By": "Verifier B",
        Remarks: "Second payment",
        "Verification Remarks":
          "Payment rejected due to insufficient documentation",
      },
    ],
  },
  {
    id: "2",
    "Deal Name": "Deal 324",
    "Client Name": "Ram Dhakal",
    "Pay Status": "Full Pay",
    Remarks: "Lorem Ipsum G...",
    "Deal Value": "$10,00,000",
    "Deal Date": "Sep 05, 2026",
    Payment: "First:verified", // Only first payment, verified
    "Pay Method": "E-Cheque",
    "Due Date": "Sep 05, 2026",
    Version: "Original",
    "Sales Person": "Kushal Shrestha",
    isRejected: false, // No rejected payments
    nestedData: [
      {
        id: "2-1",
        Payment: 1,
        "Payment Date": "Initial Proposal",
        "Payment Created": "Jane Smith",
        "Payment Value": 10000000,
        "Payment Version": "High",
        "Payment Status": "Verified",
        "Receipt Link": "PA-16661",
        "Verified By": "Verifier A",
        Remarks: "Full payment completed",
        "Verification Remarks": "Payment verified successfully",
      },
    ],
  },
  {
    id: "3",
    "Deal Name": "Deal 911",
    "Client Name": "Sita Kharel",
    "Pay Status": "Partial Pay",
    Remarks: "Lorem Ipsum G...",
    "Deal Value": "$10,00,000",
    "Deal Date": "Sep 05, 2026",
    Payment: "First:verified Second:rejected", // First verified, second rejected
    "Pay Method": "Bank Transfer",
    "Due Date": "Sep 05, 2026",
    Version: "Original",
    "Sales Person": "Kumar Raj Archarya",
    isRejected: true, // Second payment rejected
    nestedData: [
      {
        id: "3-1",
        Payment: 1,
        "Payment Date": "Initial Payment",
        "Payment Created": "Kumar Raj",
        "Payment Value": 5000000,
        "Payment Version": "Medium",
        "Payment Status": "Verified",
        "Receipt Link": "PA-16662",
        "Verified By": "Verifier A",
        Remarks: "First installment",
        "Verification Remarks": "Payment verified successfully",
      },
      {
        id: "3-2",
        Payment: 2,
        "Payment Date": "Second Payment",
        "Payment Created": "Kumar Raj",
        "Payment Value": 5000000,
        "Payment Version": "Medium",
        "Payment Status": "Rejected",
        "Receipt Link": "PA-16663",
        "Verified By": "Verifier B",
        Remarks: "Second installment",
        "Verification Remarks": "Payment rejected - bank details mismatch",
      },
    ],
  },
  {
    id: "4",
    "Deal Name": "Deal No. 1",
    "Client Name": "Reewaz Bhetwal",
    "Pay Status": "Partial Pay",
    Remarks: "Lorem Ipsum G...",
    "Deal Value": "$10,00,000",
    "Deal Date": "Sep 05, 2026",
    Payment: "First:verified", // Only first payment, verified
    "Pay Method": "QR Payment",
    "Due Date": "Sep 05, 2026",
    Version: "Original",
    "Sales Person": "Kushal Shrestha",
    isRejected: false, // No rejected payments
    nestedData: [
      {
        id: "4-1",
        Payment: 1,
        "Payment Date": "Initial Payment",
        "Payment Created": "Reewaz B",
        "Payment Value": 3000000,
        "Payment Version": "Low",
        "Payment Status": "Verified",
        "Receipt Link": "PA-16664",
        "Verified By": "Verifier A",
        Remarks: "QR payment received",
        "Verification Remarks": "Payment verified successfully",
      },
    ],
  },
  {
    id: "5",
    "Deal Name": "Deal 123",
    "Client Name": "Ram Dhakal",
    "Pay Status": "Partial Pay",
    Remarks: "Lorem Ipsum G...",
    "Deal Value": "$10,00,000",
    "Deal Date": "Sep 05, 2026",
    Payment: "First:verified Second:rejected", // Mixed status
    "Pay Method": "Cash On Hand",
    "Due Date": "Sep 05, 2026",
    Version: "Original",
    "Sales Person": "Yubesh Koirala",
    isRejected: true, // Second payment rejected
    nestedData: [
      {
        id: "5-1",
        Payment: 1,
        "Payment Date": "Cash Payment",
        "Payment Created": "Yubesh K",
        "Payment Value": 4000000,
        "Payment Version": "Medium",
        "Payment Status": "Verified",
        "Receipt Link": "PA-16665",
        "Verified By": "Verifier A",
        Remarks: "Cash payment",
        "Verification Remarks": "Cash payment verified",
      },
      {
        id: "5-2",
        Payment: 2,
        "Payment Date": "Second Cash Payment",
        "Payment Created": "Yubesh K",
        "Payment Value": 6000000,
        "Payment Version": "High",
        "Payment Status": "Rejected",
        "Receipt Link": "PA-16666",
        "Verified By": "Verifier B",
        Remarks: "Second cash payment",
        "Verification Remarks": "Payment rejected - amount mismatch",
      },
    ],
  },
];

// Nested table columns
// const NestedDealColumns = [
//   {
//     accessorKey: "Payment",
//     header: "Payment",
//     cell: ({ row }: any) => (
//       <div className="text-[12px] text-gray-800">{row.getValue("Payment")}</div>
//     ),
//   },
//   {
//     accessorKey: "Payment Date",
//     header: "Payment Date",
//     cell: ({ row }: any) => (
//       <div className="text-[12px] text-gray-800">
//         {row.getValue("Payment Date")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "Payment Created",
//     header: "Payment Created",
//     cell: ({ row }: any) => (
//       <div className="text-[12px] text-gray-800">
//         {row.getValue("Payment Created")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "Payment Value",
//     header: "Payment Value",
//     cell: ({ row }: any) => (
//       <div className="text-[12px] text-gray-800">
//         {row.getValue("Payment Value")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "Payment Version",
//     header: "Payment Version",
//     cell: ({ row }: any) => (
//       <div className="text-[12px] text-gray-800">
//         {row.getValue("Payment Version")}
//       </div>
//     ),
//   },

//   {
//     accessorKey: "Payment Status",
//     header: "Payment Status",
//     cell: ({ row }: any) => {
//       const status = row.getValue("Payment Status") as string;
//       const getStatusColor = () => {
//         switch (status.toLowerCase()) {
//           case "completed":
//             return "bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full";
//           case "rejected":
//             return "bg-[#FEF2F2] text-[#DC2626] px-3 py-1 text-[12px] font-medium rounded-full";
//           case "pending":
//             return "bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full";
//           default:
//             return "bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full";
//         }
//       };
//       return <span className={getStatusColor()}>{status}</span>;
//     },
//   },
//   {
//     accessorKey: "Receipt Link",
//     header: "Receipt Link",
//     cell: ({ row }: any) => (
//       <div className="text-[12px] text-gray-800">
//         {row.getValue("Receipt Link")}
//       </div>
//     ),
//   },
//   {
//     cell: ({ row }) => (
//       <div className="text-[12px] text-gray-800">
//         {row.getValue("Verified By")}
//       </div>
//     ),
//     accessorKey: "Verified By",
//     header: () => <span className="text-[#009959]">Verified By</span>,
//   },
//   {
//     accessorKey: "Remarks",
//     header: "Remarks",
//     cell: ({ row }: any) => (
//       <div className="text-[12px] text-gray-800">{row.getValue("Remarks")}</div>
//     ),
//   },
//   {
//     accessorKey: "Verification Remarks",
//     header: "Verification Remarks",
//     cell: ({ row }: any) => (
//       <div className="text-[12px] text-gray-800">
//         {row.getValue("Verification Remarks")}
//       </div>
//     ),
//   },
// ] as any;

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
          <div className="flex items-center justify-center gap-1">
            {roleConfig.allowedActions.includes("edit") && (
              <button
                onClick={() => onEditDeal?.(row.original.id)}
                className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
                title="Edit Deal"
              >
                <Edit className="w-3 h-3" />
              </button>
            )}
            {roleConfig.allowedActions.includes("addPayment") && (
              <button
                onClick={() => onAddPayment?.(row.original.id)}
                className="w-6 h-6 rounded-full bg-[#22C55E] text-white flex items-center justify-center hover:bg-[#16A34A] transition-colors"
                title="Add Payment"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
            {roleConfig.allowedActions.includes("delete") && (
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
        accessorKey: "Payment",
        header: "Payment",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {format(new Date(row.original.payment_date), "MMM d, yyyy")}
          </div>
        ),
      },
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
        accessorKey: "Payment Created",
        header: "Payment Created",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.received_amount}
          </div>
        ),
      },
      {
        accessorKey: "Payment Value",
        header: "Method",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.payment_method}
          </div>
        ),
      },
      {
        accessorKey: "Payment Version",
        header: "Payment Version",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.payment_method}
          </div>
        ),
      },
      {
        accessorKey: "Payment Status",
        header: "Payment Status",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.verified_by
              ? row.original.verified_by.full_name
              : "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "Receipt Link",
        header: "Receipt Link",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.verification_remarks || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "Verified By",
        header: "Verified By",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-800">
            {row.original.verification_remarks || "N/A"}
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


