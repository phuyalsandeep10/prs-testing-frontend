"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/hooks/useAuthToken";
import { UnifiedTable } from "@/components/core";
import PaymentVerificationModal from "@/components/dashboard/verifier/PaymentVerificationModal";
import Image from "next/image";
import Cancel from "@/assets/icons/Cancel.svg";
import file from "@/assets/icons/file.svg";
import Edit from "@/assets/icons/edit.svg";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

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

const fetchInvoices = async (authenticatedFetch: Function): Promise<InvoiceData[]> => {
  const json: ApiInvoice[] = await authenticatedFetch("/verifier/invoices/");

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
  authenticatedFetch,
  invoiceId,
}: {
  authenticatedFetch: Function;
  invoiceId: string;
}) => {
  await authenticatedFetch(`/verifier/invoice/${invoiceId}/`, {
    method: "DELETE",
  });

  return invoiceId;
};

const VerifyInvoice = () => {
  const { authenticatedFetch, isAuthenticated } = useAuthenticatedFetch();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: ""
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "verification" as "verification" | "view" | "edit",
    paymentId: undefined as string | number | undefined,
    invoiceData: null as InvoiceData | null,
  });

  const queryClient = useQueryClient();

  // Keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when no modal is open
      if (modalState.isOpen) return;

      switch (event.key) {
        case '1':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setActiveTab('all');
          }
          break;
        case '2':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setActiveTab('pending');
          }
          break;
        case '3':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setActiveTab('completed');
          }
          break;
        case '4':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setActiveTab('denied');
          }
          break;
        case '/':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Focus search input
            const searchInput = document.querySelector('input[placeholder="Search invoices..."]') as HTMLInputElement;
            searchInput?.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState.isOpen]);

  // Callback to handle successful payment verification
  const handleVerificationSuccess = () => {
    // Refresh invoice data to show updated status
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    
    // Switch to completed tab to show the newly verified payment
    setActiveTab("completed");
    
    // Show a success message
    toast.success("Payment Verified!", {
      description: "Payment has been successfully verified and moved to completed tab.",
      duration: 3000,
    });
  };

  const {
    data: invoiceData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => fetchInvoices(authenticatedFetch),
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const cancelMutation = useMutation<
    string,
    Error,
    { authenticatedFetch: Function; invoiceId: string }
  >({
    mutationFn: cancelInvoice,
    onSuccess: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Cancelled!", {
        description: "Invoice cancelled successfully.",
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast.error(`Error cancelling invoice: ${error.message || error}`);
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

    // Date filtering
    if (dateFilter.from || dateFilter.to) {
      data = data.filter((invoice) => {
        const invoiceDate = new Date(invoice["Invoice Date"]);
        const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
        const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
        
        if (fromDate && invoiceDate < fromDate) return false;
        if (toDate && invoiceDate > toDate) return false;
        return true;
      });
    }

    return data;
  }, [invoiceData, activeTab, searchTerm, dateFilter]);

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
          const statusConfig = {
            "Verified": { 
              style: "bg-green-100 text-green-800 border border-green-200", 
              icon: "✓" 
            },
            "Pending": { 
              style: "bg-orange-100 text-orange-800 border border-orange-200", 
              icon: "⏳" 
            },
            "Denied": { 
              style: "bg-red-100 text-red-800 border border-red-200", 
              icon: "✗" 
            },
            default: { 
              style: "bg-gray-100 text-gray-800 border border-gray-200", 
              icon: "?" 
            }
          };

          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;

          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.style}`}
            >
              <span>{config.icon}</span>
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
                    if (!isAuthenticated) {
                      toast.error("Authentication Required", {
                        description: "User not authenticated.",
                      });
                      return;
                    }

                    const confirmed = window.confirm(`Are you sure you want to cancel invoice ${row.original.id}?`);
                    if (confirmed) {
                      cancelMutation.mutate({
                        authenticatedFetch,
                        invoiceId: row.original.id,
                      });
                    }
                  }}
                  className="text-white flex items-center justify-center"
                  title="Cancel Invoice"
                  disabled={cancelMutation.isPending}
                >
                  <Image src={Cancel} alt="cancel icon" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [cancelMutation, authenticatedFetch, isAuthenticated, activeTab]
  );

  // Show authentication prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access invoice verification.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
            <div className="text-xs text-gray-500 mt-1">
              Shortcuts: Ctrl+1-4 (tabs), Ctrl+/ (search)
            </div>
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
              paymentId: undefined,
              invoiceData: null,
            });
          }
        }}
        mode={modalState.mode}
        paymentId={modalState.paymentId}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default VerifyInvoice;
