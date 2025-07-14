"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Row,
} from "@tanstack/react-table";
import { gsap } from "gsap";
// import DropDown from "@/components/salesperson/DropDown";

// inheritance reusable data props as row data
interface ReusableTableProps<TData, NestedData> {
  data: TData[]; //Array of data items of generic type TData
  columns: ColumnDef<TData, unknown>[]; // Array of column definitions, typed with TData
  nestedColumns?: ColumnDef<NestedData, unknown>[];
  getNestedData?: (row: TData) => NestedData[];
  expandedRowId?: string | null;
  setExpandedRowId?: (id: string | null) => void;
  showNestedTable?: (row: TData) => boolean;
  isLoading?: boolean; // Optional loading state
  error?: string | null; // Optional error message
  rowClassName?: (row: Row<TData>) => string;
}

const NestedRow = <TData, NestedData>({
  row,
  isExpanded,
  columns,
  nestedColumns,
  getNestedData,
}: {
  row: Row<TData>;
  isExpanded: boolean;
  columns: ColumnDef<TData, unknown>[];
  nestedColumns?: ColumnDef<NestedData, unknown>[];
  getNestedData?: (row: TData) => NestedData[];
}) => {
  const nestedContentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (isExpanded) {
      gsap.to(nestedContentRef.current, {
        height: "auto",
        duration: 0.4,
        ease: "power2.inOut",
      });
    } else {
      gsap.to(nestedContentRef.current, {
        height: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
    }
  }, [isExpanded]);

  if (!getNestedData) {
    return null;
  }

  return (
    <tr>
      <td colSpan={columns.length} className="p-0">
        <div ref={nestedContentRef} className="h-0 overflow-hidden">
          <ReusableTable
            data={getNestedData(row.original)}
            columns={nestedColumns!}
          />
        </div>
      </td>
    </tr>
  );
};

//reusable and generic table component
export function ReusableTable<TData, NestedData>({
  data,
  columns,
  nestedColumns,
  getNestedData,
  rowClassName,
  expandedRowId,
  setExpandedRowId,
  isLoading = false,
  error = null,
}: ReusableTableProps<TData, NestedData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className={`${rowClassName ? "rounded-md" : "none"} border `}>
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead
          className={`${
            rowClassName ? "bg-[#DADFFF]" : "bg-[#D1D1D1] text-[13px]"
          }`}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`${
                    rowClassName ? "px-4" : "px-4 py-3"
                  } text-left text-[16px] leading-[24px] text-[#31323A] capitalize font-medium`}
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
        <tbody className="bg-white divide-x divide-gray-200">
          {table.getRowModel().rows.map((row) => {
            const isExpanded = expandedRowId === row.id;
            return (
              <React.Fragment key={row.id}>
                <tr className={rowClassName ? rowClassName(row) : ""}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`${
                        rowClassName ? "px-4" : " px-4 py-2"
                      } relative text-left text-[13px] leading-[24px] text-[#31323A] capitalize font-medium `}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>

                {getNestedData && (
                  <NestedRow
                    row={row}
                    isExpanded={isExpanded}
                    columns={columns}
                    nestedColumns={nestedColumns}
                    getNestedData={getNestedData}
                  />
                )}
              </React.Fragment>
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
