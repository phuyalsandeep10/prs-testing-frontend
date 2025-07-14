"use client";

import React, { useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { UnifiedTable } from "@/components/core";

import { Deal, Payment } from "@/types/deals";
import { useRoleConfig } from "@/hooks/useRoleBasedColumns";
import {
  useDealsQuery,
  useTableStateSync,
  useVerifyPaymentMutation,
} from "@/hooks/useIntegratedQuery";

interface DealsTableProps {
  searchTerm?: string;
}

/**
 * Streamlined Deals table for Verifier role.
 * - Fetches deals via React Query
 * - Displays pending payment count
 * - Provides Verify / Reject actions per deal (first pending payment)
 */
const DealsTableNew: React.FC<DealsTableProps> = ({ searchTerm = "" }) => {
  // Table state synced with URL + Zustand
  const {
    tableState,
    setSearch,
    setPage,
    setPageSize,
  } = useTableStateSync("verifier-deals-table");

  // Keep search term in sync
  useEffect(() => {
    if (searchTerm !== tableState.search) {
      setSearch(searchTerm);
    }
  }, [searchTerm, tableState.search, setSearch]);

  // Fetch deals – filter only those requiring verification if backend supports
  const {
    data: dealsData,
    isLoading,
    error,
    refetch,
  } = useDealsQuery({
    ...tableState,
    verification_status: "pending", // filter for deals that need verification
  });

  // Role configuration (permissions, etc.)
  const roleConfig = useRoleConfig();

  // Payment verification mutation
  const { mutate: verifyPayment, isPending: isVerifying } =
    useVerifyPaymentMutation();

  // ---------------- COLUMN DEFINITIONS ----------------
  const columns: ColumnDef<Deal>[] = useMemo(
    () => [
      {
        id: "deal_name",
        header: "Deal Name",
        accessorKey: "deal_name",
      },
      {
        id: "client_name",
        header: "Client Name",
        accessorKey: "client_name",
      },
      {
        id: "pay_status",
        header: "Pay Status",
        accessorKey: "pay_status",
        cell: ({ row }) => {
          const raw = row.original.pay_status;
          const label = raw === "full_payment" ? "Full Pay" : "Partial Pay";
          const badgeClass =
            raw === "full_payment"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700";
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
            >
              {label}
            </span>
          );
        },
      },
      {
        id: "remarks",
        header: "Remarks",
        accessorKey: "deal_remarks",
        cell: ({ row }) => (
          <span className="truncate max-w-[150px] block">
            {row.original.deal_remarks || "-"}
          </span>
        ),
      },
      {
        id: "deal_value",
        header: "Deal Value",
        accessorKey: "deal_value",
      },
      {
        id: "deal_date",
        header: "Deal Date",
        accessorKey: "deal_date",
        cell: ({ row }) => (
          <span>
            {row.original.deal_date
              ? format(new Date(row.original.deal_date), "MMM d, yyyy")
              : "-"}
          </span>
        ),
      },
      {
        id: "payment",
        header: "Payment",
        cell: ({ row }) => (
          <div className="flex gap-1">
            {row.original.payments?.slice(0, 2).map((p: Payment, idx: number) => (
              <span
                key={p.id}
                className={cn(
                  "text-xs font-semibold",
                  p.status === "verified" ? "text-green-600" : p.status === "rejected" ? "text-red-600" : "text-gray-500"
                )}
              >
                {idx === 0 ? "First" : "Second"}
              </span>
            ))}
          </div>
        ),
      },
      {
        id: "pay_method",
        header: "Pay Method",
        cell: ({ row }) => <span>{row.original.payments?.[0]?.payment_method || "-"}</span>,
      },
      {
        id: "due_date",
        header: "Due Date",
        accessorKey: "due_date",
        cell: ({ row }) => (
          <span>
            {row.original.due_date ? format(new Date(row.original.due_date), "MMM d, yyyy") : "-"}
          </span>
        ),
      },
      {
        id: "version",
        header: "Version",
        cell: ({ row }) => <span>{row.original.version && row.original.version > 1 ? "Edited" : "Original"}</span>,
      },
      {
        id: "sales_person",
        header: "Sales Person",
        cell: ({ row }) => <span>{row.original.created_by?.full_name || "-"}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const pendingPayment = row.original.payments?.find(
            (p: Payment) => p.status === "pending"
          );

          if (!pendingPayment) return null;
          if (!roleConfig.allowedActions.includes("verify")) return null;

          const handleVerify = (status: "verified" | "rejected") => {
            verifyPayment({ paymentId: pendingPayment.id, status });
          };

          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleVerify("verified")}
              >
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleVerify("rejected")}
              >
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          );
        },
      },
    ],
    [verifyPayment, isVerifying, roleConfig]
  );

  return (
    <UnifiedTable
      data={dealsData?.data || []}
      columns={columns as any}
      loading={isLoading}
      error={error?.message}
      onRefresh={refetch}
      getRowProps={(row) => {
        const payments = (row.original as any)?.payments as Payment[] | undefined;
        const hasRejected = payments?.some((p) => p.status === "rejected");
        return {
          className: hasRejected ? "bg-red-50" : "",
        };
      }}
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
        },
        pagination: {
          pageSize: tableState.pageSize,
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

export default DealsTableNew; 