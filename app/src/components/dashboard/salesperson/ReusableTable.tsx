"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  RowData,
} from "@tanstack/react-table";

interface ReusableTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  isLoading?: boolean;
  error?: string | null;
}

export function ReusableTable<TData extends RowData>({
  data,
  columns,
  isLoading = false,
  error = null,
}: ReusableTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-4 text-center text-gray-400">No data available.</div>
      )}
    </div>
  );
}

export default ReusableTable;
