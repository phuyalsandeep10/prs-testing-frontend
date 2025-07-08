import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UnifiedTable } from "@/components/core/UnifiedTable";

type VerificationQueue = {
  ID: string;
  client: string;
  amount: string;
  status: string;
  actions: string;
};

type VerificationComponentProps = {
  data: VerificationQueue[];
};

const VerificationComponent: React.FC<VerificationComponentProps> = ({
  data,
}) => {
  // Create columns that match the original table structure
  const columns: ColumnDef<VerificationQueue>[] = React.useMemo(() => [
    {
      accessorKey: "ID",
      header: "ID",
      cell: ({ row }) => (
        <div className="truncate max-w-[80px]">{row.getValue("ID")}</div>
      ),
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => (
        <div className="truncate max-w-[150px]">{row.getValue("client")}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="truncate max-w-[100px]">{row.getValue("amount")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="text-[#C86F04] truncate max-w-[100px]">
          {row.getValue("status")}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="truncate max-w-[150px]">{row.getValue("actions")}</div>
      ),
    },
  ], []);

  return (
    <div className="overflow-x-auto">
      <UnifiedTable
        data={data}
        columns={columns as ColumnDef<unknown>[]}
        config={{
          features: {
            pagination: false,
            sorting: false,
            filtering: false,
            selection: false,
            expansion: false,
            columnVisibility: false,
            globalSearch: false,
            export: false,
            refresh: false,
          },
          styling: {
            variant: "verification",
            size: "md",
            striped: false,
            bordered: false,
            hover: false,
          },
          messages: {
            loading: "Loading verification queue...",
            empty: "No verification items found",
            error: "Failed to load verification queue",
          },
        }}
      />
    </div>
  );
};

export default VerificationComponent; 