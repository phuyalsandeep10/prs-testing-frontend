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
import { RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteClient } from "@/hooks/api";
import { useCommissionDataContext } from "./CommissionDataProvider";

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

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'clear':
      return 'bg-green-100 text-green-700 px-3 py-1 text-[12px] font-medium rounded-full';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 px-3 py-1 text-[12px] font-medium rounded-full';
    case 'bad_debt':
      return 'bg-red-100 text-red-700 px-3 py-1 text-[12px] font-medium rounded-full';
    // Legacy status values
    case 'active':
      return 'bg-green-100 text-green-700 px-3 py-1 text-[12px] font-medium rounded-full';
    case 'inactive':
      return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
    case 'prospect':
      return 'bg-yellow-100 text-yellow-700 px-3 py-1 text-[12px] font-medium rounded-full';
    default:
      return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
  }
};

interface ClientDetailsSectionProps {
  searchQuery?: string;
}

const ClientDetailsSection: React.FC<ClientDetailsSectionProps> = ({ searchQuery = "" }) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ApiClient | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Use shared data context for coordinated API calls
  const {
    dashboardClients,
    regularClients,
    clientsLoading,
    refreshClients
  } = useCommissionDataContext();
  
  // Delete client mutation
  const deleteClientMutation = useDeleteClient();

  // Improved client data merging with better error handling and type safety
  const clients = useMemo(() => {
    const allClientsMap = new Map<string, any>();
    
    try {
      // Helper function to safely get client ID
      const getClientId = (client: any): string | null => {
        const id = client?.client_id || client?.id;
        return id ? String(id) : null;
      };
      
      // Helper function to normalize client name
      const getClientName = (client: any): string => {
        return client?.client_name || client?.name || client?.client__client_name || 'Unknown Client';
      };
      
      // First, add all regular clients with default commission values
      if (Array.isArray(regularClients)) {
        regularClients.forEach((client: any) => {
          const clientId = getClientId(client);
          if (!clientId) return; // Skip invalid clients
          
          allClientsMap.set(clientId, {
            id: client.id || clientId,
            client_id: clientId,
            client_name: getClientName(client),
            email: client.email || '',
            phone_number: client.phone_number || '',
            nationality: client.nationality || '',
            remarks: client.remarks || '',
            status: client.status || 'pending',
            client_status: client.status || 'pending',
            // Default commission values for clients without deals
            total_deals: 0,
            total_value: 0,
            outstanding_amount: 0,
            payment_status: client.status || 'pending'
          });
        });
      }
      
      // Then, enhance with commission data from dashboard clients
      if (Array.isArray(dashboardClients)) {
        dashboardClients.forEach((dashboardClient: any) => {
          const clientId = getClientId(dashboardClient);
          if (!clientId) return; // Skip invalid clients
          
          const existingClient = allClientsMap.get(clientId);
          
          if (existingClient) {
            // Update existing client with dashboard data
            allClientsMap.set(clientId, {
              ...existingClient,
              total_deals: Number(dashboardClient.total_deals) || 0,
              total_value: Number(dashboardClient.total_value) || 0,
              outstanding_amount: Number(dashboardClient.outstanding_amount) || 0,
              payment_status: dashboardClient.payment_status || existingClient.status,
              // Keep original status from regular clients as it's more authoritative
              status: existingClient.status,
              client_status: existingClient.status
            });
          } else {
            // Add dashboard-only client (edge case)
            allClientsMap.set(clientId, {
              id: clientId,
              client_id: clientId,
              client_name: getClientName(dashboardClient),
              email: dashboardClient.email || '',
              phone_number: dashboardClient.phone_number || '',
              nationality: dashboardClient.nationality || '',
              remarks: dashboardClient.remarks || '',
              status: dashboardClient.status || dashboardClient.payment_status || 'pending',
              client_status: dashboardClient.status || dashboardClient.payment_status || 'pending',
              total_deals: Number(dashboardClient.total_deals) || 0,
              total_value: Number(dashboardClient.total_value) || 0,
              outstanding_amount: Number(dashboardClient.outstanding_amount) || 0,
              payment_status: dashboardClient.payment_status || 'pending'
            });
          }
        });
      }
      
      return Array.from(allClientsMap.values()).sort((a, b) => 
        (a.client_name || '').localeCompare(b.client_name || '')
      );
    } catch (error) {
      console.error('Error merging client data:', error);
      return [];
    }
  }, [dashboardClients, regularClients]);

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    
    const query = searchQuery.toLowerCase().trim();
    return clients.filter((client) => {
      return (
        client.client_name?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone_number?.toLowerCase().includes(query) ||
        client.remarks?.toLowerCase().includes(query)
      );
    });
  }, [clients, searchQuery]);

  const isLoading = clientsLoading;

  // Debug logging only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [CLIENT_DETAILS_SECTION] Dashboard clients:', dashboardClients);
    console.log('🔍 [CLIENT_DETAILS_SECTION] Regular clients:', regularClients);
    console.log('🔍 [CLIENT_DETAILS_SECTION] Merged clients:', clients);
    console.log('🔍 [CLIENT_DETAILS_SECTION] Loading:', isLoading);
  }

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
      status: client.client_status || client.status, // Use client_status if available
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
      status: client.client_status || client.status,
      created_by: 0,
      organization: 0,
      total_value: client.total_value,
    };
    setSelectedClient(transformedClient);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback((clientId: string) => {
    setClientToDelete(clientId);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!clientToDelete) return;
    
    try {
      await deleteClientMutation.mutateAsync(clientToDelete);
      setShowDeleteConfirm(false);
      setClientToDelete(null);
      // Refresh data after successful deletion
      refreshClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
      // Toast notification is handled by the mutation
    }
  }, [clientToDelete, deleteClientMutation, refreshClients]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setClientToDelete(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      // Use shared refresh function for coordinated updates
      refreshClients();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [CLIENT_DETAILS_SECTION] Refreshed client data sources');
      }
    } catch (error) {
      console.error('Failed to refresh client data:', error);
      // Could add toast notification here for user feedback
    }
  }, [refreshClients]);

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
        cell: ({ row }: { row: any }) => (
          <div className="text-[14px] font-medium text-gray-900">
            {row.getValue("name")}
          </div>
        ),
      },
      {
        accessorFn: (row: any) => row.total_deals ?? 0,
        id: "totalDeals",
        header: "Total Deals",
        cell: ({ row }: { row: any }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            {row.getValue("totalDeals")}
          </div>
        ),
      },
      {
        accessorFn: (row: any) => row.total_value ?? 0,
        id: "totalSales",
        header: "Total Sales",
        cell: ({ row }: { row: any }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            ${row.getValue("totalSales").toLocaleString()}
          </div>
        ),
      },
      {
        accessorFn: (row: any) => row.outstanding_amount ?? 0,
        id: "outstandingAmount",
        header: "Outstanding",
        cell: ({ row }: { row: any }) => (
          <div className="text-[14px] text-gray-700 font-medium">
            ${row.getValue("outstandingAmount").toLocaleString()}
          </div>
        ),
      },
      {
        accessorFn: (row: any) => row.client_status ?? row.status ?? "pending",
        id: "status",
        header: "Status",
        cell: ({ row }: { row: any }) => {
          const status = row.getValue("status") as string;
          return (
            <span className={getStatusColor(status)}>
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
            </span>
          );
        },
      },
      {
        accessorFn: (row: any) => row.remarks ?? "-",
        id: "remarks",
        header: "Remarks",
        cell: ({ row }: { row: any }) => (
          <div className="text-[14px] text-gray-700 truncate max-w-[200px]">
            {row.getValue("remarks")}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: any }) => {
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
        {/* Header with refresh button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Client Details</h3>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh client data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-gray-500">
            Loading clients...
          </p>
        ) : (
          <UnifiedTable
            data={filteredClients}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone and will permanently remove the client and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleteClientMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteClientMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteClientMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClientDetailsSection;
