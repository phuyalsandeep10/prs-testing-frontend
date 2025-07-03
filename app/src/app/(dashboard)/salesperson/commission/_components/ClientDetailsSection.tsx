"use client";

import React, { useState, useMemo, useCallback } from "react";
import { UnifiedTable } from "@/components/core";
import type { Client as ApiClient } from "@/lib/types/roles";
import { createPortal } from "react-dom";
import { ClientDetailCard } from "../../client/ClientDetailCard";
import EditClientForm from "../../client/EditClientForm";
import Eye from "@/assets/icons/Eye.svg";
import edit from "@/assets/icons/edit.svg";
import cancel from "@/assets/icons/Cancel.svg";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

// Helper for status and satisfaction badge styles (same as before)
const getStatusColor = (status: string) => {
  switch (status) {
    case "clear":
      return "bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full";
    case "pending":
      return "bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full";
    case "bad-depth":
      return "bg-[#FEF2F2] text-[#DC2626] px-3 py-1 text-[12px] font-medium rounded-full";
    default:
      return "bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full";
  }
};

const getSatisfactionColor = (satisfaction: string) => {
  switch (satisfaction) {
    case "positive":
      return "bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full";
    case "neutral":
      return "bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full";
    case "negative":
      return "bg-[#FEF2F2] text-[#DC2626] px-3 py-1 text-[12px] font-medium rounded-full";
    default:
      return "bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full";
  }
};

const ClientDetailsSection: React.FC = () => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ApiClient | null>(null);

  // Track selected clients by id
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: clients = [], isLoading } = useQuery<ApiClient[]>({
    queryKey: ["clients", "commission-page"],
    queryFn: async () => {
      const response = await apiClient.get<ApiClient[]>("/clients/");
      return response.data || [];
    },
  });

  const handleView = useCallback((client: ApiClient) => {
    setSelectedClient(client);
    setShowViewModal(true);
  }, []);

  const handleEdit = useCallback((client: ApiClient) => {
    setSelectedClient(client);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback((clientId: string) => {
    console.log("Delete client:", clientId);
    // Add your delete logic here
  }, []);

  // Toggle single checkbox
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

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id.toString())));
    }
  };

  const columns: any = useMemo(
    () => [
      {
        accessorFn: (row: ApiClient) => row.client_name,
        id: "name",
        header: "Client Name",
        cell: ({ row }) => (
          <div className="text-[14px] font-medium text-gray-900">
            {row.getValue("name")}
          </div>
        ),
      },
      // Replace Active Date with Total Sales
      {
        accessorFn: (row: ApiClient) => (row as any).total_sales ?? 0,
        id: "totalSales",
        header: "Total Sales",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            ${row.getValue("totalSales").toLocaleString()}
          </div>
        ),
      },
      {
        accessorFn: (row: ApiClient) => row.status ?? "pending",
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <span className={getStatusColor(status)}>{status}</span>;
        },
      },
      {
        accessorFn: (row: ApiClient) => row.satisfaction ?? "neutral",
        id: "satisfaction",
        header: "Satisfaction",
        cell: ({ row }) => {
          const satisfaction = row.getValue("satisfaction") as string;
          return (
            <span className={getSatisfactionColor(satisfaction)}>
              {satisfaction}
            </span>
          );
        },
      },
      {
        accessorFn: (row: ApiClient) => (row as any).projects_count ?? 0,
        id: "projects",
        header: "Projects",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            {row.getValue("projects")}
          </div>
        ),
      },
      {
        accessorFn: (row: ApiClient) => row.remarks ?? "-",
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
          const client = row.original as ApiClient;
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
                <Image src={edit} alt="View" className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(client.id.toString())}
                className=" text-white flex items-center justify-center"
                title="Delete"
              >
                <Image src={cancel} alt="View" className="w-5 h-5" />
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
      <div className="pr-6 py-4">
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
      {showViewModal &&
        selectedClient &&
        typeof window !== "undefined" &&
        createPortal(
          <ClientDetailCard
            client={selectedClient}
            onClose={() => setShowViewModal(false)}
          />,
          document.body
        )}

      {/* Edit Client Modal */}
      {showEditModal &&
        selectedClient &&
        typeof window !== "undefined" &&
        createPortal(
          <EditClientForm
            client={selectedClient}
            onClose={() => setShowEditModal(false)}
            onClientUpdated={() => setShowEditModal(false)}
          />,
          document.body
        )}
    </>
  );
};

export default ClientDetailsSection;
