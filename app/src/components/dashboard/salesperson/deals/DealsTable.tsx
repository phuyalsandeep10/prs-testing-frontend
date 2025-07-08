"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { UnifiedTable } from "@/components/core";

import { Deal, Payment } from "@/types/deals";
import { useRoleConfig } from "@/hooks/useRoleBasedColumns";
import { useDealsQuery, useTableStateSync } from "@/hooks/useIntegratedQuery";
import { cn } from "@/lib/utils";

interface DealsTableProps {
  onEditDeal?: (dealId: string) => void;
  onAddPayment?: (dealId: string) => void;
  searchTerm?: string;
}

const DealsTable: React.FC<DealsTableProps> = ({ onEditDeal, onAddPayment, searchTerm = "" }) => {
  // Table state management with URL sync
  const {
    tableState,
    setSearch,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  } = useTableStateSync("sales-deals-table");

  // React Query fetch
  const {
    data: dealsData,
    isLoading,
    error,
    refetch,
  } = useDealsQuery(tableState);

  const roleConfig = useRoleConfig();

  // Expansion state management
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (rowId: string) => {
    console.log('🔄 Toggling expansion for row:', rowId);
    setExpandedRows(prev => {
      const newState = {
        ...prev,
        [rowId]: !prev[rowId]
      };
      console.log('📊 New expansion state:', newState);
      return newState;
    });
  };

  // Expanded content renderer
  const renderExpandedContent = (row: any) => {
    const payments = row.original.payments || [];
    console.log('🔍 Expanded content for row:', row.id, 'with payments:', payments);
    
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
                      {payment.status}
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
          const value = row.original.deal_value || row.original.value;
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
        cell: ({ row }) => (
          <div className="flex gap-1">
            {row.original.payments?.slice(0, 2).map((p: Payment, idx: number) => (
              <span
                key={p.id}
                className={cn(
                  "text-xs font-semibold",
                  p.status === "verified"
                    ? "text-green-600"
                    : p.status === "rejected"
                    ? "text-red-600"
                    : "text-gray-500"
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
        cell: ({ row }) => <span className="text-sm">{row.original.payments?.[0]?.payment_method || "-"}</span>,
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
            {row.original.version && row.original.version > 1 ? "Edited" : "Original"}
          </span>
        ),
      },
      ...(roleConfig.shouldShowSalesperson
        ? [
            {
              id: "sales_person",
              header: "Sales Person",
              cell: ({ row }: any) => (
                <span className="text-sm">{row.original.created_by?.full_name || "-"}</span>
              ),
            } as ColumnDef<Deal>,
          ]
        : []),
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                toggleRowExpansion(row.id);
              }}
              title={expandedRows[row.id] ? "Collapse" : "Expand"}
            >
              {expandedRows[row.id] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onEditDeal?.(row.original.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onAddPayment?.(row.original.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onEditDeal, onAddPayment, roleConfig.shouldShowSalesperson, expandedRows]
  );

  // Keep external search term in sync
  React.useEffect(() => {
    if (searchTerm !== tableState.search) {
      setSearch(searchTerm);
    }
  }, [searchTerm, tableState.search, setSearch]);

      return (
    <UnifiedTable
      data={dealsData?.data || []}
      columns={columns as any}
      loading={isLoading}
      error={error?.message}
      onRefresh={refetch}
      expandedContent={renderExpandedContent}
      expandedRows={expandedRows}
      onExpandedRowsChange={setExpandedRows}
      getRowProps={(row) => {
        const payments = (row.original as any)?.payments as Payment[] | undefined;
        const hasRejected = payments?.some((p) => p.status === "rejected");
        return { className: hasRejected ? "bg-red-50" : "" };
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
          expansion: true,
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

export default DealsTable;
