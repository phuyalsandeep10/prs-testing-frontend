"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// ==================== TYPES ====================
export interface DataTableConfig {
  enableSearch?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableSelection?: boolean;
  enableColumnVisibility?: boolean;
  searchPlaceholder?: string;
  searchableColumns?: string[];
  pageSize?: number;
  className?: string;
  emptyStateMessage?: string;
  loadingMessage?: string;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  config?: DataTableConfig;
  loading?: boolean;
  onRowSelect?: (selectedRows: TData[]) => void;
  onSearch?: (searchTerm: string) => void;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
}

// ==================== DEFAULT CONFIG ====================
const defaultConfig: DataTableConfig = {
  enableSearch: true,
  enableSorting: true,
  enableFiltering: true,
  enablePagination: true,
  enableSelection: false,
  enableColumnVisibility: true,
  searchPlaceholder: "Search...",
  pageSize: 10,
  emptyStateMessage: "No results found.",
  loadingMessage: "Loading...",
};

// ==================== SEARCH COMPONENT ====================
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
}) => (
  <div className={cn("relative max-w-sm", className)}>
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10"
    />
  </div>
);

// ==================== COLUMN VISIBILITY TOGGLE ====================
interface ColumnVisibilityToggleProps<TData> {
  table: any; // ReactTable instance
}

function ColumnVisibilityToggle<TData>({ table }: ColumnVisibilityToggleProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          Columns <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {table
          .getAllColumns()
          .filter((column: any) => column.getCanHide())
          .map((column: any) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.columnDef.header}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ==================== PAGINATION COMPONENT ====================
interface PaginationControlsProps {
  table: any; // ReactTable instance
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ table }) => (
  <div className="flex items-center justify-between space-x-2">
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium">
        Rows per page
      </p>
      <select
        value={table.getState().pagination.pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
        className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
      >
        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            {pageSize}
          </option>
        ))}
      </select>
    </div>
    
    <div className="flex items-center space-x-2">
      <div className="text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <span className="mr-2">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </span>
        )}
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

// ==================== MAIN DATA TABLE COMPONENT ====================
export function DataTable<TData, TValue>({
  columns,
  data,
  config = {},
  loading = false,
  onRowSelect,
  onSearch,
  toolbar,
  footer,
}: DataTableProps<TData, TValue>) {
  const finalConfig = { ...defaultConfig, ...config };
  
  // ==================== STATE ====================
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // ==================== TABLE CONFIGURATION ====================
  const tableColumns = React.useMemo(() => {
    if (!finalConfig.enableSelection) return columns;
    
    // Add selection column if enabled
    const selectionColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
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
    };
    
    return [selectionColumn, ...columns];
  }, [columns, finalConfig.enableSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: finalConfig.enableSorting ? setSorting : undefined,
    onColumnFiltersChange: finalConfig.enableFiltering ? setColumnFilters : undefined,
    onColumnVisibilityChange: finalConfig.enableColumnVisibility ? setColumnVisibility : undefined,
    onRowSelectionChange: finalConfig.enableSelection ? setRowSelection : undefined,
    onGlobalFilterChange: finalConfig.enableSearch ? setGlobalFilter : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: finalConfig.enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: finalConfig.enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: finalConfig.enableFiltering ? getFilteredRowModel() : undefined,
    state: {
      sorting: finalConfig.enableSorting ? sorting : undefined,
      columnFilters: finalConfig.enableFiltering ? columnFilters : undefined,
      columnVisibility: finalConfig.enableColumnVisibility ? columnVisibility : undefined,
      rowSelection: finalConfig.enableSelection ? rowSelection : undefined,
      globalFilter: finalConfig.enableSearch ? globalFilter : undefined,
    },
    initialState: {
      pagination: finalConfig.enablePagination ? {
        pageSize: finalConfig.pageSize,
      } : undefined,
    },
  });

  // ==================== EFFECTS ====================
  React.useEffect(() => {
    if (onRowSelect && finalConfig.enableSelection) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onRowSelect(selectedRows);
    }
  }, [rowSelection, onRowSelect, table, finalConfig.enableSelection]);

  React.useEffect(() => {
    if (onSearch) {
      onSearch(globalFilter);
    }
  }, [globalFilter, onSearch]);

  // ==================== RENDER ====================
  return (
    <div className={cn("space-y-4", finalConfig.className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {finalConfig.enableSearch && (
            <SearchInput
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder={finalConfig.searchPlaceholder}
            />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {toolbar}
          {finalConfig.enableColumnVisibility && (
            <ColumnVisibilityToggle table={table} />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-6 py-3">
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  {finalConfig.loadingMessage}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "hover:bg-muted/50",
                    row.getIsSelected() && "bg-muted"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  {finalConfig.emptyStateMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="space-y-4">
        {footer}
        {finalConfig.enablePagination && (
          <PaginationControls table={table} />
        )}
      </div>
    </div>
  );
}

// ==================== HOOKS ====================
export const useDataTable = <TData,>(
  data: TData[],
  config?: DataTableConfig
) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRows, setSelectedRows] = React.useState<TData[]>([]);
  
  const filteredData = React.useMemo(() => {
    if (!searchTerm || !config?.searchableColumns?.length) return data;
    
    return data.filter((item) =>
      config.searchableColumns!.some((column) => {
        const value = (item as any)[column];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, config?.searchableColumns]);

  return {
    data: filteredData,
    searchTerm,
    setSearchTerm,
    selectedRows,
    setSelectedRows,
  };
};

// ==================== COLUMN HELPERS ====================
export const createActionsColumn = <TData,>(
  actions: Array<{
    label: string;
    onClick: (row: TData) => void;
    icon?: React.ReactNode;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  }>
): ColumnDef<TData> => ({
  id: "actions",
  header: "Actions",
  cell: ({ row }) => (
    <div className="flex items-center space-x-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "ghost"}
          size="sm"
          onClick={() => action.onClick(row.original)}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
});

export const createStatusColumn = <TData,>(
  accessor: keyof TData,
  statusMap: Record<string, { label: string; className: string }>
): ColumnDef<TData> => ({
  id: accessor as string,
  header: "Status",
  accessorKey: accessor as string,
  cell: ({ getValue }) => {
    const status = getValue() as string;
    const statusConfig = statusMap[status];
    
    if (!statusConfig) return status;
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig.className)}>
        {statusConfig.label}
      </span>
    );
  },
});

export default DataTable; 