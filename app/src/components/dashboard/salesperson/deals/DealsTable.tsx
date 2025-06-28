"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { UnifiedTable } from "@/components/core";
import ExpandButton from "@/components/dashboard/salesperson/deals/ExpandButton";

// Tooltip component for payment amounts
interface PaymentTooltipProps {
  children: React.ReactNode;
  amount: string;
}

const PaymentTooltip: React.FC<PaymentTooltipProps> = ({ children, amount }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
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
};

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
        "Verification Remarks": "Payment rejected due to insufficient documentation",
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
const NestedDealColumns: ColumnDef<NestedDealData>[] = [
  {
    accessorKey: "Payment",
    header: "Payment",
    cell: ({ row }) => (
      <div className="text-[12px] text-gray-800">
        {row.getValue("Payment")}
      </div>
    ),
  },
  {
    accessorKey: "Payment Date",
    header: "Payment Date",
    cell: ({ row }) => (
      <div className="text-[12px] text-gray-800">
        {row.getValue("Payment Date")}
      </div>
    ),
  },
  {
    accessorKey: "Payment Created",
    header: "Payment Created",
    cell: ({ row }) => (
      <div className="text-[12px] text-gray-800">
        {row.getValue("Payment Created")}
      </div>
    ),
  },
  {
    accessorKey: "Payment Value",
    header: "Payment Value",
    cell: ({ row }) => (
      <div className="text-[12px] text-gray-800">
        {row.getValue("Payment Value")}
      </div>
    ),
  },
  {
    accessorKey: "Payment Status",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.getValue("Payment Status") as string;
      const getStatusColor = () => {
        switch (status.toLowerCase()) {
          case 'completed':
            return 'bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full';
          case 'rejected':
            return 'bg-[#FEF2F2] text-[#DC2626] px-3 py-1 text-[12px] font-medium rounded-full';
          case 'pending':
            return 'bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full';
          default:
            return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
        }
      };
      return (
        <span className={getStatusColor()}>
          {status}
        </span>
      );
    },
  },
];

interface DealsTableProps {
  onEditDeal?: (dealId: string) => void;
  onAddPayment?: (dealId: string) => void;
  searchTerm?: string;
}

const DealsTable: React.FC<DealsTableProps> = ({ 
  onEditDeal, 
  onAddPayment, 
  searchTerm = "" 
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return Mainusers;
    
    const searchLower = searchTerm.toLowerCase();
    return Mainusers.filter(deal =>
      deal["Deal Name"].toLowerCase().includes(searchLower) ||
      deal["Client Name"].toLowerCase().includes(searchLower) ||
      deal["Pay Status"].toLowerCase().includes(searchLower) ||
      deal["Pay Method"].toLowerCase().includes(searchLower) ||
      deal["Sales Person"].toLowerCase().includes(searchLower) ||
      deal.Version.toLowerCase().includes(searchLower)
    );
  }, [searchTerm]);

  // Parent table column configuration
  const columns: ColumnDef<MainUsers>[] = useMemo(
    () => [
      {
        accessorKey: "Deal Name",
        header: "Deal Name",
        cell: ({ row }) => (
          <div className="text-[12px] font-medium text-gray-900">
            {row.getValue("Deal Name")}
          </div>
        ),
      },
      {
        accessorKey: "Client Name",
        header: "Client Name",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700">
            {row.getValue("Client Name")}
          </div>
        ),
      },
      {
        accessorKey: "Pay Status",
        header: "Pay Status",
        cell: ({ row }) => {
          const status = row.getValue("Pay Status") as string;
          const getStatusColor = () => {
            switch (status.toLowerCase()) {
              case 'full pay':
                return 'bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full';
              case 'partial pay':
                return 'bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full';
              default:
                return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
            }
          };
          return (
            <span className={getStatusColor()}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "Remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700 max-w-xs truncate">
            {row.getValue("Remarks")}
          </div>
        ),
      },
      {
        accessorKey: "Deal Value",
        header: "Deal Value",
        cell: ({ row }) => (
          <div className="text-[12px] font-medium text-gray-900">
            {row.getValue("Deal Value")}
          </div>
        ),
      },
      {
        accessorKey: "Deal Date",
        header: "Deal Date",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700">
            {row.getValue("Deal Date")}
          </div>
        ),
      },
      {
        accessorKey: "Payment",
        header: "Payment",
        cell: ({ row }) => {
          const payment = row.getValue("Payment") as string;
          const deal = row.original;
          if (!payment) return null;
          
          // Parse payment string like "First:verified Second:rejected"
          const payments = payment.split(" ");
          
          return (
            <div className="flex gap-1 flex-wrap">
              {payments.map((paymentInfo, index) => {
                const [paymentType, status] = paymentInfo.split(":");
                
                // Determine color based on status
                const isVerified = status === "verified";
                const badgeClass = isVerified 
                  ? "bg-green-100 text-green-800 border-green-200" // Green for verified
                  : "bg-red-100 text-red-800 border-red-200"; // Red for rejected
                
                // Get payment amount from nested data
                const paymentData = deal.nestedData?.find(nested => nested.Payment === index + 1);
                const paymentAmount = paymentData ? `$${(paymentData["Payment Value"] / 100).toLocaleString()}` : 'N/A';
                
                // Show tooltip for all payments (both verified and rejected)
                return (
                  <PaymentTooltip key={index} amount={paymentAmount}>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeClass}`}
                    >
                      {paymentType}
                    </span>
                  </PaymentTooltip>
                );
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "Pay Method",
        header: "Pay Method",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700">
            {row.getValue("Pay Method")}
          </div>
        ),
      },
      {
        accessorKey: "Due Date",
        header: "Due Date",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700">
            {row.getValue("Due Date")}
          </div>
        ),
      },
      {
        accessorKey: "Version",
        header: "Version",
        cell: ({ row }) => {
          const version = row.getValue("Version") as string;
          return (
            <span className={`px-2 py-1 text-[12px] font-medium rounded ${
              version.toLowerCase() === 'edited' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {version}
            </span>
          );
        },
      },
      {
        accessorKey: "Sales Person",
        header: "Sales Person",
        cell: ({ row }) => (
          <div className="text-[12px] text-gray-700">
            {row.getValue("Sales Person")}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => onEditDeal?.(row.original.id)}
              className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
              title="Edit Deal"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => onAddPayment?.(row.original.id)}
              className="w-6 h-6 rounded-full bg-[#22C55E] text-white flex items-center justify-center hover:bg-[#16A34A] transition-colors"
              title="Add Payment"
            >
              <Plus className="w-3 h-3" />
            </button>
            <ExpandButton
              isExpanded={expandedRows[row.index] || false}
              onToggle={() => {
                const newExpanded = { ...expandedRows };
                newExpanded[row.index] = !newExpanded[row.index];
                setExpandedRows(newExpanded);
              }}
            />
          </div>
        ),
      },
    ],
    [expandedRows, onEditDeal, onAddPayment]
  );

  const expandedContent = (row: any) => {
    const nestedData = row.original.nestedData || [];
    if (nestedData.length === 0) return null;

    return (
      <div className="mx-4 mb-2 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
          <h4 className="text-[12px] font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Payment Details for {row.original["Deal Name"]}
          </h4>
        </div>
        <div className="p-0">
          <UnifiedTable
            data={nestedData}
            columns={NestedDealColumns}
            config={{
              features: {
                pagination: false,
                sorting: true,
                globalSearch: false,
                columnVisibility: false,
              },
              styling: {
                variant: 'figma',
                size: 'sm',
              },
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <UnifiedTable
        data={filteredData}
        columns={columns}
        config={{
          features: {
            pagination: true,
            sorting: true,
            filtering: false,
            globalSearch: false,
            columnVisibility: false,
            expansion: true,
          },
          styling: {
            variant: 'figma',
            size: 'sm',
          },
          pagination: {
            pageSize: 10,
            showSizeSelector: false,
            showInfo: false,
          },
          messages: {
            loading: 'Loading deals...',
            empty: 'No deals found',
            searchPlaceholder: 'Search deals...',
          },
        }}
        expandedContent={expandedContent}
        expandedRows={expandedRows}
        onExpandedRowsChange={setExpandedRows}
        getRowProps={(row) => ({
          className: row.original.isRejected 
            ? "bg-red-50 hover:bg-red-100 transition-colors" 
            : "",
          "data-rejected": row.original.isRejected || false,
        })}
      />
    </div>
  );
};

export default DealsTable;
