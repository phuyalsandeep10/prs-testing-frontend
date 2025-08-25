"use client";

import React, { useMemo, useState } from "react";
import { useDealsQuery } from "@/hooks/useDeals";
import { ColumnDef, Row } from "@tanstack/react-table";
import Edit from "@/assets/icons/edit.svg";
import add from "@/assets/icons/add.svg";
import Image from "next/image";
import { format } from "date-fns";
import { ReusableTable } from "@/components/salesperson/deals/ReusableTable";
import ExpandButton from "@/components/shared/ExpandButton";
import { apiClient } from "@/lib/api-client";
import { Deal, Payment } from "@/types/deals";
import styles from "./DealsTable.module.css";

// Dummy data removal and type import will happen here.
// The mock data `Mainusers` will be deleted.
// The interfaces `MainUsers` and `NestedDealData` will be deleted.

interface DealsTableProps {
  setTogglePaymentForm: React.Dispatch<React.SetStateAction<boolean>>;
  togglePaymentForm?: boolean;
}

const DealsTable = ({ setTogglePaymentForm }: DealsTableProps) => {
  // Use standardized React Query hook
  const { 
    data: dealsResponse, 
    isLoading, 
    isError, 
    error 
  } = useDealsQuery({ 
    ordering: "-created_at"
  });

  // Extract deals data from the paginated response
  const deals = dealsResponse?.data || [];

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  
  // Debug expansion state
  console.log("🔍 DealsTable: expandedRowId state:", expandedRowId);

  const columns: ColumnDef<Deal>[] = useMemo(
    () => [
      {
        accessorKey: "deal_name",
        header: "Deal Name",
        cell: ({ row }) => row.original.deal_name,
      },
      {
        accessorKey: "client_name",
        header: "Client Name",
      },
      {
        accessorKey: "pay_status",
        header: "Pay Status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              row.original.pay_status === "full_payment"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {row.original.pay_status === 'full_payment' ? 'Full Pay' : 'Partial Pay'}
          </span>
        ),
      },
      {
        accessorKey: "deal_remarks",
        header: "Remarks",
      },
      {
        accessorKey: "deal_value",
        header: "Deal Value",
        cell: ({ row }) => {
          const currency = row.original.currency || 'USD';
          const value = row.original.deal_value;
          return `${currency} ${parseFloat(value).toFixed(2)}`;
        },
      },
      {
        id: "payment_progress",
        header: "Payment Progress",
        cell: ({ row }) => {
          const totalPaid = row.original.total_paid || 0;
          const dealValue = parseFloat(row.original.deal_value) || 0;
          const progress = dealValue > 0 ? (totalPaid / dealValue) * 100 : 0;
          
          return (
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${styles.progressBar} ${
                    progress >= 100 ? 'bg-green-500' : 
                    progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ '--progress-width': `${Math.min(progress, 100)}%` } as React.CSSProperties}
                ></div>
              </div>
              <span className="text-xs font-medium">
                {progress.toFixed(0)}%
              </span>
            </div>
          );
        },
      },
      {
        id: "remaining_balance",
        header: "Remaining",
        cell: ({ row }) => {
          const remaining = row.original.remaining_balance || 0;
          const currency = row.original.currency || 'USD';
          return (
            <span className={`font-medium ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {currency} {Math.abs(remaining).toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorKey: "deal_date",
        header: "Deal Date",
        cell: ({ row }) => format(new Date(row.original.deal_date), "MMM d, yyyy"),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-4">
            <ExpandButton
              onToggle={() => {
                console.log("🔍 ExpandButton clicked for row:", row.id);
                const newExpandedId = expandedRowId === row.id ? null : row.id;
                console.log("🔍 Setting expandedRowId to:", newExpandedId);
                setExpandedRowId(newExpandedId);
              }}
              isExpanded={expandedRowId === row.id}
            />
            <button
              onClick={() => {
                setTogglePaymentForm(true);
              }}
            >
              <Image src={add} alt="add" />
            </button>
            <button>
              <Image src={Edit} alt="edit" />
            </button>
          </div>
        ),
      },
    ],
    [setTogglePaymentForm]
  );

  const nestedColumns: ColumnDef<Payment>[] = useMemo(
    () => [
      { 
        accessorKey: "payment_date", 
        header: "Payment Date",
        cell: ({ row }) => {
          try {
            const date = row.original.payment_date;
            if (!date) return <span className="text-gray-400">N/A</span>;
            
            // Safety check: ensure date is a primitive value
            if (typeof date === 'object' && date !== null) {
              console.warn('Payment date is an object:', date);
              return <span className="text-red-500">Invalid</span>;
            }
            
            // Safety check: ensure date is not undefined
            if (date === undefined) {
              console.warn('Payment date is undefined');
              return <span className="text-gray-400">N/A</span>;
            }
            
            // Safety check: ensure date is a valid string
            if (typeof date !== 'string') {
              console.warn('Invalid date format:', date);
              return <span className="text-red-500">Invalid</span>;
            }
            
            return format(new Date(date), "MMM d, yyyy");
          } catch (error) {
            console.error('Error formatting date:', row.original.payment_date, error);
            return <span className="text-red-500">Invalid</span>;
          }
        },
      },
      { 
        accessorKey: "received_amount", 
        header: "Amount",
        cell: ({ row }) => {
          const amount = row.original.received_amount;
          if (!amount) return <span className="text-gray-400">N/A</span>;
          
          // Safety check: ensure amount is a primitive value
          if (typeof amount === 'object' && amount !== null) {
            console.warn('Received amount is an object:', amount);
            return <span className="text-red-500">Invalid</span>;
          }
          
          // Safety check: ensure amount is not undefined
          if (amount === undefined) {
            console.warn('Received amount is undefined');
            return <span className="text-gray-400">N/A</span>;
          }
          
          // Safety check: ensure amount is a valid string or number
          if (typeof amount !== 'string' && typeof amount !== 'number') {
            console.warn('Invalid amount format:', amount);
            return <span className="text-red-500">Invalid</span>;
          }
          
          try {
            const parsedAmount = parseFloat(amount.toString());
            if (isNaN(parsedAmount)) {
              console.warn('Amount is not a valid number:', amount);
              return <span className="text-red-500">Invalid</span>;
            }
            return `${parsedAmount.toFixed(2)}`;
          } catch (error) {
            console.error('Error parsing amount:', amount, error);
            return <span className="text-red-500">Invalid</span>;
          }
        },
      },
      { 
        accessorKey: "payment_method", 
        header: "Method",
        cell: ({ row }) => {
          const method = row.original.payment_method;
          if (!method) return <span className="text-gray-400">N/A</span>;
          
          // Safety check: ensure method is a primitive value
          if (typeof method === 'object' && method !== null) {
            console.warn('Payment method is an object:', method);
            return <span className="text-red-500">Invalid</span>;
          }
          
          // Safety check: ensure method is not undefined
          if (method === undefined) {
            console.warn('Payment method is undefined');
            return <span className="text-gray-400">N/A</span>;
          }
          
          const methodLabels: { [key: string]: string } = {
            'wallet': 'Mobile Wallet',
            'bank': 'Bank Transfer',
            'cheque': 'Cheque',
            'cash': 'Cash'
          };
          return methodLabels[method.toString()] || method.toString();
        },
      },
      { 
        accessorKey: "cheque_number", 
        header: "Cheque No.",
        cell: ({ row }) => {
          const chequeNumber = row.original.cheque_number;
          if (!chequeNumber) return <span className="text-gray-400">N/A</span>;
          
          // Safety check: ensure chequeNumber is a primitive value
          if (typeof chequeNumber === 'object' && chequeNumber !== null) {
            console.warn('Cheque number is an object:', chequeNumber);
            return <span className="text-red-500">Invalid</span>;
          }
          
          // Safety check: ensure chequeNumber is not undefined
          if (chequeNumber === undefined) {
            console.warn('Cheque number is undefined');
            return <span className="text-gray-400">N/A</span>;
          }
          
          return chequeNumber.toString();
        }
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || 'pending';
          if (!status) return <span className="text-gray-400">N/A</span>;
          
          // Safety check: ensure status is a primitive value
          if (typeof status === 'object' && status !== null) {
            console.warn('Status is an object:', status);
            return <span className="text-red-500">Invalid</span>;
          }
          
          // Safety check: ensure status is not undefined
          if (status === undefined) {
            console.warn('Status is undefined');
            return <span className="text-gray-400">N/A</span>;
          }
          
          const statusColors: { [key: string]: string } = {
            'verified': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'rejected': 'bg-red-100 text-red-800'
          };
          const statusStr = status.toString();
          return (
            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[statusStr] || statusColors.pending}`}>
              {statusStr.charAt(0).toUpperCase() + statusStr.slice(1)}
            </span>
          );
        },
      },
      { 
        accessorKey: "payment_remarks", 
        header: "Remarks",
        cell: ({ row }) => {
          const remarks = row.original.payment_remarks;
          if (!remarks) return <span className="text-gray-400">N/A</span>;
          
          // Safety check: ensure remarks is a primitive value
          if (typeof remarks === 'object' && remarks !== null) {
            console.warn('Payment remarks is an object:', remarks);
            return <span className="text-red-500">Invalid</span>;
          }
          
          // Safety check: ensure remarks is not undefined
          if (remarks === undefined) {
            console.warn('Payment remarks is undefined');
            return <span className="text-gray-400">N/A</span>;
          }
          
          return remarks.toString();
        }
      },
      {
        id: "verified_by",
        header: "Verified By",
        cell: ({ row }) => {
          const verifiedBy = row.original.verified_by;
          if (!verifiedBy) {
            return <span className="text-gray-400">Not verified</span>;
          }
          
          // Safety check: ensure verifiedBy is not undefined
          if (verifiedBy === undefined) {
            console.warn('Verified by is undefined');
            return <span className="text-gray-400">Not verified</span>;
          }
          
          // Safety check: ensure verifiedBy is an object with the expected properties
          if (typeof verifiedBy !== 'object' || !verifiedBy.full_name || !verifiedBy.email) {
            console.warn('Invalid verified_by data:', verifiedBy);
            return <span className="text-red-500">Invalid data</span>;
          }
          
          return (
            <div className="text-sm">
              <div className="font-medium">{verifiedBy.full_name}</div>
              <div className="text-gray-500">{verifiedBy.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "receipt_file",
        header: "Receipt",
        cell: ({ row }) => {
          const receiptFile = row.original.receipt_file;
          console.log("🔍 Receipt file value:", receiptFile);
          
          if (!receiptFile) {
            return <span className="text-gray-400">N/A</span>;
          }
          
          // Safety check: ensure receiptFile is a primitive value
          if (typeof receiptFile === 'object' && receiptFile !== null) {
            console.warn('Receipt file is an object:', receiptFile);
            return <span className="text-red-500">Invalid</span>;
          }
          
          // Safety check: ensure receiptFile is not undefined
          if (receiptFile === undefined) {
            console.warn('Receipt file is undefined');
            return <span className="text-gray-400">N/A</span>;
          }
          
          try {
            // Fix relative URLs by making them absolute with backend URL
            const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
            const fullUrl = receiptFile.toString().startsWith('http') 
              ? receiptFile.toString() 
              : `${backendUrl}${receiptFile.toString()}`;
            
            return (
              <a 
                href={fullUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
                onClick={(e) => {
                  console.log("📎 Clicking receipt link:", fullUrl);
                }}
              >
                View
              </a>
            );
          } catch (error) {
            console.error('Error processing receipt file:', receiptFile, error);
            return <span className="text-red-500">Error</span>;
          }
        },
      },
    ],
    []
  );

  if (isLoading) {
    return <div className="p-4 text-center">Loading deals...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">Error fetching deals: {error.message}</div>;
  }

  // Debug: Log deals data to see if payments are present
  console.log("Deals data:", deals);
  console.log("Expanded row ID:", expandedRowId);
  
  // Additional debugging for payment structure
  if (deals && deals.length > 0) {
    const firstDeal = deals[0];
    console.log("First deal structure:", firstDeal);
    if (firstDeal.payments) {
      console.log("First deal payments:", firstDeal.payments);
      if (firstDeal.payments.length > 0) {
        console.log("First payment structure:", firstDeal.payments[0]);
        console.log("First payment keys:", Object.keys(firstDeal.payments[0]));
      }
    }
  }

  console.log("🔍 DealsTable: About to render ReusableTable with props:", {
    columnsCount: columns.length,
    dataCount: (deals || []).length,
    expandedRowId,
    hasNestedColumns: !!nestedColumns
  });
  
  return (
    <ReusableTable
      columns={columns}
      data={deals || []}
      expandedRowId={expandedRowId}
      setExpandedRowId={setExpandedRowId}
      getNestedData={(row) => {
        console.log("🔍 Getting nested data for row:", row.id);
        console.log("🔍 Row payments:", row.payments);
        console.log("🔍 Row data:", row);
        
        // Safety check: ensure we return an array
        const payments = row.payments;
        if (!payments) {
          console.log("🔍 No payments found, returning empty array");
          return [];
        }
        
        if (!Array.isArray(payments)) {
          console.warn("🔍 Payments is not an array:", payments);
          return [];
        }
        
        // Filter out any invalid payment objects
        const validPayments = payments.filter(payment => {
          if (!payment || typeof payment !== 'object') {
            console.warn("🔍 Invalid payment object:", payment);
            return false;
          }
          return true;
        });
        
        console.log("🔍 Returning valid payments:", validPayments.length);
        console.log("🔍 Valid payments data:", validPayments);
        
        // For debugging, if no payments, return a dummy payment to test expansion
        if (validPayments.length === 0) {
          console.log("🔍 No valid payments, returning dummy data for testing");
          return [
            {
              id: 'dummy-1',
              payment_serial: 'TEST-001',
              payment_date: new Date().toISOString(),
              received_amount: '100.00',
              payment_method: 'cash',
              status: 'pending',
              payment_remarks: 'Test payment for expansion debugging',
              receipt_file: null,
              cheque_number: '',
              verified_by: null,
              verification_remarks: null,
              version: 1
            } as Payment
          ];
        }
        
        return validPayments;
      }}
      nestedColumns={nestedColumns}
      showNestedTable={(row) => {
        const payments = row.payments;
        const hasPayments = payments && Array.isArray(payments) && payments.length > 0;
        console.log("🔍 Show nested table for row:", row.id, "hasPayments:", hasPayments, "payments:", payments);
        console.log("🔍 Row data:", row);
        
        // Always return true for now to debug the expansion issue
        // We can make this more restrictive later once we confirm expansion works
        const shouldShow = true;
        console.log("🔍 Show nested table result:", shouldShow);
        return shouldShow;
      }}
    />
  );
};

export default DealsTable;
