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
  
  console.log('🔍 NestedRow: Component rendered with props:', {
    rowId: row.id,
    isExpanded,
    columnsCount: columns.length,
    hasNestedColumns: !!nestedColumns,
    hasGetNestedData: !!getNestedData
  });
  const nestedContentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    console.log('🔍 NestedRow: useLayoutEffect triggered, isExpanded:', isExpanded);
    
    if (!nestedContentRef.current) {
      console.log('🔍 NestedRow: No ref available');
      return;
    }
    
    if (isExpanded) {
      console.log('🔍 NestedRow: Expanding with GSAP');
      // First set to a specific height to ensure GSAP can animate from it
      gsap.set(nestedContentRef.current, { height: 0 });
      gsap.to(nestedContentRef.current, {
        height: "auto",
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => console.log('🔍 NestedRow: GSAP expand animation completed')
      });
    } else {
      console.log('🔍 NestedRow: Collapsing with GSAP');
      // Get current height before collapsing
      const currentHeight = nestedContentRef.current.scrollHeight;
      gsap.to(nestedContentRef.current, {
        height: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => console.log('🔍 NestedRow: GSAP collapse animation completed')
      });
    }
  }, [isExpanded]);

  if (!getNestedData || !nestedColumns) {
    return null;
  }

  console.log('🔍 NestedRow: Rendering component, isExpanded:', isExpanded);
  
  return (
    <tr style={{ border: '2px solid blue' }}>
      <td colSpan={columns.length} className="p-0">
        <div 
          ref={nestedContentRef} 
          className="overflow-hidden"
          style={{ 
            border: '2px solid red', 
            backgroundColor: isExpanded ? 'lightgreen' : 'lightcoral',
            height: isExpanded ? 'auto' : '0px'
          }}
        >
          <div style={{ padding: '10px', fontSize: '12px', color: 'red' }}>
            🔍 NestedRow Content - isExpanded: {isExpanded.toString()}
          </div>
          {(() => {
            try {
              const nestedData = getNestedData(row.original);
              console.log('🔍 NestedRow: Got nested data:', nestedData);
              
              // Safety check: ensure nested data is valid
              if (!nestedData) {
                console.log('🔍 NestedRow: No nested data returned');
                return <div className="p-4 text-gray-400">No data available</div>;
              }
              
              if (!Array.isArray(nestedData)) {
                console.warn('🔍 NestedRow: Nested data is not an array:', nestedData);
                return <div className="p-4 text-red-500">Invalid nested data format</div>;
              }
              
              // Always render the table, even if empty - this allows the expansion to work
              console.log('🔍 NestedRow: Rendering nested table with', nestedData.length, 'rows');
              return (
                <ReusableTable
                  data={nestedData}
                  columns={nestedColumns!}
                />
              );
            } catch (error) {
              console.error('🔍 NestedRow: Error rendering nested table:', error);
              return <div className="p-4 text-red-500">Error rendering nested data</div>;
            }
          })()}
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
  showNestedTable,
  isLoading = false,
  error = null,
}: ReusableTableProps<TData, NestedData>) {
  
  // Debug props
  console.log("🔍 ReusableTable: Received props:", {
    dataCount: data.length,
    columnsCount: columns.length,
    hasNestedColumns: !!nestedColumns,
    hasGetNestedData: !!getNestedData,
    expandedRowId,
    hasSetExpandedRowId: !!setExpandedRowId,
    hasShowNestedTable: !!showNestedTable
  });
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
            console.log("🔍 ReusableTable: Processing row:", row.id, "isExpanded:", isExpanded, "expandedRowId:", expandedRowId);
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
                      {(() => {
                        try {
                          const rendered = flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          );
                          
                          // Safety check: ensure we're not rendering objects directly
                          if (rendered && typeof rendered === 'object' && !React.isValidElement(rendered)) {
                            console.warn('Attempting to render object directly:', rendered);
                            console.warn('Column definition:', cell.column.columnDef);
                            console.warn('Row data:', row.original);
                            return <span className="text-red-500">Invalid data</span>;
                          }
                          
                          // Additional safety check for primitive values
                          if (rendered && typeof rendered === 'object' && rendered !== null) {
                            console.warn('Rendered value is an object:', rendered);
                            return <span className="text-red-500">Object data</span>;
                          }
                          
                          return rendered;
                        } catch (error) {
                          console.error('Error rendering cell:', error);
                          console.error('Column definition:', cell.column.columnDef);
                          console.error('Row data:', row.original);
                          return <span className="text-red-500">Error</span>;
                        }
                      })()}
                    </td>
                  ))}
                </tr>

                {(() => {
                  const shouldRenderNested = getNestedData && nestedColumns;
                  console.log('🔍 ReusableTable: Should render NestedRow for row:', row.id, 'isExpanded:', isExpanded, 'shouldRenderNested:', shouldRenderNested);
                  console.log('🔍 ReusableTable: getNestedData function:', getNestedData);
                  console.log('🔍 ReusableTable: nestedColumns:', nestedColumns);
                  
                  if (!shouldRenderNested) {
                    console.log('🔍 ReusableTable: Not rendering NestedRow because:', {
                      hasGetNestedData: !!getNestedData,
                      hasNestedColumns: !!nestedColumns
                    });
                    return null;
                  }
                  
                  // Check if showNestedTable function exists and what it returns
                  if (showNestedTable) {
                    console.log('🔍 ReusableTable: Calling showNestedTable for row:', row.id, 'row.original:', row.original);
                    const shouldShow = showNestedTable(row.original);
                    console.log('🔍 ReusableTable: showNestedTable result for row:', row.id, 'shouldShow:', shouldShow);
                    if (!shouldShow) {
                      console.log('🔍 ReusableTable: Not showing nested table for row:', row.id, 'because showNestedTable returned false');
                      return null;
                    }
                  }
                  
                  console.log('🔍 ReusableTable: About to render NestedRow for row:', row.id);
                  console.log('🔍 ReusableTable: NestedRow props:', {
                    rowId: row.id,
                    isExpanded,
                    hasColumns: !!columns,
                    hasNestedColumns: !!nestedColumns,
                    hasGetNestedData: !!getNestedData
                  });
                  return (
                    <>
                      <tr style={{ border: '2px solid green' }}>
                        <td colSpan={columns.length} style={{ padding: '5px', backgroundColor: 'lightyellow', fontSize: '10px' }}>
                          🔍 DEBUG: NestedRow wrapper for row {row.id} - isExpanded: {isExpanded.toString()}
                        </td>
                      </tr>
                      <NestedRow
                        key={`nested-${row.id}`}
                        row={row}
                        isExpanded={isExpanded}
                        columns={columns}
                        nestedColumns={nestedColumns}
                        getNestedData={getNestedData}
                      />
                    </>
                  );
                })()}
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
