"use client";

import React, { useState, useMemo, useCallback } from "react";
import { UnifiedTable } from "@/components/core";
import type { Client as ApiClient } from "@/lib/types/roles";
import SlideModal from "@/components/ui/SlideModal";
import { ClientDetailCard } from "../../client/ClientDetailCard";
import EditClientForm from "../../client/EditClientForm";
import Eye from "@/assets/icons/Eye.svg";
import edit from "@/assets/icons/edit.svg";
import cancel from "@/assets/icons/Cancel.svg";
import Image from "next/image";
import { useDashboardClients } from "@/hooks/api";

type DashboardClientsResponse = {
  clients: ApiClient[];
  pagination: {
    limit: number;
    has_more: boolean;
  };
  status_summary: {
    all: number;
    clear: number;
    pending: number;
    bad_debt: number;
  };
  total_clients: number;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "clear":
      return "bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full";
    case "pending":
      return "bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full";
    case "bad_debt":
      return "bg-[#FEF2F2] text-[#DC2626] px-3 py-1 text-[12px] font-medium rounded-full";
    default:
      return "bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full";
  }
};

const ClientDetailsSection: React.FC = () => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ApiClient | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: clients = [], isLoading } = useDashboardClients();

  console.log('🔍 [CLIENT_DETAILS_SECTION] Clients data:', clients);
  console.log('🔍 [CLIENT_DETAILS_SECTION] Loading:', isLoading);

  const handleView = useCallback((client: any) => {
    // Transform backend client data to match ApiClient interface
    const transformedClient: ApiClient = {
      id: client.client_id?.toString() || client.id?.toString() || '',
      client_name: client.client_name,
      email: client.email,
      phone_number: client.phone_number,
      nationality: null,
      created_at: '',
      updated_at: '',
      remarks: client.remarks,
      satisfaction: null,
      status: client.payment_status,
      created_by: 0,
      organization: 0,
      total_value: client.total_value,
    };
    setSelectedClient(transformedClient);
    setShowViewModal(true);
  }, []);

  const handleEdit = useCallback((client: any) => {
    // Transform backend client data to match ApiClient interface
    const transformedClient: ApiClient = {
      id: client.client_id?.toString() || client.id?.toString() || '',
      client_name: client.client_name,
      email: client.email,
      phone_number: client.phone_number,
      nationality: null,
      created_at: '',
      updated_at: '',
      remarks: client.remarks,
      satisfaction: null,
      status: client.payment_status,
      created_by: 0,
      organization: 0,
      total_value: client.total_value,
    };
    setSelectedClient(transformedClient);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback((clientId: string) => {
    console.log("Delete client:", clientId);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const columns: any = useMemo(
    () => [
      {
        accessorFn: (row: any) => row.client_name,
        id: "name",
        header: "Client Name",
        cell: ({ row }) => (
          <div className="text-[14px] font-medium text-gray-900">
            {row.getValue("name")}
          </div>
        ),
      },
      {
        accessorFn: (row: any) => row.total_deals ?? 0,
        id: "totalDeals",
        header: "Total Deals",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            {row.getValue("totalDeals")}
          </div>
        ),
      },
      {
        accessorFn: (row: any) => row.total_value ?? 0,
        id: "totalSales",
        header: "Total Sales",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            ${row.getValue("totalSales").toLocaleString()}
          </div>
        ),
      },
      {
        accessorFn: (row: any) => row.outstanding_amount ?? 0,
        id: "outstandingAmount",
        header: "Outstanding",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            ${row.getValue("outstandingAmount").toLocaleString()}
          </div>
        ),
      },
      {
        accessorFn: (row: any) => row.payment_status ?? "pending",
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <span className={getStatusColor(status)}>{status}</span>;
        },
      },
      {
        accessorFn: (row: any) => row.remarks ?? "-",
        id: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700 truncate max-w-[200px]">
            {row.getValue("remarks")}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const client = row.original as any;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleView(client)}
                className="text-white flex items-center justify-center"
                title="View"
              >
                <Image src={Eye} alt="View" className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleEdit(client)}
                className="text-white flex items-center justify-center"
                title="Edit"
              >
                <Image src={edit} alt="Edit" className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(client.client_id?.toString() || client.id?.toString() || '')}
                className="text-white flex items-center justify-center"
                title="Delete"
              >
                <Image src={cancel} alt="Delete" className="w-5 h-5" />
              </button>
            </div>
          );
        },
      },
    ],
    [handleView, handleEdit, handleDelete, selectedIds, clients.length]
  );

  return (
    <>
      <div className="pr-6 py-4 ml-6">
        {isLoading ? (
          <p className="text-center text-sm text-gray-500">
            Loading clients...
          </p>
        ) : (
          <UnifiedTable
            data={clients}
            columns={columns}
            config={{
              features: {
                pagination: true,
                sorting: true,
                globalSearch: false,
                columnVisibility: false,
              },
              styling: {
                variant: "figma",
                size: "md",
                hover: true,
                bordered: true,
              },
              pagination: { pageSize: 10 },
              messages: {
                empty: "No clients found",
                loading: "Loading clients...",
              },
            }}
          />
        )}
      </div>

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <ClientDetailCard
          client={selectedClient}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Edit Client Modal */}
      <SlideModal
        isOpen={showEditModal && selectedClient !== null}
        onClose={() => setShowEditModal(false)}
        title="Edit Client"
        width="lg"
        showCloseButton={true}
      >
        {selectedClient && (
          <EditClientForm
            client={selectedClient}
            onClose={() => setShowEditModal(false)}
            onClientUpdated={() => setShowEditModal(false)}
          />
        )}
      </SlideModal>
    </>
  );
};

export default ClientDetailsSection;
