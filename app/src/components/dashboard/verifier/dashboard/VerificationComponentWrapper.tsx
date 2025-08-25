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
      cell: ({ row }) => {
        const value = row.getValue("ID");
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
        return <div className="truncate max-w-[80px]">{displayValue}</div>;
      },
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => {
        const value = row.getValue("client");
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
        return <div className="truncate max-w-[150px]">{displayValue}</div>;
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const value = row.getValue("amount");
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
        return <div className="truncate max-w-[100px]">{displayValue}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const value = row.getValue("status");
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
        return <div className="text-[#C86F04] truncate max-w-[100px]">{displayValue}</div>;
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const value = row.getValue("actions");
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
        return <div className="truncate max-w-[150px]">{displayValue}</div>;
      },
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