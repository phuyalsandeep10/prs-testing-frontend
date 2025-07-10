"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Payment,
  createRightColumns,
  scrollableColumns,
} from "@/components/PaymentRecordsTable/column";
import { UnifiedTable } from "@/components/core";
import { ColumnDef } from "@tanstack/react-table";

const fetchPayments = async (): Promise<Payment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          date: "Sep 05,",
          depositorName: "Ram Dhakal",
          salesperson: "Joshna Khadka",
          chequeNo: "0123456749",
          amount: "$1500",
          chequeRemarks: "$150,000.00 USD",
          accountNo: "0123456749",
          status: "Pending",
          approvedBy: "Joshna Khadka",
          comments:
            "Meeting with Jamesto discuss CRM integration. Client Express",
        },
        {
          date: "Sep 05,",
          depositorName: "Ram Dhakal",
          salesperson: "Joshna Khadka",
          chequeNo: "0123456749",
          amount: "$1500",
          chequeRemarks: "$150,000.00 USD",
          accountNo: "0123456749",
          status: "Pending",
          approvedBy: "Joshna Khadka",
          comments:
            "Meeting with Jamesto discuss CRM integration. Client Express",
        },
        {
          date: "Sep 05,",
          depositorName: "Ram Dhakal",
          salesperson: "Joshna Khadka",
          chequeNo: "0123456749",
          amount: "$1500",
          chequeRemarks: "$150,000.00 USD",
          accountNo: "0123456749",
          status: "Pending",
          approvedBy: "Joshna Khadka",
          comments:
            "Meeting with Jamesto discuss CRM integration. Client Express",
        },
        {
          date: "Sep 05,",
          depositorName: "Ram Dhakal",
          salesperson: "Joshna Khadka",
          chequeNo: "0123456749",
          amount: "$1500",
          chequeRemarks: "$150,000.00 USD",
          accountNo: "0123456749",
          status: "Pending",
          approvedBy: "Joshna Khadka",
          comments:
            "Meeting with Jamesto discuss CRM integration. Client Express",
        },
        {
          date: "Sep 05,",
          depositorName: "Ram Dhakal",
          salesperson: "Joshna Khadka",
          chequeNo: "0123456749",
          amount: "$1500",
          chequeRemarks: "$150,000.00 USD",
          accountNo: "0123456749",
          status: "Pending",
          approvedBy: "Joshna Khadka",
          comments:
            "Meeting with Jamesto discuss CRM integration. Client Express",
        },
        {
          date: "Sep 05,",
          depositorName: "Ram Dhakal",
          salesperson: "Joshna Khadka",
          chequeNo: "0123456749",
          amount: "$1500",
          chequeRemarks: "$150,000.00 USD",
          accountNo: "0123456749",
          status: "Pending",
          approvedBy: "Joshna Khadka",
          comments:
            "Meeting with Jamesto discuss CRM integration. Client Express",
        },
        {
          date: "Sep 05,",
          depositorName: "Ram Dhakal",
          salesperson: "Joshna Khadka",
          chequeNo: "0123456749",
          amount: "$1500",
          chequeRemarks: "$150,000.00 USD",
          accountNo: "0123456749",
          status: "Pending",
          approvedBy: "Joshna Khadka",
          comments:
            "Meeting with Jamesto discuss CRM integration. Client Express",
        },
        {
          date: "Sep 05,",
          depositorName: "Ram Dhakal",
          salesperson: "Joshna Khadka",
          chequeNo: "0123456749",
          amount: "$1500",
          chequeRemarks: "$150,000.00 USD",
          accountNo: "0123456749",
          status: "Pending",
          approvedBy: "Joshna Khadka",
          comments:
            "Meeting with Jamesto discuss CRM integration. Client Express",
        },
      ]);
    }, 1000);
  });
};

interface PaymentTableProps {
  role: "verifier" | "senior-verifier";
}

const PaymentTable: React.FC<PaymentTableProps> = ({ role }) => {
  const [paymentsData, setPaymentsData] = useState<Payment[]>([]);

  const { data, isLoading, isError, error } = useQuery<Payment[], Error>({
    queryKey: ["payments"],
    queryFn: fetchPayments,
  });

  useEffect(() => {
    if (data) {
      setPaymentsData(data);
    }
  }, [data]);

  // Only senior verifier can update status
  const updatePaymentStatus =
    role === "senior-verifier"
      ? (rowIndex: number, newStatus: string) => {
          setPaymentsData((prev) =>
            prev.map((payment, index) =>
              index === rowIndex ? { ...payment, status: newStatus } : payment
            )
          );
        }
      : undefined;

  // Create columns based on role
  const rightColumns = createRightColumns(role, updatePaymentStatus);

  // Custom loading skeleton component
  const customLoadingComponent = (
    <div className="mt-6 space-y-2">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-10 gap-2 border-b border-gray-200 py-2"
        >
          {[...Array(10)].map((_, j) => (
            <Skeleton key={j} className="h-4 w-full rounded bg-gray-200" />
          ))}
        </div>
      ))}
    </div>
  );

  if (isError) {
    return <div>Error loading payments: {error.message}</div>;
  }

  return (
    <div className="mt-6">
      <UnifiedTable
        data={paymentsData as unknown[]}
        columns={
          [...scrollableColumns, ...rightColumns] as ColumnDef<unknown>[]
        }
        scrollableColumns={scrollableColumns as ColumnDef<unknown>[]}
        rightColumns={rightColumns as ColumnDef<unknown>[]}
        config={{
          features: {
            splitTable: true,
            pagination: true,
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
            variant: "payment",
            size: "sm",
            striped: true,
            bordered: true,
            hover: false,
          },
        }}
        loading={isLoading}
        customLoadingComponent={customLoadingComponent}
        error={isError ? error.message : null}
      />
    </div>
  );
};

export default PaymentTable;
