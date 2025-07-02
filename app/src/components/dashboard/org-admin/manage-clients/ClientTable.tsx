"use client";

import * as React from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { UnifiedTable } from "@/components/core";
import { type Client } from "@/lib/types/roles";

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
};

const columns: ColumnDef<Client>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "client_name",
    header: "Client Name",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex items-center gap-3">
          <span className="font-medium">{client.client_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created Date",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Client["status"];
      if (!status) return 'N/A';
      const statusConfig = {
        clear: { label: "Clear", className: "text-green-600" },
        pending: { label: "Pending", className: "text-orange-500" },
        bad_debt: { label: "Bad Debt", className: "text-red-600" },
      };
      const config = status ? statusConfig[status] : null;
      return config ? <span className={config.className}>{config.label}</span> : 'N/A';
    },
  },
  {
    accessorKey: "satisfaction",
    header: "Satisfaction",
    cell: ({ row }) => {
      const satisfaction = row.getValue("satisfaction") as Client["satisfaction"];
      if (!satisfaction) return 'N/A';
      const satisfactionConfig = {
        excellent: { label: 'Excellent', className: 'text-green-600' },
        good: { label: 'Good', className: 'text-blue-500' },
        average: { label: 'Average', className: 'text-yellow-500' },
        poor: { label: 'Poor', className: 'text-red-600' },
      };
      const config = satisfaction ? satisfactionConfig[satisfaction] : null;
      return config ? <span className={config.className}>{config.label}</span> : 'N/A';
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => <div className="truncate w-40">{row.getValue("remarks") || 'No remarks'}</div>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/org-admin/manage-clients/${client.id}`}>
            <button className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors">
              <Eye className="h-4 w-4" />
            </button>
          </Link>
          <button className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];

interface ClientTableProps {
  clients: Client[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onExport?: (data: Client[]) => void;
  onRowClick?: (row: Row<Client>) => void;
}

export function ClientTable({
  clients,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  onRowClick
}: ClientTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <UnifiedTable
        data={clients}
        columns={columns as ColumnDef<unknown>[]}
        config={{
          features: {
            pagination: true,
            sorting: true,
            filtering: false,
            selection: true,
            columnVisibility: false,
            globalSearch: false,
            export: !!onExport,
            refresh: !!onRefresh,
          },
          styling: {
            variant: 'figma',
            size: 'md',
            striped: false,
            bordered: true,
            hover: true,
          },
          pagination: {
            pageSize: 10,
            showSizeSelector: true,
            showInfo: true,
          },
          messages: {
            loading: 'Loading clients...',
            empty: 'No clients found',
            error: 'Failed to load clients',
            searchPlaceholder: 'Search clients...',
          },
        }}
        loading={loading}
        error={error}
        onRowClick={onRowClick}
        onExport={onExport}
        onRefresh={onRefresh}
      />
    </div>
  );
}
