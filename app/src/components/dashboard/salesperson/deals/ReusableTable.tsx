"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  RowData,
  Row,
} from "@tanstack/react-table";
// import DropDown from "@/components/salesperson/DropDown";

// inheritance reusable data props as row data
interface ReusableTableProps<TData extends RowData> {
  data: TData[]; //Array of data items of generic type TData
  columns: ColumnDef<TData, unknown>[]; // Array of column definitions, typed with TData
  isLoading?: boolean; // Optional loading state
  error?: string | null; // Optional error message
  rowClassName?: (row: Row<TData>) => string;
}
//reusable and generic table component
export function ReusableTable<TData extends RowData>({
  data,
  columns,
  isLoading = false,
  error = null,
  rowClassName,
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
        <thead className="bg-[#DADFFF]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-[16px] leading-[24px] text-[#31323A] capitalize font-medium max-w-1/2 max-h-1/2 w-full h-full"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => {
            return (
              <tr
                key={row.id}
                className={rowClassName ? rowClassName(row) : ""}
              >
                {row.getVisibleCells().map((cell) => {
                  console.log(cell);
                  return (
                    <td
                      key={cell.id}
                      className="px-4 py-2 whitespace-nowrap font-medium text-[15px] leading-5 capitalize"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-4 text-center text-gray-400">No data available.</div>
      )}
    </div>
  );
}

export default ReusableTable;
