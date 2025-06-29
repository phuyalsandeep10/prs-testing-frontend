"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Edit from "@/assets/icons/edit.svg";
import add from "@/assets/icons/add.svg";
import Image from "next/image";
import { format } from "date-fns";
import { ReusableTable } from "@/components/salesperson/deals/ReusableTable"; // adjust path
import ExpandButton from "@/components/salesperson/deals/ExpandButton"; // adjust path

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

interface DealsTableProps {
  setTogglePaymentForm: React.Dispatch<React.SetStateAction<boolean>>;
}

// deals table
const DealsTable = ({ setTogglePaymentForm }: DealsTableProps) => {
  // dropdown for each table row
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Main table columns
  const columns: ColumnDef<MainUsers>[] = useMemo(
    () => [
      {
        accessorKey: "Deal Name", // The key in your data object to access the value for this column
        header: "Deal Name", // The column header label displayed in the table
        cell: (info) => info.getValue(), // Function to render the cell content: here it returns the value of "Remarks" for the current row
      },
      {
        accessorKey: "Client Name",
        header: "Client Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "Pay Status",
        header: "Pay Status",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "Remarks",
        header: "Remarks",
        cell: (info) => {
          const value = info.getValue() as string;
          return (
            <div className="flex flex-col">
              <span className="text-[15px] leading-5 capitalize">
                {`${value.slice(0, 10)}...`}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "Deal Value",
        header: "Deal Value",
        cell: (info) => {
          const dealValueStr = info.getValue() as string;
          const dealValue = parseFloat(dealValueStr.replace(/[^0-9.-]+/g, ""));
          const payments = info.row.original.nestedData || [];
          const totalPaid = payments
            .filter((p) => p["Payment Status"] === "Completed")
            .reduce((sum, p) => sum + p["Payment Value"], 0);
          const dueAmount = dealValue - totalPaid;

          return (
            <div className="relative group">
              <span>{dealValueStr}</span>
              <div className="absolute hidden group-hover:block bg-[#909fff] text-white text-xs rounded py-1 px-2 -top-8 left-0 w-max z-10">
                <p>{dueAmount.toLocaleString()}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "Deal Date",
        header: "Deal Date",
        cell: (info) => format(info.getValue() as number, "MMM dd, yyyy"),
      },
      {
        accessorKey: "Payment",
        header: "Payment",
        cell: (info) => {
          const parts = (info.getValue() as string).split(" ");

          return (
            <div className="flex flex-col">
              {parts.map((part: string, i: number) => {
                // lowercase for case-insensitive check
                const lower = part.toLowerCase();

                // decide color
                let colorClass = "";
                if (lower.includes("first")) colorClass = "text-green-600";
                if (lower.includes("second")) colorClass = "text-red-600";

                if (lower.includes("first")) {
                  return (
                    <div className="relative group" key={i}>
                      <span className={` ${colorClass} `}>{part}</span>
                      <div className="absolute hidden group-hover:block bg-[#909fff] text-white text-xs rounded py-1 px-2 -top-8 left-0 w-max z-10 ">
                        $3000
                      </div>
                    </div>
                  );
                }

                return (
                  <React.Fragment key={i}>
                    <span className={` ${colorClass} `}>{part}</span>
                  </React.Fragment>
                );
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "Pay Method",
        header: "Pay Method",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "Due Date",
        header: "Due Date",
        cell: (info) => format(info.getValue() as number, "MMM dd, yyyy"),
      },
      {
        accessorKey: "Version",
        header: "Version",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "Sales Person",
        header: "Sales Person",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "Actions",
        header: "Actions",
        size: 120,
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <button>
                <Image src={Edit} alt="Edit" />
              </button>
              <button onClick={() => setTogglePaymentForm((prev) => !prev)}>
                <Image src={add} alt="Add" />
              </button>
              <ExpandButton
                onToggle={() =>
                  setExpandedRowId((prev) => (prev === row.id ? null : row.id))
                }
              />
            </div>
          );
        },
      },
    ],
    []
  );

  // Nested table columns
  const nestedColumns: ColumnDef<NestedDealData>[] = useMemo(
    () => [
      {
        accessorKey: "Payment",
        header: "Payment",
      },
      {
        accessorKey: "Payment Date",
        header: "Payment Date",
      },
      {
        accessorKey: "Payment Created",
        header: "Payment Created",
      },
      {
        accessorKey: "Payment Value",
        header: "Payment Value",
      },
      {
        accessorKey: "Payment Version",
        header: "Payment Version",
      },
      {
        accessorKey: "Payment Status",
        header: "Payment Status",
      },
      {
        accessorKey: "Receipt Link",
        header: "Receipt Link",
      },
      {
        accessorKey: "Verified By",
        header: () => <span className="text-[#009959]">Verified By</span>,
      },
      {
        accessorKey: "Remarks",
        header: "Remarks",
      },
      {
        accessorKey: "Verification Remarks",
        header: "Verification Remarks",
      },
    ],
    []
  );
  return (
    <ReusableTable
      data={Mainusers} // The main dataset to render in the table
      columns={columns} // Column definitions for the main table
      nestedColumns={nestedColumns} // Column definitions to be used for rendering nested tables (expandable rows)
      getNestedData={(info) => info.nestedData || []} // Function to extract nested data (e.g., sub-rows) from a given row
      showNestedTable={(info) =>
        Boolean(info.nestedData && info.nestedData.length > 0)
      } // Determines whether a row should display a nested table
      expandedRowId={expandedRowId} // The ID of the currently expanded row (used to control row expansion)
      setExpandedRowId={setExpandedRowId} // Callback to update the expanded row ID when toggling expansion
      rowClassName={(row) => {
        const payment = row.original.Payment || "";
        if (!payment.toLowerCase().includes("second")) {
          return "bg-[#F5F5F5] h-[44px]";
        }
        return "bg-[#FFDBD9] border-b border-[#FFA1A1]";
      }} // Function to apply dynamic styling to each row based on its data
      isLoading={false} // Controls whether a loading state should be shown
      error={null} // Displays error content if present
    />
  );
};

export default DealsTable;
