"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { UnifiedTable } from "@/components/core";
import { getClients } from "@/data/clients";
import type { Client } from "@/types";
import { createPortal } from "react-dom";
import { ClientDetailCard } from "../../client/ClientDetailCard";
import EditClientForm from "../../client/EditClientForm";

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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Track selected clients by id
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const clients = useMemo(() => getClients(), []);

  const handleView = useCallback((client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  }, []);

  const handleEdit = useCallback((client: Client) => {
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
      setSelectedIds(new Set(clients.map((c) => c.id)));
    }
  };

  const columns = useMemo(
    () => [
      // Checkbox column
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            checked={selectedIds.size === clients.length && clients.length > 0}
            onChange={toggleSelectAll}
            aria-label="Select all clients"
            className="accent-[#009959]"
          />
        ),
        cell: ({ row }: any) => {
          const client = row.original as Client;
          return (
            <input
              type="checkbox"
              checked={selectedIds.has(client.id)}
              onChange={() => toggleSelect(client.id)}
              aria-label={`Select client ${client.name}`}
              className="accent-[#009959]"
            />
          );
        },
        size: 20,
      },
      {
        accessorFn: (row: Client) => row.name,
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
        accessorFn: (row: Client) => row.totalSales ?? 0,
        id: "totalSales",
        header: "Total Sales",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            ${row.getValue("totalSales").toLocaleString()}
          </div>
        ),
      },
      {
        accessorFn: (row: Client) => row.status,
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <span className={getStatusColor(status)}>{status}</span>;
        },
      },
      {
        accessorFn: (row: Client) => row.satisfaction,
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
        accessorFn: (row: Client) => row.projects,
        id: "projects",
        header: "Projects",
        cell: ({ row }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            {row.getValue("projects")}
          </div>
        ),
      },
      {
        accessorFn: (row: Client) => row.remarks,
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
          const client = row.original as Client;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleView(client)}
                className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA]"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(client)}
                className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA]"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(client.id)}
                className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626]"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
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
            onFormSubmit={() => setShowEditModal(false)}
          />,
          document.body
        )}
    </>
  );
};

export default ClientDetailsSection;
