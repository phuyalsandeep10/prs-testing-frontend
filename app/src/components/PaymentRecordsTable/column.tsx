import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import eyeicon from "@/assets/icons/Eye-fill.svg";
import plusicon from "@/assets/icons/Plus.svg";
import editicon from "@/assets/icons/edit.svg";
import { useState } from "react";
import MeetingDetails from "@/app/(dashboard)/verifier/paymentRecords/MeetingDetails";

export type Payment = {
  date: string;
  depositorName: string;
  salesperson: string;
  chequeNo: string;
  amount: string;
  chequeRemarks: string;
  accountNo: string;
  status: string;
  approvedBy: string;
  comments: string;
};

export const scrollableColumns: ColumnDef<Payment>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "depositorName", header: "Depositor Name" },
  { accessorKey: "salesperson", header: "Salesperson" },
  { accessorKey: "chequeNo", header: "Cheque No" },
  { accessorKey: "amount", header: "Amount" },
  { accessorKey: "chequeRemarks", header: "Cheque Remarks" },
  { accessorKey: "accountNo", header: "Account No" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "text-[#FD8B00]";
    case "Approved":
      return "text-green-600";
    case "Rejected":
      return "text-red-600";
    default:
      return "text-[#31323A]";
  }
};

// Comments cell with popover
const CommentsCell = ({ row }: { row: any }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const comment = row.original.comments;

  return (
    <div className="flex items-start gap-2 w-full">
      <p className="text-xs break-words whitespace-pre-wrap flex-1">
        {comment}
      </p>
      <div className="flex flex-shrink-0">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-1">
              <Image src={eyeicon} alt="View" className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0 border-0 shadow-lg"
            align="end"
            side="bottom"
          >
            <MeetingDetails />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" className="h-6 w-6 p-1">
          <Image src={plusicon} alt="Add" className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export const createRightColumns = (
  role: "verifier" | "senior-verifier",
  updatePaymentStatus?: (rowIndex: number, newStatus: string) => void
): ColumnDef<Payment>[] => {
  const isVerifier = role === "verifier";
  const isSeniorVerifier = role === "senior-verifier";

  return [
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        if (isSeniorVerifier && updatePaymentStatus) {
          return (
            <Select
              value={row.original.status}
              onValueChange={(value: string) =>
                updatePaymentStatus(row.index, value)
              }
            >
              <SelectTrigger
                className={`border-none bg-transparent p-0 h-6 text-[12px] focus:ring-0 shadow-none ${getStatusColor(
                  row.original.status
                )}`}
              >
                <SelectValue
                  placeholder="Select status"
                  className="text-[12px]"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending" className="text-[#FD8B00]">
                  Pending
                </SelectItem>
                <Separator className="my-1" />
                <SelectItem value="Approved" className="text-green-600">
                  Approved
                </SelectItem>
                <Separator className="my-1" />
                <SelectItem value="Rejected" className="text-red-600">
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>
          );
        }

        if (isVerifier) {
          return (
            <span className={`text-xs ${getStatusColor(row.original.status)}`}>
              {row.original.status}
            </span>
          );
        }

        return <span>{row.original.status}</span>;
      },
    },
    { accessorKey: "approvedBy", header: "Approved By" },
    {
      accessorKey: "comments",
      header: "Comments",
      cell: ({ row }) => <CommentsCell row={row} />,
    },
    ...(isVerifier
      ? [
          {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6 p-1">
                  <Image src={editicon} alt="Edit" className="w-4 h-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];
};
