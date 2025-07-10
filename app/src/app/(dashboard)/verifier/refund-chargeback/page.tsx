"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UnifiedTable } from "@/components/core";

interface TransactionData {
  id: string;
  Client: string;
  Amount: string;
  Status: string;
  Reasons: string;
  Dates: string;
}

const fetchRefundsAndChargebacks = async (
  token: string
): Promise<TransactionData[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/dashboard/recent-refunds-or-bad-debts/`,
    {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch transactions: ${errorText}`);
  }

  const data = await res.json();

  return (Array.isArray(data) ? data : []).map((item) => {
    const status =
      item.invoice_status === "bad_debt"
        ? "Chargeback"
        : item.invoice_status === "refunded"
        ? "Refunded"
        : "Unknown";

    const reasons =
      item.invoice_status === "bad_debt"
        ? item.failure_remarks || "No failure reason"
        : item.invoice_status === "refunded"
        ? item.approved_remarks || "No approved remarks"
        : "No remarks";

    return {
      id: item.invoice_id || "N/A",
      Client: item.client_name || "Unknown",
      Amount: `$${parseFloat(item.payment_amount || 0).toFixed(0)}`, // No decimal
      Status: status,
      Reasons: reasons,
      Dates: new Date(item.approval_date || "").toLocaleDateString(),
    };
  });
};

const RefundChargeback = () => {
  const [activeTab, setActiveTab] = useState<"refunded" | "chargeback">(
    "refunded"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["refundChargebackData", token],
    queryFn: () => fetchRefundsAndChargebacks(token!),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const filteredData = useMemo(() => {
    const targetStatus = activeTab === "refunded" ? "Refunded" : "Chargeback";
    return (
      data?.filter(
        (item) =>
          item.Status === targetStatus &&
          (item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Reasons.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Dates.toLowerCase().includes(searchTerm.toLowerCase()))
      ) || []
    );
  }, [data, searchTerm, activeTab]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Transactional ID",
        size: 150,
      },
      {
        accessorKey: "Client",
        header: "Client",
        size: 200,
      },
      {
        accessorKey: "Amount",
        header: "Amount",
        size: 140,
      },
      {
        accessorKey: "Status",
        header: "Status",
        size: 120,
        cell: ({ row }: any) => {
          const status = row.getValue("Status") as string;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === "Refunded"
                  ? "bg-pink-100 text-pink-800"
                  : status === "Chargeback"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "Reasons",
        header: "Reasons",
        size: 180,
      },
      {
        accessorKey: "Dates",
        header: "Dates",
        size: 130,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-semibold text-black font-outfit">
              Refund & Chargeback
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor and manage refunded transactions and chargeback claims
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="mb-6">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("refunded")}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "refunded"
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Refunded
            </button>
            <button
              onClick={() => setActiveTab("chargeback")}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "chargeback"
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Chargeback
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-600">Loading...</div>
          ) : isError ? (
            <div className="p-4 text-red-500">
              {(error as Error)?.message || "Failed to load transactions."}
            </div>
          ) : (
            <UnifiedTable
              data={filteredData}
              columns={columns}
              config={{
                styling: { variant: "figma" },
                features: {
                  pagination: true,
                  globalSearch: false,
                  filtering: false,
                  export: false,
                  refresh: false,
                  columnVisibility: false,
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundChargeback;
