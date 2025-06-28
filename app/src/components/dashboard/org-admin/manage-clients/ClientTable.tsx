"use client";

import * as React from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";
import { UnifiedTable } from "@/components/core";
import { getClients, type Client } from "@/data/clients";

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options).replace(' ', '-');
  } catch {
    return dateString;
  }
};

const columns: ColumnDef<Client>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
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
    accessorKey: "name",
    header: "Client Name",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex items-center gap-3">
          <Image
            src={client.avatarUrl || '/avatars/default.png'}
            alt={client.name}
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="font-medium">{client.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "activeDate",
    header: "Active Date",
    cell: ({ row }) => formatDate(row.getValue("activeDate")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Client["status"];
      const statusColor: Record<Client["status"], string> = {
        "clear": "text-green-600",
        "pending": "text-orange-500",
        "bad-depth": "text-red-600",
      };
      return <span className={statusColor[status]}>{status}</span>;
    },
  },
  {
    accessorKey: "salesLeadsAvatars",
    header: "Sales Leads",
    cell: ({ row }) => {
      const leads = row.getValue("salesLeadsAvatars") as string[];
      return (
        <div className="flex -space-x-2 overflow-hidden">
          {leads.map((lead, index) => (
            <Image 
              key={index} 
              className="inline-block h-7 w-7 rounded-full ring-2 ring-white" 
              src={lead} 
              alt={`lead ${index + 1}`} 
              width={28} 
              height={28} 
            />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "satisfaction",
    header: "Satisfaction",
    cell: ({ row }) => {
      const satisfaction = row.getValue("satisfaction") as Client["satisfaction"];
      const satisfactionColor: Record<Client["satisfaction"], string> = {
        "positive": "text-green-600",
        "neutral": "text-orange-500",
        "negative": "text-red-600",
      };
      return <span className={satisfactionColor[satisfaction]}>{satisfaction}</span>;
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => <div className="truncate w-40">{row.getValue("remarks")}</div>,
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
  clients?: Client[];
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
  const data = React.useMemo(() => clients || getClients(), [clients]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <UnifiedTable
        data={data}
        columns={columns}
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
