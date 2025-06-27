"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  RowSelectionState,

} from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";

import { getClients, type Client } from "@/data/clients";

const clientData = getClients();

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
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
            <Image key={index} className="inline-block h-7 w-7 rounded-full ring-2 ring-white" src={lead} alt={`lead ${index + 1}`} width={28} height={28} />
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
        <div className="flex items-center space-x-1">
          <Link href={`/org-admin/manage-clients/${client.id}`}>
            <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700 rounded-full w-8 h-8 bg-blue-100">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 rounded-full w-8 h-8 bg-red-100">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export function ClientTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const data = React.useMemo(() => clientData, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-purple-50 hover:bg-purple-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-0">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-gray-600 py-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
