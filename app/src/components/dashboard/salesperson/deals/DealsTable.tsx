"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Edit from "@/assets/icons/edit.svg";
import add from "@/assets/icons/add.svg";
import Image from "next/image";
import { format } from "date-fns";
import { UnifiedTable } from "@/components/core";
import ExpandButton from "@/components/dashboard/salesperson/deals/ExpandButton"; // adjust path

// type define for table head, row and header cell // Parent table data structure
interface MainUsers {
  id: string; // id for parent table
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
  nestedData?: NestedDealData[];
}

interface NestedDealData {
  id: string; // id for nested table
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

// dummy data for table body,row,data cell
const Mainusers: MainUsers[] = [
  {
    id: "1",
    "Deal Name": "Deal 1",
    "Client Name": "Ram Dhakal",
    "Pay Status": "Partial Pay",
    Remarks:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    "Deal Value": "$10000",
    "Deal Date": "sep 5 , 2026",
    Payment: "First Second",
    "Pay Method": "Mobile Wallet",
    "Due Date": "sep 24, 2026",
    Version: "edited",
    "Sales Person": "Yubesh Koirala",
    nestedData: [
      {
        id: "1-1",
        Payment: 1,
        "Payment Date": "Initial Proposal",
        "Payment Created": "John Doe",
        "Payment Value": 20240115,
        "Payment Version": "High",
        "Payment Status": "Completed",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
      {
        id: "1-2",
        Payment: 2,
        "Payment Date": "Technical Review",
        "Payment Created": "Jane Smith",
        "Payment Value": 20240120,
        "Payment Version": "Medium",
        "Payment Status": "In Progress",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
      {
        id: "1-3",
        Payment: 3,
        "Payment Date": "Contract Negotiation",
        "Payment Created": "Mike Johnson",
        "Payment Value": 20240125,
        "Payment Version": "High",
        "Payment Status": "Pending",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
    ],
  },
  {
    id: "2",
    "Deal Name": "Deal 2",
    "Client Name": "Sita Khatri",
    "Pay Status": "Full Pay",
    Remarks:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    "Deal Value": "$7000",
    "Deal Date": "sep 5 , 2026",
    Payment: "First",
    "Pay Method": "E-Cheque",
    "Due Date": "sep 24, 2026",
    Version: "original",
    "Sales Person": "Yubesh Koirala",
    nestedData: [
      {
        id: "2-1",
        Payment: 1,
        "Payment Date": "Initial Proposal",
        "Payment Created": "John Doe",
        "Payment Value": 20240115,
        "Payment Version": "High",
        "Payment Status": "Completed",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
      {
        id: "2-2",
        Payment: 2,
        "Payment Date": "Technical Review",
        "Payment Created": "Jane Smith",
        "Payment Value": 20240120,
        "Payment Version": "Medium",
        "Payment Status": "In Progress",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
      {
        id: "2-3",
        Payment: 3,
        "Payment Date": "Contract Negotiation",
        "Payment Created": "Mike Johnson",
        "Payment Value": 20240125,
        "Payment Version": "High",
        "Payment Status": "Pending",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
    ],
  },
  {
    id: "3",
    "Deal Name": "Deal 3",
    "Client Name": "Hari Shrestha",
    "Pay Status": "Full Pay",
    Remarks:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    "Deal Value": "$2000",
    "Deal Date": "sep 5 , 2026",
    Payment: "First Second",
    "Pay Method": "Bank Transfer",
    "Due Date": "sep 24, 2026",
    Version: "original",
    "Sales Person": "samip pokhrel",
    nestedData: [
      {
        id: "3-1",
        Payment: 1,
        "Payment Date": "Initial Proposal",
        "Payment Created": "John Doe",
        "Payment Value": 20240115,
        "Payment Version": "High",
        "Payment Status": "Completed",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
      {
        id: "3-2",
        Payment: 2,
        "Payment Date": "Technical Review",
        "Payment Created": "Jane Smith",
        "Payment Value": 20240120,
        "Payment Version": "Medium",
        "Payment Status": "In Progress",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
      {
        id: "3-3",
        Payment: 3,
        "Payment Date": "Contract Negotiation",
        "Payment Created": "Mike Johnson",
        "Payment Value": 20240125,
        "Payment Version": "High",
        "Payment Status": "Pending",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
    ],
  },
  {
    id: "4",
    "Deal Name": "Deal 4",
    "Client Name": "Gita Shrestha",
    "Pay Status": "Partial Pay",
    Remarks:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    "Deal Value": "$5000",
    "Deal Date": "sep 5 , 2026",
    Payment: "First ",
    "Pay Method": "Cash On Hand",
    "Due Date": "sep 24, 2026",
    Version: "edited",
    "Sales Person": "Yubesh Koirala",
    nestedData: [
      {
        id: "4-1",
        Payment: 1,
        "Payment Date": "Initial Proposal",
        "Payment Created": "John Doe",
        "Payment Value": 20240115,
        "Payment Version": "High",
        "Payment Status": "Completed",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
      {
        id: "4-2",
        Payment: 2,
        "Payment Date": "Technical Review",
        "Payment Created": "Jane Smith",
        "Payment Value": 20240120,
        "Payment Version": "Medium",
        "Payment Status": "In Progress",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
      {
        id: "4-3",
        Payment: 3,
        "Payment Date": "Contract Negotiation",
        "Payment Created": "Mike Johnson",
        "Payment Value": 20240125,
        "Payment Version": "High",
        "Payment Status": "Pending",
        "Receipt Link": "PA-16659",
        "Verified By": "Verifier A",
        Remarks: "Test project ",
        "Verification Remarks": "Yes",
      },
    ],
  },
];

// nested table column configuration
const NestedDealColumns: ColumnDef<NestedDealData>[] = [
  {
    accessorKey: "Payment",
    header: "Payment",
    cell: ({ row }) => (
      <div className="text-[14px] text-gray-800">{row.getValue("Payment")}</div>
    ),
  },
  {
    accessorKey: "Payment Date",
    header: "Payment Date",
    cell: ({ row }) => (
      <div className="text-[14px] text-gray-800">
        {row.getValue("Payment Date")}
      </div>
    ),
  },
  {
    accessorKey: "Payment Created",
    header: "Payment Created",
    cell: ({ row }) => (
      <div className="text-[14px] text-gray-800">
        {row.getValue("Payment Created")}
      </div>
    ),
  },
  {
    accessorKey: "Payment Value",
    header: "Payment Value",
    cell: ({ row }) => (
      <div className="text-[14px] text-gray-800">
        {row.getValue("Payment Value")}
      </div>
    ),
  },
  {
    accessorKey: "Payment Version",
    header: "Payment Version",
    cell: ({ row }) => (
      <div className="text-[14px] text-gray-800">
        {row.getValue("Payment Version")}
      </div>
    ),
  },
  {
    accessorKey: "Payment Status",
    header: "Payment Status",
    cell: ({ row }) => (
      <div className="text-[14px] text-gray-800">
        {row.getValue("Payment Status")}
      </div>
    ),
  },
  {
    accessorKey: "Receipt Link",
    header: "Receipt Link",
    cell: ({ row }) => (
      <div className="text-[14px] text-blue-600 hover:text-blue-800 cursor-pointer">
        {row.getValue("Receipt Link")}
      </div>
    ),
  },
  {
    accessorKey: "Verified By",
    header: "Verified By",
    cell: ({ row }) => (
      <div className="text-[14px] text-gray-800">
        {row.getValue("Verified By")}
      </div>
    ),
  },
  {
    accessorKey: "Remarks",
    header: "Remarks",
    cell: ({ row }) => (
      <div className="text-[14px] text-gray-800 truncate max-w-[150px]">{row.getValue("Remarks")}</div>
    ),
  },
  {
    accessorKey: "Verification Remarks",
    header: "Verification Remarks",
    cell: ({ row }) => (
      <div className="text-[14px] text-gray-800 truncate max-w-[150px]">
        {row.getValue("Verification Remarks")}
      </div>
    ),
  },
];

interface DealsTableProps {
  onEditDeal?: (dealId: string) => void;
  onAddPayment?: (dealId: string) => void;
}

const DealsTable: React.FC<DealsTableProps> = ({ onEditDeal, onAddPayment }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // parent table column configuration
  const columns: ColumnDef<MainUsers>[] = useMemo(
    () => [
      {
        id: "expand",
        header: () => null,
        cell: ({ row }) => (
          <ExpandButton
            isExpanded={expandedRows.has(row.original.id)}
            onToggle={() => {
              const newExpanded = new Set(expandedRows);
              if (expandedRows.has(row.original.id)) {
                newExpanded.delete(row.original.id);
              } else {
                newExpanded.add(row.original.id);
              }
              setExpandedRows(newExpanded);
            }}
          />
        ),
      },
      {
        accessorKey: "Deal Name",
        header: "Deal Name",
        cell: ({ row }) => (
          <div className="text-[14px] font-medium text-gray-900">
            {row.getValue("Deal Name")}
          </div>
        ),
      },
      {
        accessorKey: "Client Name",
        header: "Client Name",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700">
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
          <div className="text-[14px] text-gray-700 max-w-xs truncate">
            {row.getValue("Remarks")}
          </div>
        ),
      },
      {
        accessorKey: "Deal Value",
        header: "Deal Value",
        cell: ({ row }) => (
          <div className="text-[14px] font-medium text-gray-900">
            {row.getValue("Deal Value")}
          </div>
        ),
      },
      {
        accessorKey: "Deal Date",
        header: "Deal Date",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700">
            {row.getValue("Deal Date")}
          </div>
        ),
      },
      {
        accessorKey: "Payment",
        header: "Payment",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700">
            {row.getValue("Payment")}
          </div>
        ),
      },
      {
        accessorKey: "Pay Method",
        header: "Pay Method",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700">
            {row.getValue("Pay Method")}
          </div>
        ),
      },
      {
        accessorKey: "Due Date",
        header: "Due Date",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700">
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
              version === 'edited' 
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
          <div className="text-[14px] text-gray-700">
            {row.getValue("Sales Person")}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onEditDeal?.(row.original.id)}
              className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
              title="Edit Deal"
            >
              <Image src={Edit} alt="Edit" width={16} height={16} />
            </button>
            <button
              onClick={() => onAddPayment?.(row.original.id)}
              className="w-8 h-8 rounded-full bg-[#22C55E] text-white flex items-center justify-center hover:bg-[#16A34A] transition-colors"
              title="Add Payment"
            >
              <Image src={add} alt="Add Payment" width={16} height={16} />
            </button>
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
      <div className="mx-6 mb-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
          <h4 className="text-[14px] font-semibold text-gray-800 flex items-center gap-2">
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
        data={Mainusers}
        columns={columns}
        config={{
          features: {
            pagination: true,
            sorting: true,
            filtering: true,
            globalSearch: true,
            columnVisibility: true,
            expansion: true,
          },
          styling: {
            variant: 'figma',
            size: 'md',
          },
          pagination: {
            pageSize: 10,
            showSizeSelector: true,
            showInfo: true,
          },
          messages: {
            loading: 'Loading deals...',
            empty: 'No deals found',
            searchPlaceholder: 'Search deals...',
          },
        }}
        expandedContent={(row) => 
          expandedRows.has(row.original.id) ? expandedContent(row) : null
        }
      />
    </div>
  );
};

export default DealsTable;
