"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { UnifiedTable } from "@/components/core";
import type { Client } from '@/lib/types/roles';
import { ClientKanbanView } from './ClientKanbanView';
import AddNewClientForm from './AddNewClientForm';
import EditClientForm from './EditClientForm';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import SlideModal from '@/components/ui/SlideModal';
import { useAuth } from '@/stores';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useClients, useDeleteClient } from "@/hooks/api";



// Memoized status color function
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

// Memoized satisfaction color function
const getSatisfactionColor = (satisfaction: string | null) => {
  switch (satisfaction) {
    case 'excellent':
      return 'bg-blue-100 text-blue-700 px-3 py-1 text-[12px] font-medium rounded-full';
    case 'good':
      return 'bg-green-100 text-green-700 px-3 py-1 text-[12px] font-medium rounded-full';
    case 'average':
      return 'bg-yellow-100 text-yellow-700 px-3 py-1 text-[12px] font-medium rounded-full';
    case 'poor':
      return 'bg-red-100 text-red-700 px-3 py-1 text-[12px] font-medium rounded-full';
    default:
      return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
  }
};

const ClientsPage = React.memo(() => {
  const { isAuthInitialized, isAuthenticated } = useAuth();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const router = useRouter();

  // Use debounced search hook for better performance
  const { searchValue, debouncedSearchValue, setSearchValue } = useDebouncedSearch('', 300);

  // Use standardized client hooks
  const { data: clients = [], isLoading: loading, error, refetch } = useClients();
  const deleteClientMutation = useDeleteClient();

  // Force a refetch whenever the page is focused or re-mounted
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Memoized search function
  const searchAllClientColumns = useCallback((client: Client, query: string): boolean => {
    const searchableFields = [
      client.client_name,
      client.email,
      client.id,
      client.status,
      client.satisfaction,
      client.remarks,
      client.phone_number,
      client.nationality,
    ].filter(Boolean); // Filter out null/undefined values

    return searchableFields.some(field =>
      field!.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  // Memoized filtered clients
  const filteredClients = useMemo(() => {
    if (debouncedSearchValue.trim()) {
      return clients.filter(client =>
        searchAllClientColumns(client, debouncedSearchValue)
      );
    }
    return clients;
  }, [debouncedSearchValue, clients, searchAllClientColumns]);

  // Memoized event handlers
  const handleEdit = useCallback((client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  }, []);

  const confirmDelete = useCallback(async (clientId: string) => {
    try {
      await deleteClientMutation.mutateAsync(clientId);
      toast.success("Client deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while deleting the client.');
    }
  }, [deleteClientMutation]);

  const handleView = useCallback((client: Client) => {
    router.push(`/salesperson/client/${client.id}`);
  }, [router]);

  // Memoized columns definition
  const columns = useMemo(() => [
    {
      accessorKey: "client_name",
      header: "Client Name",
      cell: ({ row }: any) => (
        <div className="text-[14px] font-medium text-gray-900">
          {row.getValue("client_name")}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Active Date",
      cell: ({ row }: any) => (
        <div className="text-[14px] text-gray-700">
          {new Date(row.getValue("created_at")).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status") as string;
        return (
          <span className={getStatusColor(status)}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: "satisfaction",
      header: "Satisfaction",
      cell: ({ row }: any) => {
        const satisfaction = row.getValue("satisfaction") as string;
        return (
          <span className={getSatisfactionColor(satisfaction)}>
             {satisfaction ? satisfaction.charAt(0).toUpperCase() + satisfaction.slice(1) : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      cell: ({ row }: any) => (
        <div className="text-[14px] text-gray-700 font-medium">
          {row.getValue("phone_number")}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }: any) => (
        <div className="text-[14px] text-gray-700 truncate max-w-[200px]">
          {row.getValue("remarks")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const client = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(client)}
              className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the client
                    "{client.client_name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => confirmDelete(client.id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ] as any, [handleEdit, confirmDelete]);

  if (!isAuthInitialized || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message || 'Failed to load clients'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exact Figma Header Implementation */}
      <div className="bg-white px-8 py-8 border-b border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
              Your Clients
            </h1>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              Manage your client base and access all the details of each client.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Input - LEFT of buttons */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-12 pr-4 py-3 w-[320px] h-[44px] text-[14px] bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            {/* Filter Button */}
            <Button 
              variant="outline"
              className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-3 h-[44px] rounded-lg font-medium text-[14px] flex items-center gap-2 transition-all"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>

            {/* View Toggle Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant={view === 'table' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setView('table')}
                className={`w-[44px] h-[44px] rounded-lg transition-all ${
                  view === 'table' 
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-5 w-5" />
              </Button>
              <Button 
                variant={view === 'kanban' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setView('kanban')}
                className={`w-[44px] h-[44px] rounded-lg transition-all ${
                  view === 'kanban' 
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </div>

            {/* Add Client Button - RIGHT SIDE */}
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 h-[44px] rounded-lg font-medium text-[14px] flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 py-6">
        {view === 'table' ? (
          <UnifiedTable
              data={filteredClients}
              columns={columns}
              config={{
                features: {
                  pagination: true,
                  sorting: true,
                  filtering: false, // Disable built-in filtering
                  globalSearch: false, // Disable built-in search
                  columnVisibility: false, // Disable column visibility button
                },
                styling: {
                  variant: 'figma', // Use figma variant for consistent styling
                  size: 'md',
                  striped: false,
                  bordered: true,
                  hover: true,
                },
                pagination: {
                  pageSize: 10,
                  showSizeSelector: true,
                  showInfo: true,
                },
                messages: {
                  loading: 'Loading clients...',
                  empty: 'No clients found',
                  error: 'Failed to load clients',
                },
              }}
            />
        ) : (
          <ClientKanbanView 
            clients={filteredClients} 
            onViewDetails={handleView}
          />
        )}
      </div>

      {/* Add Client Modal */}
      <SlideModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Client"
        width="md"
        showCloseButton={true}
      >
        <AddNewClientForm
          onClose={() => setShowAddModal(false)}
          onClientAdded={() => {
            setShowAddModal(false);
          }}
        />
      </SlideModal>

      {/* Edit Client Modal */}
      <SlideModal
        isOpen={showEditModal && selectedClient !== null}
        onClose={() => setShowEditModal(false)}
        title="Edit Client Details"
        width="md"
        showCloseButton={true}
      >
        {selectedClient && (
          <EditClientForm
            client={selectedClient}
            onClose={() => setShowEditModal(false)}
            onClientUpdated={() => {
              setShowEditModal(false);
              setSelectedClient(null);
            }}
          />
        )}
      </SlideModal>
    </div>
  );
});

ClientsPage.displayName = "ClientsPage";
export default ClientsPage;