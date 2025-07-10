"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UnifiedTable } from "@/components/core/UnifiedTable";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function TeamTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  return (
    <UnifiedTable
      data={data}
      columns={columns as ColumnDef<unknown>[]}
      config={{
        features: {
          pagination: true,
          sorting: true,
          filtering: true,
          selection: false,
          expansion: false,
          columnVisibility: false,
          globalSearch: false,
          export: false,
          refresh: false,
        },
        styling: {
          variant: "team",
          size: "md",
          striped: false,
          bordered: false,
          hover: true,
        },
        pagination: {
          pageSize: 10,
          showSizeSelector: false,
          showInfo: false,
        },
        messages: {
          loading: "Loading teams...",
          empty: "No results.",
          error: "Failed to load teams",
        },
      }}
    />
  );
} 