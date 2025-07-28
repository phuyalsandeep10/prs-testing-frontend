"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, Row } from "@tanstack/react-table";
import Edit from "@/assets/icons/edit.svg";
import add from "@/assets/icons/add.svg";
import Image from "next/image";
import { format } from "date-fns";
import { ReusableTable } from "@/components/salesperson/deals/ReusableTable";
import ExpandButton from "@/components/shared/ExpandButton";
import { apiClient } from "@/lib/api";
import { Deal, Payment } from "@/types/deals";

// Dummy data removal and type import will happen here.
// The mock data `Mainusers` will be deleted.
// The interfaces `MainUsers` and `NestedDealData` will be deleted.

interface DealsTableProps {
  setTogglePaymentForm: React.Dispatch<React.SetStateAction<boolean>>;
  togglePaymentForm?: boolean;
}

const fetchDeals = async (): Promise<Deal[]> => {
  const response = await apiClient.get<{ results: Deal[] }>("/deals/deals/");
  return response.data.results;
};

const DealsTable = ({ setTogglePaymentForm }: DealsTableProps) => {
  const { data: deals, isLoading, isError, error } = useQuery<Deal[], Error>({
    queryKey: ["deals"],
    queryFn: fetchDeals,
  });

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const columns: ColumnDef<Deal>[] = useMemo(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <ExpandButton
            onToggle={() =>
              setExpandedRowId((prev) => (prev === row.id ? null : row.id))
            }
            isExpanded={expandedRowId === row.id}
            variant="salesperson"
          />
        ),
      },
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
          const dealValue = row.original.deal_value || 0;
          const progress = dealValue > 0 ? (totalPaid / dealValue) * 100 : 0;
          
          return (
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    progress >= 100 ? 'bg-green-500' : 
                    progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
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
        cell: ({ row }) => format(new Date(row.original.payment_date), "MMM d, yyyy"),
      },
      { 
        accessorKey: "received_amount", 
        header: "Amount",
        cell: ({ row }) => {
          const amount = row.original.received_amount;
          return `${parseFloat(amount).toFixed(2)}`;
        },
      },
      { 
        accessorKey: "payment_method", 
        header: "Method",
        cell: ({ row }) => {
          const method = row.original.payment_method;
          const methodLabels: { [key: string]: string } = {
            'wallet': 'Mobile Wallet',
            'bank': 'Bank Transfer',
            'cheque': 'Cheque',
            'cash': 'Cash'
          };
          return methodLabels[method] || method;
        },
      },
      { accessorKey: "cheque_number", header: "Cheque No." },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || 'pending';
          const statusColors: { [key: string]: string } = {
            'verified': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'rejected': 'bg-red-100 text-red-800'
          };
          return (
            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status] || statusColors.pending}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      { accessorKey: "payment_remarks", header: "Remarks" },
      {
        accessorKey: "receipt_file",
        header: "Receipt",
        cell: ({ row }) => {
          const receiptFile = row.original.receipt_file;
          console.log("🔍 Receipt file value:", receiptFile);
          
          if (receiptFile) {
            // Fix relative URLs by making them absolute with backend URL
            const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
            const fullUrl = receiptFile.startsWith('http') 
              ? receiptFile 
              : `${backendUrl}${receiptFile}`;
            
            return (
              <a 
                href={fullUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
                onClick={(e) => {
                  console.log("📎 Clicking receipt link:", fullUrl);
                }}
              >
                View
              </a>
            );
          }
          return <span className="text-gray-400">N/A</span>;
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

  return (
    <ReusableTable
      columns={columns}
      data={deals || []}
      expandedRowId={expandedRowId}
      setExpandedRowId={setExpandedRowId}
      getNestedData={(row) => {
        console.log("Getting nested data for row:", row);
        console.log("Payments:", row.payments);
        return row.payments || [];
      }}
      nestedColumns={nestedColumns}
      showNestedTable={(row) => {
        const hasPayments = row.payments && row.payments.length > 0;
        console.log("Show nested table for row:", row, "hasPayments:", hasPayments);
        return hasPayments;
      }}
    />
  );
};

export default DealsTable;
