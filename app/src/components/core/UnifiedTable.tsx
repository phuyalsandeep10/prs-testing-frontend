"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

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
import { cn } from "@/lib/utils";

// ==================== TYPES ====================
export interface TableFeatures {
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  selection?: boolean;
  expansion?: boolean;
  columnVisibility?: boolean;
  globalSearch?: boolean;
  export?: boolean;
  refresh?: boolean;
}

export interface TableStyling {
  variant?: 'default' | 'minimal' | 'professional' | 'compact' | 'figma';
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
}

export interface TableConfig {
  features?: TableFeatures;
  styling?: TableStyling;
  pagination?: {
    pageSize?: number;
    showSizeSelector?: boolean;
    showInfo?: boolean;
  };
  messages?: {
    loading?: string;
    empty?: string;
    error?: string;
    searchPlaceholder?: string;
  };
}

export interface UnifiedTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  config?: TableConfig;
  loading?: boolean;
  error?: string | null;
  onRowClick?: (row: Row<TData>) => void;
  onRowSelect?: (selectedRows: TData[]) => void;
  onExport?: (data: TData[]) => void;
  onRefresh?: () => void;
  className?: string;
  expandedContent?: (row: Row<TData>) => React.ReactNode;
  toolbar?: React.ReactNode;
  getRowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>;
  expandedRows?: Record<string, boolean>;
  onExpandedRowsChange?: (expandedRows: Record<string, boolean>) => void;
}

// ==================== DEFAULT CONFIGURATIONS ====================
const defaultFeatures: TableFeatures = {
  pagination: true,
  sorting: true,
  filtering: false,
  selection: false,
  expansion: false,
  columnVisibility: true,
  globalSearch: true,
  export: false,
  refresh: false,
};

const defaultStyling: TableStyling = {
  variant: 'default',
  size: 'md',
  striped: false,
  bordered: true,
  hover: true,
};

const defaultMessages = {
  loading: 'Loading data...',
  empty: 'No data available',
  error: 'Failed to load data',
  searchPlaceholder: 'Search...',
};

// ==================== STYLING VARIANTS ====================
const getTableVariant = (variant: string, size: string) => {
  const variants = {
    default: {
      table: "w-full border-collapse",
      header: "bg-gray-50 border-b border-gray-200",
      headerCell: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
      row: "border-b border-gray-200 hover:bg-gray-50 transition-colors",
      cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
    },
    minimal: {
      table: "w-full",
      header: "border-b",
      headerCell: "pb-3 text-left text-sm font-medium text-gray-700",
      row: "border-b border-gray-100 hover:bg-gray-25",
      cell: "py-3 text-sm text-gray-600",
    },
    professional: {
      table: "w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden",
      header: "bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200",
      headerCell: "px-6 py-4 text-left text-sm font-semibold text-blue-900 uppercase tracking-wide",
      row: "border-b border-gray-100 hover:bg-blue-25 transition-all duration-200",
      cell: "px-6 py-4 text-sm text-gray-800",
    },
    compact: {
      table: "w-full text-sm",
      header: "bg-gray-100 border-b",
      headerCell: "px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase",
      row: "border-b border-gray-100 hover:bg-gray-50",
      cell: "px-3 py-2 text-xs text-gray-700",
    },
    figma: {
      table: "w-full",
      header: "bg-[#F1F0FF] border-b border-gray-200",
      headerCell: "px-6 py-4 text-left text-[14px] font-semibold text-gray-900",
      row: "border-b border-gray-100 hover:bg-gray-50 transition-colors",
      cell: "px-6 py-4 text-[14px] text-gray-700",
    },
  };

  return variants[variant as keyof typeof variants] || variants.default;
};

// ==================== PAGINATION COMPONENT ====================
interface PaginationProps {
  table: any;
  config?: TableConfig['pagination'];
}

const TablePagination: React.FC<PaginationProps> = ({ table, config }) => {
  const pageSizes = [10, 20, 50, 100];

  return (
    <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
      </div>
      
      <div className="flex items-center gap-1">
        <button className="w-9 h-9 flex items-center justify-center text-[14px] bg-[#4F46E5] text-white rounded-lg transition-colors font-medium">
          1
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
          2
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
          3
        </button>
        <span className="text-[14px] text-gray-400 mx-2">...</span>
        <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
          8
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
          9
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
          10
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

// ==================== TOOLBAR COMPONENT ====================
interface ToolbarProps<TData> {
  table: any;
  config: TableConfig;
  onExport?: (data: TData[]) => void;
  onRefresh?: () => void;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  toolbar?: React.ReactNode;
}

const TableToolbar = <TData,>({
  table,
  config,
  onExport,
  onRefresh,
  globalFilter,
  setGlobalFilter,
  toolbar,
}: ToolbarProps<TData>) => {
  const features = { ...defaultFeatures, ...config.features };
  const messages = { ...defaultMessages, ...config.messages };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-4">
        {features.globalSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={messages.searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        )}
        {features.filtering && (
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {toolbar}
        {features.export && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport?.(table.getFilteredRowModel().rows.map((row: any) => row.original))}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
        {features.refresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
        {features.columnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Columns
                <ChevronDown className="h-4 w-4 ml-2" />
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export function UnifiedTable<TData>({
  data,
  columns,
  config = {},
  loading = false,
  error = null,
  onRowClick,
  onRowSelect,
  onExport,
  onRefresh,
  className,
  expandedContent,
  toolbar,
  getRowProps,
  expandedRows,
  onExpandedRowsChange,
}: UnifiedTableProps<TData>) {
  // Merge configurations with defaults
  const features = { ...defaultFeatures, ...config.features };
  const styling = { ...defaultStyling, ...config.styling };
  const messages = { ...defaultMessages, ...config.messages };

  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [internalExpandedRows, setInternalExpandedRows] = React.useState<Record<string, boolean>>({});

  // Use controlled expansion state if provided, otherwise use internal state
  const currentExpandedRows = expandedRows || internalExpandedRows;
  const setCurrentExpandedRows = onExpandedRowsChange || setInternalExpandedRows;

  // Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: features.selection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: features.pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: config.pagination?.pageSize || 10,
      },
    },
  });

  // Handle row selection
  React.useEffect(() => {
    if (features.selection && onRowSelect) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
      onRowSelect(selectedRows);
    }
  }, [rowSelection, features.selection, onRowSelect, table]);

  // Get styling classes
  const styles = getTableVariant(styling.variant!, styling.size!);

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">{messages.loading}</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-red-200">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} className="mt-2">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar - Only show if any toolbar features are enabled */}
      {(features.globalSearch || features.filtering || features.export || features.refresh || features.columnVisibility || toolbar) && (
        <TableToolbar
          table={table}
          config={config}
          onExport={onExport}
          onRefresh={onRefresh}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          toolbar={toolbar}
        />
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table className={styles.table}>
          <TableHeader className={styles.header}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={styles.headerCell}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center space-x-2",
                          header.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {features.sorting && header.column.getCanSort() && (
                          <span className="ml-2">
                            {header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <div className="h-4 w-4 opacity-50">
                                <ChevronUp className="h-3 w-3" />
                                <ChevronDown className="h-3 w-3 -mt-1" />
                              </div>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      styles.row,
                      onRowClick && "cursor-pointer",
                      row.getIsSelected() && "bg-blue-50"
                    )}
                    onClick={() => onRowClick?.(row)}
                    {...(getRowProps ? getRowProps(row) : {} as React.HTMLAttributes<HTMLTableRowElement>)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={styles.cell}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {features.expansion && expandedContent && currentExpandedRows[row.id] && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="p-0">
                        <div className="p-4 bg-gray-50 border-t">
                          {expandedContent(row)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  {messages.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {features.pagination && (
        <TablePagination table={table} config={config.pagination} />
      )}
    </div>
  );
} 