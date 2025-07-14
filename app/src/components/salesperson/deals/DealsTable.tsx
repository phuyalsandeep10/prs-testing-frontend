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
      { accessorKey: "payment_date", header: "Payment Date" },
      { accessorKey: "received_amount", header: "Amount" },
      { accessorKey: "payment_method", header: "Method" },
      { accessorKey: "cheque_number", header: "Cheque No." },
      { accessorKey: "payment_remarks", header: "Remarks" },
      {
        accessorKey: "receipt_file",
        header: "Receipt",
        cell: ({ row }) =>
          row.original.receipt_file ? (
            <a href={row.original.receipt_file} target="_blank" rel="noopener noreferrer">
              View
            </a>
          ) : (
            "N/A"
          ),
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

  return (
    <ReusableTable
      columns={columns}
      data={deals || []}
      expandedRowId={expandedRowId}
      setExpandedRowId={setExpandedRowId}
      getNestedData={(row) => row.payments}
      nestedColumns={nestedColumns}
      showNestedTable={(row) => row.payments && row.payments.length > 0}
    />
  );
};

export default DealsTable;
