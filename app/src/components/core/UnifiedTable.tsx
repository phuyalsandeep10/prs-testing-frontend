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
import TableSkeleton from './TableSkeleton';

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
  splitTable?: boolean; // NEW: Split table feature
}

export interface TableStyling {
  variant?:
    | "default"
    | "minimal"
    | "professional"
    | "compact"
    | "figma"
    | "payment"
    | "team"        // NEW: Team table variant
    | "user"        // NEW: User table variant  
    | "verification"; // NEW: Verification table variant
  size?: "sm" | "md" | "lg";
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
}

export interface TableConfig {
  features?: TableFeatures;
  styling?: TableStyling;
  pagination?: {
    pageSize?: number;
    /**
     * Current page (1-based). Optional – only needed when using external/server-side pagination.
     */
    page?: number;
    /**
     * Total number of rows when using server-side pagination. Optional.
     */
    total?: number;
    /**
     * Callback fired when the page index changes in external pagination mode.
     */
    onPageChange?: (page: number) => void;
    /**
     * Callback fired when the page size changes in external pagination mode.
     */
    onPageSizeChange?: (pageSize: number) => void;
    showSizeSelector?: boolean;
    showInfo?: boolean;
  };
  messages?: {
    loading?: string;
    empty?: string;
    error?: string;
    searchPlaceholder?: string;
  };
  splitTable?: {
    // NEW: Split table configuration
    scrollableColumns?: ColumnDef<any>[];
    rightColumns?: ColumnDef<any>[];
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
  // NEW: Split table props
  scrollableColumns?: ColumnDef<TData>[];
  rightColumns?: ColumnDef<TData>[];
  customLoadingComponent?: React.ReactNode;
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
  splitTable: false, // NEW
};

const defaultStyling: TableStyling = {
  variant: "default",
  size: "md",
  striped: false,
  bordered: true,
  hover: true,
};

const defaultMessages = {
  loading: "Loading data...",
  empty: "No data available",
  error: "Failed to load data",
  searchPlaceholder: "Search...",
};

// ==================== STYLING VARIANTS ====================
const getTableVariant = (variant: string, size: string) => {
  const variants = {
    default: {
      table: "w-auto border-collapse",
      header: "bg-gray-50 border-b border-gray-200",
      headerCell:
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
      row: "border-b border-gray-200 hover:bg-gray-50 transition-colors",
      cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
    },
    minimal: {
      table: "w-auto",
      header: "border-b",
      headerCell: "pb-3 text-left text-sm font-medium text-gray-700",
      row: "border-b border-gray-100 hover:bg-gray-25",
      cell: "py-3 text-sm text-gray-600",
    },
    professional: {
      table:
        "w-auto border-collapse bg-white shadow-sm rounded-lg overflow-hidden",
      header:
        "bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200",
      headerCell:
        "px-6 py-4 text-left text-sm font-semibold text-blue-900 uppercase tracking-wide",
      row: "border-b border-gray-100 hover:bg-blue-25 transition-all duration-200",
      cell: "px-6 py-4 text-sm text-gray-800",
    },
    compact: {
      table: "w-auto text-sm",
      header: "bg-gray-100 border-b",
      headerCell:
        "px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase",
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
    // NEW: Payment variant
    payment: {
      table: "w-full text-sm",
      header: "sticky top-0 z-10 bg-[#DADFFF] border-b border-gray-200",
      headerCell:
        "text-left px-3 py-2 font-medium text-[#31323A] whitespace-nowrap h-[48px]",
      row: "border-b border-gray-200",
      cell: "px-3 py-2 text-[#31323A] text-[12px] border-b border-gray-200 whitespace-nowrap",
    },
    // NEW: Team table variant - matches TeamTable exactly
    team: {
      table: "w-auto border-collapse",
      header: "bg-[#F8F9FA] border-b hover:bg-[#F8F9FA]",
      headerCell: "px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider",
      row: "border-b hover:bg-gray-50/50",
      cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-800",
    },
    // NEW: User table variant - matches UserTable exactly
    user: {
      table: "w-full",
      header: "bg-[#F1F0FF] border-b border-gray-200",
      headerCell: "px-6 py-4 text-left text-[14px] font-semibold text-gray-900",
      row: "hover:bg-gray-50 transition-colors",
      cell: "px-6 py-4 text-[14px] text-gray-700",
    },
    // NEW: Verification table variant - matches VerificationComponent exactly
    verification: {
      table: "min-w-[600px] w-full table-auto border-collapse",
      header: "bg-[#DADFFF] border-b border-gray-400",
      headerCell: "py-3 px-4 text-left text-[16px] font-medium text-[#31323A]",
      row: "text-[12px] text-gray-800",
      cell: "py-3 px-4 truncate",
    },
  };

  return variants[variant as keyof typeof variants] || variants.default;
};

// ==================== SPLIT TABLE COMPONENT ====================
interface SplitTableProps<TData> {
  data: TData[];
  scrollableColumns: ColumnDef<TData>[];
  rightColumns: ColumnDef<TData>[];
  styling: TableStyling;
  messages: any;
}

const SplitTable = <TData,>({
  data,
  scrollableColumns,
  rightColumns,
  styling,
  messages,
}: SplitTableProps<TData>) => {
  const leftTableRef = React.useRef<HTMLTableElement>(null);
  const rightTableRef = React.useRef<HTMLTableElement>(null);

  const leftTable = useReactTable({
    data,
    columns: scrollableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rightTable = useReactTable({
    data,
    columns: rightColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const styles = React.useMemo(
    () => getTableVariant(styling.variant!, styling.size!),
    [styling.variant, styling.size]
  );

  // Sync row heights between left and right tables
  React.useEffect(() => {
    const syncRowHeights = () => {
      if (!leftTableRef.current || !rightTableRef.current) return;

      const leftRows = leftTableRef.current.querySelectorAll("tbody tr");
      const rightRows = rightTableRef.current.querySelectorAll("tbody tr");

      // Reset heights first
      leftRows.forEach((row) => {
        (row as HTMLElement).style.height = "auto";
      });
      rightRows.forEach((row) => {
        (row as HTMLElement).style.height = "auto";
      });

      // Calculate and apply max heights
      for (let i = 0; i < Math.min(leftRows.length, rightRows.length); i++) {
        const leftRowHeight = (leftRows[i] as HTMLElement).offsetHeight;
        const rightRowHeight = (rightRows[i] as HTMLElement).offsetHeight;
        const maxHeight = Math.max(leftRowHeight, rightRowHeight);

        (leftRows[i] as HTMLElement).style.height = `${maxHeight}px`;
        (rightRows[i] as HTMLElement).style.height = `${maxHeight}px`;
      }
    };

    syncRowHeights();

    // Sync heights when Select dropdown changes
    const observer = new ResizeObserver(syncRowHeights);
    if (leftTableRef.current) observer.observe(leftTableRef.current);
    if (rightTableRef.current) observer.observe(rightTableRef.current);

    return () => observer.disconnect();
  }, [data]);

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex h-full">
        {/* Scrollable left section */}
        <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table ref={leftTableRef} className={styles.table}>
            <thead className={styles.header}>
              {leftTable.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className={styles.headerCell}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leftTable.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    styles.row,
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.cell}>
                      <div className="flex items-center min-h-[24px]">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fixed right section */}
        <div className="flex-shrink-0">
          <table ref={rightTableRef} className={styles.table}>
            <thead className={cn(styles.header, "z-20")}>
              {rightTable.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className={styles.headerCell}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rightTable.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    styles.row,
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.cell}>
                      <div className="flex items-center min-h-[24px]">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==================== PAGINATION COMPONENT ====================
interface PaginationProps {
  table: any;
  config?: TableConfig["pagination"];
}

const TablePagination: React.FC<PaginationProps> = ({ table, config }) => {
  const pageSizes = [10, 20, 50, 100];
  
  // External pagination mode (server-side)
  const isExternalPagination = config?.page !== undefined && config?.total !== undefined && config?.onPageChange;
  
  if (isExternalPagination) {
    const currentPage = config!.page!;
    const totalPages = Math.ceil(config!.total! / table.getState().pagination.pageSize);
    
    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        config!.onPageChange!(page);
      }
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          {config?.showInfo && (
            <span className="text-[14px] text-gray-500 ml-2">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span key={`dots-${index}`} className="text-[14px] text-gray-400 mx-2">
                  ...
                </span>
              );
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum as number)}
                className={`w-9 h-9 flex items-center justify-center text-[14px] rounded-lg transition-colors font-medium ${
                  currentPage === pageNum
                    ? 'bg-[#4F46E5] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {config?.showSizeSelector && (
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
                config?.onPageSizeChange?.(Number(e.target.value));
              }}
              className="px-3 py-1 text-[14px] border border-gray-300 rounded-lg"
            >
              {pageSizes.map(size => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // Internal pagination mode (client-side)
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

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
        {config?.showInfo && (
          <span className="text-[14px] text-gray-500 ml-2">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span key={`dots-${index}`} className="text-[14px] text-gray-400 mx-2">
                ...
              </span>
            );
          }
          return (
            <button
              key={pageNum}
              onClick={() => table.setPageIndex((pageNum as number) - 1)}
              className={`w-9 h-9 flex items-center justify-center text-[14px] rounded-lg transition-colors font-medium ${
                currentPage === pageNum
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {config?.showSizeSelector && (
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-3 py-1 text-[14px] border border-gray-300 rounded-lg"
          >
            {pageSizes.map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        )}
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
            onClick={() =>
              onExport?.(
                table.getFilteredRowModel().rows.map((row: any) => row.original)
              )
            }
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
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
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
export const UnifiedTable = React.memo(
  <TData,>({
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
    scrollableColumns,
    rightColumns,
    customLoadingComponent,
  }: UnifiedTableProps<TData>) => {
    // Memoize configurations to prevent unnecessary re-calculations
    const features = React.useMemo(
      () => ({ ...defaultFeatures, ...config.features }),
      [config.features]
    );
    const styling = React.useMemo(
      () => ({ ...defaultStyling, ...config.styling }),
      [config.styling]
    );
    const messages = React.useMemo(
      () => ({ ...defaultMessages, ...config.messages }),
      [config.messages]
    );

    // Table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
      React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [internalExpandedRows, setInternalExpandedRows] = React.useState<
      Record<string, boolean>
    >({});

    // Use controlled expansion state if provided, otherwise use internal state
    const currentExpandedRows = expandedRows || internalExpandedRows;
    const setCurrentExpandedRows =
      onExpandedRowsChange || setInternalExpandedRows;

    // Check if using external pagination
    const isExternalPagination = config.pagination?.page !== undefined && 
      config.pagination?.total !== undefined && 
      config.pagination?.onPageChange;

    // Memoize table configuration
    const tableConfig = React.useMemo(
      () => ({
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
        // For external pagination, don't use getPaginationRowModel
        ...(features.pagination && !isExternalPagination
          ? { getPaginationRowModel: getPaginationRowModel() }
          : {}),
        getSortedRowModel: getSortedRowModel(),
        // For external pagination, use manual pagination
        ...(isExternalPagination
          ? { 
              manualPagination: true,
              pageCount: Math.ceil((config.pagination?.total || 0) / (config.pagination?.pageSize || 10))
            }
          : {}),
        initialState: {
          pagination: {
            pageSize: config.pagination?.pageSize || 10,
            // For external pagination, set the page index correctly
            ...(isExternalPagination && config.pagination?.page
              ? { pageIndex: config.pagination.page - 1 }
              : {}),
          },
        },
      }),
      [
        data,
        columns,
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
        globalFilter,
        features.selection,
        features.pagination,
        config.pagination?.pageSize,
        config.pagination?.page,
        config.pagination?.total,
        isExternalPagination,
      ]
    );

    // Table instance
    const table = useReactTable({
      ...tableConfig,
      getRowId: (row) => {
        // Use deal_id if available, otherwise fall back to index
        return (row as any).deal_id || `row-${Math.random()}`;
      },
    });

    // Memoized callback for row selection
    const handleRowSelection = React.useCallback(() => {
      if (features.selection && onRowSelect) {
        const selectedRows = table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original);
        onRowSelect(selectedRows);
      }
    }, [features.selection, onRowSelect, table, rowSelection]);

    // Handle row selection
    React.useEffect(() => {
      handleRowSelection();
    }, [handleRowSelection]);

    // Sync table state with external pagination
    React.useEffect(() => {
      if (isExternalPagination && config.pagination?.page) {
        table.setPageIndex(config.pagination.page - 1);
      }
    }, [config.pagination?.page, isExternalPagination, table]);

    // Memoize styling classes
    const styles = React.useMemo(
      () => getTableVariant(styling.variant!, styling.size!),
      [styling.variant, styling.size]
    );

    // Memoized row click handler
    const handleRowClick = React.useCallback(
      (row: any) => {
        onRowClick?.(row);
      },
      [onRowClick]
    );

    // Render loading state
    if (loading) {
      if (customLoadingComponent) {
        return <>{customLoadingComponent}</>;
      }
      return (
        <div className={cn("relative", className)}>
          <TableSkeleton rows={config.pagination?.pageSize ?? 10} cols={columns.length} />
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{messages.loading}</p>
            </div>
          </div>
        </div>
      );
    }

    // Render error state
    if (error) {
      return (
        <div className={cn("relative", className)}>
          <TableSkeleton rows={config.pagination?.pageSize ?? 10} cols={columns.length} />
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-red-200">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-red-600">{error}</p>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="mt-2"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Render split table if enabled
    if (features.splitTable && scrollableColumns && rightColumns) {
      return (
        <div className={cn("space-y-4", className)}>
          {/* Toolbar - Only show if any toolbar features are enabled */}
          {(features.globalSearch ||
            features.filtering ||
            features.export ||
            features.refresh ||
            features.columnVisibility ||
            toolbar) && (
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

          <SplitTable
            data={data}
            scrollableColumns={scrollableColumns}
            rightColumns={rightColumns}
            styling={styling}
            messages={messages}
          />

          {/* Pagination */}
          {features.pagination && (
            <TablePagination table={table} config={config.pagination} />
          )}
        </div>
      );
    }

    // Render regular table
    return (
      <div className={cn("space-y-4", className)}>
        {/* Toolbar - Only show if any toolbar features are enabled */}
        {(features.globalSearch ||
          features.filtering ||
          features.export ||
          features.refresh ||
          features.columnVisibility ||
          toolbar) && (
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
        <div className="rounded-md border overflow-hidden w-full">
          <Table className={styles.table}>
            <TableHeader className={`!w-auto ${styles.header}`}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={styles.headerCell}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center space-x-2",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                      onClick={() => handleRowClick(row)}
                      {...(getRowProps
                        ? getRowProps(row)
                        : ({} as React.HTMLAttributes<HTMLTableRowElement>))}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={styles.cell}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {features.expansion &&
                      expandedContent && (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="p-0">
                            <div 
                              className={cn(
                                "w-full overflow-hidden transition-all duration-500 ease-in-out",
                                currentExpandedRows[row.id] 
                                  ? "max-h-[1000px] opacity-100 scale-100" 
                                  : "max-h-0 opacity-0 scale-95"
                              )}
                            >
                              {currentExpandedRows[row.id] && expandedContent(row)}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
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
);

UnifiedTable.displayName = "UnifiedTable";
