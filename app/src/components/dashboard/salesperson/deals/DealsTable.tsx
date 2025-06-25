"use client";

import React from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import Edit from "@/assets/icons/edit.svg";
import add from "@/assets/icons/add.svg";
import expand from "@/assets/icons/expand.svg";
import Image from "next/image";
import { format } from "date-fns";
import { ReusableTable } from "./ReusableTable";

// type define for table head, row and header cell
type User = {
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
};

// dummy data for table body,row,data cell
const users: User[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

// Define columns array with type safety, where each column matches the User type
const columns: ColumnDef<User>[] = [
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
    cell: (info) => info.getValue(),
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
    accessorKey: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex space-x-2">
        <button className="p-1 hover:bg-gray-200 w-5 h-5 rounded">
          <Image src={Edit} alt="Filter-fill" className="w-auto h-auto" />
        </button>
        <button className="p-1 hover:bg-gray-200 w-5 h-5 rounded">
          <Image src={add} alt="Filter-fill" className="w-auto h-auto" />
        </button>
        <button className="p-1 hover:bg-gray-200 w-5 h-5 rounded">
          <Image src={expand} alt="Filter-fill" className="w-auto h-auto" />
        </button>
      </div>
    ),
  },
];

// checking if certain string includes or not
const getRowClassName = (row: Row<User>) => {
  const payment = row.original.Payment || "";
  if (!payment.toLowerCase().includes("second")) {
    return "bg-[#F5F5F5]";
  }
  return "bg-[#FFDBD9] border-b border-[#FFA1A1]";
};

const DealsTable = () => {
  return (
    <ReusableTable<User>
      data={users}
      columns={columns}
      rowClassName={getRowClassName}
    />
  );
};

export default DealsTable;
