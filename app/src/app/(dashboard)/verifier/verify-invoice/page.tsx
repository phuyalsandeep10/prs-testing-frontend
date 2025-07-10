"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UnifiedTable } from "@/components/core";
import PaymentVerificationModal from "@/components/dashboard/verifier/PaymentVerificationModal";
import Image from "next/image";
import Cancel from "@/assets/icons/Cancel.svg";
import file from "@/assets/icons/file.svg";
import Edit from "@/assets/icons/edit.svg";
import { Skeleton } from "@/components/ui/skeleton";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface InvoiceData {
  id: string;
  payment_id: string;
  "Client Name": string;
  "Deal Name": string;
  "Invoice Date": string;
  "Due Date": string;
  Amount: string;
  Status: string;
}

interface ApiInvoice {
  invoice_id: string;
  client_name: string;
  deal_name: string;
  invoice_date: string;
  due_date: string | null;
  amount: string;
  status: string;
  payment_id: string;
  receipt_file: string | null;
}

const fetchInvoices = async (token: string): Promise<InvoiceData[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/invoices/`,
    {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch invoices");

  const json: ApiInvoice[] = await res.json();

  return json.map((invoice) => ({
    payment_id: invoice.payment_id,
    id: invoice.invoice_id,
    "Client Name": invoice.client_name,
    "Deal Name": invoice.deal_name,
    "Invoice Date": new Date(invoice.invoice_date).toLocaleDateString(),
    "Due Date": invoice.due_date
      ? new Date(invoice.due_date).toLocaleDateString()
      : "N/A",
    Amount: `$${parseFloat(invoice.amount).toLocaleString()} USD`,
    Status:
      invoice.status === "rejected"
        ? "Denied"
        : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
  }));
};

const cancelInvoice = async ({
  token,
  invoiceId,
}: {
  token: string;
  invoiceId: string;
}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/invoice/${invoiceId}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to cancel invoice: ${errorText}`);
  }

  return invoiceId;
};

const VerifyInvoice = () => {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "verification" as "verification" | "view" | "edit",
    paymentId: null as string | null,
    invoiceData: null as InvoiceData | null,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
  }, []);

  const {
    data: invoiceData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["invoices", token],
    queryFn: () => fetchInvoices(token!),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const cancelMutation = useMutation<
    string,
    Error,
    { token: string; invoiceId: string }
  >({
    mutationFn: cancelInvoice,
    onSuccess: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await queryClient.invalidateQueries({ queryKey: ["invoices", token] });

      MySwal.fire({
        icon: "success",
        title: "Cancelled!",
        text: "Invoice cancelled successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error: any) => {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: `Error cancelling invoice: ${error.message || error}`,
      });
    },
  });

  const getTabCount = (status: string) => {
    if (!invoiceData) return 0;
    if (status === "all") return invoiceData.length;
    return invoiceData.filter((invoice) => {
      if (status === "pending") return invoice.Status === "Pending";
      if (status === "completed") return invoice.Status === "Verified";
      if (status === "denied") return invoice.Status === "Denied";
      return false;
    }).length;
  };

  const filteredData = useMemo(() => {
    if (!invoiceData) return [];

    let data = invoiceData.filter((invoice) =>
      activeTab === "all"
        ? true
        : activeTab === "pending"
        ? invoice.Status === "Pending"
        : activeTab === "completed"
        ? invoice.Status === "Verified"
        : activeTab === "denied"
        ? invoice.Status === "Denied"
        : true
    );

    if (searchTerm) {
      data = data.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice["Client Name"]
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice["Deal Name"]
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.Status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [invoiceData, activeTab, searchTerm]);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Invoice-ID", size: 150 },
      { accessorKey: "Client Name", header: "Client Name", size: 200 },
      { accessorKey: "Deal Name", header: "Deal Name", size: 180 },
      { accessorKey: "Invoice Date", header: "Invoice Date", size: 130 },
      { accessorKey: "Due Date", header: "Due Date", size: 130 },
      { accessorKey: "Amount", header: "Amount", size: 140 },
      {
        accessorKey: "Status",
        header: "Status",
        size: 120,
        cell: ({ row }: any) => {
          const status = row.getValue("Status");
          const statusStyle =
            status === "Verified"
              ? "bg-green-100 text-green-800"
              : status === "Pending"
              ? "bg-orange-100 text-orange-800"
              : status === "Denied"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800";

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        size: 100,
        cell: ({ row }: any) => {
          return (
            <div className="flex items-center gap-2">
              {activeTab === "pending" && (
                <button
                  onClick={() =>
                    setModalState({
                      isOpen: true,
                      mode: "verification",
                      paymentId: row.original.payment_id,
                      invoiceData: null,
                    })
                  }
                  className="text-white flex items-center justify-center"
                  title="Open Payment Verification Form"
                >
                  <Image src={file} alt="file icon" />
                </button>
              )}
              {activeTab === "completed" && (
                <button
                  onClick={() =>
                    setModalState({
                      isOpen: true,
                      mode: "edit",
                      paymentId: row.original.payment_id,
                      invoiceData: null,
                    })
                  }
                  className="text-white flex items-center justify-center"
                  title="Edit Payment"
                >
                  <Image src={Edit} alt="edit icon" />
                </button>
              )}
              {(activeTab === "all" ||
                activeTab === "pending" ||
                activeTab === "completed" ||
                activeTab === "denied") && (
                <button
                  onClick={async () => {
                    if (!token) {
                      MySwal.fire({
                        icon: "error",
                        title: "Authentication Required",
                        text: "User not authenticated.",
                      });
                      return;
                    }

                    const result = await MySwal.fire({
                      title: `Cancel invoice ${row.original.id}?`,
                      text: "Are you sure you want to cancel this invoice?",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonColor: "#3085d6",
                      confirmButtonText: "Yes, cancel it!",
                    });

                    if (result.isConfirmed) {
                      cancelMutation.mutate({
                        token,
                        invoiceId: row.original.id,
                      });
                    }
                  }}
                  className="text-white flex items-center justify-center"
                  title="Cancel Invoice"
                  disabled={cancelMutation.isLoading}
                >
                  <Image src={Cancel} alt="cancel icon" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [cancelMutation, token]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-semibold text-black font-outfit">
              Verify Invoice
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and verify invoice submissions for approval
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="mb-6">
          <div className="flex gap-8 border-b border-gray-200">
            {["all", "pending", "completed", "denied"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? `border-${
                        tab === "pending"
                          ? "orange"
                          : tab === "completed"
                          ? "green"
                          : tab === "denied"
                          ? "red"
                          : "blue"
                      }-500 text-${
                        tab === "pending"
                          ? "orange"
                          : tab === "completed"
                          ? "green"
                          : tab === "denied"
                          ? "red"
                          : "blue"
                      }-600`
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="flex items-center gap-2 capitalize">
                  {tab === "all"
                    ? "All Invoices"
                    : `Verification ${
                        tab.charAt(0).toUpperCase() + tab.slice(1)
                      }`}
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      tab === "pending"
                        ? "bg-orange-100 text-orange-600"
                        : tab === "completed"
                        ? "bg-green-100 text-green-600"
                        : tab === "denied"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {getTabCount(tab)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-red-500 p-4">Failed to load invoices.</p>
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

      <PaymentVerificationModal
        isOpen={modalState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalState({
              isOpen: false,
              mode: "verification",
              paymentId: null,
              invoiceData: null,
            });
          }
        }}
        mode={modalState.mode}
        paymentId={modalState.paymentId}
      />
    </div>
  );
};

export default VerifyInvoice;
